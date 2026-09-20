import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Login.scss";
import { FcGoogle } from "react-icons/fc";
import { postLogin } from '../../sevices/apiService';
import { TbBrandWindows } from "react-icons/tb";
import { useDispatch, useSelector } from 'react-redux';
import { ImSpinner6 } from "react-icons/im";
import { FETCH_USER_LOGIN_SUCCESS } from '../../actions/Actions';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const mountedRef = useRef(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmitLogin = async (overrideEmail, overridePassword) => {
        const loginEmail = overrideEmail || email;
        const loginPassword = overridePassword || password;

        const isValidEmail = validateEmail(loginEmail);
        if (!isValidEmail) {
            toast.error('Email không hợp lệ');
            return;
        }

        if (!loginPassword) {
            toast.error('Mật khẩu không được để trống');
            return;
        }

        try {
            setIsLoading(true);

            let res = await postLogin(loginEmail, loginPassword);

            if (res && res.data && res.data.EC === 0) {
                dispatch({
                    type: FETCH_USER_LOGIN_SUCCESS,
                    payload: res.data
                });

                toast.success("Đăng nhập thành công!");
                navigate('/');
            } else {
                if (mountedRef.current) {
                    toast.error(res?.data?.EM || "Đăng nhập thất bại");
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
                    "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
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
                        <div className="brand-logo">
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
                            {/* Demo Login Buttons */}
                            <div style={{
                                display: 'flex', gap: '10px', marginBottom: '16px'
                            }}>
                                <button
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #22c55e',
                                        backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: '600', cursor: 'pointer',
                                        transition: 'all 0.2s', fontSize: '0.9rem'
                                    }}
                                    onClick={() => handleDemoLogin('user')}
                                    disabled={isLoading}
                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                >
                                    🟢 Demo Thí sinh
                                </button>
                                <button
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #8b5cf6',
                                        backgroundColor: '#f5f3ff', color: '#6d28d9', fontWeight: '600', cursor: 'pointer',
                                        transition: 'all 0.2s', fontSize: '0.9rem'
                                    }}
                                    onClick={() => handleDemoLogin('admin')}
                                    disabled={isLoading}
                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ede9fe'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f5f3ff'; }}
                                >
                                    🟣 Demo Admin
                                </button>
                            </div>

                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: '8px 0' }}>
                                — hoặc đăng nhập bằng email —
                            </div>

                            <div className="login-input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="input-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    className="input-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitLogin(); }}
                                />
                            </div>

                            <button className="btn-email" onClick={() => handleSubmitLogin()} disabled={isLoading}>
                                {isLoading ? <ImSpinner6 className="loaderIcon" /> : null}
                                <span>Đăng nhập</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="login-footer">
                    <p>Chưa có tài khoản? <button className="link-button" onClick={handleNavigateSignUp}>Đăng ký</button></p>
                </div>
            </div>

            <div className="login-right">
                {/* phần trang trí giữ nguyên */}
            </div>
        </div>
    );
}

export default Login;
