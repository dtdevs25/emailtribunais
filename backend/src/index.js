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

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EmailPericia Backend is running' });
});

// React Catch-all
app.get('/:path*', (req, res) => {
  // Use path.join instead of relative
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`EmailPericia Backend listening at http://localhost:${port}`);
  runCampanhas();
});
