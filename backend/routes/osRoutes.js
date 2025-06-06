// backend/routes/osRoutes.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const registrarHistorico = require('../middlewares/logHistorico');
const checkPermissao = require('../middlewares/checkPermissao');
const enviarEmail = require('../utils/emailService');
const { confirmacaoAgendamento } = require('../utils/emailTemplates');

// Listar todas as ordens de serviço
router.get(
  '/',
  checkPermissao(['administrador', 'funcionario']),
  async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM ordens_servico');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
    }
  }
);

// Buscar ordem de serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM ordens_servico WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar ordem de serviço' });
  }
});

// Criar nova ordem de serviço
router.post(
  '/',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('cliente_id')
      .isInt()
      .withMessage('ID do cliente é obrigatório e deve ser numérico'),
    body('veiculo_id')
      .isInt()
      .withMessage('ID do veículo é obrigatório e deve ser numérico'),
    body('usuario_id')
      .isInt()
      .withMessage('ID do usuário é obrigatório e deve ser numérico'),
    body('status').notEmpty().withMessage('Status é obrigatório'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('valor_total')
      .isFloat()
      .withMessage('Valor total deve ser numérico'),
    body('data_agendada')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Data agendada inválida'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const {
      cliente_id,
      veiculo_id,
      usuario_id,
      status,
      descricao,
      valor_total,
      data_agendada,
    } = req.body;

    try {
      // Inserir nova OS
      const result = await db.query(
        `
        INSERT INTO ordens_servico
          (cliente_id, veiculo_id, usuario_id, status, descricao, valor_total, data_agendada)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          cliente_id,
          veiculo_id,
          usuario_id,
          status,
          descricao,
          valor_total,
          data_agendada,
        ]
      );

      const novaOS = result.rows[0];

      // Registrar histórico da criação
      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'criar',
        entidade: 'ordens_servico',
        entidade_id: novaOS.id,
        dados_novos: novaOS,
      });

      // Se for status “agendada”, enviar e-mail de confirmação e criar notificação
      if (status === 'agendada') {
        // Buscar dados do cliente
        const clienteResult = await db.query(
          'SELECT nome, email FROM clientes WHERE id = $1',
          [cliente_id]
        );
        const cliente = clienteResult.rows[0];

        if (cliente?.email) {
          // Buscar modelo do veículo
          const veiculoResult = await db.query(
            'SELECT modelo FROM veiculos WHERE id = $1',
            [veiculo_id]
          );
          const veiculo = veiculoResult.rows[0]?.modelo || 'Seu veículo';

          // Gerar conteúdo de e-mail
          const mensagemHtml = confirmacaoAgendamento(
            cliente.nome,
            new Date(data_agendada).toLocaleString('pt-BR'),
            veiculo
          );
          // Enviar e-mail
          await enviarEmail(
            cliente.email,
            'Agendamento Confirmado - Orbe Garage',
            mensagemHtml
          );
        }

        // Criar notificação interna
        await db.query(
          `
          INSERT INTO notificacoes
            (usuario_id, mensagem, tipo)
          VALUES
            ($1, $2, $3)
          `,
          [
            usuario_id,
            `Nova OS agendada para ${new Date(data_agendada).toLocaleDateString(
              'pt-BR'
            )}`,
            'info',
          ]
        );
      }

      res.status(201).json(novaOS);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
    }
  }
);

// Atualizar ordem de serviço
router.put(
  '/:id',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('cliente_id')
      .isInt()
      .withMessage('ID do cliente é obrigatório e deve ser numérico'),
    body('veiculo_id')
      .isInt()
      .withMessage('ID do veículo é obrigatório e deve ser numérico'),
    body('usuario_id')
      .isInt()
      .withMessage('ID do usuário é obrigatório e deve ser numérico'),
    body('status').notEmpty().withMessage('Status é obrigatório'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('valor_total')
      .isFloat()
      .withMessage('Valor total deve ser numérico'),
    body('data_agendada')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Data agendada inválida'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const {
      cliente_id,
      veiculo_id,
      usuario_id,
      status,
      descricao,
      valor_total,
      data_agendada,
    } = req.body;

    try {
      // Buscar OS antes de atualizar (para histórico)
      const osAntesResult = await db.query(
        'SELECT * FROM ordens_servico WHERE id = $1',
        [req.params.id]
      );
      const osAntes = osAntesResult.rows[0];

      // Atualizar OS
      const result = await db.query(
        `
        UPDATE ordens_servico
        SET
          cliente_id = $1,
          veiculo_id = $2,
          usuario_id = $3,
          status = $4,
          descricao = $5,
          valor_total = $6,
          data_agendada = $7
        WHERE id = $8
        RETURNING *
        `,
        [
          cliente_id,
          veiculo_id,
          usuario_id,
          status,
          descricao,
          valor_total,
          data_agendada,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Registrar histórico da atualização
      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'atualizar',
        entidade: 'ordens_servico',
        entidade_id: req.params.id,
        dados_anteriores: osAntes,
        dados_novos: result.rows[0],
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar ordem de serviço' });
    }
  }
);

// Deletar ordem de serviço
router.delete(
  '/:id',
  checkPermissao(['administrador', 'funcionario']),
  async (req, res) => {
    try {
      const osAntesResult = await db.query(
        'SELECT * FROM ordens_servico WHERE id = $1',
        [req.params.id]
      );
      const osAntes = osAntesResult.rows[0];

      const result = await db.query(
        'DELETE FROM ordens_servico WHERE id = $1 RETURNING *',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Registrar histórico da exclusão
      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'deletar',
        entidade: 'ordens_servico',
        entidade_id: req.params.id,
        dados_anteriores: osAntes,
      });

      res.json({ mensagem: 'Ordem de serviço deletada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
    }
  }
);

// Gerar link de visualização da OS
router.get('/:id/link', async (req, res) => {
  try {
    const token = jwt.sign(
      { os_id: req.params.id },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ link: `${process.env.FRONTEND_URL}/visualizar-os/${token}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar link' });
  }
});

