const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({
            EC: -1,
            EM: 'Access token is required',
            DT: '',
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                EC: -1,
                EM: 'Invalid or expired access token',
                DT: '',
            });
        }
        req.user = user;
        next();
    });
}

// Optional authentication - attaches user if token is present, does not block if missing
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
        } else {
            req.user = null;
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    optionalAuth,
};
