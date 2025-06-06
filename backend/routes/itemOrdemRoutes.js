const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const registrarHistorico = require('../middlewares/logHistorico');

// Listar todos os itens de todas as ordens
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM itens_ordem');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar itens de ordem' });
  }
});

// buscar item por id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM itens_ordem WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
});

// Criar novo item para uma ordem de serviço
router.post(
  '/',
  [
    body('ordem_id').isInt().withMessage('ID da ordem é obrigatório'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('valor').isFloat({ gt: 0 }).withMessage('Valor deve ser numérico e maior que zero')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { ordem_id, descricao, valor } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO itens_ordem (ordem_id, descricao, valor) VALUES ($1, $2, $3) RETURNING *',
        [ordem_id, descricao, valor]
      );

      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'criar',
        entidade: 'itens_ordem',
        entidade_id: result.rows[0].id,
        dados_novos: result.rows[0]
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar item' });
    }
  }
);

// Atualizar item da ordem
router.put(
  '/:id',
  [
    body('ordem_id').isInt().withMessage('ID da ordem é obrigatório'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('valor').isFloat({ gt: 0 }).withMessage('Valor deve ser numérico e maior que zero')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { ordem_id, descricao, valor } = req.body;
    try {
      const itemAntes = await db.query('SELECT * FROM itens_ordem WHERE id = $1', [req.params.id]);

      const result = await db.query(
        'UPDATE itens_ordem SET ordem_id = $1, descricao = $2, valor = $3 WHERE id = $4 RETURNING *',
        [ordem_id, descricao, valor, req.params.id]
      );

      if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });

      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'atualizar',
        entidade: 'itens_ordem',
        entidade_id: req.params.id,
        dados_anteriores: itemAntes.rows[0],
        dados_novos: result.rows[0]
      });

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar item' });
    }
  }
);

// Deletar item da ordem
router.delete('/:id', async (req, res) => {
  try {
    const itemAntes = await db.query('SELECT * FROM itens_ordem WHERE id = $1', [req.params.id]);

    const result = await db.query('DELETE FROM itens_ordem WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });

    await registrarHistorico({
      usuario_id: req.user.id,
      acao: 'deletar',
      entidade: 'itens_ordem',
      entidade_id: req.params.id,
      dados_anteriores: itemAntes.rows[0]
    });

    res.json({ mensagem: 'Item deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar item' });
  }
});

module.exports = router;
