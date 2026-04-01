const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

// Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT chave, valor FROM emailpericia.configuracoes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update specific setting
router.put('/:chave', async (req, res) => {
  const { chave } = req.params;
  const { valor } = req.body;
  try {
    const result = await query(
      'UPDATE emailpericia.configuracoes SET valor=$1, updated_at=NOW() WHERE chave=$2 RETURNING *',
      [valor, chave]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
