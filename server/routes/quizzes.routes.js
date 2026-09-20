const express = require('express');
const multer = require('multer');
const db = require('../config/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function bufferToDataURI(file) {
    if (!file || !file.buffer) return null;
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

// ── PARTICIPANT QUIZZES ──────────────────────────────────────────

// GET /quiz-by-participant
router.get('/quiz-by-participant', optionalAuth, (req, res) => {
    let quizzes = [];

    if (req.user && req.user.id) {
        // Find assigned quizzes for this participant
        quizzes = db.prepare(`
            SELECT q.id, q.name, q.description, q.difficulty, q.image, q.duration, q.created_at
            FROM quizzes q
            JOIN user_quizzes uq ON q.id = uq.quiz_id
            WHERE uq.user_id = ?
            ORDER BY q.id DESC
        `).all(req.user.id);
    }

    // If no specific quizzes assigned or unauthenticated, return all public quizzes
    if (quizzes.length === 0) {
        quizzes = db.prepare(`
            SELECT id, name, description, difficulty, image, duration, created_at
            FROM quizzes
            ORDER BY id DESC
        `).all();
    }

    res.status(200).json({
        EC: 0,
        EM: 'Get quizzes success',
        DT: quizzes,
    });
});

// ── ADMIN QUIZ MANAGEMENT ────────────────────────────────────────

// GET /quiz/all
router.get('/quiz/all', (req, res) => {
    const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY id DESC').all();
    res.status(200).json({
        EC: 0,
        EM: 'Get all quizzes success',
        DT: quizzes,
    });
});

// POST /quiz (Create quiz)
router.post('/quiz', upload.single('quizImage'), (req, res) => {
    const { name, description, difficulty } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = bufferToDataURI(req.file);
    }

    if (!name) {
        return res.status(400).json({
            EC: -1,
            EM: 'Quiz name is required',
            DT: '',
        });
    }

    const quizDifficulty = (difficulty || 'EASY').toUpperCase();
    const result = db.prepare(`
        INSERT INTO quizzes (name, description, difficulty, image)
        VALUES (?, ?, ?, ?)
    `).run(name.trim(), description || '', quizDifficulty, image || null);

    res.status(201).json({
        EC: 0,
        EM: 'Create quiz success',
        DT: {
            id: result.lastInsertRowid,
            name: name.trim(),
            description: description || '',
            difficulty: quizDifficulty,
            image: image || null,
        },
    });
});

// PUT /quiz (Update quiz)
router.put('/quiz', upload.single('quizImage'), (req, res) => {
    const { id, name, description, difficulty } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = bufferToDataURI(req.file);
    }

    if (!id) {
        return res.status(400).json({
            EC: -1,
            EM: 'Quiz id is required',
            DT: '',
        });
    }

    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (!quiz) {
        return res.status(404).json({
            EC: -1,
            EM: 'Quiz not found',
            DT: '',
        });
    }

    const updates = [];
    const params = [];

    if (name) {
        updates.push('name = ?');
        params.push(name.trim());
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }
    if (difficulty) {
        updates.push('difficulty = ?');
        params.push(difficulty.toUpperCase());
    }
    if (image !== undefined) {
        updates.push('image = ?');
        params.push(image);
    }

    if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        db.prepare(`UPDATE quizzes SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updatedQuiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);

    res.status(200).json({
        EC: 0,
        EM: 'Update quiz success',
        DT: updatedQuiz,
    });
});

// DELETE /quiz/:id
router.delete('/quiz/:id', (req, res) => {
    const id = req.params.id;

    const result = db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
    if (result.changes === 0) {
        return res.status(404).json({
            EC: -1,
            EM: 'Quiz not found',
            DT: '',
        });
    }

    res.status(200).json({
        EC: 0,
        EM: 'Delete quiz success',
        DT: '',
    });
});

// POST /quiz-assign-to-user (Assign quiz to user or multiple users)
router.post('/quiz-assign-to-user', (req, res) => {
    const { quizId, userId, userIds } = req.body;

    if (!quizId) {
        return res.status(400).json({
            EC: -1,
            EM: 'Quiz ID is required',
            DT: '',
        });
    }

    const idsToAssign = [];
    if (userIds && Array.isArray(userIds)) {
        idsToAssign.push(...userIds);
    } else if (userId) {
        idsToAssign.push(userId);
    }

    if (idsToAssign.length === 0) {
        return res.status(400).json({
            EC: -1,
            EM: 'At least one user ID is required',
            DT: '',
        });
    }

    const insertAssign = db.prepare('INSERT OR IGNORE INTO user_quizzes (user_id, quiz_id) VALUES (?, ?)');
    const insertMany = db.transaction((ids) => {
        for (const uid of ids) {
            insertAssign.run(uid, quizId);
        }
    });

    insertMany(idsToAssign);

    res.status(200).json({
        EC: 0,
        EM: 'Assign quiz to user(s) success',
        DT: { quizId, assignedCount: idsToAssign.length },
    });
});

// POST /quiz/:id/duplicate (Duplicate quiz with all questions & answers)
router.post('/quiz/:id/duplicate', (req, res) => {
    const quizId = req.params.id;
    const sourceQuiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);

    if (!sourceQuiz) {
        return res.status(404).json({
            EC: -1,
            EM: 'Source quiz not found',
            DT: '',
        });
    }

    const duplicateTransaction = db.transaction(() => {
        // Insert new quiz copy
        const newQuizRes = db.prepare(`
            INSERT INTO quizzes (name, description, difficulty, image, duration)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            `${sourceQuiz.name} (Copy)`,
            sourceQuiz.description,
            sourceQuiz.difficulty,
            sourceQuiz.image,
            sourceQuiz.duration
        );

        const newQuizId = newQuizRes.lastInsertRowid;

        // Copy questions
        const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quizId);
        for (const q of questions) {
            const newQRes = db.prepare(`
                INSERT INTO questions (quiz_id, description, image, type)
                VALUES (?, ?, ?, ?)
            `).run(newQuizId, q.description, q.image, q.type);

            const newQId = newQRes.lastInsertRowid;

            // Copy answers
            const answers = db.prepare('SELECT * FROM answers WHERE question_id = ?').all(q.id);
            for (const a of answers) {
                db.prepare(`
                    INSERT INTO answers (question_id, description, is_correct)
                    VALUES (?, ?, ?)
                `).run(newQId, a.description, a.is_correct);
            }
        }

        return newQuizId;
    });

    const newQuizId = duplicateTransaction();
    const createdQuiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(newQuizId);

    res.status(201).json({
        EC: 0,
        EM: 'Quiz duplicated successfully',
        DT: createdQuiz,
    });
});

