const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('🐘 Postgres conectado com sucesso!');
});
pool.on('error', (err) => {
  console.error('❌ Erro no pool do Postgres:', err.message);
});

module.exports = pool;
