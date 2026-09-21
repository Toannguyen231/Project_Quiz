const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { PORT } = require('./config/env');
const db = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const quizzesRoutes = require('./routes/quizzes.routes');
const questionsRoutes = require('./routes/questions.routes');
const submissionsRoutes = require('./routes/submissions.routes');
const statsRoutes = require('./routes/stats.routes');
const errorHandler = require('./middleware/error');

const app = express();

// Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// URL normalization for double prefix (/api/v1/api/v1/* -> /api/v1/*)
app.use((req, res, next) => {
    if (req.url.startsWith('/api/v1/api/v1')) {
        req.url = req.url.replace('/api/v1/api/v1', '/api/v1');
    }
    next();
});

// Healthcheck endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
    });
});

// API v1 Routes
// Auth routes mounted at both /api/v1/auth and /api/v1 for legacy compatibility
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', authRoutes);

// User & Participant routes
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1', usersRoutes);

// Quizzes, Questions, Submissions, and Stats routes
app.use('/api/v1', quizzesRoutes);
app.use('/api/v1', questionsRoutes);
app.use('/api/v1', submissionsRoutes);
app.use('/api/v1', statsRoutes);

// Serve static frontend in production if build directory exists
const buildPath = path.resolve(__dirname, '../build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api/')) {
            return res.sendFile(path.join(buildPath, 'index.html'));
        }
        next();
    });
}

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`[QuizMaster Backend] Server running on http://localhost:${PORT}`);
});

module.exports = app;
