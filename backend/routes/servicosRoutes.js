// backend/routes/servicosRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

// Rota para listar todos os serviços disponíveis
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
    try {
        const result = await db.query('SELECT id, nome_servico, preco_padrao FROM servicos ORDER BY nome_servico ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        res.status(500).json({ error: 'Erro interno ao buscar serviços' });
    }
});

// Outras rotas (criar, editar, deletar serviços) podem ser adicionadas aqui no futuro

module.exports = router;