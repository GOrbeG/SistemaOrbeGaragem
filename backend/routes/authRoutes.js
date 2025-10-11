// backend/src/routes/authRoutes.js - VERSÃO FINAL COM TODAS AS CORREÇÕES
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const cors = require('cors');

const router = express.Router();

// ✅ CORREÇÃO: Definição do corsOptions que estava faltando
const corsOptions = {
    origin: 'https://sistemaorbegaragem-1.onrender.com', 
    optionsSuccessStatus: 200
};

// --- ROTA DE LOGIN ---
// Habilita explicitamente a "sondagem" de segurança (preflight) para a rota de login
router.options('/login', cors(corsOptions)); 

router.post('/login', cors(corsOptions),
  [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { email, senha } = req.body;

    try {
      // ✅ NOVA QUERY COM LEFT JOIN E COALESCE
      const query = `
        SELECT
          u.id,
          u.nome,
          u.email,
          u.senha,
          u.role,
          u.avatar_url,
          COALESCE(u.telefone, c.telefone) AS telefone,
          COALESCE(u.endereco, CONCAT_WS(', ', c.logradouro, c.numero, c.bairro, c.cidade, c.estado)) AS endereco
        FROM usuarios u
        LEFT JOIN clientes c ON u.id = c.usuario_id
        WHERE u.email = $1;
      `;
      
      const result = await db.query(query, [email]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const usuario = result.rows[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, role: usuario.role },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      // ✅ OBJETO ENVIADO PARA O FRONTEND AGORA ESTÁ COMPLETO E CORRETO
      const usuarioParaFrontend = {
        id: usuario.id,
        name: usuario.nome, // Frontend espera 'name'
        email: usuario.email,
        role: usuario.role,
        phone: usuario.telefone, // Vem da coluna unificada 'telefone'
        address: usuario.endereco, // Vem da coluna unificada 'endereco'
        avatarUrl: usuario.avatar_url
      };

      res.json({ token, usuario: usuarioParaFrontend });

    } catch (error) {
      console.error("ERRO NO LOGIN:", error);
      res.status(500).json({ error: 'Erro interno ao fazer login' });
    }
  }
);


// --- ROTA DE CADASTRO DE CLIENTE ---
const validacaoCadastroCliente = [
  body('nome').notEmpty().withMessage('O nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  body('cpf_cnpj').notEmpty().withMessage('CPF ou CNPJ é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório')
];

router.post('/register-client', cors(corsOptions), validacaoCadastroCliente, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { nome, email, senha, cpf_cnpj, telefone, data_nascimento, cep, logradouro, numero, bairro, cidade, estado } = req.body;
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const hashedPassword = await bcrypt.hash(senha, 10);
      const userQuery = `INSERT INTO usuarios (nome, email, senha, role, cpf) VALUES ($1, $2, $3, 'cliente', $4) RETURNING id;`;
      const userResult = await client.query(userQuery, [nome, email, hashedPassword, cpf_cnpj]);
      const newUserId = userResult.rows[0].id;
      const clienteQuery = `INSERT INTO clientes (nome, email, telefone, cpf_cnpj, tipo_pessoa, data_nascimento, cep, logradouro, numero, bairro, cidade, estado, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`;
      const tipoPessoa = (cpf_cnpj || '').length > 14 ? 'PJ' : 'PF';
      await client.query(clienteQuery, [nome, email, telefone, cpf_cnpj, tipoPessoa, data_nascimento || null, cep, logradouro, numero, bairro, cidade, estado, newUserId]);
      await client.query('COMMIT');
      res.status(201).json({ message: 'Cadastro realizado com sucesso! Você já pode fazer o login.' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("ERRO NA TRANSAÇÃO DE CADASTRO:", error);
      if (error.code === '23505') {
        return res.status(409).json({ error: `Já existe um cadastro com este ${error.constraint.includes('email') ? 'email' : 'CPF/CNPJ'}.` });
      }
      res.status(500).json({ error: 'Ocorreu um erro inesperado durante o cadastro.' });
    } finally {
      client.release();
    }
});


module.exports = router;