// GET /quiz/:id/export (Export quiz + questions + answers to JSON)
router.get('/quiz/:id/export', (req, res) => {
    const quizId = req.params.id;
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);

    if (!quiz) {
        return res.status(404).json({
            EC: -1,
            EM: 'Quiz not found',
            DT: '',
        });
    }

    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quizId);
    const fullQuestions = questions.map((q) => {
        const answers = db.prepare('SELECT description, is_correct FROM answers WHERE question_id = ?').all(q.id);
        return {
            description: q.description,
            image: q.image,
            type: q.type,
            answers: answers.map((a) => ({
                description: a.description,
                is_correct: Boolean(a.is_correct),
            })),
        };
    });

    const exportData = {
        name: quiz.name,
        description: quiz.description,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        image: quiz.image,
        questions: fullQuestions,
    };

    res.status(200).json({
        EC: 0,
        EM: 'Export quiz success',
        DT: exportData,
    });
});

// POST /quiz/import (Import quiz JSON)
router.post('/quiz/import', (req, res) => {
    const quizData = req.body.quizData || req.body;

    if (!quizData || !quizData.name) {
        return res.status(400).json({
            EC: -1,
            EM: 'Valid quiz data with name is required',
            DT: '',
        });
    }

    const importTransaction = db.transaction(() => {
        const quizRes = db.prepare(`
            INSERT INTO quizzes (name, description, difficulty, image, duration)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            quizData.name,
            quizData.description || '',
            quizData.difficulty || 'EASY',
            quizData.image || null,
            quizData.duration || 600
        );

        const newQuizId = quizRes.lastInsertRowid;

        if (Array.isArray(quizData.questions)) {
            for (const q of quizData.questions) {
                const qRes = db.prepare(`
                    INSERT INTO questions (quiz_id, description, image, type)
                    VALUES (?, ?, ?, ?)
                `).run(newQuizId, q.description, q.image || null, q.type || 'SINGLE');

                const newQId = qRes.lastInsertRowid;

                if (Array.isArray(q.answers)) {
                    for (const a of q.answers) {
                        db.prepare(`
                            INSERT INTO answers (question_id, description, is_correct)
                            VALUES (?, ?, ?)
                        `).run(newQId, a.description, a.is_correct ? 1 : 0);
                    }
                }
            }
        }

        return newQuizId;
    });

    const newQuizId = importTransaction();
    const importedQuiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(newQuizId);

    res.status(201).json({
        EC: 0,
        EM: 'Import quiz success',
        DT: importedQuiz,
    });
});

module.exports = router;
