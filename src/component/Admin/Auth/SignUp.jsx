
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./SignUp.scss"
import SignUpImg from '../../../accets/pexels-tuan-phan-2156993475-34600814.jpg';
import { TbBrandGoogle, TbBrandWindows } from "react-icons/tb";
import { postCreateSignUp } from '../../sevices/apiService';
function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmitSignUp = async () => {
        //validate 
        const isValidEmail = validateEmail(email);
        if (!isValidEmail) {
            toast.error('Email không hợp lệ');
            return;
        }

        if (!userName.trim()) {
            toast.error('Vui lòng nhập tên người dùng');
            return;
        }

        if (!password) {
            toast.error('Mật khẩu không được để trống');
            return;
        }

        try {
            let res = await postCreateSignUp(userName, email, password);

            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Đăng ký tài khoản thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                toast.error(res?.data?.EM || 'Đăng ký thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi đăng ký');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmitSignUp();
        }
    };

    const handleGoogleSignup = () => {
        toast.info('Đăng nhập với Google sắp ra mắt!');
    };

    const handleMicrosoftSignup = () => {
        toast.info('Đăng nhập với Microsoft sắp ra mắt!');
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
                    <h1 className="SignUp-title">Đăng ký<br />NNT Academy</h1>
                    <div className="SignUp-illustration">
                        <img src={SignUpImg} alt="SignUp illustration" className="illustration-img" />
                    </div>
                </div>
                <div className="SignUp-footer">
                    <p>© NNT Academy</p>
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
                        <button className="link-button" onClick={handleClickLogin}>Đăng nhập</button>
                    </div>
                </div>

                <div className="SignUp-right-content">
                    <div className="SignUp-brand">
                        <div className="brand-icon">
                            <span className="brand-square"></span>
                            <span className="brand-circle"></span>
                        </div>
                        <h2 className="brand-name">NNT Academy</h2>
                    </div>

                    <div className='SignUp-right-inputs'>
                        <input
                            type="text"
                            placeholder='Tên người dùng'
                            className='input-userName'
                            size="30"
                            value={userName} onChange={(e) => setUserName(e.target.value)} />
                        <input
                            type="text"
                            placeholder="Địa chỉ Email"
                            className='input-email'
                            size="30" value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className='input-password'
                            value={password}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div className="SignUp-buttons">
                        <button className="btn-social btn-google" onClick={handleGoogleSignup}>
                            <TbBrandGoogle size={20} />
                            <span>Đăng ký với Google</span>
                        </button>

                        <button className="btn-social btn-microsoft" onClick={handleMicrosoftSignup}>
                            <TbBrandWindows size={20} />
                            <span>Đăng ký với Microsoft</span>
                        </button>

                        <div className="divider">
                            <span>HOẶC</span>
                        </div>

                        <button className="btn-email" onClick={handleSubmitSignUp}>
                            Đăng ký với Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;