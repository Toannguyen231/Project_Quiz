import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { store } from '../actions/store';
import { refreshTokenSuccess, userLogout } from '../actions/Actions';

// Create configured Axios instance
const instance = axios.create({
    baseURL: '/api/v1',
    timeout: 15000,
    withCredentials: true,
});

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 100,
});

// Mutex and request queue for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor: Attach Bearer token from Redux store & start NProgress
instance.interceptors.request.use(
    function (config) {
        if (config.url && config.url.startsWith('/api/v1')) {
            config.url = config.url.replace(/^\/api\/v1/, '') || '/';
        }
        const state = store.getState();
        const token = state?.user?.account?.access_token || state?.user?.account?.token;

        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        NProgress.start();
        return config;
    },
    function (error) {
        NProgress.done();
        return Promise.reject(error);
    }
);

// Response Interceptor: 401 interception, token refresh mutex/queue, retry and logout
instance.interceptors.response.use(
    function (response) {
        NProgress.done();
        return response;
    },
    async function (error) {
        NProgress.done();

        const originalRequest = error.config;

        if (!error.response || error.response.status !== 401 || !originalRequest) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || '';
        const isAuthEndpoint =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/register') ||
            requestUrl.includes('/auth/refresh') ||
            requestUrl.includes('/refresh') ||
            requestUrl.includes('/auth/logout') ||
            requestUrl.includes('/logout');

        // Do not attempt refresh on auth endpoints or if already retried
        if (isAuthEndpoint || originalRequest._retry) {
            if (requestUrl.includes('/refresh')) {
                // Refresh endpoint itself returned 401: clear session and redirect
                store.dispatch(userLogout());
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }

        // If refresh is already in progress, enqueue this request
        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then(function (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return instance(originalRequest);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const state = store.getState();
        const currentRefreshToken = state?.user?.account?.refresh_token;

        return new Promise(function (resolve, reject) {
            // Helper function to call refresh endpoint
            const tryRefresh = async () => {
                let refreshRes = null;
                try {
                    refreshRes = await axios.post(
                        '/api/v1/auth/refresh',
                        { refresh_token: currentRefreshToken },
                        { withCredentials: true, timeout: 10000 }
                    );
                } catch (err1) {
                    if (err1?.response?.status === 404) {
                        // Fallback to /api/v1/refresh
                        refreshRes = await axios.post(
                            '/api/v1/refresh',
                            { refresh_token: currentRefreshToken },
                            { withCredentials: true, timeout: 10000 }
                        );
                    } else {
                        throw err1;
                    }
                }

                const data = refreshRes?.data?.DT || refreshRes?.data || {};
                const newAccessToken =
                    data.access_token ||
                    data.token ||
                    (typeof data === 'string' ? data : null);
                const newRefreshToken =
                    data.refresh_token || data.refreshToken || currentRefreshToken;

                if (!newAccessToken) {
                    throw new Error('Invalid token in refresh response');
                }

                // Update Redux store
                store.dispatch(
                    refreshTokenSuccess({
                        access_token: newAccessToken,
                        token: newAccessToken,
                        refresh_token: newRefreshToken,
                    })
                );

                // Update default header on axios instance
                instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Flush queue with new token
                processQueue(null, newAccessToken);

                // Retry original request
                return instance(originalRequest);
            };

            tryRefresh()
                .then((res) => {
                    resolve(res);
                })
                .catch((refreshErr) => {
                    processQueue(refreshErr, null);
                    store.dispatch(userLogout());
                    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    reject(refreshErr);
                })
                .finally(() => {
                    isRefreshing = false;
                });
        });
    }
);

export default instance;

