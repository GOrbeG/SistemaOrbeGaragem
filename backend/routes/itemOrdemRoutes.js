const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const registrarHistorico = require('../middlewares/logHistorico');
const checkPermissao = require('../middlewares/checkPermissao');

// Listar itens de uma OS (agora com JOIN para pegar nomes)
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
    const { ordem_servico_id } = req.query;
    if (!ordem_servico_id) return res.status(400).json({ error: 'ID da OS é obrigatório.' });
    try {
        const query = `
            SELECT 
                ios.id,
                ios.quantidade,
                ios.preco_unitario,
                ios.subtotal,
                -- Pega o nome do serviço, do produto, ou usa a descrição manual
                COALESCE(s.nome_servico, p.nome_produto, ios.descricao_manual) as descricao
            FROM itens_ordem_servico ios
            LEFT JOIN servicos s ON ios.servico_id = s.id
            LEFT JOIN produtos_pecas p ON ios.produto_peca_id = p.id
            WHERE ios.ordem_servico_id = $1
            ORDER BY ios.id ASC;
        `;
        const result = await db.query(query, [ordem_servico_id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar itens:", error);
        res.status(500).json({ error: 'Erro ao buscar itens' });
    }
});

// Criar novo item
router.post('/', checkPermissao(['administrador', 'funcionario']),
    [
        body('ordem_servico_id').isInt(),
        body('quantidade').isInt({ gt: 0 }),
        body('preco_unitario').isFloat({ gt: -1 }),
        // Valida um dos três tipos de item
        body().custom((value, { req }) => {
            const { servico_id, produto_peca_id, descricao_manual } = req.body;
            if (servico_id || produto_peca_id || descricao_manual) {
                return true;
            }
            throw new Error('É necessário fornecer um serviço, produto ou descrição manual.');
        })
    ],
    async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

        const { ordem_servico_id, servico_id, produto_peca_id, descricao_manual, quantidade, preco_unitario } = req.body;
        const subtotal = Number(quantidade) * Number(preco_unitario);
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const insertQuery = `
                INSERT INTO itens_ordem_servico (ordem_servico_id, servico_id, produto_peca_id, descricao_manual, quantidade, preco_unitario, subtotal)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
            `;
            const newItem = await client.query(insertQuery, [ordem_servico_id, servico_id || null, produto_peca_id || null, descricao_manual || null, quantidade, preco_unitario, subtotal]);

            const updateTotalQuery = `
                UPDATE ordens_servico SET valor_total = (SELECT SUM(subtotal) FROM itens_ordem_servico WHERE ordem_servico_id = $1) WHERE id = $1;
            `;
            await client.query(updateTotalQuery, [ordem_servico_id]);

            await client.query('COMMIT');
            res.status(201).json(newItem.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Erro ao criar item:", error);
            res.status(500).json({ error: 'Erro ao criar item' });
        } finally {
            client.release();
        }
    }
);

// Atualizar item da ordem e ATUALIZAR O TOTAL DA OS
router.put('/:id',
  checkPermissao(['administrador', 'funcionario']),
  [
    // A validação agora foca nos campos que podem ser editados
    body('quantidade').isInt({ gt: 0 }).withMessage('Quantidade deve ser um número maior que zero'),
    body('preco_unitario').isFloat({ gt: -1 }).withMessage('Preço unitário deve ser numérico'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { id } = req.params;
    const { quantidade, preco_unitario } = req.body;
    const subtotal = Number(quantidade) * Number(preco_unitario);
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const itemAntesResult = await client.query('SELECT * FROM itens_ordem_servico WHERE id = $1', [id]);
        if (itemAntesResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        const itemAntes = itemAntesResult.rows[0];
        const { ordem_servico_id } = itemAntes;

        // A query de atualização foca em quantidade e preço, que são os campos editáveis
        const updateQuery = `
            UPDATE itens_ordem_servico 
            SET quantidade = $1, preco_unitario = $2, subtotal = $3 
            WHERE id = $4 RETURNING *
        `;
        const updatedItemResult = await client.query(updateQuery, [quantidade, preco_unitario, subtotal, id]);

        const updateTotalQuery = `
            UPDATE ordens_servico
            SET valor_total = (SELECT SUM(subtotal) FROM itens_ordem_servico WHERE ordem_servico_id = $1)
            WHERE id = $1;
        `;
        await client.query(updateTotalQuery, [ordem_servico_id]);

        await client.query('COMMIT');

        await registrarHistorico({
            usuario_id: req.user.id,
            acao: 'atualizar',
            entidade: 'itens_ordem_servico',
            entidade_id: id,
            dados_anteriores: itemAntes,
            dados_novos: updatedItemResult.rows[0]
        });
        
        res.json(updatedItemResult.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao atualizar item:", error);
        res.status(500).json({ error: 'Erro ao atualizar item' });
    } finally {
        client.release();
    }
  }
);

// Deletar item da ordem e ATUALIZAR O TOTAL DA OS
router.delete('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const itemAntesResult = await client.query('SELECT * FROM itens_ordem_servico WHERE id = $1', [id]);
        if (itemAntesResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        const itemAntes = itemAntesResult.rows[0];
        const { ordem_servico_id } = itemAntes;

        await client.query('DELETE FROM itens_ordem_servico WHERE id = $1', [id]);

        const updateTotalQuery = `
            UPDATE ordens_servico
            SET valor_total = (SELECT COALESCE(SUM(subtotal), 0) FROM itens_ordem_servico WHERE ordem_servico_id = $1)
            WHERE id = $1;
        `;
        await client.query(updateTotalQuery, [ordem_servico_id]);

        await client.query('COMMIT');

        await registrarHistorico({
            usuario_id: req.user.id,
            acao: 'deletar',
            entidade: 'itens_ordem_servico',
            entidade_id: id,
            dados_anteriores: itemAntes
        });

        res.status(204).send();
  } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao deletar item:", error);
        res.status(500).json({ error: 'Erro ao deletar item' });
    } finally {
        client.release();
    }
});

module.exports = router;
