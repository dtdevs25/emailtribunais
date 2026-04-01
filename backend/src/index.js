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

// Auto-migration to ensure tables and columns exist on legacy databases
const runMigrations = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(100) NOT NULL,
        assunto VARCHAR(255) NOT NULL,
        corpo_html TEXT NOT NULL,
        corpo_texto TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campanhas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(100) NOT NULL,
        template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
        intervalo_dias INTEGER DEFAULT 15,
        ativa BOOLEAN DEFAULT TRUE,
        proxima_execucao TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS anexos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(255) NOT NULL,
        minio_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100),
        tamanho_bytes BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campanha_anexos (
        campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
        anexo_id UUID REFERENCES anexos(id) ON DELETE CASCADE,
        PRIMARY KEY (campanha_id, anexo_id)
      );

      CREATE TABLE IF NOT EXISTS envios (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
        tribunal_id UUID,
        assunto VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pendente',
        erro_mensagem TEXT,
        enviado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE tribunais ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'TJ';
      ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS intervalo_dias INTEGER DEFAULT 15;
      ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT TRUE;
      ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS proxima_execucao TIMESTAMP WITH TIME ZONE;
      ALTER TABLE envios ADD COLUMN IF NOT EXISTS erro_mensagem TEXT;
      ALTER TABLE envios ADD COLUMN IF NOT EXISTS assunto VARCHAR(255);
    `);
    console.log("Database schema migrated successfully.");
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
