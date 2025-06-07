// backend/index.js
require('dotenv').config();

const app = require('./app');

// usa a porta que o Render injeta em process.env.PORT, cai para 10000 em dev local
const port = process.env.PORT || 10000;

// rota de health-check (opcional mas recomendado)
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ... suas outras rotas / middlewares aqui ...

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
