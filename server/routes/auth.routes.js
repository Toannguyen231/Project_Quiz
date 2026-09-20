const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { JWT_SECRET } = require('../config/env');
const { authenticateToken } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimit');

const router = express.Router();

// Helper to generate access and refresh tokens
function generateTokens(user) {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Store refresh token in database
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(
        user.id,
        refreshToken,
        expiresAt
    );

    return { accessToken, refreshToken };
}

// POST /auth/login
router.post('/login', rateLimiter({ max: 20 }), (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            EC: -1,
            EM: 'Email and password are required',
            DT: '',
        });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user) {
        return res.status(401).json({
            EC: -1,
            EM: 'Invalid email or password',
            DT: '',
        });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            EC: -1,
            EM: 'Invalid email or password',
            DT: '',
        });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        EC: 0,
        EM: 'Login successful',
        DT: {
            access_token: accessToken,
            token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                image: user.image,
            },
        },
    });
});

// POST /auth/register
router.post('/register', rateLimiter({ max: 15 }), (req, res) => {
    const { username, userName, email, password } = req.body;
    const finalUsername = username || userName;

    if (!email || !password || !finalUsername) {
        return res.status(400).json({
            EC: -1,
            EM: 'Username, email and password are required',
            DT: '',
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            EC: -1,
            EM: 'Invalid email format',
            DT: '',
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            EC: -1,
            EM: 'Password must be at least 6 characters',
            DT: '',
        });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existingUser) {
        return res.status(409).json({
            EC: -1,
            EM: 'Email is already registered',
            DT: '',
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
        INSERT INTO users (email, password, username, role)
        VALUES (?, ?, ?, 'USER')
    `).run(email.trim().toLowerCase(), hashedPassword, finalUsername.trim());

    // Auto-assign existing quizzes to the new user so they can take quizzes immediately
    const quizzes = db.prepare('SELECT id FROM quizzes').all();
    const assignQuiz = db.prepare('INSERT OR IGNORE INTO user_quizzes (user_id, quiz_id) VALUES (?, ?)');
    for (const q of quizzes) {
        assignQuiz.run(result.lastInsertRowid, q.id);
    }

    res.status(201).json({
        EC: 0,
        EM: 'Registration successful',
        DT: {
            id: result.lastInsertRowid,
            email: email.trim().toLowerCase(),
            username: finalUsername.trim(),
            role: 'USER',
        },
    });
});

// POST /auth/refresh
router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({
            EC: -1,
            EM: 'Refresh token is required',
            DT: '',
        });
    }

    const tokenRecord = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
    if (!tokenRecord) {
        return res.status(401).json({
            EC: -1,
            EM: 'Invalid refresh token',
            DT: '',
        });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
        db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(tokenRecord.id);
        return res.status(401).json({
            EC: -1,
            EM: 'Refresh token expired',
            DT: '',
        });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(tokenRecord.user_id);
    if (!user) {
        return res.status(401).json({
            EC: -1,
            EM: 'User not found',
            DT: '',
        });
    }

    // Delete old refresh token
    db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(tokenRecord.id);

    // Generate new tokens
    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        EC: 0,
        EM: 'Token refreshed successfully',
        DT: {
            access_token: tokens.accessToken,
            token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
        },
    });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refresh_token;
    if (refreshToken) {
        db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.status(200).json({
        EC: 0,
        EM: 'Logged out successfully',
        DT: '',
    });
});

// POST /auth/change-password
router.post('/change-password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            EC: -1,
            EM: 'Current and new passwords are required',
            DT: '',
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            EC: -1,
            EM: 'New password must be at least 6 characters',
            DT: '',
        });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({
            EC: -1,
            EM: 'User not found',
            DT: '',
        });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({
            EC: -1,
            EM: 'Current password is incorrect',
            DT: '',
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        hashedPassword,
        user.id
    );

    res.status(200).json({
        EC: 0,
        EM: 'Password changed successfully',
        DT: '',
    });
});

// POST /auth/forgot-password
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    res.status(200).json({
        EC: 0,
        EM: 'If your email is registered in QuizMaster, password reset instructions have been dispatched.',
        DT: '',
    });
});

module.exports = router;
