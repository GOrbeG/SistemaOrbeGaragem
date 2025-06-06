// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const verificarJWT = require('./middlewares/autenticacaoMiddleware');
const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rotas públicas
app.use('/api/auth', require('./routes/authRoutes'));
pp.use('/api/login', require('./routes/loginRoutes'));

// Middleware de autenticação para todas as rotas abaixo
app.use(verificarJWT);

// Rotas protegidas
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/veiculos', require('./routes/veiculosRoutes'));
app.use('/api/os', require('./routes/osRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/historico', require('./routes/historicoRoutes'));
app.use('/api/agendamentos', require('./routes/agendamentosRoutes'));
app.use('/api/comentarios', require('./routes/comentariosRoutes'));
app.use('/api/financeiro', require('./routes/financeiroRoutes'));
app.use('/api/favoritos', require('./routes/favoritosRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notificacoes', require('./routes/notificacoesRoutes'));
app.use('/api/checklist', require('./routes/checklistRoutes'));
app.use('/api/checklist-confirmacao', require('./routes/checklistConfirmacaoRoutes'));
app.use('/api/assinaturas', require('./routes/assinaturaRoutes'));
app.use('/api/relatorios', require('./routes/relatoriosRoutes'));
app.use('/api/tecnicos', require('./routes/tecnicosRoutes'));
app.use('/api/itens-ordem', require('./routes/itemOrdemRoutes'));
app.use('/api/agenda', require('./routes/agendaRoutes'));

// Rota raiz
app.get('/', (req, res) => {
  res.send('API Orbe Garage rodando com sucesso!');
});

module.exports = app;
