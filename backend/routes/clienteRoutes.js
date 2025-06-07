const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');
const registrarHistorico = require('../middlewares/logHistorico');
const checkPermissao = require('../middlewares/checkPermissao');

//Listar todos os clientes
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

//Buscar clientes por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

//Criar novos clientes
router.post(
  '/',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('endereco').notEmpty().withMessage('Endereço é obrigatório')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { nome, telefone, email, endereco } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO clientes (nome, telefone, email, endereco) VALUES ($1, $2, $3, $4) RETURNING *',
        [nome, telefone, email, endereco]
      );

      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'criar',
        entidade: 'clientes',
        entidade_id: result.rows[0].id,
        dados_novos: result.rows[0]
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  }
);

//Atualizar cliente
router.put(
  '/:id',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('endereco').notEmpty().withMessage('Endereço é obrigatório')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { nome, telefone, email, endereco } = req.body;
    try {
      // ✅ PASSO 1: ANTES de atualizar, busque o estado atual do cliente
      const clienteAntes = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
      if (clienteAntes.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado para buscar dados antigos' });
      }

      const result = await db.query(
        'UPDATE clientes SET nome = $1, telefone = $2, email = $3, endereco = $4 WHERE id = $5 RETURNING *',
        [nome, telefone, email, endereco, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado para atualizar' });
      
      // ✅ PASSO 3: Use a variável correta que você acabou de buscar
      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'atualizar',
        entidade: 'clientes',
        entidade_id: req.params.id,
        dados_anteriores: clienteAntes.rows[0], // Agora "clienteAntes" existe!
        dados_novos: result.rows[0]
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error); // Adicione um log para ver o erro
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }
);

//Deletar CLiente
router.delete('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const clienteAntes = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (clienteAntes.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado para deletar' });
    }

    await db.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    
    // ✅ PASSO 3: Use a variável correta para o histórico
    await registrarHistorico({
      usuario_id: req.user.id,
      acao: 'deletar',
      entidade: 'clientes',
      entidade_id: req.params.id,
      dados_anteriores: clienteAntes.rows[0] // Agora "clienteAntes" existe!
    });
    
    res.json({ mensagem: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error); // Adicione um log para ver o erro
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;