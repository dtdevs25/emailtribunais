const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { sendEmail } = require('../services/emailService');
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
        stream.on('data', c => chunks.push(c));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
});

// List campaigns with template data
router.get('/', async (req, res) => {
  try {
    const result = await query(`
        SELECT c.*, t.assunto, t.corpo_html,
        (SELECT json_agg(json_build_object('id', a.id, 'nome', a.nome, 'minio_path', a.minio_path))
         FROM campanha_anexos ca JOIN anexos a ON ca.anexo_id = a.id 
         WHERE ca.campanha_id = c.id) as anexos
        FROM campanhas c 
        LEFT JOIN templates t ON c.template_id = t.id 
        ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create campaign & template atomically
router.post('/', async (req, res) => {
  const { nome, assunto, corpo_html, intervalo_dias, anexo_ids, data_inicio, hora_inicio } = req.body;
  try {
    // 1. Create Template
    const tplRes = await query(
      'INSERT INTO templates (nome, assunto, corpo_html) VALUES ($1, $2, $3) RETURNING id',
      [`Template: ${nome}`, assunto, corpo_html]
    );
    const templateId = tplRes.rows[0].id;

    // 2. Create Campanha (Scheduled Time)
    let proximaExec = new Date();
    if (data_inicio && hora_inicio) {
        proximaExec = new Date(`${data_inicio}T${hora_inicio}:00-03:00`);
    }
    
    const campRes = await query(
      'INSERT INTO campanhas (nome, template_id, intervalo_dias, ativa, proxima_execucao) VALUES ($1, $2, $3, true, $4) RETURNING *',
      [nome, templateId, intervalo_dias || 15, proximaExec]
    );
    const campanhaId = campRes.rows[0].id;

    // 3. Link Anexos IF any
    if (anexo_ids && Array.isArray(anexo_ids)) {
      for (const anid of anexo_ids) {
        await query('INSERT INTO campanha_anexos (campanha_id, anexo_id) VALUES ($1, $2)', [campanhaId, anid]);
      }
    }

    res.status(201).json(campRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle campaign active/inactive
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await query(
      'UPDATE campanhas SET ativa = NOT ativa WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campanha não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send test email for a campaign
router.post('/:id/test-email', async (req, res) => {
  const { email_teste } = req.body;
  const targetEmail = email_teste || 'daniel-ehs@outlook.com';
  
  try {
    const result = await query(`
      SELECT c.*, t.assunto, t.corpo_html,
      (SELECT json_agg(json_build_object('id', a.id, 'nome', a.nome, 'minio_path', a.minio_path))
       FROM campanha_anexos ca JOIN anexos a ON ca.anexo_id = a.id 
       WHERE ca.campanha_id = c.id) as anexos
      FROM campanhas c 
      LEFT JOIN templates t ON c.template_id = t.id 
      WHERE c.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Campanha não encontrada' });
    
    const campanha = result.rows[0];
    
    // Replace variables with sample data for preview
    const htmlTeste = (campanha.corpo_html || '')
      .replace(/\{\{nome_tribunal\}\}/g, '[VARA DO TRABALHO DE TESTE]')
      .replace(/\{\{estado\}\}/g, 'SP')
      .replace(/\{\{cidade\}\}/g, 'São Paulo');

    const attachments = [];
    for (const a of (campanha.anexos || []).filter(a => a && a.minio_path)) {
      try {
        const objectName = a.minio_path.includes('/') ? a.minio_path.split('/').slice(1).join('/') : a.minio_path;
        const content = await getMinioBuffer(objectName);
        attachments.push({ filename: a.nome, content });
      } catch(e) {
        console.error(`Attachment fetch failed for ${a.nome}:`, e.message);
      }
    }

    await sendEmail(
      targetEmail,
      `[TESTE] ${campanha.assunto}`,
      htmlTeste,
      attachments
    );

    res.json({ success: true, message: `E-mail teste enviado para ${targetEmail}` });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Manual Trigger - Ignores active/inactive but respects tribunal cooldown
router.post('/:id/trigger', async (req, res) => {
  try {
    const { executeCampanhaLogic } = require('../services/schedulerService');
    const result = await query(`
        SELECT c.*, t.assunto, t.corpo_html 
        FROM campanhas c
        JOIN templates t ON c.template_id = t.id
        WHERE c.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Campanha não encontrada' });

    const responseInfo = await executeCampanhaLogic(result.rows[0]);
    res.json(responseInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit campaign & template
router.patch('/:id', async (req, res) => {
  const { nome, assunto, corpo_html, intervalo_dias, data_inicio, hora_inicio, anexo_ids } = req.body;
  try {
    const campanha = await query('SELECT template_id FROM campanhas WHERE id = $1', [req.params.id]);
    if (campanha.rows.length === 0) return res.status(404).json({ error: 'Campanha não encontrada' });

    const templateId = campanha.rows[0].template_id;

    // Update template
    if (templateId) {
      await query('UPDATE templates SET assunto = $1, corpo_html = $2 WHERE id = $3', [assunto, corpo_html, templateId]);
    }

    // Update proxima_execucao if date/time changed
    let updates = 'nome = $1, intervalo_dias = $2';
    let params = [nome, intervalo_dias || 15];

    if (data_inicio && hora_inicio) {
      const proximaExec = new Date(`${data_inicio}T${hora_inicio}:00-03:00`);
      updates += ', proxima_execucao = $3';
      params.push(proximaExec);
      params.push(req.params.id);
    } else {
      params.push(req.params.id);
    }

    const result = await query(`UPDATE campanhas SET ${updates} WHERE id = $${params.length} RETURNING *`, params);
    
    // Update anexos if new ones were uploaded
    if (anexo_ids && Array.isArray(anexo_ids)) {
      await query('DELETE FROM campanha_anexos WHERE campanha_id = $1', [req.params.id]);
      for (const anid of anexo_ids) {
        await query('INSERT INTO campanha_anexos (campanha_id, anexo_id) VALUES ($1, $2)', [req.params.id, anid]);
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle campaign active/inactive
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await query('UPDATE campanhas SET ativa = NOT ativa WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campanha não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM campanhas WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

