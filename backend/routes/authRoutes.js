// backend/src/routes/authRoutes.js - VERSÃO COM CADASTRO UNIFICADO
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Validação para o novo formulário de cadastro de cliente
const validacaoCadastroCliente = [
  body('nome').notEmpty().withMessage('O nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  body('cpf_cnpj').notEmpty().withMessage('CPF ou CNPJ é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório')
];

// ✅ NOVO ENDPOINT: Rota transacional para registrar um cliente com acesso ao portal
router.post('/register-client', validacaoCadastroCliente, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, email, senha, cpf_cnpj, telefone, data_nascimento, cep, logradouro, numero, bairro, cidade, estado } = req.body;
  
  // Inicia a transação com o banco de dados
  const client = await db.connect();
  try {
    // PASSO A: Inicia a operação "tudo ou nada"
    await client.query('BEGIN');

    // PASSO B: Cria o registro na tabela 'usuarios'
    const hashedPassword = await bcrypt.hash(senha, 10);
    const userQuery = `
      INSERT INTO usuarios (nome, email, senha, role, cpf)
      VALUES ($1, $2, $3, 'cliente', $4)
      RETURNING id;
    `;
    const userResult = await client.query(userQuery, [nome, email, hashedPassword, cpf_cnpj]);
    const newUserId = userResult.rows[0].id;

    // PASSO C: Cria o registro na tabela 'clientes', ligando com o usuário recém-criado
    const clienteQuery = `
      INSERT INTO clientes (nome, email, telefone, cpf_cnpj, tipo_pessoa, data_nascimento, cep, logradouro, numero, bairro, cidade, estado, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const tipoPessoa = (cpf_cnpj || '').length > 14 ? 'PJ' : 'PF'; // Valida se é CNPJ ou CPF
    
    await client.query(clienteQuery, [nome, email, telefone, cpf_cnpj, tipoPessoa, data_nascimento || null, cep, logradouro, numero, bairro, cidade, estado, newUserId]);

    // PASSO D: Se tudo deu certo, confirma a transação
    await client.query('COMMIT');
    res.status(201).json({ message: 'Cadastro realizado com sucesso! Você já pode fazer o login.' });

  } catch (error) {
    // PASSO E: Se algo deu errado, desfaz todas as operações
    await client.query('ROLLBACK');
    console.error("ERRO NA TRANSAÇÃO DE CADASTRO:", error);

    if (error.code === '23505') { // Erro de valor único duplicado (email ou cpf)
      return res.status(409).json({ error: `Já existe um cadastro com este ${error.constraint.includes('email') ? 'email' : 'CPF/CNPJ'}.` });
    }
    
    res.status(500).json({ error: 'Ocorreu um erro inesperado durante o cadastro.' });
  } finally {
    // Libera a conexão com o banco de dados
    client.release();
  }
});


// Rota de Login (pode manter a sua lógica atual aqui, se já tiver)
router.post('/login', async (req, res) => {
    // ... sua lógica de login atual ...
    // Se não tiver, podemos adicionar depois.
});


module.exports = router;