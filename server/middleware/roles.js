function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                EC: -1,
                EM: 'Unauthorized: User not authenticated',
                DT: '',
            });
        }

        const userRole = (req.user.role || '').toUpperCase();
        if (userRole !== role.toUpperCase()) {
            return res.status(403).json({
                EC: -1,
                EM: `Forbidden: Requires ${role} role`,
                DT: '',
            });
        }

        next();
    };
}

const requireAdmin = requireRole('ADMIN');

module.exports = {
    requireRole,
    requireAdmin,
};
