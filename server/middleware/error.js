function errorHandler(err, req, res, next) {
    console.error(`[QuizMaster Error] ${req.method} ${req.originalUrl}:`, err);

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        EC: -1,
        EM: message,
        DT: process.env.NODE_ENV === 'development' ? err.stack : '',
    });
}

module.exports = errorHandler;
