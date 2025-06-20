// backend/routes/dashboardRoutes.js
const express = require('express');
const db = require('../config/db');
const verificarJWT = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verificarJWT(['administrador', 'funcionario']), async (req, res) => {
  const { inicio, fim } = req.query;
  const filtros = [];
  const valores = [];

  if (inicio && fim) {
    filtros.push('data_criacao BETWEEN $1 AND $2');
    valores.push(inicio, fim);
  }

  const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

  try {
    const [usuarios, clientes, veiculos, ordens, os_abertas, os_fechadas, receita, osPorMes, osPorFuncionario, agendamentos] = await Promise.all([
      db.query('SELECT COUNT(*) FROM usuarios'),
      db.query('SELECT COUNT(*) FROM clientes'),
      db.query('SELECT COUNT(*) FROM veiculos'),
      db.query('SELECT COUNT(*) FROM ordens_servico'),
      db.query(`SELECT COUNT(*) FROM ordens_servico WHERE status ILIKE 'aberta'`),
      db.query(`SELECT COUNT(*) FROM ordens_servico WHERE status ILIKE 'fechada'`),
      db.query(`SELECT COALESCE(SUM(it.valor), 0) AS receita FROM itens_ordem it JOIN ordens_servico os ON it.ordem_id = os.id ${where}`, valores),
      db.query(`
        SELECT TO_CHAR(data_criacao, 'YYYY-MM') AS mes, COUNT(*) AS total
        FROM ordens_servico ${where}
        GROUP BY mes
        ORDER BY mes DESC
        LIMIT 6
      `, valores),
      db.query(`
        SELECT u.nome, COUNT(*) AS total
        FROM ordens_servico o
        JOIN usuarios u ON o.usuario_id = u.id
        ${where ? `WHERE ${filtros.join(' AND ')}` : ''}
        GROUP BY u.nome
        ORDER BY total DESC
        LIMIT 5
      `, valores),
      db.query('SELECT COUNT(*) FROM agendamentos')
    ]);

    res.json({
      total_usuarios: parseInt(usuarios.rows[0].count),
      total_clientes: parseInt(clientes.rows[0].count),
      total_veiculos: parseInt(veiculos.rows[0].count),
      total_ordens: parseInt(ordens.rows[0].count),
      ordens_abertas: parseInt(os_abertas.rows[0].count),
      ordens_fechadas: parseInt(os_fechadas.rows[0].count),
      receita_total: parseFloat(receita.rows[0].receita),
      ordens_por_mes: osPorMes.rows,
      ordens_por_funcionario: osPorFuncionario.rows,
      total_agendamentos: parseInt(agendamentos.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
  }
});

module.exports = router;
