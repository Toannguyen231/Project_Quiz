const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    const createMiddleware = typeof proxy === 'function' ? proxy : proxy.createProxyMiddleware;
    app.use(
        createMiddleware('/api/v1', {
            target: 'http://localhost:5000',
            changeOrigin: true,
        })
    );
};
