const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /api/v1/posts — Danh sách bài viết blog (hỗ trợ filter tag)
router.get('/', (req, res) => {
    try {
        const { tag } = req.query;

        let query = 'SELECT * FROM posts';
        const params = [];

        if (tag && tag !== 'all') {
            query += ' WHERE tag = ?';
            params.push(tag);
        }

        query += ' ORDER BY featured DESC, id ASC';

        const posts = db.prepare(query).all(...params);

        const result = posts.map((p) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            tag: p.tag,
            author: p.author,
            readTime: p.read_time,
            read_minutes: p.read_minutes,
            date: p.published_at ? p.published_at.split(' ')[0] : '2026-09-21',
            featured: Boolean(p.featured),
            published_at: p.published_at,
            created_at: p.created_at,
        }));

        res.status(200).json({
            EC: 0,
            EM: 'Get posts success',
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

// GET /api/v1/posts/:id — Chi tiết bài viết
router.get('/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);

        if (!post) {
            return res.status(404).json({
                EC: -1,
                EM: 'Bài viết không tồn tại',
                DT: null,
            });
        }

        res.status(200).json({
            EC: 0,
            EM: 'Get post detail success',
            DT: {
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                tag: post.tag,
                author: post.author,
                readTime: post.read_time,
                read_minutes: post.read_minutes,
                date: post.published_at ? post.published_at.split(' ')[0] : '2026-09-21',
                featured: Boolean(post.featured),
                published_at: post.published_at,
                created_at: post.created_at,
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
