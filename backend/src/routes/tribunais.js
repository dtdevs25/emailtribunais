const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

// List all courts
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM emailpericia.tribunais ORDER BY nome ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a court
router.post('/', async (req, res) => {
  const { nome, estado, cidade, email, email_secundario, tipo, observacoes } = req.body;
  try {
    const result = await query(
      'INSERT INTO emailpericia.tribunais (nome, estado, cidade, email, email_secundario, tipo, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nome, estado, cidade, email, email_secundario, tipo, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a court
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, estado, cidade, email, email_secundario, tipo, ativo, observacoes } = req.body;
  try {
    const result = await query(
      'UPDATE emailpericia.tribunais SET nome=$1, estado=$2, cidade=$3, email=$4, email_secundario=$5, tipo=$6, ativo=$7, observacoes=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [nome, estado, cidade, email, email_secundario, tipo, ativo, observacoes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a court
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM emailpericia.tribunais WHERE id=$1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
