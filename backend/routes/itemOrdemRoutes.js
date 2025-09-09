const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const registrarHistorico = require('../middlewares/logHistorico');
const checkPermissao = require('../middlewares/checkPermissao');

// Listar todos os itens de uma OS específica
router.get('/', async (req, res) => {
  // ✅ CORREÇÃO: Lendo o parâmetro 'ordem_servico_id' que o frontend envia
  const { ordem_servico_id } = req.query;

  // Garante que um ID foi fornecido
  if (!ordem_servico_id) {
    return res.status(400).json({ error: 'ID da Ordem de Serviço é obrigatório.' });
  }

  try {
    // ✅ CORREÇÃO: Usando a tabela e coluna corretas
    const query = 'SELECT * FROM itens_ordem_servico WHERE ordem_servico_id = $1 ORDER BY id ASC';
    const params = [ordem_servico_id];
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar itens de ordem:", error);
    res.status(500).json({ error: 'Erro ao buscar itens de ordem' });
  }
});

// Criar novo item e ATUALIZAR O TOTAL DA OS
router.post('/',
    checkPermissao(['administrador', 'funcionario']),
    [
        // ✅ CORREÇÃO: Validação alinhada com o formulário e a tabela
        body('ordem_servico_id').isInt().withMessage('ID da ordem é obrigatório'),
        body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
        body('quantidade').isInt({ gt: 0 }).withMessage('Quantidade deve ser um número maior que zero'),
        body('preco_unitario').isFloat({ gt: -1 }).withMessage('Preço unitário deve ser numérico'),
        body('subtotal').isFloat().withMessage('Subtotal deve ser numérico'),
        body('tipo_item').notEmpty().withMessage('Tipo do item é obrigatório')
    ],
    async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

        const { ordem_servico_id, descricao, quantidade, preco_unitario, subtotal, tipo_item } = req.body;
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // ✅ CORREÇÃO: Query de INSERT com a tabela e colunas corretas
            const insertItemQuery = `
                INSERT INTO itens_ordem_servico (ordem_servico_id, descricao, quantidade, preco_unitario, subtotal, tipo_item) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `;
            const newItemResult = await client.query(insertItemQuery, [ordem_servico_id, descricao, quantidade, preco_unitario, subtotal, tipo_item]);

            // ✅ CORREÇÃO: Recalcula e atualiza o valor_total na OS somando os subtotais
            const updateTotalQuery = `
                UPDATE ordens_servico
                SET valor_total = (SELECT SUM(subtotal) FROM itens_ordem_servico WHERE ordem_servico_id = $1)
                WHERE id = $1;
            `;
            await client.query(updateTotalQuery, [ordem_servico_id]);

            await client.query('COMMIT');
            
            await registrarHistorico({
                usuario_id: req.user.id,
                acao: 'criar',
                entidade: 'itens_ordem_servico',
                entidade_id: newItemResult.rows[0].id,
                dados_novos: newItemResult.rows[0]
            });
            
            res.status(201).json(newItemResult.rows[0]);

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
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('quantidade').isInt({ gt: 0 }).withMessage('Quantidade deve ser um número maior que zero'),
    body('preco_unitario').isFloat({ gt: -1 }).withMessage('Preço unitário deve ser numérico'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { id } = req.params;
    const { descricao, quantidade, preco_unitario } = req.body;
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

        const updateQuery = `
            UPDATE itens_ordem_servico 
            SET descricao = $1, quantidade = $2, preco_unitario = $3, subtotal = $4 
            WHERE id = $5 RETURNING *
        `;
        const updatedItemResult = await client.query(updateQuery, [descricao, quantidade, preco_unitario, subtotal, id]);

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
