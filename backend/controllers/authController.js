// backend/controllers/authController.js

// --- MUDANÇA 1: Importe o 'validationResult' ---
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  // Executa as validações que definimos na rota
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  // MUDANÇA 2: Remova 'role' daqui, pois ele será definido como 'cliente' logo abaixo
  const { nome, email, senha, cpf } = req.body;

  try {
    // Verifica se o usuário já existe
    const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE email = $1 OR cpf = $2', [email, cpf]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail ou CPF já cadastrado.' });
    }

    // Garante que o 'role' para registros públicos seja sempre 'cliente'
    const role = 'cliente';
    const senhaHash = await bcrypt.hash(senha, 10);

    // A query para inserir no banco já estava correta, usando 'role'
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha, cpf, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, cpf, role',
      [nome, email, cpf, senhaHash, role]
    );

    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  // A sua função de login já está correta e não precisa de alterações.
  // Apenas adicionei um log de erro para facilitar depurações futuras.
  const { email, senha } = req.body;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' }); // Usar 401 para não vazar info
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};