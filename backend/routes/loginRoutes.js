// backend/routes/loginRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/',
  [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { email, senha } = req.body;

    try {
      const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });

      const usuario = result.rows[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas' });

      const token = jwt.sign(
        {
          id: usuario.id,
          nome: usuario.nome,
          papel: usuario.papel
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel } });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

module.exports = router;
