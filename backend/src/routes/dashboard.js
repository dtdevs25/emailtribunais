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
    const regioesRes = await query(`
      SELECT 
        CASE 
          WHEN t.email LIKE '%trt15%' THEN 'Interior SP (15ª)'
          WHEN t.email LIKE '%trtsp%' OR t.email LIKE '%trt2%' THEN 'Capital / Litoral (2ª)'
          ELSE 'Outras Regiões' 
        END as name,
        COUNT(e.id) as value
      FROM envios e
      JOIN tribunais t ON e.tribunal_id = t.id
      WHERE e.status = 'enviado'
      GROUP BY name
      ORDER BY value DESC
    `);

    res.json({
      totalEnvios: parseInt(totalEnviosRes.rows[0].total),
      enviosSucesso: parseInt(enviosSucessoRes.rows[0].total),
      totalCampanhas: parseInt(totalCampanhasRes.rows[0].total),
      totalTribunais: parseInt(totalTribunaisRes.rows[0].total),
      historico: enviosRecentes.rows || [],
      regioes: regioesRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
