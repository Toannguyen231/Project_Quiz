import userReducer, {
    INITIAL_STATE,
    FETCH_USER_LOGIN_SUCCESS,
    FETCH_USER_LOGIN_FAIL,
    USER_LOGOUT,
    UPDATE_USER_PROFILE,
    REFRESH_TOKEN_SUCCESS,
} from '../userReducer';

describe('userReducer Unit Tests', () => {
    test('returns INITIAL_STATE when state is undefined and action is unknown', () => {
        const state = userReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(INITIAL_STATE);
        expect(state.isAuthenticated).toBe(false);
        expect(state.account.auth).toBe(false);
        expect(state.account.token).toBe('');
    });

    describe('FETCH_USER_LOGIN_SUCCESS', () => {
        test('handles standard API payload with nested DT and user object', () => {
            const action = {
                type: FETCH_USER_LOGIN_SUCCESS,
                payload: {
                    EC: 0,
                    DT: {
                        access_token: 'mock-access-token-123',
                        refresh_token: 'mock-refresh-token-456',
                        user: {
                            id: 10,
                            username: 'john_doe',
                            email: 'john@example.com',
                            role: 'ADMIN',
                            image: 'avatar-url.jpg',
                        },
                    },
                },
            };

            const state = userReducer(INITIAL_STATE, action);

            expect(state.isAuthenticated).toBe(true);
            expect(state.account.auth).toBe(true);
            expect(state.account.token).toBe('mock-access-token-123');
            expect(state.account.access_token).toBe('mock-access-token-123');
            expect(state.account.refresh_token).toBe('mock-refresh-token-456');
            expect(state.account.username).toBe('john_doe');
            expect(state.account.email).toBe('john@example.com');
            expect(state.account.role).toBe('ADMIN');
            expect(state.account.roles).toBe('ADMIN');
            expect(state.account.image).toBe('avatar-url.jpg');
        });

        test('handles flat payload structure and normalizes lowercase role to uppercase', () => {
            const action = {
                type: FETCH_USER_LOGIN_SUCCESS,
                payload: {
                    token: 'flat-token-xyz',
                    refreshToken: 'flat-refresh-abc',
                    username: 'learner_jane',
                    email: 'jane@quiz.com',
                    role: 'user',
                    image: 'jane.png',
                },
            };

            const state = userReducer(INITIAL_STATE, action);

            expect(state.isAuthenticated).toBe(true);
            expect(state.account.auth).toBe(true);
            expect(state.account.token).toBe('flat-token-xyz');
            expect(state.account.refresh_token).toBe('flat-refresh-abc');
            expect(state.account.role).toBe('USER');
            expect(state.account.roles).toBe('USER');
            expect(state.account.username).toBe('learner_jane');
        });

        test('defaults missing role to USER and handles empty payload gracefully', () => {
            const action = {
                type: FETCH_USER_LOGIN_SUCCESS,
                payload: null,
            };

            const state = userReducer(INITIAL_STATE, action);

            expect(state.isAuthenticated).toBe(true);
            expect(state.account.role).toBe('USER');
            expect(state.account.token).toBe('');
            expect(state.account.username).toBe('');
        });
    });

    describe('USER_LOGOUT & LOGIN_FAIL', () => {
        const loggedInState = {
            isAuthenticated: true,
            account: {
                access_token: 'active-token',
                token: 'active-token',
                refresh_token: 'active-refresh',
                username: 'alice',
                email: 'alice@mail.com',
                role: 'USER',
                roles: 'USER',
                image: 'img.png',
                auth: true,
            },
        };

        test('clears user authentication state and resets account on USER_LOGOUT', () => {
            const state = userReducer(loggedInState, { type: USER_LOGOUT });

            expect(state.isAuthenticated).toBe(false);
            expect(state.account.auth).toBe(false);
            expect(state.account.token).toBe('');
            expect(state.account.access_token).toBe('');
            expect(state.account.refresh_token).toBe('');
            expect(state.account.username).toBe('');
            expect(state.account.email).toBe('');
            expect(state.account.role).toBe('');
        });

        test('clears user authentication state on FETCH_USER_LOGIN_FAIL', () => {
            const state = userReducer(loggedInState, { type: FETCH_USER_LOGIN_FAIL });
            expect(state.isAuthenticated).toBe(false);
            expect(state.account.auth).toBe(false);
        });

        test('clears user authentication state on FETCH_USER_LOGOUT_FAIL', () => {
            const state = userReducer(loggedInState, { type: 'FETCH_USER_LOGOUT_FAIL' });
            expect(state.isAuthenticated).toBe(false);
            expect(state.account.auth).toBe(false);
        });
    });

    describe('UPDATE_USER_PROFILE', () => {
        const loggedInState = {
            isAuthenticated: true,
            account: {
                access_token: 'token-stays',
                token: 'token-stays',
                refresh_token: 'refresh-stays',
                username: 'old_name',
                email: 'old@mail.com',
                role: 'USER',
                roles: 'USER',
                image: 'old.png',
                auth: true,
            },
        };

        test('updates username and image while preserving existing tokens', () => {
            const action = {
                type: UPDATE_USER_PROFILE,
                payload: {
                    user: {
                        username: 'new_name',
                        image: 'new_avatar.jpg',
                    },
                },
            };

            const state = userReducer(loggedInState, action);

            expect(state.account.username).toBe('new_name');
            expect(state.account.image).toBe('new_avatar.jpg');
            // Unchanged fields preserved
            expect(state.account.email).toBe('old@mail.com');
            expect(state.account.token).toBe('token-stays');
            expect(state.account.refresh_token).toBe('refresh-stays');
            expect(state.isAuthenticated).toBe(true);
        });

        test('handles nested DT payload and role update', () => {
            const action = {
                type: UPDATE_USER_PROFILE,
                payload: {
                    DT: {
                        user: {
                            username: 'promoted_admin',
                            role: 'admin',
                        },
                    },
                },
            };

            const state = userReducer(loggedInState, action);

            expect(state.account.username).toBe('promoted_admin');
            expect(state.account.role).toBe('ADMIN');
            expect(state.account.roles).toBe('ADMIN');
        });
    });

    describe('REFRESH_TOKEN_SUCCESS', () => {
        const activeState = {
            isAuthenticated: true,
            account: {
                access_token: 'old-access-token',
                token: 'old-access-token',
                refresh_token: 'persisted-refresh-token',
                username: 'bob',
                email: 'bob@mail.com',
                role: 'USER',
                roles: 'USER',
                image: '',
                auth: true,
            },
        };

        test('updates access_token while retaining existing refresh_token and profile info', () => {
            const action = {
                type: REFRESH_TOKEN_SUCCESS,
                payload: {
                    DT: {
                        access_token: 'fresh-new-jwt',
                    },
                },
            };

            const state = userReducer(activeState, action);

            expect(state.account.token).toBe('fresh-new-jwt');
            expect(state.account.access_token).toBe('fresh-new-jwt');
            expect(state.account.refresh_token).toBe('persisted-refresh-token');
            expect(state.account.username).toBe('bob');
            expect(state.isAuthenticated).toBe(true);
            expect(state.account.auth).toBe(true);
        });

        test('updates both access_token and refresh_token when new refreshToken is provided', () => {
            const action = {
                type: REFRESH_TOKEN_SUCCESS,
                payload: {
                    access_token: 'new-token-1',
                    refresh_token: 'new-refresh-2',
                },
            };

            const state = userReducer(activeState, action);

            expect(state.account.token).toBe('new-token-1');
            expect(state.account.refresh_token).toBe('new-refresh-2');
        });
    });

    test('returns unmodified state for unrecognized action types', () => {
        const existingState = {
            isAuthenticated: true,
            account: { username: 'test' },
        };
        const state = userReducer(existingState, { type: 'SOME_UNKNOWN_ACTION' });
        expect(state).toBe(existingState);
    });
});
