// backend/routes/checklistRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Criar checklist de entrega
router.post('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { ordem_id, conferencias, observacoes } = req.body;
  const usuario_id = req.user.id;

  if (!ordem_id || !conferencias) {
    return res.status(400).json({ error: 'Ordem e conferências são obrigatórios' });
  }

  try {
    const result = await db.query(
      `INSERT INTO checklist_entrega (ordem_id, usuario_id, conferencias, observacoes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ordem_id, usuario_id, conferencias, observacoes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar checklist' });
  }
});

// Consultar checklist de uma OS
router.get('/:ordem_id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.nome AS autor
       FROM checklist_entrega c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE ordem_id = $1`,
      [req.params.ordem_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar checklist' });
  }
});

// Atualizar checklist (ex: marcar como concluído ou editar conferências)
router.put('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { conferencias, observacoes, concluido } = req.body;

  try {
    const result = await db.query(
      `UPDATE checklist_entrega
       SET conferencias = $1,
           observacoes = $2,
           concluido = $3
       WHERE id = $4
       RETURNING *`,
      [conferencias, observacoes, concluido, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Checklist não encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar checklist' });
  }
});

module.exports = router;
