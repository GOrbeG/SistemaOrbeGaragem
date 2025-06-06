// backend/routes/agendamentosRoutes.js
const express = require('express');
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Criar agendamento
router.post('/',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('cliente_id').isInt().withMessage('ID do cliente é obrigatório'),
    body('veiculo_id').isInt().withMessage('ID do veículo é obrigatório'),
    body('data_agendada').isISO8601().withMessage('Data agendada inválida'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { cliente_id, veiculo_id, data_agendada, descricao } = req.body;
    const usuario_id = req.user.id;

    try {
      const result = await db.query(
        `INSERT INTO agendamentos (cliente_id, veiculo_id, usuario_id, data_agendada, descricao)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [cliente_id, veiculo_id, usuario_id, data_agendada, descricao]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }
);

// Listar todos os agendamentos com filtros por data ou funcionário
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { inicio, fim, funcionario_id } = req.query;
  const filtros = [];
  const valores = [];

  if (inicio && fim) {
    filtros.push('data_agendada BETWEEN $' + (valores.length + 1) + ' AND $' + (valores.length + 2));
    valores.push(inicio, fim);
  }
  if (funcionario_id) {
    filtros.push('a.usuario_id = $' + (valores.length + 1));
    valores.push(funcionario_id);
  }

  const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

  try {
    const result = await db.query(
      `SELECT a.*, c.nome AS cliente_nome, v.modelo AS veiculo_modelo, u.nome AS funcionario
       FROM agendamentos a
       JOIN clientes c ON a.cliente_id = c.id
       JOIN veiculos v ON a.veiculo_id = v.id
       JOIN usuarios u ON a.usuario_id = u.id
       ${where}
       ORDER BY data_agendada ASC`,
      valores
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Deletar agendamento
router.delete('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query('DELETE FROM agendamentos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});

module.exports = router;
