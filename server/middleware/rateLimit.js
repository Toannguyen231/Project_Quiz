// Simple in-memory rate limiter per IP address
const ipRequests = new Map();

function rateLimiter(options = {}) {
    const windowMs = options.windowMs || 60 * 1000; // 1 minute default
    const max = options.max || 20; // 20 requests per window

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        if (!ipRequests.has(ip)) {
            ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const record = ipRequests.get(ip);
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }

        record.count += 1;
        if (record.count > max) {
            return res.status(429).json({
                EC: -1,
                EM: 'Too many requests, please try again later.',
                DT: '',
            });
        }

        next();
    };
}

module.exports = rateLimiter;
