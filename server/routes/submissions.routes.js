const express = require('express');
const db = require('../config/db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /quiz-submit
router.post('/quiz-submit', optionalAuth, (req, res) => {
    const { quizId, answers } = req.body;

    if (!quizId) {
        return res.status(400).json({
            EC: -1,
            EM: 'quizId is required',
            DT: '',
        });
    }

    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
    if (!quiz) {
        return res.status(404).json({
            EC: -1,
            EM: 'Quiz not found',
            DT: '',
        });
    }

    const allQuestions = db.prepare('SELECT id, description, type FROM questions WHERE quiz_id = ?').all(quizId);
    const total = allQuestions.length;
    let countCorrect = 0;
    const details = [];

    const userAnswersMap = new Map();
    if (Array.isArray(answers)) {
        for (const item of answers) {
            const qId = item.questionId || item.id;
            const userAns = Array.isArray(item.userAnswer)
                ? item.userAnswer.map(Number)
                : item.userAnswer !== undefined && item.userAnswer !== null
                ? [Number(item.userAnswer)]
                : [];
            userAnswersMap.set(Number(qId), userAns);
        }
    }

    for (const q of allQuestions) {
        const correctAnswers = db.prepare('SELECT id FROM answers WHERE question_id = ? AND is_correct = 1').all(q.id);
        const correctIds = correctAnswers.map((a) => a.id).sort((a, b) => a - b);
        const userAnsIds = (userAnswersMap.get(q.id) || []).sort((a, b) => a - b);

        const isCorrect =
            correctIds.length === userAnsIds.length &&
            correctIds.every((val, index) => val === userAnsIds[index]);

        if (isCorrect) {
            countCorrect += 1;
        }

        details.push({
            questionId: q.id,
            isCorrect,
            userAnswer: userAnsIds,
            correctAnswer: correctIds,
        });
    }

    const percentage = total > 0 ? Math.round((countCorrect / total) * 100) : 0;
    const score = total > 0 ? Number(((countCorrect / total) * 10).toFixed(1)) : 0;
    const userId = req.user ? req.user.id : null;

    // Record submission in DB
    const subRes = db.prepare(`
        INSERT INTO submissions (user_id, quiz_id, total_questions, total_correct, score, percentage, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, quizId, total, countCorrect, score, percentage, JSON.stringify(details));

    // Clear auto-save progress if exists
    if (userId) {
        db.prepare('DELETE FROM submission_progress WHERE user_id = ? AND quiz_id = ?').run(userId, quizId);
    }

    res.status(200).json({
        EC: 0,
        EM: 'Submit quiz success',
        DT: {
            submissionId: subRes.lastInsertRowid,
            quizId: Number(quizId),
            countCorrect,
            total,
            percentage,
            score,
            details,
        },
    });
});

// PUT /submissions/:id/progress (Auto-save progress for exam)
router.put('/submissions/:id/progress', optionalAuth, (req, res) => {
    const quizId = req.params.id;
    const { answers, remainingSeconds } = req.body;
    const userId = req.user ? req.user.id : 1; // Default to 1 if anonymous

    db.prepare(`
        INSERT INTO submission_progress (user_id, quiz_id, answers, remaining_seconds, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, quiz_id) DO UPDATE SET
            answers = excluded.answers,
            remaining_seconds = excluded.remaining_seconds,
            updated_at = CURRENT_TIMESTAMP
    `).run(userId, quizId, JSON.stringify(answers || {}), remainingSeconds || null);

    res.status(200).json({
        EC: 0,
        EM: 'Progress saved successfully',
        DT: { status: 'saved' },
    });
});

// GET /submissions/history (Get past submissions for authenticated user)
router.get('/submissions/history', optionalAuth, (req, res) => {
    const userId = req.user ? req.user.id : null;

    let query = `
        SELECT s.id, s.quiz_id, q.name AS quiz_name, s.total_questions, s.total_correct,
               s.score, s.percentage, s.created_at
        FROM submissions s
        JOIN quizzes q ON s.quiz_id = q.id
    `;
    const params = [];

    if (userId) {
        query += ' WHERE s.user_id = ?';
        params.push(userId);
    }

    query += ' ORDER BY s.id DESC LIMIT 50';

    const history = db.prepare(query).all(...params);

    res.status(200).json({
        EC: 0,
        EM: 'Get submission history success',
        DT: history,
    });
});

module.exports = router;
