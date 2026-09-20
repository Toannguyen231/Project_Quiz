export const INCREMENT = 'INCREMENT';
export const FETCH_USER_LOGIN_SUCCESS = 'FETCH_USER_LOGIN_SUCCESS';
export const DECREMENT = 'DECREMENT';
export const FETCH_USER_LOGIN_FAIL = 'FETCH_USER_LOGOUT_FAIL';
export const USER_LOGOUT = 'USER_LOGOUT';
export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE';
export const REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS';

export const increaseCounter = () => {
    return {
        type: INCREMENT,
    };
};

export const decreaseCounter = () => {
    return {
        type: DECREMENT,
    };
};

export const fetchUserLoginSuccess = (userData) => {
    return {
        type: FETCH_USER_LOGIN_SUCCESS,
        payload: userData,
    };
};

export const fetchUserLoginFail = (userData) => {
    return {
        type: FETCH_USER_LOGIN_FAIL,
        payload: userData,
    };
};

export const userLogout = () => {
    return {
        type: USER_LOGOUT,
    };
};

export const updateUserProfile = (profileData) => {
    return {
        type: UPDATE_USER_PROFILE,
        payload: profileData,
    };
};

export const refreshTokenSuccess = (tokenData) => {
    return {
        type: REFRESH_TOKEN_SUCCESS,
        payload: tokenData,
    };
};

