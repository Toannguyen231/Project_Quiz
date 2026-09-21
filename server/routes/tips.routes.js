const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /api/v1/tips — Danh sách tips, video ngắn (hỗ trợ filter category)
router.get('/', (req, res) => {
    try {
        const { category } = req.query;

        let query = 'SELECT * FROM tips';
        const params = [];

        if (category && category !== 'all') {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY featured DESC, id ASC';

        const tips = db.prepare(query).all(...params);

        const result = tips.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            duration: t.duration,
            duration_seconds: t.duration_seconds,
            level: t.level,
            description: t.description,
            video_url: t.video_url,
            featured: Boolean(t.featured),
            created_at: t.created_at,
        }));

        res.status(200).json({
            EC: 0,
            EM: 'Get tips success',
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

// GET /api/v1/tips/:id — Chi tiết một tip
router.get('/:id', (req, res) => {
    try {
        const tipId = parseInt(req.params.id, 10);
        const tip = db.prepare('SELECT * FROM tips WHERE id = ?').get(tipId);

        if (!tip) {
            return res.status(404).json({
                EC: -1,
                EM: 'Tip không tồn tại',
                DT: null,
            });
        }

        res.status(200).json({
            EC: 0,
            EM: 'Get tip detail success',
            DT: {
                ...tip,
                featured: Boolean(tip.featured),
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
