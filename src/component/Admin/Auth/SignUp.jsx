
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SignUp.scss';
import SignUpImg from '../../../accets/pexels-tuan-phan-2156993475-34600814.jpg';
import { TbBrandGoogle, TbBrandWindows } from 'react-icons/tb';
import { ImSpinner6 } from 'react-icons/im';
import { postCreateSignUp } from '../../sevices/apiService';
import instance from '../../util/axiosCutomes';

function SignUp() {
    const navigate = useNavigate();

    const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);


    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // If user is already logged in, redirect to home
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const validateEmail = (emailStr) => {
        return String(emailStr)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmitSignUp = async () => {
        const trimmedUsername = userName.trim();
        const trimmedEmail = email.trim();

        if (!trimmedUsername) {
            toast.error('Vui lòng nhập tên người dùng');
            return;
        }

        if (!trimmedEmail) {
            toast.error('Vui lòng nhập địa chỉ email');
            return;
        }

        const isValidEmail = validateEmail(trimmedEmail);
        if (!isValidEmail) {
            toast.error('Địa chỉ email không đúng định dạng');
            return;
        }

        if (!password) {
            toast.error('Mật khẩu không được để trống');
            return;
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (!confirmPassword) {
            toast.error('Vui lòng xác nhận mật khẩu');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setIsLoading(true);

            let res;
            try {
                // First attempt proxy call to Express backend on 3001
                res = await instance.post('/auth/register', {
                    username: trimmedUsername,
                    email: trimmedEmail,
                    password: password,
                });
            } catch (backendErr) {
                if (backendErr?.response?.status === 404) {
                    try {
                        res = await instance.post('/register', {
                            username: trimmedUsername,
                            email: trimmedEmail,
                            password: password,
                        });
                    } catch (e2) {
                        res = await postCreateSignUp(trimmedUsername, trimmedEmail, password);
                    }
                } else if (!backendErr?.response) {
                    // Backend offline/network error: fallback to service with mock
                    res = await postCreateSignUp(trimmedUsername, trimmedEmail, password);
                } else {
                    // Real backend returned 400/409 with error
                    throw backendErr;
                }
            }

            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Đăng ký tài khoản thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                toast.error(res?.data?.EM || 'Đăng ký thất bại');
            }
        } catch (error) {
            const errorMsg =
                error?.response?.data?.EM ||
                error?.response?.data?.message ||
                'Có lỗi xảy ra khi đăng ký tài khoản. Vui lòng thử lại.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmitSignUp();
        }
    };

    const handleGoogleSignup = () => {
        toast.info('Đăng nhập với Google đang được phát triển!');
    };

    const handleMicrosoftSignup = () => {
        toast.info('Đăng nhập với Microsoft đang được phát triển!');
    };

    const handleClickLogin = () => {
        navigate('/login');
    };

    return (
        <div className="SignUp-container">
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
            {/* Left Panel */}
            <div className="SignUp-left">
                <div className="SignUp-left-content">
                    <h1 className="SignUp-title">
                        Đăng ký
                        <br />
                        NNT Academy
                    </h1>
                    <div className="SignUp-illustration">
                        <img src={SignUpImg} alt="SignUp illustration" className="illustration-img" />
                    </div>
                </div>
                <div className="SignUp-footer">
                    <p>© NNT Academy — Nền tảng thi trắc nghiệm trực tuyến</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="SignUp-right">
                <div className="SignUp-right-header">
                    <div className="language-selector">
                        <span className="language-icon">🌐</span>
                        <span className="language-text">Tiếng Việt</span>
                    </div>
                    <div className="SignUp-link">
                        <span>Đã có tài khoản?</span>
                        <button className="link-button" onClick={handleClickLogin} disabled={isLoading}>
                            Đăng nhập
                        </button>
                    </div>
                </div>

                <div className="SignUp-right-content">
                    <div className="SignUp-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <div className="brand-icon">
                            <span className="brand-square"></span>
                            <span className="brand-circle"></span>
                        </div>
                        <h2 className="brand-name">NNT Academy</h2>
                    </div>

                    <div className="SignUp-right-inputs">
                        <input
                            type="text"
                            placeholder="Tên người dùng"
                            className="input-userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={isLoading}
                            autoComplete="name"
                        />
                        <input
                            type="email"
                            placeholder="Địa chỉ Email"
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
                                disabled={isLoading}
                                autoComplete="new-password"
                                style={{ width: '100%', paddingRight: '45px', marginBottom: 0 }}
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
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Xác nhận lại mật khẩu"
                            className="input-password"
                            value={confirmPassword}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            autoComplete="new-password"
                            style={{ marginBottom: '16px' }}
                        />
                    </div>

                    <div className="SignUp-buttons">
                        <button
                            className="btn-email"
                            onClick={handleSubmitSignUp}
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
                            <span>{isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký với Email'}</span>
                        </button>

                        <div className="divider">
                            <span>HOẶC</span>
                        </div>

                        <button className="btn-social btn-google" onClick={handleGoogleSignup} disabled={isLoading}>
                            <TbBrandGoogle size={20} />
                            <span>Đăng ký với Google</span>
                        </button>

                        <button className="btn-social btn-microsoft" onClick={handleMicrosoftSignup} disabled={isLoading}>
                            <TbBrandWindows size={20} />
                            <span>Đăng ký với Microsoft</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;