const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Helper to convert buffer to base64 data URI
function bufferToDataURI(file) {
    if (!file || !file.buffer) return null;
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

// ── CURRENT USER PROFILE ─────────────────────────────────────────

// GET /users/me
router.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, email, username, role, image, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({
            EC: -1,
            EM: 'User not found',
            DT: '',
        });
    }

    res.status(200).json({
        EC: 0,
        EM: 'Profile retrieved successfully',
        DT: user,
    });
});

// PUT /users/me
router.put('/me', authenticateToken, upload.single('userImage'), (req, res) => {
    const { username } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = bufferToDataURI(req.file);
    }

    const updates = [];
    const params = [];

    if (username && username.trim()) {
        updates.push('username = ?');
        params.push(username.trim());
    }

    if (image !== undefined) {
        updates.push('image = ?');
        params.push(image);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            EC: -1,
            EM: 'No fields to update',
            DT: '',
        });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedUser = db.prepare('SELECT id, email, username, role, image FROM users WHERE id = ?').get(req.user.id);

    res.status(200).json({
        EC: 0,
        EM: 'Profile updated successfully',
        DT: updatedUser,
    });
});

// ── PARTICIPANTS (ADMIN CRUD) ───────────────────────────────────

// GET /participant/all
router.get('/participant/all', (req, res) => {
    const users = db.prepare('SELECT id, email, username, role, image, created_at FROM users ORDER BY id DESC').all();
    res.status(200).json({
        EC: 0,
        EM: 'Get all users success',
        DT: users,
    });
});

// GET /participant?page=&limit=&search=
router.get('/participant', (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';

    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) AS total FROM users';
    let dataQuery = 'SELECT id, email, username, role, image, created_at FROM users';
    const params = [];

    if (search) {
        countQuery += ' WHERE email LIKE ? OR username LIKE ?';
        dataQuery += ' WHERE email LIKE ? OR username LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
    }

    dataQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    const totalRows = db.prepare(countQuery).get(...params).total;
    const totalPages = Math.ceil(totalRows / limit) || 1;

    const queryParams = [...params, limit, offset];
    const users = db.prepare(dataQuery).all(...queryParams);

    res.status(200).json({
        EC: 0,
        EM: 'Get users with pagination success',
        DT: {
            totalRows,
            totalPages,
            users,
        },
    });
});

// POST /participant (Create user)
router.post('/participant', upload.single('userImage'), (req, res) => {
    const { email, password, username, role } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = bufferToDataURI(req.file);
    }

    if (!email || !password || !username) {
        return res.status(400).json({
            EC: -1,
            EM: 'Email, password, and username are required',
            DT: '',
        });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existingUser) {
        return res.status(400).json({
            EC: -1,
            EM: 'Email already exists',
            DT: '',
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userRole = (role || 'USER').toUpperCase();

    const result = db.prepare(`
        INSERT INTO users (email, password, username, role, image)
        VALUES (?, ?, ?, ?, ?)
    `).run(email.trim().toLowerCase(), hashedPassword, username.trim(), userRole, image || null);

    res.status(201).json({
        EC: 0,
        EM: 'Create user success',
        DT: {
            id: result.lastInsertRowid,
            email: email.trim().toLowerCase(),
            username: username.trim(),
            role: userRole,
            image: image || null,
        },
    });
});

// PUT /participant (Update user)
router.put('/participant', upload.single('userImage'), (req, res) => {
    const { id, username, role } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = bufferToDataURI(req.file);
    }

    if (!id) {
        return res.status(400).json({
            EC: -1,
            EM: 'User id is required',
            DT: '',
        });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
        return res.status(404).json({
            EC: -1,
            EM: 'User not found',
            DT: '',
        });
    }

    const updates = [];
    const params = [];

    if (username) {
        updates.push('username = ?');
        params.push(username.trim());
    }
    if (role) {
        updates.push('role = ?');
        params.push(role.toUpperCase());
    }
    if (image !== undefined) {
        updates.push('image = ?');
        params.push(image);
    }

    if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updatedUser = db.prepare('SELECT id, email, username, role, image FROM users WHERE id = ?').get(id);

    res.status(200).json({
        EC: 0,
        EM: 'Update user success',
        DT: updatedUser,
    });
});

// DELETE /participant (Delete user)
router.delete('/participant', (req, res) => {
    const id = req.body?.id || req.query?.id;

    if (!id) {
        return res.status(400).json({
            EC: -1,
            EM: 'User id is required',
            DT: '',
        });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (result.changes === 0) {
        return res.status(404).json({
            EC: -1,
            EM: 'User not found',
            DT: '',
        });
    }

    res.status(200).json({
        EC: 0,
        EM: 'Delete user success',
        DT: '',
    });
});

module.exports = router;
