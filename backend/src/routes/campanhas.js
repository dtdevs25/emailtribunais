const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

// List campaigns
router.get('/', async (req, res) => {
  try {
    const result = await query(`
        SELECT c.*, t.assunto, t.corpo_html 
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
  const { nome, assunto, corpo_html, intervalo_dias } = req.body;
  try {
    // 1. Create Template
    const tplRes = await query(
      'INSERT INTO templates (nome, assunto, corpo_html) VALUES ($1, $2, $3) RETURNING id',
      [`Template: ${nome}`, assunto, corpo_html]
    );
    const templateId = tplRes.rows[0].id;

    // 2. Create Campanha
    const campRes = await query(
      'INSERT INTO campanhas (nome, template_id, intervalo_dias, ativa, proxima_execucao) VALUES ($1, $2, $3, true, NOW()) RETURNING *',
      [nome, templateId, intervalo_dias || 15]
    );

    res.status(201).json(campRes.rows[0]);
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
