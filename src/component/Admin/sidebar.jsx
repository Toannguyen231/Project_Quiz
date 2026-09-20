import React from 'react';
import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import {
    FaTachometerAlt,
    FaRegLaughWink,
    FaGithub,
    FaBookOpen,
    FaQuestionCircle,
    FaUsers,
    FaGraduationCap
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const SideBar = ({ collapsed, toggled, handleToggleSidebar }) => {
    const navigate = useNavigate();

    return (
        <ProSidebar
            image={false}
            collapsed={collapsed}
            toggled={toggled}
            breakPoint="md"
            onToggle={handleToggleSidebar}
            style={{
                backgroundColor: '#0f172a',
                color: '#cbd5e1'
            }}
        >
            <SidebarHeader>
                <div
                    style={{
                        padding: '24px 20px',
                        fontWeight: 'bold',
                        fontSize: 18,
                        letterSpacing: '0.5px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid #1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
                    <FaGraduationCap size="1.8rem" color="#6C63FF" />
                    <span style={{ color: '#ffffff', fontFamily: 'var(--qm-font-heading)', fontWeight: '700' }}>
                        NNT Academy
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <Menu iconShape="circle">
                    <MenuItem
                        icon={<FaTachometerAlt color="#3b82f6" />}
                    >
                        Tổng quan
                        <Link to="/admin" />
                    </MenuItem>
                </Menu>

                <Menu iconShape="circle">
                    <SubMenu
                        icon={<FaRegLaughWink color="#8b5cf6" />}
                        title="Quản trị nội dung"
                        defaultOpen={true}
                    >
                        <MenuItem icon={<FaBookOpen color="#38bdf8" />}>
                            Quản lý đề thi
                            <Link to="/admin/manageQuiz" />
                        </MenuItem>
                        <MenuItem icon={<FaQuestionCircle color="#34d399" />}>
                            Ngân hàng câu hỏi
                            <Link to="/admin/manageQuestions" />
                        </MenuItem>
                        <MenuItem icon={<FaUsers color="#fbbf24" />}>
                            Quản lý thí sinh
                            <Link to="/admin/manageruser" />
                        </MenuItem>
                    </SubMenu>
                </Menu>
            </SidebarContent>

            <SidebarFooter style={{ textAlign: 'center', borderTop: '1px solid #1e293b' }}>
                <div
                    className="sidebar-btn-wrapper"
                    style={{
                        padding: '16px 20px',
                    }}
                >
                    <a
                        href="https://github.com/Toannguyen231"
                        target="_blank"
                        className="sidebar-btn"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#94a3b8',
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                            fontWeight: '600'
                        }}
                    >
                        <FaGithub size={18} />
                        <span>ToanNguyen231</span>
                    </a>
                </div>
            </SidebarFooter>
        </ProSidebar>
    );
};

export default SideBar;