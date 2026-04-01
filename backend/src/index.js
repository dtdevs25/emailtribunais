const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db/pool');
const { runCampanhas } = require('./services/schedulerService');

const app = express();
const port = process.env.PORT || 3001;

const path = require('path');

// Logger middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middlewares
app.use(cors());
app.use(express.json());

// Static Files (Frontend)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Routes
app.use('/api/tribunais', require('./routes/tribunais'));
app.use('/api/configuracoes', require('./routes/configuracoes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/campanhas', require('./routes/campanhas'));
app.use('/api/envios', require('./routes/envios'));
app.use('/api/anexos', require('./routes/anexos'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EmailPericia Backend is running' });
});

// React Catch-all
app.get(/.*/, (req, res) => {
  // Use path.join instead of relative
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Auto-migration to ensure columns exist on legacy databases
const runMigrations = async () => {
  try {
    await pool.query(`
      ALTER TABLE tribunais ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'TJ';
      ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS intervalo_dias INTEGER DEFAULT 15;
      ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT TRUE;
      ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS proxima_execucao TIMESTAMP WITH TIME ZONE;
      ALTER TABLE envios ADD COLUMN IF NOT EXISTS erro_mensagem TEXT;
    `);
    console.log("Database schema auto-migrated successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  }
};

// Start server
app.listen(port, async () => {
  console.log(`EmailPericia Backend listening at http://localhost:${port}`);
  await runMigrations();
  runCampanhas();
});
