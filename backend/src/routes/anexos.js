const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../db/pool');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Upload a generic file (anexo)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }
        
        // Simulating MinIO path as local file path for MVP
        const minio_path = req.file.path; 

        const result = await query(`
            INSERT INTO anexos (nome, minio_path, mime_type, tamanho_bytes)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nome
        `, [req.file.originalname, minio_path, req.file.mimetype, req.file.size]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Upload error: ", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
