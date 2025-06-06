// backend/routes/comentariosRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Criar comentário interno
router.post('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { ordem_id, comentario } = req.body;
  const usuario_id = req.user.id;

  if (!comentario || !ordem_id) {
    return res.status(400).json({ error: 'Ordem e comentário são obrigatórios' });
  }

  try {
    const result = await db.query(
      `INSERT INTO comentarios_os (ordem_id, usuario_id, comentario)
       VALUES ($1, $2, $3) RETURNING *`,
      [ordem_id, usuario_id, comentario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

// Listar comentários de uma OS
router.get('/:ordem_id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.nome AS autor
       FROM comentarios_os c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.ordem_id = $1
       ORDER BY c.data_criacao ASC`,
      [req.params.ordem_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

module.exports = router;
