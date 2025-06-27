// backend/routes/agendaRoutes.js - VERSÃO CORRIGIDA E FINAL
const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Listar OS agendadas com filtros opcionais
router.get('/agendamentos', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const { data_inicio, data_fim, usuario_id } = req.query;

    let filtros = [`os.status = 'Agendada'`]; // O status correto para um agendamento
    const valores = [];
    let contadorParams = 1;

    // Filtro por data (usado pelo FullCalendar)
    if (data_inicio) {
      filtros.push(`os.data_agendada >= $${contadorParams++}`);
      valores.push(data_inicio);
    }
    if (data_fim) {
      filtros.push(`os.data_agendada <= $${contadorParams++}`);
      valores.push(data_fim);
    }

    // Filtro por funcionário (técnico)
    if (usuario_id) {
      filtros.push(`os.tecnico_id = $${contadorParams++}`);
      valores.push(usuario_id);
    }

    // ✅ QUERY CORRIGIDA: Usa LEFT JOIN e os.tecnico_id
    const query = `
      SELECT 
        os.id,
        os.data_agendada,
        c.nome AS cliente_nome, 
        v.modelo AS veiculo_modelo, 
        u.nome AS responsavel
      FROM ordens_servico os
      JOIN clientes c ON os.cliente_id = c.id
      JOIN veiculos v ON os.veiculo_id = v.id
      LEFT JOIN usuarios u ON os.tecnico_id = u.id -- Usa LEFT JOIN para não excluir OS sem técnico
      WHERE ${filtros.join(' AND ')}
      ORDER BY os.data_agendada ASC
    `;

    const result = await db.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

module.exports = router;