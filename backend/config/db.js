const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // --- INÍCIO DA CORREÇÃO ---
  // Adicione este objeto para habilitar a conexão SSL exigida pelo Render
  ssl: {
    rejectUnauthorized: false
  }
  // --- FIM DA CORREÇÃO ---
});

pool.on('connect', () => {
  console.log('🐘 Postgres conectado com sucesso!');
});
pool.on('error', (err) => {
  console.error('❌ Erro no pool do Postgres:', err.message);
});

module.exports = pool;