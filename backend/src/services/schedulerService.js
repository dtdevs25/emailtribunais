const cron = require('node-cron');
const { query } = require('../db/pool');
const { sendEmail } = require('./emailService');
const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'storage-api.ehspro.com.br',
    port: parseInt(process.env.MINIO_PORT) || 443,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET_NAME || 'email-tribunais';

const getMinioBuffer = (objectName) => new Promise((resolve, reject) => {
    const chunks = [];
    minioClient.getObject(BUCKET, objectName, (err, stream) => {
        if (err) return reject(err);
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
});

const runCampanhas = async () => {
    try {
        const campanhas = await query(`
            SELECT c.*, t.assunto, t.corpo_html 
            FROM campanhas c
            JOIN templates t ON c.template_id = t.id
            WHERE c.ativa = TRUE 
            AND (c.proxima_execucao <= NOW() OR c.proxima_execucao IS NULL)
        `);

        for (const campanha of campanhas.rows) {
            console.log(`Processing campaign: ${campanha.nome}`);
            
            const tribunais = await query(`SELECT * FROM tribunais WHERE ativo = TRUE`);

            // Get attachments and fetch buffers from MinIO
            const anexos = await query(`
                SELECT a.* FROM anexos a
                JOIN campanha_anexos ca ON a.id = ca.anexo_id
                WHERE ca.campanha_id = $1
            `, [campanha.id]);

            const attachments = [];
            for (const a of anexos.rows) {
                try {
                    // minio_path format: "bucket/filename" — extract just filename
                    const objectName = a.minio_path.includes('/') ? a.minio_path.split('/').slice(1).join('/') : a.minio_path;
                    const content = await getMinioBuffer(objectName);
                    attachments.push({ filename: a.nome, content });
                } catch (e) {
                    console.error(`Failed to fetch attachment ${a.nome} from MinIO:`, e.message);
                }
            }

            for (const tribunal of tribunais.rows) {
                try {
                    // Replace variables in template
                    let personalizedHtml = campanha.corpo_html
                        .replace(/{{nome_tribunal}}/g, tribunal.nome)
                        .replace(/{{estado}}/g, tribunal.estado)
                        .replace(/{{cidade}}/g, tribunal.cidade || '');

                    await sendEmail(tribunal.email, campanha.assunto, personalizedHtml, attachments);

                    // Log success
                    await query(`
                        INSERT INTO envios (campanha_id, tribunal_id, assunto, status)
                        VALUES ($1, $2, $3, 'enviado')
                    `, [campanha.id, tribunal.id, campanha.assunto]);

                } catch (error) {
                    console.error(`Error sending to ${tribunal.email}:`, error);
                    await query(`
                        INSERT INTO envios (campanha_id, tribunal_id, assunto, status, erro_mensagem)
                        VALUES ($1, $2, $3, 'erro', $4)
                    `, [campanha.id, tribunal.id, campanha.assunto, error.message]);
                }
            }

            // Update next execution
            const nextExecution = new Date();
            nextExecution.setDate(nextExecution.getDate() + (campanha.intervalo_dias || 15));
            
            await query(`
                UPDATE campanhas 
                SET proxima_execucao = $1 
                WHERE id = $2
            `, [nextExecution, campanha.id]);
        }
    } catch (err) {
        console.error('Error in runCampanhas:', err);
    }
};

// Check every hour
cron.schedule('0 * * * *', () => {
    console.log('Running campaign checker...');
    runCampanhas();
});

module.exports = { runCampanhas };
