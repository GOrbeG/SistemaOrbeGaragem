// backend/routes/assinaturaRoutes.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');

const router = express.Router();

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'assinaturas_os',
    allowed_formats: ['jpg', 'png'],
    public_id: (req, file) => `assinatura_os_${Date.now()}`
  }
});

const upload = multer({ storage });

// Upload da assinatura do cliente
router.post('/:ordem_id', checkPermissao(['administrador', 'funcionario']), upload.single('assinatura'), async (req, res) => {
  try {
    const { ordem_id } = req.params;
    const url = req.file.path;

    const result = await db.query(
      `UPDATE ordens_servico SET assinatura_url = $1 WHERE id = $2 RETURNING *`,
      [url, ordem_id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar assinatura' });
  }
});

// Visualizar URL da assinatura
router.get('/:ordem_id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT assinatura_url FROM ordens_servico WHERE id = $1`,
      [req.params.ordem_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

module.exports = router;
