// backend/routes/tecnicosRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Atribuir técnico responsável à OS
router.post('/atribuir', checkPermissao(['administrador']), async (req, res) => {
  const { ordem_id, tecnico_id } = req.body;

  if (!ordem_id || !tecnico_id) {
    return res.status(400).json({ error: 'Ordem e técnico são obrigatórios' });
  }

  try {
    const result = await db.query(
      `UPDATE ordens_servico SET tecnico_id = $1 WHERE id = $2 RETURNING *`,
      [tecnico_id, ordem_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atribuir técnico' });
  }
});

// Listar OS por técnico
router.get('/por-tecnico/:tecnico_id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM ordens_servico WHERE tecnico_id = $1 ORDER BY data_criacao DESC`,
      [req.params.tecnico_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar OS por técnico' });
  }
});

module.exports = router;
