const cron = require('node-cron');
const { query } = require('../db/pool');
const { sendEmail } = require('./emailService');

const runCampanhas = async () => {
    try {
        const campanhas = await query(`
            SELECT c.*, t.assunto, t.corpo_html 
            FROM emailpericia.campanhas c
            JOIN emailpericia.templates t ON c.template_id = t.id
            WHERE c.ativa = TRUE 
            AND (c.proxima_execucao <= NOW() OR c.proxima_execucao IS NULL)
        `);

        for (const campanha of campanhas.rows) {
            console.log(`Processing campaign: ${campanha.nome}`);
            
            // Get tribunais for this campaign (or all active if none specified)
            const tribunais = await query(`
                SELECT * FROM emailpericia.tribunais 
                WHERE ativo = TRUE
            `);

            // Get attachments for this campaign
            const anexos = await query(`
                SELECT a.* FROM emailpericia.anexos a
                JOIN emailpericia.campanha_anexos ca ON a.id = ca.anexo_id
                WHERE ca.campanha_id = $1
            `, [campanha.id]);

            const attachments = anexos.rows.map(a => ({
                filename: a.nome,
                path: a.minio_path // Assuming path is accessible or will be proxy-downloaded
            }));

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
                        INSERT INTO emailpericia.envios (campanha_id, tribunal_id, assunto, status)
                        VALUES ($1, $2, $3, 'enviado')
                    `, [campanha.id, tribunal.id, campanha.assunto]);

                } catch (error) {
                    console.error(`Error sending to ${tribunal.email}:`, error);
                    await query(`
                        INSERT INTO emailpericia.envios (campanha_id, tribunal_id, assunto, status, erro_mensagem)
                        VALUES ($1, $2, $3, 'erro', $4)
                    `, [campanha.id, tribunal.id, campanha.assunto, error.message]);
                }
            }

            // Update next execution
            const nextExecution = new Date();
            nextExecution.setDate(nextExecution.getDate() + (campanha.intervalo_dias || 15));
            
            await query(`
                UPDATE emailpericia.campanhas 
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
