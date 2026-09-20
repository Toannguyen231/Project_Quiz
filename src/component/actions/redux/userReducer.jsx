import {
    FETCH_USER_LOGIN_SUCCESS,
    FETCH_USER_LOGIN_FAIL,
    USER_LOGOUT,
    UPDATE_USER_PROFILE,
    REFRESH_TOKEN_SUCCESS,
} from '../Actions';

export {
    FETCH_USER_LOGIN_SUCCESS,
    FETCH_USER_LOGIN_FAIL,
    USER_LOGOUT,
    UPDATE_USER_PROFILE,
    REFRESH_TOKEN_SUCCESS,
};

export const INITIAL_STATE = {
    account: {
        access_token: '',
        token: '',
        refresh_token: '',
        username: '',
        email: '',
        role: '',
        roles: '',
        image: '',
        auth: false,
    },
    isAuthenticated: false,
};

const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS: {
            const dt = action.payload?.DT || action.payload || {};
            const userObj = dt.user || dt;
            const token = dt.access_token || dt.token || userObj.access_token || userObj.token || '';
            const refreshToken = dt.refresh_token || dt.refreshToken || userObj.refresh_token || userObj.refreshToken || '';
            const username = userObj.username || userObj.userName || userObj.name || dt.username || '';
            const email = userObj.email || dt.email || '';
            const rawRole = userObj.roles || userObj.role || dt.roles || dt.role || 'USER';
            const role = typeof rawRole === 'string' ? rawRole.toUpperCase() : 'USER';
            const image = userObj.image || dt.image || '';

            return {
                ...state,
                account: {
                    access_token: token,
                    token: token,
                    refresh_token: refreshToken,
                    username: username,
                    email: email,
                    role: role,
                    roles: role,
                    image: image,
                    auth: true,
                },
                isAuthenticated: true,
            };
        }

        case REFRESH_TOKEN_SUCCESS: {
            const rDt = action.payload?.DT || action.payload || {};
            const newToken = rDt.access_token || rDt.token || action.payload?.access_token || action.payload?.token || '';
            const newRefreshToken = rDt.refresh_token || rDt.refreshToken || action.payload?.refresh_token || action.payload?.refreshToken || state.account.refresh_token;

            return {
                ...state,
                account: {
                    ...state.account,
                    access_token: newToken || state.account.access_token,
                    token: newToken || state.account.token,
                    refresh_token: newRefreshToken,
                    auth: true,
                },
                isAuthenticated: true,
            };
        }

        case UPDATE_USER_PROFILE: {
            const pDt = action.payload?.DT || action.payload || {};
            const pUser = pDt.user || pDt;
            const updatedUsername = pUser.username !== undefined ? pUser.username : (pUser.userName !== undefined ? pUser.userName : state.account.username);
            const updatedEmail = pUser.email !== undefined ? pUser.email : state.account.email;
            const updatedImage = pUser.image !== undefined ? pUser.image : state.account.image;
            const rawUpdatedRole = pUser.role || pUser.roles;
            const updatedRole = rawUpdatedRole ? (typeof rawUpdatedRole === 'string' ? rawUpdatedRole.toUpperCase() : state.account.role) : state.account.role;

            return {
                ...state,
                account: {
                    ...state.account,
                    username: updatedUsername,
                    email: updatedEmail,
                    image: updatedImage,
                    role: updatedRole,
                    roles: updatedRole,
                },
            };
        }

        case USER_LOGOUT:
        case FETCH_USER_LOGIN_FAIL:
        case 'FETCH_USER_LOGOUT_FAIL':
            return {
                ...state,
                account: {
                    access_token: '',
                    token: '',
                    refresh_token: '',
                    username: '',
                    email: '',
                    role: '',
                    roles: '',
                    image: '',
                    auth: false,
                },
                isAuthenticated: false,
            };

        default:
            return state;
    }
};

export default userReducer;

