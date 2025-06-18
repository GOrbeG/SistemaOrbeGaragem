// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, register } = require('../controllers/authController');
const multer = require('multer');

const upload = multer(); // Configuração básica do multer

// --- MUDANÇA 1: Criar um array de middlewares para a rota de registro ---
const registerValidation = [
  // Primeiro, o multer para ler os dados do formulário
  upload.single('foto'), 
  
  // Em seguida, as validações
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('cpf').notEmpty().withMessage('CPF é obrigatório'),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
];

// --- MUDANÇA 2: Aplicar os middlewares na rota ---
// O primeiro argumento é o caminho, o segundo é o array de middlewares, e o terceiro é o controller.
router.post('/register', registerValidation, register);


// A rota de login continua a mesma
const loginValidation = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

router.post('/login', loginValidation, login); // Adicionando validação ao login também

module.exports = router;