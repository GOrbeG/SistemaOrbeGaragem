// backend/routes/produtosRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

// Rota para listar todas as peças e produtos disponíveis
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
    try {
        const result = await db.query('SELECT id, nome_produto, preco_venda FROM produtos_pecas ORDER BY nome_produto ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar produtos' });
    }
});

// Outras rotas (criar, editar, deletar produtos) podem ser adicionadas aqui no futuro

module.exports = router;