const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { sendEmail } = require('../services/emailService');
const path = require('path');

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

    const attachments = (campanha.anexos || [])
      .filter(a => a && a.minio_path)
      .map(a => ({
        filename: a.nome,
        path: a.minio_path
      }));

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
