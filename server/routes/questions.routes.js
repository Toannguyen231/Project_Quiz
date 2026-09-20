const express = require('express');
const db = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /questions-by-quiz?quizId=
router.get('/questions-by-quiz', optionalAuth, (req, res) => {
    const quizId = req.query.quizId;

    if (!quizId) {
        return res.status(400).json({
            EC: -1,
            EM: 'quizId parameter is required',
            DT: [],
        });
    }

    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC').all(quizId);
    const isAdmin = req.user && (req.user.role || '').toUpperCase() === 'ADMIN';

    const result = questions.map((q) => {
        const answers = db.prepare('SELECT id, description, is_correct FROM answers WHERE question_id = ? ORDER BY id ASC').all(q.id);
        return {
            id: q.id,
            description: q.description,
            image: q.image,
            type: q.type,
            answers: answers.map((a) => ({
                id: a.id,
                description: a.description,
                // Only expose is_correct if requesting user is an ADMIN
                ...(isAdmin ? { is_correct: Boolean(a.is_correct) } : {}),
            })),
        };
    });

    res.status(200).json({
        EC: 0,
        EM: 'Get questions success',
        DT: result,
    });
});

// POST /questions (Create single question)
router.post('/questions', (req, res) => {
    const { quiz_id, description, image, type, answers } = req.body;

    if (!quiz_id || !description) {
        return res.status(400).json({
            EC: -1,
            EM: 'quiz_id and description are required',
            DT: '',
        });
    }

    const questionTransaction = db.transaction(() => {
        const qRes = db.prepare(`
            INSERT INTO questions (quiz_id, description, image, type)
            VALUES (?, ?, ?, ?)
        `).run(quiz_id, description, image || null, type || 'SINGLE');

        const questionId = qRes.lastInsertRowid;

        if (Array.isArray(answers)) {
            const insertAnswer = db.prepare(`
                INSERT INTO answers (question_id, description, is_correct)
                VALUES (?, ?, ?)
            `);
            for (const a of answers) {
                insertAnswer.run(questionId, a.description || '', a.is_correct ? 1 : 0);
            }
        }

        return questionId;
    });

    const questionId = questionTransaction();
    const createdQuestion = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);

    res.status(201).json({
        EC: 0,
        EM: 'Create question success',
        DT: createdQuestion,
    });
});

// PUT /questions/:id (Update single question)
router.put('/questions/:id', (req, res) => {
    const id = req.params.id;
    const { description, image, type, answers } = req.body;

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
    if (!question) {
        return res.status(404).json({
            EC: -1,
            EM: 'Question not found',
            DT: '',
        });
    }

    const updateTransaction = db.transaction(() => {
        const updates = [];
        const params = [];

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (image !== undefined) {
            updates.push('image = ?');
            params.push(image);
        }
        if (type !== undefined) {
            updates.push('type = ?');
            params.push(type);
        }

        if (updates.length > 0) {
            params.push(id);
            db.prepare(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        }

        if (Array.isArray(answers)) {
            // Replace answers
            db.prepare('DELETE FROM answers WHERE question_id = ?').run(id);
            const insertAnswer = db.prepare(`
                INSERT INTO answers (question_id, description, is_correct)
                VALUES (?, ?, ?)
            `);
            for (const a of answers) {
                insertAnswer.run(id, a.description || '', a.is_correct ? 1 : 0);
            }
        }
    });

    updateTransaction();
    const updated = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);

    res.status(200).json({
        EC: 0,
        EM: 'Update question success',
        DT: updated,
    });
});

// DELETE /questions/:id (Delete question)
router.delete('/questions/:id', (req, res) => {
    const id = req.params.id;
    const result = db.prepare('DELETE FROM questions WHERE id = ?').run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            EC: -1,
            EM: 'Question not found',
            DT: '',
        });
    }

    res.status(200).json({
        EC: 0,
        EM: 'Delete question success',
        DT: '',
    });
});

// POST /quiz-assign-to-quiz (Save/replace multiple questions for a quiz)
router.post('/quiz-assign-to-quiz', (req, res) => {
    const { quizId, questions } = req.body;

    if (!quizId) {
        return res.status(400).json({
            EC: -1,
            EM: 'quizId is required',
            DT: '',
        });
    }

    if (!Array.isArray(questions)) {
        return res.status(400).json({
            EC: -1,
            EM: 'questions must be an array',
            DT: '',
        });
    }

    const saveTransaction = db.transaction(() => {
        // Delete existing questions and their cascade answers
        db.prepare('DELETE FROM questions WHERE quiz_id = ?').run(quizId);

        const insertQ = db.prepare(`
            INSERT INTO questions (quiz_id, description, image, type)
            VALUES (?, ?, ?, ?)
        `);
        const insertA = db.prepare(`
            INSERT INTO answers (question_id, description, is_correct)
            VALUES (?, ?, ?)
        `);

        for (const q of questions) {
            const qRes = insertQ.run(quizId, q.description || '', q.image || null, q.type || 'SINGLE');
            const qId = qRes.lastInsertRowid;

            if (Array.isArray(q.answers)) {
                for (const a of q.answers) {
                    insertA.run(qId, a.description || '', a.is_correct ? 1 : 0);
                }
            }
        }
    });

    saveTransaction();

    res.status(200).json({
        EC: 0,
        EM: 'Save questions for quiz success',
        DT: { quizId, count: questions.length },
    });
});

module.exports = router;
