import React from 'react';
import SideBar from "./sidebar";
import './Admin.scss';
import { FaBars } from 'react-icons/fa';
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = (props) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const navigate = useNavigate();

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <SideBar collapsed={collapsed} />
            </div>
            <div className="admin-content">
                <div className="admin-header">
                    <div className="header-left">
                        <button
                            type="button"
                            className="admin-toggle-btn"
                            onClick={() => setCollapsed(!collapsed)}
                            title="Đóng / Mở menu"
                        >
                            <FaBars />
                        </button>
                        <h4 className="header-title-text">
                            Hệ Thống Quản Trị NNT Academy
                        </h4>
                    </div>

                    <div className="header-right">
                        <span className="admin-badge">
                            🛡 Quản Trị Viên
                        </span>
                        <button
                            type="button"
                            className="btn-view-site"
                            onClick={() => navigate('/')}
                        >
                            🌐 Xem Trang Chủ
                        </button>
                    </div>
                </div>

                <div className="admin-main">
                    <Outlet />
                </div>
            </div>

            <ToastContainer
                position="bottom-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </div>
    );
};

export default Admin;