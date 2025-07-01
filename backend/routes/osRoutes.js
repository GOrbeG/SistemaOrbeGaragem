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
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
    const { clienteId } = req.query; // Pega o clienteId da URL
    try {
      let query = 'SELECT * FROM ordens_servico ORDER BY data_criacao DESC';
      const params = [];

      // Se um clienteId for fornecido, modifica a query para filtrar
      if (clienteId) {
        query = 'SELECT * FROM ordens_servico WHERE cliente_id = $1 ORDER BY data_criacao DESC';
        params.push(clienteId);
      }

      const { rows } = await db.query(query, params);
      res.json(rows);
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
      .withMessage('Data agendada inválida'),
  ],
  async (req, res) => {
    // ✅ LINHA DE DEBUG ADICIONADA AQUI
    console.log('DADOS RECEBIDOS PARA CRIAR OS:', req.body);

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

// ✅ ROTA DE EXPORTAÇÃO DE PDF ATUALIZADA
router.get('/:id/exportar', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const { id } = req.params;

    // Query principal que une OS, Cliente e Veículo
    const osQuery = `
      SELECT 
        os.*, 
        c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
        v.marca, v.modelo, v.placa, v.ano
      FROM ordens_servico os
      LEFT JOIN clientes c ON os.cliente_id = c.id
      LEFT JOIN veiculos v ON os.veiculo_id = v.id
      WHERE os.id = $1;
    `;
    const osResult = await db.query(osQuery, [id]);

    // Query para os itens da OS
    const itensResult = await db.query('SELECT * FROM itens_ordem WHERE ordem_id = $1', [id]);

    if (osResult.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    const os = osResult.rows[0];
    const itens = itensResult.rows;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-disposition', `inline; filename="os_${id}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // --- Início do Layout do PDF ---

    // Cabeçalho
    doc.fontSize(20).font('Helvetica-Bold').text('Orbe Garage', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Ordem de Serviço', { align: 'center' });
    doc.moveDown(2);

    // Informações da OS
    doc.fontSize(12).font('Helvetica-Bold').text(`OS #${os.id}`, { continued: true });
    doc.font('Helvetica').text(` - ${new Date(os.data_criacao).toLocaleDateString('pt-BR')}`, { align: 'right' });
    doc.fontSize(10).fillColor('gray').text(`Status: ${os.status}`);
    doc.moveDown();

    // Dados do Cliente e Veículo (em colunas)
    const yPos = doc.y;
    doc.fontSize(12).font('Helvetica-Bold').text('Dados do Cliente', { width: 250 });
    doc.font('Helvetica').text(os.cliente_nome || 'N/A');
    doc.text(os.cliente_email || 'N/A');
    doc.text(os.cliente_telefone || 'N/A');

    doc.y = yPos; // Volta para a mesma altura para a segunda coluna
    doc.fontSize(12).font('Helvetica-Bold').text('Dados do Veículo', { align: 'right' });
    doc.font('Helvetica').text(`${os.marca || ''} ${os.modelo || ''} ${os.ano || ''}`, { align: 'right' });
    doc.text(`Placa: ${os.placa || 'N/A'}`, { align: 'right' });
    doc.moveDown(2);

    // Descrição principal da OS
    doc.font('Helvetica-Bold').text('Descrição do Problema/Serviço:');
    doc.font('Helvetica').text(os.descricao, { align: 'justify' });
    doc.moveDown(2);

    // Tabela de Itens e Serviços
    doc.font('Helvetica-Bold').text('Itens e Serviços Detalhados:');
    doc.moveDown();
    const tableTop = doc.y;
    const itemX = 50;
    const valorX = 450;
    
    doc.font('Helvetica-Bold').text('Descrição', itemX, tableTop).text('Valor (R$)', valorX, tableTop, { align: 'right' });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Linha divisória
    
    let currentY = doc.y + 5;
    itens.forEach(item => {
        doc.font('Helvetica').fontSize(10).text(item.descricao, itemX, currentY, { width: 380 });
        doc.text(parseFloat(item.valor).toFixed(2), valorX, currentY, { align: 'right' });
        currentY += 20;
    });

    doc.y = currentY > doc.y ? currentY : doc.y; // Garante que a posição Y esteja correta
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Total
    doc.fontSize(14).font('Helvetica-Bold').text('Valor Total:', { width: 480, align: 'right' });
    doc.y -= 16; // Recua um pouco a linha para alinhar o valor
    doc.text(`R$ ${parseFloat(os.valor_total).toFixed(2)}`, { align: 'right' });
    doc.moveDown(3);

    // Assinatura
    doc.moveTo(150, doc.y + 30).lineTo(450, doc.y + 30).stroke();
    doc.text('Assinatura do Cliente', { align: 'center' });


    // --- Fim do Layout ---

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).json({ error: 'Erro ao gerar PDF da OS' });
  }
});

module.exports = router;
