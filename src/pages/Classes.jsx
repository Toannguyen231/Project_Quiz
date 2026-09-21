import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    FaUsers,
    FaChalkboardTeacher,
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaBookOpen,
    FaGraduationCap,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getClasses, joinClass, getMyClasses } from '../component/sevices/apiService';
import Skeleton from '../component/Common/Skeleton';
import mascotImg from '../accets/quizzy-mascot.jpg';
import './Pages.scss';

const Classes = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.user?.isAuthenticated);

    const [classes, setClasses] = useState([]);
    const [myClasses, setMyClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [joiningId, setJoiningId] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const res = await getClasses();
            if (res && res.data && res.data.EC === 0 && Array.isArray(res.data.DT)) {
                setClasses(res.data.DT);
            } else {
                setClasses([]);
            }

            if (isAuthenticated) {
                try {
                    const mineRes = await getMyClasses();
                    if (mineRes && mineRes.data && mineRes.data.EC === 0 && Array.isArray(mineRes.data.DT)) {
                        setMyClasses(mineRes.data.DT);
                    }
                } catch (e) {
                    // Ignore error on myClasses fetch
                }
            } else {
                setMyClasses([]);
            }
        } catch (error) {
            console.error('Lỗi tải danh sách lớp học:', error);
            setHasError(true);
            toast.error('Không thể tải danh sách lớp học. Vui lòng kiểm tra kết nối!');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const joinedClassIds = new Set(myClasses.map(c => c.id));

    const handleJoin = async (cls) => {
        if (!isAuthenticated) {
            toast.info('Vui lòng đăng nhập để tham gia lớp học!');
            navigate('/login');
            return;
        }

        if (joinedClassIds.has(cls.id)) {
            toast.info('Bạn đã tham gia lớp học này rồi!');
            return;
        }

        setJoiningId(cls.id);
        try {
            const res = await joinClass(cls.id);
            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Tham gia lớp học thành công!');
                // Cập nhật lại danh sách lớp của tôi
                setMyClasses(prev => [...prev, { ...cls, joined_at: new Date().toISOString(), isJoined: true }]);
                setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, students: (c.students || 0) + 1, isJoined: true } : c));
            } else {
                toast.error(res?.data?.EM || 'Không thể tham gia lớp học. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi khi tham gia lớp học:', error);
            toast.error('Lỗi kết nối khi tham gia lớp học.');
        } finally {
            setJoiningId(null);
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
                        <span> để xem lịch học cá nhân &amp; tham gia lớp học.</span>
                    </div>
                )}

                {/* Section: Lớp của tôi (hiển thị khi học viên đã đăng nhập và có lớp) */}
                {isAuthenticated && myClasses.length > 0 && (
                    <div className="my-classes-section mb-5">
                        <div className="section-header d-flex align-items-center gap-2 mb-3">
                            <FaGraduationCap className="text-primary fs-4" />
                            <h2 className="fs-4 fw-bold mb-0">Lớp Học Của Tôi ({myClasses.length})</h2>
                        </div>
                        <div className="classes-grid">
                            {myClasses.map(cls => (
                                <div key={`mine-${cls.id}`} className="class-card joined">
                                    <div className="class-card-head">
                                        <div className="class-card-icon">
                                            <FaCheckCircle />
                                        </div>
                                        <span className="class-badge joined-badge">Đã tham gia</span>
                                    </div>
                                    <h3>{cls.name}</h3>
                                    <p className="class-code">Mã lớp: <strong>{cls.code}</strong></p>
                                    <p className="class-desc">{cls.description}</p>
                                    <ul className="class-meta">
                                        <li><FaChalkboardTeacher /> {cls.teacher}</li>
                                        <li><FaClock /> {cls.schedule}</li>
                                        <li><FaBookOpen /> Giáo trình độc quyền NNT</li>
                                    </ul>
                                    <button
                                        type="button"
                                        className="page-btn page-btn-primary"
                                        disabled
                                    >
                                        ✓ Đang học lớp này
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="section-header mb-3">
                    <h2 className="fs-4 fw-bold mb-0">Tất Cả Lớp Học Đang Mở</h2>
                </div>

                {isLoading ? (
                    <div className="classes-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="class-card">
                                <Skeleton width="46px" height="46px" borderRadius="14px" className="mb-3" />
                                <Skeleton width="75%" height="24px" className="mb-2" />
                                <Skeleton width="40%" height="16px" className="mb-3" />
                                <Skeleton width="90%" height="16px" className="mb-4" />
                                <Skeleton width="100%" height="40px" borderRadius="999px" />
                            </div>
                        ))}
                    </div>
                ) : hasError ? (
                    <div className="page-empty-state">
                        <img src={mascotImg} alt="Quizzy Mascot" className="page-empty-mascot" />
                        <h3>Lỗi tải dữ liệu lớp học</h3>
                        <p>Không thể kết nối đến máy chủ. Đừng lo lắng, Quizzy đang hỗ trợ thử lại!</p>
                        <button className="page-btn page-btn-primary" onClick={fetchData}>
                            Thử lại ngay
                        </button>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="page-empty-state">
                        <img src={mascotImg} alt="Quizzy Mascot" className="page-empty-mascot" />
                        <h3>Chưa có lớp học nào mở</h3>
                        <p>Hiện tại chưa có lớp học nào được mở. Quizzy đang chuẩn bị thêm nhiều lớp mới, quay lại sau nhé!</p>
                    </div>
                ) : (
                    <div className="classes-grid">
                        {classes.map(cls => {
                            const joined = joinedClassIds.has(cls.id) || cls.isJoined;
                            const isJoining = joiningId === cls.id;
                            return (
                                <div key={cls.id} className={`class-card ${joined ? 'joined' : ''}`}>
                                    <div className="class-card-head">
                                        <div className="class-card-icon">
                                            {joined ? <FaCheckCircle /> : <FaChalkboardTeacher />}
                                        </div>
                                        <span className={`class-badge ${joined ? 'joined-badge' : ''}`}>
                                            {joined ? 'Đã tham gia' : 'Đang mở'}
                                        </span>
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
                                        disabled={joined || isJoining}
                                        onClick={() => handleJoin(cls)}
                                    >
                                        {isJoining ? 'Đang xử lý...' : joined ? '✓ Đã tham gia' : 'Tham gia lớp'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="page-empty-state">
                    <img src={mascotImg} alt="Quizzy Mascot" className="page-empty-mascot" />
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