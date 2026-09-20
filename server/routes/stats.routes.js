const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /overview
router.get('/overview', (req, res) => {
    const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const quizzesCount = db.prepare('SELECT COUNT(*) AS count FROM quizzes').get().count;
    const questionsCount = db.prepare('SELECT COUNT(*) AS count FROM questions').get().count;
    const answersCount = db.prepare('SELECT COUNT(*) AS count FROM answers').get().count;

    res.status(200).json({
        EC: 0,
        EM: 'Get overview success',
        DT: {
            users: usersCount,
            quizzes: quizzesCount,
            questions: questionsCount,
            answers: answersCount,
        },
    });
});

// GET /stats/daily
router.get('/stats/daily', (req, res) => {
    // Get submissions count grouped by date (YYYY-MM-DD)
    const dailySubmissions = db.prepare(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM submissions
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        LIMIT 30
    `).all();

    // Get quizzes grouped by difficulty
    const difficultyStats = db.prepare(`
        SELECT difficulty, COUNT(*) AS count
        FROM quizzes
        GROUP BY difficulty
    `).all();

    res.status(200).json({
        EC: 0,
        EM: 'Get stats success',
        DT: {
            dailySubmissions,
            difficultyStats,
        },
    });
});

module.exports = router;
