const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const registrarHistorico = require('../middlewares/logHistorico');
const checkPermissao = require('../middlewares/checkPermissao');

// ✅ ROTA ATUALIZADA: Listar todos os itens ou filtrar por ordem_id
router.get('/', async (req, res) => {
  const { ordemId } = req.query;

  try {
    let query = 'SELECT * FROM itens_ordem';
    const params = [];

    if (ordemId) {
      query += ' WHERE ordem_id = $1';
      params.push(ordemId);
    }
    
    const result = await db.query(query, params);
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

// ✅ ROTA ATUALIZADA: Criar novo item e ATUALIZAR O TOTAL DA OS
router.post('/',
    checkPermissao(['administrador', 'funcionario']),
    [
        body('ordem_id').isInt().withMessage('ID da ordem é obrigatório'),
        body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
        body('valor').isFloat({ gt: -1 }).withMessage('Valor deve ser numérico') // Permitindo valor 0
    ],
    async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

        const { ordem_id, descricao, valor } = req.body;
        const client = await db.connect(); // Inicia conexão para transação

        try {
            await client.query('BEGIN'); // Começa a transação

            // 1. Insere o novo item
            const insertItemQuery = 'INSERT INTO itens_ordem (ordem_id, descricao, valor) VALUES ($1, $2, $3) RETURNING *';
            const newItemResult = await client.query(insertItemQuery, [ordem_id, descricao, valor]);

            // 2. Recalcula e atualiza o valor_total na tabela ordens_servico
            const updateTotalQuery = `
                UPDATE ordens_servico
                SET valor_total = (SELECT SUM(valor) FROM itens_ordem WHERE ordem_id = $1)
                WHERE id = $1;
            `;
            await client.query(updateTotalQuery, [ordem_id]);

            await client.query('COMMIT'); // Confirma a transação se tudo deu certo
            
            // Opcional: Registrar histórico
            await registrarHistorico({
                usuario_id: req.user.id,
                acao: 'criar',
                entidade: 'itens_ordem',
                entidade_id: newItemResult.rows[0].id,
                dados_novos: newItemResult.rows[0]
            });
            
            res.status(201).json(newItemResult.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK'); // Desfaz tudo se der erro
            console.error("Erro ao criar item:", error);
            res.status(500).json({ error: 'Erro ao criar item' });
        } finally {
            client.release(); // Libera a conexão
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
