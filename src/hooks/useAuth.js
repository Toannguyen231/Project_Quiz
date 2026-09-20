import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchUserLoginSuccess,
    userLogout,
    updateUserProfile,
    refreshTokenSuccess,
} from '../component/actions/Actions';
import instance from '../component/util/axiosCutomes';
import { persistor } from '../component/actions/store';

/**
 * Custom hook to access authentication state and dispatch auth actions
 * Exposes: user, account, role, isAuthenticated, isAdmin, isUser, login, logout, updateProfile
 */
export const useAuth = () => {
    const dispatch = useDispatch();

    const account = useSelector((state) => state.user?.account) || {};
    const isAuthenticated = useSelector((state) => state.user?.isAuthenticated) || false;

    // Normalizing role
    const rawRole = account.role || account.roles || '';
    const role = typeof rawRole === 'string' ? rawRole.toUpperCase() : '';
    const isAdmin = role === 'ADMIN';
    const isUser = role === 'USER';

    const user = {
        id: account.id || null,
        username: account.username || '',
        email: account.email || '',
        role: role,
        roles: role,
        image: account.image || '',
        token: account.token || account.access_token || '',
        access_token: account.access_token || account.token || '',
        refresh_token: account.refresh_token || '',
        auth: Boolean(isAuthenticated),
    };

    const login = useCallback(
        (userData) => {
            dispatch(fetchUserLoginSuccess(userData));
        },
        [dispatch]
    );

    const logout = useCallback(async () => {
        try {
            await instance.post('/auth/logout').catch(() => {});
        } catch (err) {
            // Ignore failure on logout API
        } finally {
            dispatch(userLogout());
            if (persistor && typeof persistor.purge === 'function') {
                persistor.purge().catch(() => {});
            }
        }
    }, [dispatch]);

    const updateProfile = useCallback(
        (profileData) => {
            dispatch(updateUserProfile(profileData));
        },
        [dispatch]
    );

    const refreshTokens = useCallback(
        (tokenData) => {
            dispatch(refreshTokenSuccess(tokenData));
        },
        [dispatch]
    );

    return {
        user,
        account,
        role,
        isAuthenticated,
        isAdmin,
        isUser,
        login,
        logout,
        updateProfile,
        refreshTokens,
    };
};

export default useAuth;
