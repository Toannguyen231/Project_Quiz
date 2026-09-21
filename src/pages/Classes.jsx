import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUsers, FaChalkboardTeacher, FaUserPlus, FaArrowLeft, FaCheckCircle, FaClock, FaBookOpen } from 'react-icons/fa';
import './Pages.scss';

// ── Dữ liệu mẫu lớp học (sẽ thay bằng API backend ở Phase sau) ──
const SAMPLE_CLASSES = [
    {
        id: 1,
        name: 'Lớp Luyện Thi TOEIC 2026 — Ca Tối',
        code: 'TOEIC-26-T6',
        teacher: 'Thầy Nguyễn Ngọc Toàn',
        students: 42,
        schedule: 'T2 · T4 · T6 — 19:00',
        status: 'active',
        description: 'Luyện thi TOEIC 4 kỹ năng, cam kết đầu ra 700+.',
    },
    {
        id: 2,
        name: 'Lớp React & Frontend Master',
        code: 'REACT-26-M',
        teacher: 'Thầy Nguyễn Ngọc Toàn',
        students: 28,
        schedule: 'T3 · T5 — 20:00',
        status: 'active',
        description: 'Từ JS core đến React 18, Redux Toolkit, tối ưu hiệu năng.',
    },
    {
        id: 3,
        name: 'Lớp VSTEP B1/B2 Cấp Tốc',
        code: 'VSTEP-26-S',
        teacher: 'Cô Mai Anh',
        students: 35,
        schedule: 'T2 · T4 — 18:00',
        status: 'active',
        description: 'Luyện cấu trúc đề thi, mẹo làm bài đọc — nghe tốc độ cao.',
    },
];

const Classes = () => {
    const navigate = useNavigate();
    const account = useSelector(state => state.user?.account);
    const isAuthenticated = useSelector(state => state.user?.isAuthenticated);

    const [joinedClasses, setJoinedClasses] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('nnt_joined_classes') || '[]');
        } catch {
            return [];
        }
    });

    const handleJoin = (cls) => {
        if (joinedClasses.includes(cls.id)) return;
        const next = [...joinedClasses, cls.id];
        setJoinedClasses(next);
        try {
            localStorage.setItem('nnt_joined_classes', JSON.stringify(next));
        } catch (e) {
            /* ignore */
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-hero">
                <div className="page-hero-inner">
                    <span className="page-eyebrow">NNT ACADEMY</span>
                    <h1>Lớp Học Trực Tuyến</h1>
                    <p>Học theo lớp, theo lộ trình — giáo viên hướng dẫn, bài thi thực chiến mỗi tuần.</p>
                </div>
            </div>

            <div className="page-container">
                {!isAuthenticated && (
                    <div className="page-notice">
                        <FaUsers className="page-notice-icon" />
                        <span>Bạn chưa đăng nhập. </span>
                        <button className="page-link-btn" onClick={() => navigate('/login')}>Đăng nhập</button>
                        <span> để xem lịch học cá nhân &amp; kết quả của lớp.</span>
                    </div>
                )}

                <div className="classes-grid">
                    {SAMPLE_CLASSES.map(cls => {
                        const joined = joinedClasses.includes(cls.id);
                        return (
                            <div key={cls.id} className={`class-card ${joined ? 'joined' : ''}`}>
                                <div className="class-card-head">
                                    <div className="class-card-icon">
                                        {joined ? <FaCheckCircle /> : <FaChalkboardTeacher />}
                                    </div>
                                    <span className="class-badge">{joined ? 'Đã tham gia' : 'Đang mở'}</span>
                                </div>
                                <h3>{cls.name}</h3>
                                <p className="class-code">Mã lớp: <strong>{cls.code}</strong></p>
                                <p className="class-desc">{cls.description}</p>
                                <ul className="class-meta">
                                    <li><FaChalkboardTeacher /> {cls.teacher}</li>
                                    <li><FaUsers /> {cls.students} học viên</li>
                                    <li><FaClock /> {cls.schedule}</li>
                                    <li><FaBookOpen /> Giáo trình độc quyền NNT</li>
                                </ul>
                                <button
                                    type="button"
                                    className="page-btn page-btn-primary"
                                    disabled={joined}
                                    onClick={() => handleJoin(cls)}
                                >
                                    {joined ? '✓ Đã tham gia' : 'Tham gia lớp'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="page-empty-state">
                    <FaUserPlus className="page-empty-icon" />
                    <h3>Muốn mở lớp học riêng?</h3>
                    <p>Tính năng tạo lớp cho giáo viên sẽ ra mắt ở phiên bản kế tiếp. Hiện tại bạn có thể tham gia các lớp đang mở bên trên.</p>
                    <button className="page-btn page-btn-ghost" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Classes;