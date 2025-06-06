// backend/routes/financeiroRoutes.js
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');
const router = express.Router();

// Criar transação financeira
router.post('/', checkPermissao(['administrador']), async (req, res) => {
  const { descricao, valor, tipo, categoria, data, referencia_os_id } = req.body;

  if (!descricao || !valor || !tipo || !data) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const result = await db.query(
      `INSERT INTO transacoes_financeiras (descricao, valor, tipo, categoria, data, referencia_os_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [descricao, valor, tipo, categoria || null, data, referencia_os_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Listar transações com filtros opcionais
router.get('/', checkPermissao(['administrador']), async (req, res) => {
  const { inicio, fim, tipo, categoria } = req.query;
  const valores = [];
  let query = 'SELECT * FROM transacoes_financeiras WHERE 1=1';

  if (inicio) {
    query += ' AND data >= $' + (valores.length + 1);
    valores.push(inicio);
  }
  if (fim) {
    query += ' AND data <= $' + (valores.length + 1);
    valores.push(fim);
  }
  if (tipo) {
    query += ' AND tipo = $' + (valores.length + 1);
    valores.push(tipo);
  }
  if (categoria) {
    query += ' AND categoria = $' + (valores.length + 1);
    valores.push(categoria);
  }

  query += ' ORDER BY data DESC';

  try {
    const result = await db.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Relatório de saldo
router.get('/saldo', checkPermissao(['administrador']), async (req, res) => {
  try {
    const entradas = await db.query(`SELECT COALESCE(SUM(valor), 0) AS total FROM transacoes_financeiras WHERE tipo = 'entrada'`);
    const saidas = await db.query(`SELECT COALESCE(SUM(valor), 0) AS total FROM transacoes_financeiras WHERE tipo = 'saida'`);
    const saldo = parseFloat(entradas.rows[0].total) - parseFloat(saidas.rows[0].total);

    res.json({ entradas: parseFloat(entradas.rows[0].total), saidas: parseFloat(saidas.rows[0].total), saldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular saldo' });
  }
});

// Relatório agrupado por categoria
router.get('/por-categoria', checkPermissao(['administrador']), async (req, res) => {
  const { inicio, fim } = req.query;
  const valores = [];
  let query = `
    SELECT categoria, tipo, SUM(valor) AS total
    FROM transacoes_financeiras
    WHERE 1=1`;

  if (inicio) {
    query += ' AND data >= $' + (valores.length + 1);
    valores.push(inicio);
  }
  if (fim) {
    query += ' AND data <= $' + (valores.length + 1);
    valores.push(fim);
  }

  query += ' GROUP BY categoria, tipo ORDER BY categoria';

  try {
    const result = await db.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por categoria' });
  }
});

module.exports = router;
