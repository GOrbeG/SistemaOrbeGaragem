// backend/routes/categoriasRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Listar todas as categorias
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const { tipo } = req.query;
    let query = 'SELECT * FROM categorias_financeiras ORDER BY nome ASC';
    const params = [];
    if (tipo) {
      query = 'SELECT * FROM categorias_financeiras WHERE tipo = $1 ORDER BY nome ASC';
      params.push(tipo);
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova categoria
router.post('/',
  checkPermissao(['administrador']),
  [
    body('nome_categoria').notEmpty().withMessage('O nome da categoria é obrigatório.'),
    body('tipo').isIn(['entrada', 'saida']).withMessage('O tipo deve ser "entrada" ou "saida".')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nome_categoria, tipo } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO categorias_financeiras (nome_categoria, tipo) VALUES ($1, $2) RETURNING *',
        [nome_categoria, tipo]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      if (error.code === '23505') { // Erro de nome único duplicado
        return res.status(409).json({ error: 'Já existe uma categoria com este nome.' });
      }
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }
);

// Deletar categoria (com segurança)
router.delete('/:id', checkPermissao(['administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica se a categoria está em uso antes de deletar
    const emUsoResult = await db.query('SELECT id FROM transacoes_financeiras WHERE categoria_id = $1 LIMIT 1', [id]);
    if (emUsoResult.rows.length > 0) {
      return res.status(400).json({ error: 'Não é possível excluir esta categoria, pois ela já está sendo utilizada em transações.' });
    }

    const deleteResult = await db.query('DELETE FROM categorias_financeiras WHERE id = $1 RETURNING *', [id]);
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    res.status(200).json({ message: 'Categoria excluída com sucesso.' });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});


module.exports = router;