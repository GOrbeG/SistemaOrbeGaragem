const express = require('express');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Listar OS agendadas com filtros opcionais
router.get('/agendamentos', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    const { data_inicio, data_fim, usuario_id } = req.query;

    const filtros = [`os.status = 'agendada'`];
    const valores = [];

    // Filtro por data
    if (data_inicio) {
      filtros.push('os.data_agendada >= $' + (valores.length + 1));
      valores.push(data_inicio);
    } else {
      filtros.push('os.data_agendada >= $' + (valores.length + 1));
      valores.push(hoje); // padrão: hoje para frente
    }

    if (data_fim) {
      filtros.push('os.data_agendada <= $' + (valores.length + 1));
      valores.push(data_fim);
    }

    // Filtro por funcionário
    if (usuario_id) {
      filtros.push('os.usuario_id = $' + (valores.length + 1));
      valores.push(usuario_id);
    }

    const query = `
      SELECT os.*, c.nome AS cliente_nome, v.modelo AS veiculo_modelo, u.nome AS responsavel
      FROM ordens_servico os
      JOIN clientes c ON os.cliente_id = c.id
      JOIN veiculos v ON os.veiculo_id = v.id
      JOIN usuarios u ON os.usuario_id = u.id
      WHERE ${filtros.join(' AND ')}
      ORDER BY os.data_agendada ASC
    `;

    const result = await db.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

module.exports = router;
