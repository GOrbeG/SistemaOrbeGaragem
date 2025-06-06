// backend/routes/relatoriosRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Relatório por período
router.get('/por-periodo', checkPermissao(['administrador']), async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const result = await db.query(
      `SELECT * FROM ordens_servico
       WHERE data_criacao BETWEEN $1 AND $2
       ORDER BY data_criacao ASC`,
      [inicio, fim]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por período' });
  }
});

// Relatório por funcionário
router.get('/por-funcionario/:id', checkPermissao(['administrador']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM ordens_servico
       WHERE usuario_id = $1
       ORDER BY data_criacao DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por funcionário' });
  }
});

// Relatório por status
router.get('/por-status/:status', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM ordens_servico
       WHERE status = $1
       ORDER BY data_criacao DESC`,
      [req.params.status]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por status' });
  }
});

module.exports = router;
