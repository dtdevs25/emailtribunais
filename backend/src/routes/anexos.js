const express = require('express');
const router = express.Router();
const multer = require('multer');
const { query } = require('../db/pool');
const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'storage-api.ehspro.com.br',
    port: parseInt(process.env.MINIO_PORT) || 443,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET_NAME || 'email-tribunais';

// Helper: read file buffer from MinIO
const getMinioBuffer = (objectName) => new Promise((resolve, reject) => {
    const chunks = [];
    minioClient.getObject(BUCKET, objectName, (err, stream) => {
        if (err) return reject(err);
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
});

// Memory storage — no disk, upload direct to MinIO
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/anexos/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

        // Fix UTF-8 encoding from multer latin1 decode
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const safeFileName = `${Date.now()}-${originalName}`;

        // Ensure bucket exists
        const exists = await minioClient.bucketExists(BUCKET);
        if (!exists) await minioClient.makeBucket(BUCKET, 'us-east-1');

        // Upload buffer to MinIO
        await minioClient.putObject(BUCKET, safeFileName, req.file.buffer, req.file.size, {
            'Content-Type': req.file.mimetype
        });

        const minio_path = `${BUCKET}/${safeFileName}`;
        console.log(`[MinIO] Uploaded: ${safeFileName}`);

        const result = await query(
            'INSERT INTO anexos (nome, minio_path, mime_type, tamanho_bytes) VALUES ($1, $2, $3, $4) RETURNING id, nome',
            [originalName, minio_path, req.file.mimetype, req.file.size]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Erro no upload: ' + err.message });
    }
});

module.exports = router;
module.exports.getMinioBuffer = getMinioBuffer;
