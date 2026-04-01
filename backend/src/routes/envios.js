const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

// List envios
router.get('/', async (req, res) => {
  try {
    const result = await query(`
        SELECT e.*, c.nome as campanha, t.nome as tribunal 
        FROM envios e 
        LEFT JOIN campanhas c ON e.campanha_id = c.id 
        LEFT JOIN tribunais t ON e.tribunal_id = t.id 
        ORDER BY e.enviado_em DESC 
        LIMIT 200
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View specific email preview
router.get('/:id/preview', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.nome as tribunal_nome, t.estado as tribunal_estado, t.cidade as tribunal_cidade, temp.corpo_html
      FROM envios e
      JOIN tribunais t ON e.tribunal_id = t.id
      JOIN campanhas c ON e.campanha_id = c.id
      JOIN templates temp ON c.template_id = temp.id
      WHERE e.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Envio ou template não encontrado' });
    
    const row = result.rows[0];
    let html = row.corpo_html
        .replace(/\{\{nome_tribunal\}\}/g, row.tribunal_nome)
        .replace(/\{\{estado\}\}/g, row.tribunal_estado)
        .replace(/\{\{cidade\}\}/g, row.tribunal_cidade || '');
        
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
