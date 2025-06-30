// backend/src/routes/relatoriosRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');
const router = express.Router();

// Endpoint para o Resumo do Período (DRE Simplificado)
router.get('/resumo-periodo', checkPermissao(['administrador']), async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  
  try {
    const query = `
      SELECT 
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'entrada'), 0) AS total_receitas,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'saida'), 0) AS total_despesas
      FROM transacoes_financeiras
      WHERE data_transacao BETWEEN $1 AND $2;
    `;
    const { rows } = await db.query(query, [data_inicio, data_fim]);
    const { total_receitas, total_despesas } = rows[0];
    const lucro_prejuizo = total_receitas - total_despesas;

    res.json({
        total_receitas: parseFloat(total_receitas),
        total_despesas: parseFloat(total_despesas),
        lucro_prejuizo: parseFloat(lucro_prejuizo)
    });
  } catch (error) {
    console.error("Erro ao gerar resumo do período:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para a Distribuição por Categorias
router.get('/distribuicao-categorias', checkPermissao(['administrador']), async (req, res) => {
  const { data_inicio, data_fim } = req.query;

  try {
    const query = `
      SELECT c.nome, t.tipo, SUM(t.valor) AS total
      FROM transacoes_financeiras t
      JOIN categorias_financeiras c ON t.categoria_id = c.id
      WHERE t.data_transacao BETWEEN $1 AND $2
      GROUP BY c.nome, t.tipo;
    `;
    const { rows } = await db.query(query, [data_inicio, data_fim]);
    
    const entradas = rows.filter(r => r.tipo === 'entrada').map(r => ({ nome: r.nome, total: parseFloat(r.total) }));
    const saidas = rows.filter(r => r.tipo === 'saida').map(r => ({ nome: r.nome, total: parseFloat(r.total) }));

    res.json({ entradas, saidas });
  } catch (error) {
    console.error("Erro ao gerar distribuição por categorias:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;