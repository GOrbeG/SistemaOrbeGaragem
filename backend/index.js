// backend/index.js
require('dotenv').config();
const app = require('./app');

const port = process.env.PORT;
if (!port) {
  console.error('⚠️ A variável PORT não está definida. Verifique as configurações do serviço no Render.');
  process.exit(1);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});