// Visualização pública da OS via token
router.get('/visualizar/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const osResult = await db.query(
      'SELECT * FROM ordens_servico WHERE id = $1',
      [decoded.os_id]
    );
    const itensResult = await db.query(
      'SELECT * FROM itens_ordem WHERE ordem_id = $1',
      [decoded.os_id]
    );

    if (osResult.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    res.json({ ordem: osResult.rows[0], itens: itensResult.rows });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Token inválido ou expirado' });
  }
});

// Exportar OS em PDF
router.get('/:id/exportar', async (req, res) => {
  try {
    const { id } = req.params;
    const osResult = await db.query(
      'SELECT * FROM ordens_servico WHERE id = $1',
      [id]
    );
    const itensResult = await db.query(
      'SELECT * FROM itens_ordem WHERE ordem_id = $1',
      [id]
    );

    if (osResult.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    const doc = new PDFDocument();
    res.setHeader(
      'Content-disposition',
      `inline; filename="ordem_servico_${id}.pdf"`
    );
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Orbe Garage - Ordem de Serviço', { align: 'center' });
    doc.moveDown();

    const dados = osResult.rows[0];
    doc.fontSize(12).text(`ID: ${dados.id}`);
    doc.text(`Status: ${dados.status}`);
    doc.text(`Descrição: ${dados.descricao}`);
    doc.text(`Data: ${new Date(dados.data_criacao).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Serviços:', { underline: true });
    itensResult.rows.forEach((item, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${item.descricao} - R$ ${parseFloat(item.valor).toFixed(2)}`
      );
    });

    const total = itensResult.rows.reduce(
      (acc, cur) => acc + parseFloat(cur.valor),
      0
    );
    doc.moveDown();
    doc.fontSize(14).text(`Total: R$ ${total.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar PDF da OS' });
  }
});

module.exports = router;
