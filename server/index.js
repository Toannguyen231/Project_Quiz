const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`[QuizMaster Backend] Server running on http://localhost:${PORT}`);
});

module.exports = app;
