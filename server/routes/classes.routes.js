const express = require('express');
const db = require('../config/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Base student offsets to preserve realistic counts from hardcoded UI
const BASE_STUDENTS = {
    1: 42,
    2: 28,
    3: 35,
};

// GET /api/v1/classes — Danh sách tất cả lớp học
router.get('/', optionalAuth, (req, res) => {
    try {
        const classes = db.prepare('SELECT * FROM classes WHERE status = ? ORDER BY id ASC').all('active');
        const userId = req.user ? req.user.id : null;

        const result = classes.map((cls) => {
            const memberCount = db.prepare('SELECT COUNT(*) AS count FROM class_members WHERE class_id = ?').get(cls.id).count;
            const base = BASE_STUDENTS[cls.id] || 20;
            const students = base + memberCount;

            let isJoined = false;
            if (userId) {
                const joinedRecord = db.prepare('SELECT id FROM class_members WHERE class_id = ? AND user_id = ?').get(cls.id, userId);
                isJoined = Boolean(joinedRecord);
            }

            return {
                id: cls.id,
                name: cls.name,
                code: cls.code,
                teacher: cls.teacher,
                schedule: cls.schedule,
                status: cls.status,
                max_students: cls.max_students,
                description: cls.description,
                students,
                isJoined,
            };
        });

        res.status(200).json({
            EC: 0,
            EM: 'Get classes success',
            DT: result,
        });
    } catch (error) {
        res.status(500).json({
            EC: -1,
            EM: error.message,
            DT: null,
        });
    }
});

// GET /api/v1/classes/mine — Danh sách lớp tôi đã tham gia
router.get('/mine', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const myClasses = db.prepare(`
            SELECT c.*, cm.joined_at
            FROM classes c
            JOIN class_members cm ON c.id = cm.class_id
            WHERE cm.user_id = ?
            ORDER BY cm.joined_at DESC
        `).all(userId);

        const result = myClasses.map((cls) => {
            const memberCount = db.prepare('SELECT COUNT(*) AS count FROM class_members WHERE class_id = ?').get(cls.id).count;
            const base = BASE_STUDENTS[cls.id] || 20;
            return {
                id: cls.id,
                name: cls.name,
                code: cls.code,
                teacher: cls.teacher,
                schedule: cls.schedule,
                status: cls.status,
                max_students: cls.max_students,
                description: cls.description,
                students: base + memberCount,
                joined_at: cls.joined_at,
                isJoined: true,
            };
        });

        res.status(200).json({
            EC: 0,
            EM: 'Get my classes success',
            DT: result,
        });
    } catch (error) {
        res.status(500).json({
            EC: -1,
            EM: error.message,
            DT: null,
        });
    }
});

// POST /api/v1/classes/:id/join — Học viên tham gia lớp (Idempotent)
router.post('/:id/join', authenticateToken, (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        if (!classId) {
            return res.status(400).json({
                EC: -1,
                EM: 'Mã lớp học không hợp lệ',
                DT: null,
            });
        }

        const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
        if (!cls) {
            return res.status(404).json({
                EC: -1,
                EM: 'Lớp học không tồn tại',
                DT: null,
            });
        }

        // Idempotent insertion
        const existing = db.prepare('SELECT id FROM class_members WHERE class_id = ? AND user_id = ?').get(classId, userId);
        if (existing) {
            return res.status(200).json({
                EC: 0,
                EM: 'Bạn đã tham gia lớp học này rồi',
                DT: {
                    class_id: classId,
                    user_id: userId,
                    alreadyJoined: true,
                },
            });
        }

        db.prepare('INSERT INTO class_members (class_id, user_id) VALUES (?, ?)').run(classId, userId);

        res.status(200).json({
            EC: 0,
            EM: 'Tham gia lớp học thành công',
            DT: {
                class_id: classId,
                user_id: userId,
                alreadyJoined: false,
            },
        });
    } catch (error) {
        res.status(500).json({
            EC: -1,
            EM: error.message,
            DT: null,
        });
    }
});

module.exports = router;
