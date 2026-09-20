import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSun, FiMoon } from 'react-icons/fi';
import nntLogo from '../../accets/nnt-logo.jpg';
import './Nav.scss';

const Header = () => {
    const dispatch = useDispatch();
    const account = useSelector(state => state.user.account);
    const isAuthenticated = useSelector(state => state.user.isAuthenticated);
    const navigate = useNavigate();
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleClickSignUp = () => {
        navigate('/signup');
    };
    const handleClickLogin = () => {
        navigate('/login');
    };

    const handleClickLogOut = () => {
        dispatch({
            type: 'FETCH_USER_LOGOUT_FAIL',
            payload: {}
        });
        navigate('/');
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const isAdmin = account?.roles === 'ADMIN';

    return (
        <Navbar expand="lg" className="navbar-tpp">
            <Container>
                {/* NNT Academy Logo */}
                <NavLink to="/" className="navbar-brand-tpp">
                    <img src={nntLogo} alt="NNT Academy Logo" className="brand-logo-img" />
                    <div className="brand-text-wrap">
                        <span className="brand-title">NNT ACADEMY</span>
                        <span className="brand-slogan">Học Khôn Ngoan – Không Gian Nan</span>
                    </div>
                </NavLink>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto my-2 my-lg-0">
                        <NavLink 
                            to="/" 
                            end 
                            className={({ isActive }) => `nav-link-tpp ${isActive ? 'active' : ''}`}
                        >
                            Trang chủ
                        </NavLink>
                        <NavLink 
                            to="/user" 
                            end 
                            className={({ isActive }) => `nav-link-tpp ${isActive ? 'active' : ''}`}
                        >
                            NNT Learn
                        </NavLink>
                        <NavDropdown 
                            title="Test Online" 
                            id="test-online-dropdown" 
                            className={`nav-link-tpp-dropdown ${location.pathname.startsWith('/quiz') ? 'active' : ''}`}
                        >
                            <NavDropdown.Item onClick={() => navigate('/user')}>
                                📝 Thi thử TOEIC (LC & RC)
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate('/user')}>
                                💻 Kiểm tra Lập Trình & IT
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate('/user')}>
                                🎓 Đánh giá năng lực VSTEP
                            </NavDropdown.Item>
                        </NavDropdown>
                        <a 
                            href="#courses" 
                            className={`nav-link-tpp ${location.hash === '#courses' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                if (location.pathname !== '/') {
                                    navigate('/#courses');
                                } else {
                                    const el = document.getElementById('courses');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            Khoá Học
                        </a>
                        <button 
                            type="button" 
                            className="nav-link-tpp btn-nav-plain"
                            onClick={() => alert("Tính năng Lớp Học Trực Tuyến đang được hoàn thiện và sẽ sớm ra mắt trong phiên bản tới!")}
                        >
                            Lớp học
                        </button>
                        <button 
                            type="button" 
                            className="nav-link-tpp btn-nav-plain"
                            onClick={() => alert("Tính năng Reels — Video Bài Giảng Ngắn NNT đang được phát triển!")}
                        >
                            Reels
                        </button>
                        <button 
                            type="button" 
                            className="nav-link-tpp btn-nav-plain"
                            onClick={() => alert("Chuyên mục Blog Tin Tức & Kinh Nghiệm Thi đang được cập nhật bài viết mới!")}
                        >
                            Blog
                        </button>
                        {isAuthenticated && isAdmin && (
                            <NavLink 
                                to="/admin" 
                                className={({ isActive }) => `nav-link-tpp ${isActive ? 'active' : ''}`}
                            >
                                Quản trị NNT
                            </NavLink>
                        )}
                    </Nav>

                    <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            title="Chuyển đổi giao diện Sáng / Tối"
                        >
                            {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>

                        {isAuthenticated === false ? (
                            <>
                                <button
                                    type="button"
                                    className="btn-tpp-login"
                                    onClick={handleClickLogin}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    type="button"
                                    className="btn-tpp-register"
                                    onClick={handleClickSignUp}
                                >
                                    Đăng ký
                                </button>
                            </>
                        ) : (
                            <NavDropdown
                                title={
                                    <span className="user-badge-trigger">
                                        <span>👤</span>
                                        <span>{account?.username || 'User'}</span>
                                        <span className={`role-pill ${isAdmin ? 'admin' : 'user'}`}>
                                            {isAdmin ? 'ADMIN' : 'HỌC VIÊN'}
                                        </span>
                                        <span className="dropdown-caret-arrow">▼</span>
                                    </span>
                                }
                                id="basic-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item onClick={() => navigate('/user')}>
                                    📝 Bài thi của tôi
                                </NavDropdown.Item>
                                {isAdmin && (
                                    <NavDropdown.Item onClick={() => navigate('/admin')}>
                                        ⚙️ Quản trị hệ thống
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleClickLogOut} style={{ color: '#dc2626' }}>
                                    🚪 Đăng xuất
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;