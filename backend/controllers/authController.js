const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { nome, email, senha, role } = req.body;
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha, role) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, role',
      [nome, email, senhaHash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, nome: user.nome, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};