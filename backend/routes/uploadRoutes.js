// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../config/db');
const checkPermissao = require('../middlewares/checkPermissao');
const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'orbe/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  },
});

const upload = multer({ storage });

// Upload e associação com ordem de serviço
router.post('/:ordem_id', checkPermissao(['administrador', 'funcionario']), upload.single('arquivo'), async (req, res) => {
  try {
    const { ordem_id } = req.params;
    const { originalname, mimetype } = req.file;
    const caminho = req.file.path;

    const result = await db.query(
      'INSERT INTO arquivos_os (ordem_id, nome_arquivo, caminho, tipo) VALUES ($1, $2, $3, $4) RETURNING *',
      [ordem_id, originalname, caminho, mimetype]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar arquivo' });
  }
});

//listar arquivos de uma ordem de serviço
router.get('/:ordem_id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM arquivos_os WHERE ordem_id = $1 ORDER BY data_upload DESC',
      [req.params.ordem_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar arquivos da OS' });
  }
});

// Deletar arquivo por ID
router.delete('/:id', checkPermissao(['administrador', 'funcionario']), async (req, res) => {
  try {
    const resultado = await db.query('SELECT * FROM arquivos_os WHERE id = $1', [req.params.id]);
    if (resultado.rows.length === 0) return res.status(404).json({ error: 'Arquivo não encontrado' });

    const caminhoCloudinary = resultado.rows[0].caminho.split('/').pop().split('.')[0];

    await cloudinary.uploader.destroy(`orbe/uploads/${caminhoCloudinary}`);

    await db.query('DELETE FROM arquivos_os WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Arquivo excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

module.exports = router;
