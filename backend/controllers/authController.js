// backend/controllers/authController.js

// --- MUDANÇA 1: Importe o 'validationResult' da biblioteca express-validator ---
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  const { nome, email, senha, cpf } = req.body;

  try {
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE email = $1 OR cpf = $2', [email, cpfLimpo]);
    
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail ou CPF já cadastrado.' });
    }

    const role = 'cliente';
    const senhaHash = await bcrypt.hash(senha, 10);

    // --- CÓDIGO DE DEPURAÇÃO ---
    // Este bloco vai nos mostrar os dados exatos antes de salvar
    console.log('--- INICIANDO DEPURAÇÃO DOS DADOS PARA INSERT ---');
    console.log(`Valor de NOME: "${nome}", Tamanho: ${nome?.length}`);
    console.log(`Valor de EMAIL: "${email}", Tamanho: ${email?.length}`);
    console.log(`Valor de SENHA HASH: "${senhaHash}", Tamanho: ${senhaHash?.length}`);
    console.log(`Valor de CPF LIMPO: "${cpfLimpo}", Tamanho: ${cpfLimpo?.length}`);
    console.log(`Valor de ROLE: "${role}", Tamanho: ${role?.length}`);
    console.log('--- FIM DA DEPURAÇÃO ---');
    // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha, cpf, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, cpf, role`,
      [nome, email, senhaHash, cpfLimpo, role]
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
  // Sua função de login está correta, não precisa de alterações.
  // Apenas adicionei um log de erro para facilitar depurações futuras.
  const { email, senha } = req.body;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
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