// backend/routes/veiculoRoutes.js - VERSÃO CORRIGIDA E MELHORADA
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');
const registrarHistorico = require('../middlewares/logHistorico');
const checkPermissao = require('../middlewares/checkPermissao');

// ✅ ROTA ATUALIZADA: Listar todos os veículos ou filtrar por cliente
router.get('/', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  const { clienteId } = req.query; // Pega o ID do cliente da URL (ex: /api/veiculos?clienteId=1)

  try {
    let query = 'SELECT * FROM veiculos ORDER BY marca, modelo';
    const params = [];

    if (clienteId) {
      query = 'SELECT * FROM veiculos WHERE cliente_id = $1 ORDER BY marca, modelo';
      params.push(clienteId);
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar veículos:", error);
    res.status(500).json({ error: 'Erro ao buscar veículos' });
  }
});

// Buscar veículos por ID (sem alterações)
router.get('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM veiculos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar veículo' });
  }
});

// Criar novo veiculo (sem alterações)
router.post(
  '/',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('cliente_id').isInt().withMessage('ID do cliente é obrigatório e deve ser numérico'),
    body('marca').notEmpty().withMessage('Marca é obrigatória'),
    body('modelo').notEmpty().withMessage('Modelo é obrigatório'),
    body('placa').notEmpty().withMessage('Placa é obrigatória'),
    body('ano').isInt().withMessage('Ano deve ser numérico')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { cliente_id, marca, modelo, placa, ano, observacoes } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO veiculos (cliente_id, marca, modelo, placa, ano, observacoes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [cliente_id, marca, modelo, placa, ano, observacoes]
      );

      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'criar',
        entidade: 'veiculos',
        entidade_id: result.rows[0].id,
        dados_novos: result.rows[0]
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar veículo' });
    }
  }
);

// ✅ ROTA CORRIGIDA: Atualizar veiculo
router.put(
  '/:id',
  checkPermissao(['administrador', 'funcionario']),
  [
    body('cliente_id').isInt().withMessage('ID do cliente é obrigatório e deve ser numérico'),
    body('marca').notEmpty().withMessage('Marca é obrigatória'),
    body('modelo').notEmpty().withMessage('Modelo é obrigatório'),
    body('placa').notEmpty().withMessage('Placa é obrigatória'),
    body('ano').isInt().withMessage('Ano deve ser numérico')
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { cliente_id, marca, modelo, placa, ano, observacoes } = req.body;
    try {
      // CORREÇÃO: Busca os dados do veículo ANTES de atualizar para registrar no histórico
      const veiculoAntesResult = await db.query('SELECT * FROM veiculos WHERE id = $1', [req.params.id]);
      if (veiculoAntesResult.rows.length === 0) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      const veiculoAntes = veiculoAntesResult.rows[0];

      const result = await db.query(
        'UPDATE veiculos SET cliente_id = $1, marca = $2, modelo = $3, placa = $4, ano = $5, observacoes = $6 WHERE id = $7 RETURNING *',
        [cliente_id, marca, modelo, placa, ano, observacoes, req.params.id]
      );
      
      await registrarHistorico({
        usuario_id: req.user.id,
        acao: 'atualizar',
        entidade: 'veiculos',
        entidade_id: req.params.id,
        dados_anteriores: veiculoAntes, // Agora a variável existe
        dados_novos: result.rows[0]
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
  }
);

// ✅ ROTA CORRIGIDA: Deletar veiculo
router.delete('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    // CORREÇÃO: Busca os dados do veículo ANTES de deletar para registrar no histórico
    const veiculoAntesResult = await db.query('SELECT * FROM veiculos WHERE id = $1', [req.params.id]);
    if (veiculoAntesResult.rows.length === 0) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    const veiculoAntes = veiculoAntesResult.rows[0];

    await db.query('DELETE FROM veiculos WHERE id = $1', [req.params.id]);
    
    await registrarHistorico({
      usuario_id: req.user.id,
      acao: 'deletar',
      entidade: 'veiculos',
      entidade_id: req.params.id,
      dados_anteriores: veiculoAntes // Agora a variável existe
    });
    
    res.status(200).json({ mensagem: 'Veículo deletado com sucesso' });
  } catch (error) {
    console.error("Erro ao deletar veículo:", error);
    res.status(500).json({ error: 'Erro ao deletar veículo' });
  }
});

module.exports = router;