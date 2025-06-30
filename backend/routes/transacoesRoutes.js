// backend/routes/transacoesRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Listar todas as transações com filtros
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { data_inicio, data_fim, tipo, categoria_id } = req.query;
  try {
    let query = `
      SELECT t.*, c.nome AS categoria_nome 
      FROM transacoes_financeiras t
      LEFT JOIN categorias_financeiras c ON t.categoria_id = c.id
    `;
    const filtros = [];
    const valores = [];
    let contador = 1;

    if (data_inicio) {
      filtros.push(`t.data_transacao >= $${contador++}`);
      valores.push(data_inicio);
    }
    if (data_fim) {
      filtros.push(`t.data_transacao <= $${contador++}`);
      valores.push(data_fim);
    }
    if (tipo) {
      filtros.push(`t.tipo = $${contador++}`);
      valores.push(tipo);
    }
    if (categoria_id) {
      filtros.push(`t.categoria_id = $${contador++}`);
      valores.push(categoria_id);
    }

    if (filtros.length > 0) {
      query += ' WHERE ' + filtros.join(' AND ');
    }

    query += ' ORDER BY t.data_transacao DESC, t.id DESC';

    const { rows } = await db.query(query, valores);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova transação
router.post('/',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('descricao').notEmpty().withMessage('A descrição é obrigatória.'),
    body('valor').isFloat({ gt: 0 }).withMessage('O valor deve ser um número positivo.'),
    body('tipo').isIn(['entrada', 'saida']).withMessage('O tipo deve ser "entrada" ou "saida".'),
    body('data_transacao').isISO8601().toDate().withMessage('A data é inválida.'),
    body('categoria_id').isInt().withMessage('A categoria é obrigatória.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { descricao, valor, tipo, data_transacao, categoria_id, ordem_servico_id, observacoes } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO transacoes_financeiras (descricao, valor, tipo, data_transacao, categoria_id, ordem_servico_id, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [descricao, valor, tipo, data_transacao, categoria_id, ordem_servico_id || null, observacoes]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      res.status(500).json({ error: 'Erro ao criar transação' });
    }
  }
);

// Deletar transação
router.delete('/:id', checkPermissao(['administrador']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM transacoes_financeiras WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada.' });
        }
        res.status(200).json({ message: 'Transação excluída com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar transação:", error);
        res.status(500).json({ error: 'Erro ao deletar transação' });
    }
});


module.exports = router;