// backend/src/routes/setupRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const router = express.Router();

router.post(
  '/create-first-admin',
  [
    body('nome').notEmpty(),
    body('email').isEmail(),
    body('senha').isLength({ min: 6 }),
    body('cpf').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // VERIFICAÇÃO DE SEGURANÇA: Checa se já existe algum usuário
      const userCountResult = await db.query('SELECT COUNT(*) FROM usuarios');
      if (parseInt(userCountResult.rows[0].count) > 0) {
        return res.status(403).json({ error: 'Acesso negado. O administrador inicial já foi criado.' });
      }

      // Se não houver usuários, prossegue com a criação
      const { nome, email, senha, cpf } = req.body;
      const hashedPassword = await bcrypt.hash(senha, 10);

      const result = await db.query(
        `INSERT INTO usuarios (nome, email, senha, role, cpf) 
         VALUES ($1, $2, $3, 'administrador', $4) RETURNING id, nome, email, role`,
        [nome, email, hashedPassword, cpf]
      );

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error("Erro ao criar primeiro admin:", error);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
);

module.exports = router;