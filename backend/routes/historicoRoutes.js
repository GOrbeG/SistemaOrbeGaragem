// backend/routes/historicoRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Listar histórico com filtros avançados
router.get('/', checkPermissao(['administrador']), async (req, res) => {
  const { usuario_id, entidade, entidade_id, acao, inicio, fim, limit, offset } = req.query;
  const valores = [];
  let query = `SELECT h.*, u.nome AS usuario_nome
               FROM historico_acoes h
               LEFT JOIN usuarios u ON h.usuario_id = u.id
               WHERE 1=1`;

  if (usuario_id) {
    query += ' AND h.usuario_id = $' + (valores.length + 1);
    valores.push(usuario_id);
  }

  if (entidade) {
    query += ' AND h.entidade = $' + (valores.length + 1);
    valores.push(entidade);
  }

  if (entidade_id) {
    query += ' AND h.entidade_id = $' + (valores.length + 1);
    valores.push(entidade_id);
  }

  if (acao) {
    query += ' AND h.acao = $' + (valores.length + 1);
    valores.push(acao);
  }

  if (inicio) {
    query += ' AND h.data >= $' + (valores.length + 1);
    valores.push(inicio);
  }

  if (fim) {
    query += ' AND h.data <= $' + (valores.length + 1);
    valores.push(fim);
  }

  query += ' ORDER BY h.data DESC';

  if (limit) {
    query += ' LIMIT $' + (valores.length + 1);
    valores.push(limit);
  }

  if (offset) {
    query += ' OFFSET $' + (valores.length + 1);
    valores.push(offset);
  }

  try {
    const result = await db.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

module.exports = router;