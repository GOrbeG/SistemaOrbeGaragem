// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const verificarJWT = require('./middlewares/authMiddleware');
const app = express();

// --- Middlewares Globais ---
const corsOptions = {
  // A URL exata do seu frontend no Render
  origin: 'https://sistemaorbegaragem-1.onrender.com', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));


// --- ROTAS PÚBLICAS ---
// Apenas login e o registro de novos CLIENTES ficam aqui.
app.use('/api/auth', require('./routes/authRoutes'));


// --- PROTEÇÃO GLOBAL ---
// A partir daqui, TODAS as rotas abaixo exigirão um token JWT válido para prosseguir.
app.use(verificarJWT());


// --- ROTAS PROTEGIDAS ---
// Agora, a rota para gerenciar usuários (criar funcionários, etc.) está aqui.
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/veiculos', require('./routes/veiculoRoutes'));
app.use('/api/os', require('./routes/osRoutes'));
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


// Rota raiz apenas para checagem de status
app.get('/', (req, res) => {
  res.send('API Orbe Garage rodando com sucesso!');
});


module.exports = app;