// backend/app.js - VERSÃO DE TESTE MÍNIMA
const express = require('express');
const pool = require('./config/db'); // Verifique se este caminho está correto
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const verificarJWT = require('./middlewares/authMiddleware');
const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rotas públicas (login e registro)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/login', require('./routes/loginRoutes'));
app.use('/api/os', require('./routes/osRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/historico', require('./routes/historicoRoutes'));
app.use('/api/agendamentos', require('./routes/agendamentosRoutes'));
app.use('/api/comentarios', require('./routes/comentariosRoutes'));

// A partir daqui, qualquer rota abaixo exigirá JWT válido
app.use(verificarJWT());

// Rotas protegidas (apenas com token válido)
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/veiculos', require('./routes/veiculoRoutes'))

// Rota raiz para o Render verificar se o servidor está vivo
app.get('/', (req, res) => {
  res.send('Servidor de teste mínimo está no ar!');
});

// Rota de teste do banco de dados com LOGS DETALHADOS
app.get('/api/test-db', async (req, res) => {
  console.log('➡️  [Passo 1] Recebi uma requisição em /api/test-db.');
  let client;

  try {
    console.log('➡️  [Passo 2] Tentando obter uma conexão do pool...');
    client = await pool.connect(); // Tenta pegar uma conexão
    console.log('✅  [Passo 3] Conexão do pool obtida com sucesso!');

    const result = await client.query('SELECT NOW()');
    console.log('✅  [Passo 4] Query executada com sucesso!');

    res.json({ agora: result.rows[0].now });

  } catch (err) {
    console.error('❌❌❌ ERRO NO BLOCO CATCH ❌❌❌');
    console.error('O erro foi:', err);
    res.status(500).json({
      error: 'Falha ao conectar ou consultar o banco de dados.',
      details: err.message,
      stack: err.stack
    });
  } finally {
    // Garante que a conexão seja sempre liberada
    if (client) {
      client.release();
      console.log('✅  [Passo 5] Conexão liberada de volta para o pool.');
    }
  }
});

module.exports = app;