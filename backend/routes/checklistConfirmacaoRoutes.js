// backend/routes/checklistConfirmacaoRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Confirmar checklist por cliente ou funcionário
router.post('/confirmar', checkPermissao(['cliente', 'funcionario', 'administrador']), async (req, res) => {
  const { checklist_id, tipo_confirmacao } = req.body;

  if (!checklist_id || !tipo_confirmacao) {
    return res.status(400).json({ error: 'Checklist e tipo de confirmação são obrigatórios' });
  }

  try {
    const campo = tipo_confirmacao === 'cliente' ? 'confirmado_cliente' : 'confirmado_funcionario';

    const result = await db.query(
      `UPDATE checklist_entrega SET ${campo} = TRUE WHERE id = $1 RETURNING *`,
      [checklist_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao confirmar checklist' });
  }
});

// Ver status de confirmação
router.get('/:checklist_id', checkPermissao(['cliente', 'funcionario', 'administrador']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT confirmado_cliente, confirmado_funcionario FROM checklist_entrega WHERE id = $1`,
      [req.params.checklist_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Checklist não encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar confirmação' });
  }
});

module.exports = router;
