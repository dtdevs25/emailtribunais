const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

router.get('/stats', async (req, res) => {
  try {
    const totalEnviosRes = await query(`SELECT COUNT(*) as total FROM envios`);
    const enviosSucessoRes = await query(`SELECT COUNT(*) as total FROM envios WHERE status='enviado'`);
    const totalCampanhasRes = await query(`SELECT COUNT(*) as total FROM campanhas`);
    const totalTribunaisRes = await query(`SELECT COUNT(*) as total FROM tribunais WHERE ativo=TRUE`);
    
    const enviosRecentes = await query(`
      SELECT e.*, c.nome as campanha, t.nome as tribunal, e.status
      FROM envios e
      JOIN campanhas c ON e.campanha_id = c.id
      JOIN tribunais t ON e.tribunal_id = t.id
      ORDER BY e.enviado_em DESC
      LIMIT 10
    `);

    res.json({
      totalEnvios: parseInt(totalEnviosRes.rows[0].total),
      enviosSucesso: parseInt(enviosSucessoRes.rows[0].total),
      totalCampanhas: parseInt(totalCampanhasRes.rows[0].total),
      totalTribunais: parseInt(totalTribunaisRes.rows[0].total),
      historico: enviosRecentes.rows || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
