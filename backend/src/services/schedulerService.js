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

const executeCampanhaLogic = async (campanha) => {
    try {
        console.log(`Executing campaign logic for: ${campanha.nome}`);

        // Get tribunals that are ACTIVE AND have not successfully received THIS campaign in the past X days
        const tribunaisQuery = await query(`
            SELECT t.* FROM tribunais t
            WHERE t.ativo = TRUE
            AND NOT EXISTS (
                SELECT 1 FROM envios e 
                WHERE e.tribunal_id = t.id 
                AND e.campanha_id = $1 
                AND e.status = 'enviado'
                AND e.enviado_em >= NOW() - ($2 * INTERVAL '1 day')
            )
        `, [campanha.id, campanha.intervalo_dias || 15]);

        const tribunais = tribunaisQuery.rows;
        if (tribunais.length === 0) {
            console.log(`Campaign ${campanha.nome}: All tribunals already contacted recently. None valid for this cycle.`);
            return { sent: 0, skipped: true };
        }

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

        let sentSuccessCount = 0;

        for (const tribunal of tribunais) {
            try {
                // Replace variables in template
                let personalizedHtml = campanha.corpo_html
                    .replace(/\{\{nome_tribunal\}\}/g, tribunal.nome)
                    .replace(/\{\{estado\}\}/g, tribunal.estado)
                    .replace(/\{\{cidade\}\}/g, tribunal.cidade || '');

                await sendEmail(tribunal.email, campanha.assunto, personalizedHtml, attachments);

                // Log success
                await query(`
                    INSERT INTO envios (campanha_id, tribunal_id, assunto, status)
                    VALUES ($1, $2, $3, 'enviado')
                `, [campanha.id, tribunal.id, campanha.assunto]);
                
                sentSuccessCount++;

            } catch (error) {
                console.error(`Error sending to ${tribunal.email}:`, error);
                await query(`
                    INSERT INTO envios (campanha_id, tribunal_id, assunto, status, erro_mensagem)
                    VALUES ($1, $2, $3, 'erro', $4)
                 `, [campanha.id, tribunal.id, campanha.assunto, error.message]);
            }
        }

        // Update next execution safely
        const nextExecution = new Date();
        nextExecution.setDate(nextExecution.getDate() + (campanha.intervalo_dias || 15));
        
        await query(`
            UPDATE campanhas 
            SET proxima_execucao = $1 
            WHERE id = $2
        `, [nextExecution, campanha.id]);

        return { sent: sentSuccessCount, skipped: false };
    } catch (error) {
        console.error(`Error executing campaign ${campanha.nome}:`, error);
        throw error;
    }
};

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
            await executeCampanhaLogic(campanha);
        }
    } catch (err) {
        console.error('Error in runCampanhas:', err);
    }
};

// Check every 5 minutes
cron.schedule('*/5 * * * *', () => {
    console.log('Running campaign checker...');
    runCampanhas();
});

module.exports = { runCampanhas, executeCampanhaLogic };
