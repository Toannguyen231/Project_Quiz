import { act } from '@testing-library/react';
import { renderHookWithProviders } from '../../test-utils';
import useAuth from '../useAuth';
import instance from '../../component/util/axiosCutomes';

jest.mock('../../component/util/axiosCutomes', () => ({
    __esModule: true,
    default: {
        post: jest.fn().mockResolvedValue({ data: { EC: 0 } }),
    },
}));

describe('useAuth Hook Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('provides unauthenticated state when no user is logged in', () => {
        const { result } = renderHookWithProviders(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.isUser).toBe(false);
        expect(result.current.role).toBe('');
        expect(result.current.user.auth).toBe(false);
        expect(result.current.user.token).toBe('');
    });

    test('correctly identifies standard USER role', () => {
        const preloadedState = {
            user: {
                isAuthenticated: true,
                account: {
                    id: 1,
                    username: 'learner_bob',
                    email: 'bob@quiz.io',
                    role: 'USER',
                    roles: 'USER',
                    token: 'tok-user-123',
                    access_token: 'tok-user-123',
                    refresh_token: 'ref-user-456',
                    image: 'avatar-bob.jpg',
                    auth: true,
                },
            },
        };

        const { result } = renderHookWithProviders(() => useAuth(), { preloadedState });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isUser).toBe(true);
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.role).toBe('USER');
        expect(result.current.user.username).toBe('learner_bob');
        expect(result.current.user.email).toBe('bob@quiz.io');
        expect(result.current.user.token).toBe('tok-user-123');
    });

    test('correctly identifies ADMIN role with case normalization', () => {
        const preloadedState = {
            user: {
                isAuthenticated: true,
                account: {
                    id: 99,
                    username: 'super_admin',
                    email: 'admin@quizmaster.edu',
                    role: 'admin', // lowercase
                    roles: 'admin',
                    token: 'tok-admin-secret',
                    auth: true,
                },
            },
        };

        const { result } = renderHookWithProviders(() => useAuth(), { preloadedState });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isUser).toBe(false);
        expect(result.current.role).toBe('ADMIN');
    });

    test('executes login and updates auth state in Redux', () => {
        const { result } = renderHookWithProviders(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);

        act(() => {
            result.current.login({
                access_token: 'new-login-token',
                user: {
                    username: 'new_user',
                    email: 'new@quiz.io',
                    role: 'USER',
                },
            });
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user.username).toBe('new_user');
        expect(result.current.user.token).toBe('new-login-token');
        expect(result.current.isUser).toBe(true);
    });

    test('executes updateProfile and updates account information', () => {
        const preloadedState = {
            user: {
                isAuthenticated: true,
                account: {
                    username: 'initial_name',
                    email: 'initial@quiz.io',
                    role: 'USER',
                    roles: 'USER',
                    token: 'session-tok',
                    auth: true,
                },
            },
        };

        const { result } = renderHookWithProviders(() => useAuth(), { preloadedState });

        act(() => {
            result.current.updateProfile({
                user: {
                    username: 'updated_name',
                    image: 'https://cdn.quiz.com/avatar.jpg',
                },
            });
        });

        expect(result.current.user.username).toBe('updated_name');
        expect(result.current.user.image).toBe('https://cdn.quiz.com/avatar.jpg');
        expect(result.current.user.email).toBe('initial@quiz.io'); // unchanged
    });

    test('executes refreshTokens and updates active token', () => {
        const preloadedState = {
            user: {
                isAuthenticated: true,
                account: {
                    username: 'bob',
                    token: 'old-access-jwt',
                    access_token: 'old-access-jwt',
                    refresh_token: 'refresh-persisted',
                    role: 'USER',
                    auth: true,
                },
            },
        };

        const { result } = renderHookWithProviders(() => useAuth(), { preloadedState });

        act(() => {
            result.current.refreshTokens({
                access_token: 'shiny-new-access-jwt',
            });
        });

        expect(result.current.user.token).toBe('shiny-new-access-jwt');
        expect(result.current.user.access_token).toBe('shiny-new-access-jwt');
        expect(result.current.user.refresh_token).toBe('refresh-persisted');
    });

    test('executes logout: calls API and resets auth state', async () => {
        const preloadedState = {
            user: {
                isAuthenticated: true,
                account: {
                    username: 'logging_out_user',
                    token: 'logout-token',
                    role: 'USER',
                    auth: true,
                },
            },
        };

        const { result } = renderHookWithProviders(() => useAuth(), { preloadedState });
        expect(result.current.isAuthenticated).toBe(true);

        await act(async () => {
            await result.current.logout();
        });

        expect(instance.post).toHaveBeenCalledWith('/auth/logout');
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user.token).toBe('');
    });
});
