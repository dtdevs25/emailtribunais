const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db/pool');
const { runCampanhas } = require('./services/schedulerService');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

const path = require('path');

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/tribunais', require('./routes/tribunais'));
app.use('/api/configuracoes', require('./routes/configuracoes'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EmailPericia Backend is running' });
});

// React Catch-all
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`EmailPericia Backend listening at http://localhost:${port}`);
  runCampanhas();
});
