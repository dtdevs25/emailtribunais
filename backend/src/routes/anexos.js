const express = require('express');
const router = express.Router();
const multer = require('multer');
const { query } = require('../db/pool');
const Minio = require('minio');

// MinIO client from env vars
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'storage-api.ehspro.com.br',
    port: parseInt(process.env.MINIO_PORT) || 443,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET_NAME || 'email-tribunais';

// Use memory storage — we upload directly to MinIO, no disk needed
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to MinIO
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const fileName = `${Date.now()}-${req.file.originalname}`;

        // Ensure bucket exists
        const exists = await minioClient.bucketExists(BUCKET);
        if (!exists) {
            await minioClient.makeBucket(BUCKET, 'us-east-1');
        }

        // Upload buffer to MinIO
        await minioClient.putObject(
            BUCKET,
            fileName,
            req.file.buffer,
            req.file.size,
            { 'Content-Type': req.file.mimetype }
        );

        const minio_path = `${BUCKET}/${fileName}`;

        const result = await query(`
            INSERT INTO anexos (nome, minio_path, mime_type, tamanho_bytes)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nome
        `, [req.file.originalname, minio_path, req.file.mimetype, req.file.size]);

        console.log(`[MinIO] Uploaded: ${fileName} to bucket ${BUCKET}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Upload error: ", err);
        res.status(500).json({ error: 'Erro no upload: ' + err.message });
    }
});

module.exports = router;
