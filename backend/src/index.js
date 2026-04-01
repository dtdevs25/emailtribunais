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

// Routes
app.use('/api/tribunais', require('./routes/tribunais'));
app.use('/api/configuracoes', require('./routes/configuracoes'));

app.get('/', (req, res) => {
  res.send('<h1>EmailPericia Backend is running!</h1><p>Visit <a href="/health">/health</a> for status.</p>');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EmailPericia Backend is running' });
});

// Start server
app.listen(port, () => {
  console.log(`EmailPericia Backend listening at http://localhost:${port}`);
  runCampanhas();
});
