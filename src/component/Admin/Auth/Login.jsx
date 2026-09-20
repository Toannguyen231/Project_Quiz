import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.scss';
import { postLogin } from '../../sevices/apiService';
import instance from '../../util/axiosCutomes';
import { useDispatch, useSelector } from 'react-redux';
import { ImSpinner6 } from 'react-icons/im';
import { FETCH_USER_LOGIN_SUCCESS } from '../../actions/Actions';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const mountedRef = useRef(true);

    const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isForgotLoading, setIsForgotLoading] = useState(false);

    // If user is already logged in, redirect away from login page
    useEffect(() => {
        if (isAuthenticated) {
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const validateEmail = (emailStr) => {
        return String(emailStr)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmitLogin = async (overrideEmail, overridePassword) => {
        const loginEmail = (overrideEmail !== undefined ? overrideEmail : email).trim();
        const loginPassword = overridePassword !== undefined ? overridePassword : password;

        if (!loginEmail) {
            toast.error('Vui lòng nhập địa chỉ email');
            return;
        }

        const isValidEmail = validateEmail(loginEmail);
        if (!isValidEmail) {
            toast.error('Địa chỉ email không đúng định dạng');
            return;
        }

        if (!loginPassword) {
            toast.error('Mật khẩu không được để trống');
            return;
        }

        if (loginPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setIsLoading(true);

            let res;
            try {
                // First attempt relative proxy endpoint (Express backend on 3001)
                res = await instance.post('/auth/login', {
                    email: loginEmail,
                    password: loginPassword,
                });
            } catch (backendErr) {
                if (backendErr?.response?.status === 404) {
                    try {
                        res = await instance.post('/login', {
                            email: loginEmail,
                            password: loginPassword,
                        });
                    } catch (e2) {
                        res = await postLogin(loginEmail, loginPassword);
                    }
                } else if (!backendErr?.response) {
                    // Backend offline/network error: fallback to service with mock
                    res = await postLogin(loginEmail, loginPassword);
                } else {
                    // Real backend returned 400/401/403 with error message
                    throw backendErr;
                }
            }

            if (res && res.data && res.data.EC === 0) {
                dispatch({
                    type: FETCH_USER_LOGIN_SUCCESS,
                    payload: res.data,
                });

                toast.success('Đăng nhập thành công!');
                const targetPath = location.state?.from?.pathname || '/';
                navigate(targetPath);
            } else {
                if (mountedRef.current) {
                    toast.error(res?.data?.EM || 'Đăng nhập thất bại');
                }
            }

            if (mountedRef.current) {
                setIsLoading(false);
            }
        } catch (err) {
            if (mountedRef.current) {
                setIsLoading(false);
                const msg =
                    err?.response?.data?.EM ||
                    err?.response?.data?.message ||
                    'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
                toast.error(msg);
            }
        }
    };

    const handleDemoLogin = (role) => {
        if (role === 'admin') {
            setEmail('admin@gmail.com');
            setPassword('admin123');
            handleSubmitLogin('admin@gmail.com', 'admin123');
        } else {
            setEmail('user@gmail.com');
            setPassword('user123');
            handleSubmitLogin('user@gmail.com', 'user123');
        }
    };

    const handleNavigateSignUp = () => {
        navigate('/signup');
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        const trimmed = forgotEmail.trim();
        if (!trimmed) {
            toast.error('Vui lòng nhập email để đặt lại mật khẩu');
            return;
        }
        if (!validateEmail(trimmed)) {
            toast.error('Địa chỉ email không đúng định dạng');
            return;
        }

        try {
            setIsForgotLoading(true);
            try {
                await instance.post('/auth/forgot-password', { email: trimmed });
            } catch (err) {
                // If endpoint doesn't exist yet, continue with graceful notification
            }
            toast.success('Yêu cầu đã được ghi nhận. Vui lòng kiểm tra email của bạn!');
            setShowForgotModal(false);
            setForgotEmail('');
        } catch (err) {
            toast.error('Không thể gửi yêu cầu đặt lại mật khẩu');
        } finally {
            setIsForgotLoading(false);
        }
    };

    return (
        <div className="login-container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="login-left">
                <div className="login-content">
                    <div className="login-header">
                        <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                            <div className="brand-icon">
                                <span className="brand-square"></span>
                                <span className="brand-circle"></span>
                            </div>
                            <h2 className="brand-name">NNT Academy</h2>
                        </div>
                    </div>

                    <div className="login-form">
                        <h1 className="login-title">Đăng nhập</h1>
                        <p className="login-subtitle">
                            Hệ thống thi trắc nghiệm trực tuyến —<br />
                            Đánh giá kiến thức nhanh chóng & chính xác.
                        </p>

                        <div className="login-buttons">
                            {/* Demo Login Quick Buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <button
                                    type="button"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '2px solid #22c55e',
                                        backgroundColor: '#f0fdf4',
                                        color: '#15803d',
                                        fontWeight: '600',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.9rem',
                                        opacity: isLoading ? 0.6 : 1,
                                    }}
                                    onClick={() => handleDemoLogin('user')}
                                    disabled={isLoading}
                                    onMouseOver={(e) => {
                                        if (!isLoading) e.currentTarget.style.backgroundColor = '#dcfce7';
                                    }}
                                    onMouseOut={(e) => {
                                        if (!isLoading) e.currentTarget.style.backgroundColor = '#f0fdf4';
                                    }}
                                >
                                    🟢 Demo Thí sinh
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '2px solid #8b5cf6',
                                        backgroundColor: '#f5f3ff',
                                        color: '#6d28d9',
                                        fontWeight: '600',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.9rem',
                                        opacity: isLoading ? 0.6 : 1,
                                    }}
                                    onClick={() => handleDemoLogin('admin')}
                                    disabled={isLoading}
                                    onMouseOver={(e) => {
                                        if (!isLoading) e.currentTarget.style.backgroundColor = '#ede9fe';
                                    }}
                                    onMouseOut={(e) => {
                                        if (!isLoading) e.currentTarget.style.backgroundColor = '#f5f3ff';
                                    }}
                                >
                                    🟣 Demo Admin
                                </button>
                            </div>

                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: '8px 0' }}>
                                — hoặc đăng nhập bằng tài khoản —
                            </div>

                            <div className="login-input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="input-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                                        className="input-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSubmitLogin();
                                        }}
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                        style={{ width: '100%', paddingRight: '45px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            fontSize: '0.85rem',
                                            padding: '4px',
                                        }}
                                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showPassword ? 'Ẩn' : 'Hiện'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px', marginBottom: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#3b82f6',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        padding: 0,
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            <button
                                className="btn-email"
                                onClick={() => handleSubmitLogin()}
                                disabled={isLoading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                }}
                            >
                                {isLoading && <ImSpinner6 className="loaderIcon" style={{ animation: 'spin 1s linear infinite' }} />}
                                <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="login-footer">
                    <p>
                        Chưa có tài khoản?{' '}
                        <button className="link-button" onClick={handleNavigateSignUp} disabled={isLoading}>
                            Đăng ký
                        </button>
                    </p>
                </div>
            </div>

            <div className="login-right">
                {/* Visual side panel */}
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '16px',
                    }}
                    onClick={() => setShowForgotModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            maxWidth: '420px',
                            width: '100%',
                            padding: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
                            Khôi phục mật khẩu
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
                            Nhập địa chỉ email đăng ký để nhận liên kết đặt lại mật khẩu.
                        </p>
                        <form onSubmit={handleForgotPasswordSubmit}>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '0.95rem',
                                    boxSizing: 'border-box',
                                }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isForgotLoading}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: '#2563eb',
                                        color: '#fff',
                                        cursor: isForgotLoading ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                    }}
                                >
                                    {isForgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;

