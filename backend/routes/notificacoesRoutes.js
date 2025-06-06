// backend/routes/notificacoesRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Criar notificação
router.post('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const { usuario_id, mensagem, tipo } = req.body;
    const result = await db.query(
      'INSERT INTO notificacoes (usuario_id, mensagem, tipo) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, mensagem, tipo || 'info']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar notificação' });
  }
});

// Listar notificações do usuário
router.get('/:usuario_id', checkPermissao(['cliente', 'administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notificacoes WHERE usuario_id = $1 ORDER BY data_criacao DESC',
      [req.params.usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// Marcar como lida
router.put('/:id/lida', checkPermissao(['cliente', 'administrador', 'funcionario']), async (req, res) => {
  try {
    await db.query(
      'UPDATE notificacoes SET lida = TRUE WHERE id = $1',
      [req.params.id]
    );
    res.json({ mensagem: 'Notificação marcada como lida' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar como lida' });
  }
});

// Deletar notificação
router.delete('/:id',checkPermissao(['cliente', 'administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM notificacoes WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json({ mensagem: 'Notificação deletada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar notificação' });
  }
});

module.exports = router;
