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

module.exports = router;
