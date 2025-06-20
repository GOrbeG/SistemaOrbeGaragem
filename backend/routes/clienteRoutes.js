const express = require('express');
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const checkPermissao = require('../middlewares/checkPermissao');
const registrarHistorico = require('../middlewares/logHistorico');

const router = express.Router();

// Middleware de validação para reuso e consistência
const validacaoCliente = [
  body('nome').notEmpty().withMessage('O nome é obrigatório.').isLength({ min: 3 }),
  body('tipo_pessoa').isIn(['PF', 'PJ']).withMessage('Tipo de pessoa inválido (deve ser PF ou PJ).'),
  body('cpf_cnpj').notEmpty().withMessage('CPF/CNPJ é obrigatório.').isLength({ min: 11, max: 18 }),
  body('email').isEmail().withMessage('Formato de e-mail inválido.').optional({ checkFalsy: true }),
  body('telefone').notEmpty().withMessage('O telefone é obrigatório.'),
  body('data_nascimento').isISO8601().toDate().withMessage('Data de nascimento inválida.').optional({ checkFalsy: true }),
  body('cep').isLength({ min: 8, max: 9 }).withMessage('CEP inválido.').optional({ checkFalsy: true }),
];


// GET: Listar todos os clientes (com funcionalidade de busca)
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT id, nome, email, telefone FROM clientes ORDER BY nome ASC';
    const params = [];

    // Se houver um termo de busca, modifica a query para filtrar
    if (search) {
      query = 'SELECT id, nome, email, telefone FROM clientes WHERE nome ILIKE $1 OR email ILIKE $1 OR cpf_cnpj ILIKE $1 ORDER BY nome ASC';
      params.push(`%${search}%`);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// GET: Obter um cliente por ID
router.get('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// POST: Criar um novo cliente
router.post('/', checkPermissao(['administrador', 'funcionario']), validacaoCliente, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, tipo_pessoa, cpf_cnpj, email, telefone, data_nascimento, cep, logradouro, numero, bairro, cidade, estado } = req.body;

  try {
    // VERIFICAÇÃO IMPORTANTE: Impede CPF/CNPJ duplicado
    const clienteExistente = await db.query('SELECT id FROM clientes WHERE cpf_cnpj = $1', [cpf_cnpj]);
    if (clienteExistente.rows.length > 0) {
        return res.status(409).json({ errors: [{ msg: 'Já existe um cliente com este CPF/CNPJ.' }] });
    }

    const query = `
      INSERT INTO clientes (nome, tipo_pessoa, cpf_cnpj, email, telefone, data_nascimento, cep, logradouro, numero, bairro, cidade, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const params = [nome, tipo_pessoa, cpf_cnpj, email, telefone, data_nascimento || null, cep, logradouro, numero, bairro, cidade, estado];
    
    const result = await db.query(query, params);
    
    await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'criar',
        entidade: 'clientes',
        entidade_id: result.rows[0].id,
        dados_novos: result.rows[0]
      });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// PUT: Atualizar um cliente
router.put('/:id', checkPermissao(['administrador', 'funcionario']), validacaoCliente, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { nome, tipo_pessoa, cpf_cnpj, email, telefone, data_nascimento, cep, logradouro, numero, bairro, cidade, estado } = req.body;

  try {
    // VERIFICAÇÃO IMPORTANTE: Impede CPF/CNPJ duplicado em OUTROS clientes
    const clienteExistente = await db.query('SELECT id FROM clientes WHERE cpf_cnpj = $1 AND id != $2', [cpf_cnpj, id]);
    if (clienteExistente.rows.length > 0) {
        return res.status(409).json({ errors: [{ msg: 'Já existe outro cliente com este CPF/CNPJ.' }] });
    }

    // Busca o estado atual do cliente para o histórico
    const clienteAntes = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (clienteAntes.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const query = `
      UPDATE clientes SET nome = $1, tipo_pessoa = $2, cpf_cnpj = $3, email = $4, telefone = $5, data_nascimento = $6, cep = $7, logradouro = $8, numero = $9, bairro = $10, cidade = $11, estado = $12
      WHERE id = $13
      RETURNING *;
    `;
    const params = [nome, tipo_pessoa, cpf_cnpj, email, telefone, data_nascimento || null, cep, logradouro, numero, bairro, cidade, estado, id];

    const result = await db.query(query, params);
    
    await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'atualizar',
        entidade: 'clientes',
        entidade_id: id,
        dados_anteriores: clienteAntes.rows[0],
        dados_novos: result.rows[0]
      });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// DELETE: Deletar um cliente
router.delete('/:id', checkPermissao(['administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    // Busca os dados antes de deletar para registrar no histórico
    const clienteAntes = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (clienteAntes.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    await db.query('DELETE FROM clientes WHERE id = $1', [id]);
    
    await registrarHistorico({
      usuario_id: req.user.id,
      acao: 'deletar',
      entidade: 'clientes',
      entidade_id: id,
      dados_anteriores: clienteAntes.rows[0]
    });
    
    res.status(204).send(); // Resposta padrão de sucesso sem conteúdo
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    // Erro de chave estrangeira (cliente tem OS, veículo, etc.)
    if (error.code === '23503') { 
        return res.status(400).json({ error: 'Não é possível excluir cliente pois ele possui registros associados (ordens de serviço, veículos, etc.).' });
    }
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;