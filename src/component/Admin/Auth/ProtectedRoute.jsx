import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

/**
 * Route guard component for authentication and role-based access control (RBAC)
 * @param {React.ReactNode} children
 * @param {string} [requiredRole] - 'ADMIN' | 'USER'
 * @param {string} [redirectTo] - Custom path to redirect on failure
 */
const ProtectedRoute = ({ children, requiredRole, redirectTo }) => {
    const { isAuthenticated, isAdmin, role } = useAuth();
    const location = useLocation();

    // If not logged in, redirect to login page preserving target location
    if (!isAuthenticated) {
        return <Navigate to={redirectTo || '/login'} state={{ from: location }} replace />;
    }

    // Role-based authorization check
    if (requiredRole) {
        const targetRole = requiredRole.toUpperCase();
        if (targetRole === 'ADMIN' && !isAdmin) {
            // Non-admin attempting to access admin route: redirect to home
            return <Navigate to="/" replace />;
        }
        if (targetRole === 'USER' && role !== 'USER' && !isAdmin) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
