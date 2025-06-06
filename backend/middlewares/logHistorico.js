const db = require('../config/db');

async function registrarHistorico({ usuario_id, acao, entidade, entidade_id, dados_anteriores, dados_novos }) {
  try {
    await db.query(
      `INSERT INTO historico_acoes (usuario_id, acao, entidade, entidade_id, dados_anteriores, dados_novos)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        usuario_id,
        acao,
        entidade,
        entidade_id,
        dados_anteriores ? JSON.stringify(dados_anteriores) : null,
        dados_novos ? JSON.stringify(dados_novos) : null
      ]
    );
  } catch (error) {
    console.error('Erro ao registrar histórico:', error);
  }
}

module.exports = registrarHistorico;
