// backend/routes/usuariosRoutes.js
const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const checkPermissao = require('../middlewares/checkPermissao');

const multer = require('multer');
const upload = multer();

const router = express.Router();

// Criar novo usuário (admin ou funcionário)
router.post('/novo',
  //checkPermissao(['administrador']),
  upload.single('foto'),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('cpf').notEmpty().withMessage('CPF é obrigatório'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    body('role').isIn(['cliente', 'funcionario', 'administrador']).withMessage('role inválido')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { nome, email, cpf, senha, role } = req.body;
    try {
      const hash = await bcrypt.hash(senha, 10);
      const result = await db.query(
        `INSERT INTO usuarios (nome, email, cpf, senha, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, cpf, role`,
        [nome, email, cpf, hash, role]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
);

// Editar perfil (admin pode editar qualquer um, usuário só o próprio)
router.put('/:id', checkPermissao(['administrador', 'funcionario', 'cliente']), async (req, res) => {
  const { nome, email, cpf, senha } = req.body;
  const usuarioId = parseInt(req.params.id);

  if (req.user.role !== 'administrador' && req.user.id !== usuarioId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const campos = [];
    const valores = [];

    if (nome) {
      campos.push('nome = $' + (campos.length + 1));
      valores.push(nome);
    }
    if (email) {
      campos.push('email = $' + (campos.length + 1));
      valores.push(email);
    }
    if (cpf) {
      campos.push('cpf = $' + (campos.length + 1));
      valores.push(cpf);
    }
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      campos.push('senha = $' + (campos.length + 1));
      valores.push(hash);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });
    }

    const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${campos.length + 1} RETURNING id, nome, email, cpf, role`;
    valores.push(usuarioId);

    const result = await db.query(query, valores);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Listar usuários
router.get('/', checkPermissao(['administrador']), async (req, res) => {
  try {
    const result = await db.query('SELECT id, nome, email, cpf, role, criado_em FROM usuarios ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Deletar usuário
router.delete('/:id', checkPermissao(['administrador']), async (req, res) => {
  try {
    const result = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

module.exports = router;
