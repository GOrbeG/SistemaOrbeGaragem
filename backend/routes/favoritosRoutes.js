// backend/routes/favoritosRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Adicionar favorito
router.post('/', checkPermissao(['cliente']), async (req, res) => {
  try {
    const { usuario_id, entidade, entidade_id } = req.body;
    const result = await db.query(
      'INSERT INTO favoritos (usuario_id, entidade, entidade_id) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, entidade, entidade_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
});

// Listar favoritos por usuário
router.get('/:usuario_id', checkPermissao(['cliente']), async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const result = await db.query(
      'SELECT * FROM favoritos WHERE usuario_id = $1 ORDER BY data_adicao DESC',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// Remover favorito
router.delete('/:id', checkPermissao(['cliente']), async (req, res) => {
  try {
    await db.query('DELETE FROM favoritos WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Favorito removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

// Adicionar veículo aos favoritos
router.post('/veiculos', checkPermissao(['cliente']), async (req, res) => {
  try {
    const { usuario_id, veiculo_id } = req.body;
    const result = await db.query(
      'INSERT INTO favoritos (usuario_id, entidade, entidade_id) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, 'veiculo', veiculo_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao favoritar veículo' });
  }
});

// Listar veículos favoritos de um usuário
router.get('/veiculos/:usuario_id', checkPermissao(['cliente']), async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const result = await db.query(
      `SELECT f.id, v.*
       FROM favoritos f
       JOIN veiculos v ON v.id = f.entidade_id
       WHERE f.usuario_id = $1 AND f.entidade = 'veiculo'
       ORDER BY f.data_adicao DESC`,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar veículos favoritos' });
  }
});

// Remover favorito (veículo ou outro)
router.delete('/:id', checkPermissao(['cliente']), async (req, res) => {
  try {
    await db.query('DELETE FROM favoritos WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Favorito removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

module.exports = router;
