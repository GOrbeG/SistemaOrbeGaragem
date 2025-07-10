// backend/routes/usuariosRoutes.js
const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const checkPermissao = require('../middlewares/checkPermissao');
const multer = require('multer');
const upload = multer();
const router = express.Router();
const registrarHistorico = require('../middlewares/logHistorico');

// ✅ NOVA ROTA: Listar todos os usuários (funcionários e administradores)
router.get('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT id, nome, email, role FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`ERRO AO BUSCAR USUÁRIO ${id}:`, error);
        res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
    }
});

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
      // ✅ CORREÇÃO CRÍTICA: Adiciona o log detalhado do erro
      console.error("ERRO DETALHADO AO CRIAR USUÁRIO:", error);

      // Verifica se o erro é de violação de constraint única (email ou cpf)
      if (error.code === '23505') { // Código de erro do PostgreSQL para unique_violation
        return res.status(409).json({ error: `Já existe um usuário com este ${error.constraint.includes('email') ? 'email' : 'CPF'}.` });
      }

      res.status(500).json({ error: 'Erro interno ao criar o usuário.' });
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

// ✅ ROTA CORRIGIDA: Lista apenas usuários que podem ser técnicos e usa o nome de coluna correto
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    // Esta query agora busca apenas funcionários/admins e usa 'created_at'
    const query = `
      SELECT id, nome, email, cpf, role, created_at FROM usuarios 
      WHERE role = 'funcionario' OR role = 'administrador'
      ORDER BY nome ASC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("ERRO AO LISTAR USUÁRIOS TÉCNICOS:", error);
    res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
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
