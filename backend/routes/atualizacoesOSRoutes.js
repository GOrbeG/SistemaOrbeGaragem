// backend/routes/atualizacoesOSRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const checkPermissao = require('../middlewares/checkPermissao');
const jwt = require('jsonwebtoken');

// ROTA PROTEGIDA (para funcionários/admins)
// POST: Adicionar uma nova atualização a uma OS
router.post('/',
    checkPermissao(['administrador', 'funcionario']),
    [
        body('ordem_servico_id').isInt().withMessage('ID da OS é obrigatório'),
        body('descricao').notEmpty().withMessage('A descrição da atualização é obrigatória.'),
        body('tipo_atualizacao').notEmpty().withMessage('O tipo da atualização é obrigatório.'),
        body('novo_status').optional().isString().withMessage('Novo status inválido.')
    ],
    async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

        const { ordem_servico_id, descricao, url_midia, tipo_atualizacao, novo_status } = req.body;
        const usuario_id = req.user.id; // Pega o ID do funcionário logado

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // 1. Insere a nova atualização na tabela de histórico
            const insertQuery = `
                INSERT INTO atualizacoes_os (ordem_servico_id, usuario_id, descricao, url_midia, tipo_atualizacao)
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `;
            const novaAtualizacao = await client.query(insertQuery, [ordem_servico_id, usuario_id, descricao, url_midia, tipo_atualizacao]);

            // 2. Se a atualização for uma mudança de status, atualiza a OS principal
            if (tipo_atualizacao === 'Status' && novo_status) {
                await client.query(
                    'UPDATE ordens_servico SET status = $1 WHERE id = $2;',
                    [novo_status, ordem_servico_id]
                );
            }

            await client.query('COMMIT');
            res.status(201).json(novaAtualizacao.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Erro ao criar atualização da OS:", error);
            res.status(500).json({ error: 'Erro interno ao salvar atualização.' });
        } finally {
            client.release();
        }
    }
);


// ROTA PÚBLICA (para o cliente ver)
// GET: Buscar todas as atualizações de uma OS via token
router.get('/publico/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const os_id = decoded.os_id;

        // Busca as atualizações e junta com a tabela de usuários para pegar o nome do funcionário
        const query = `
            SELECT a.*, u.nome AS nome_usuario 
            FROM atualizacoes_os a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.ordem_servico_id = $1
            ORDER BY a.data_criacao DESC;
        `;

        const atualizacoesResult = await db.query(query, [os_id]);
        
        // Também busca os dados principais da OS para exibir na página
        const osResult = await db.query('SELECT * FROM ordens_servico WHERE id = $1', [os_id]);
        if (osResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
        }

        res.json({
            os: osResult.rows[0],
            atualizacoes: atualizacoesResult.rows
        });

    } catch (error) {
        console.error("Erro ao buscar atualizações públicas:", error);
        // Se o token for inválido ou expirado, o jwt.verify vai gerar um erro
        res.status(403).json({ error: 'Acesso negado. Token inválido ou expirado.' });
    }
});


module.exports = router;