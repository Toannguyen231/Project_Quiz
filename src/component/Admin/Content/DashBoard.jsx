import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOverview, resetDemoData } from '../../sevices/apiService';
import { toast } from 'react-toastify';

const DashBoard = (props) => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState({
        totalUsers: 0,
        totalQuizzes: 0,
        totalQuestions: 0,
        totalSubmissions: 0,
        recentSubmissions: [],
    });

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            let res = await getOverview();
            if (res && res.data && res.data.EC === 0) {
                setOverview(res.data.DT);
            }
        } catch (error) {
            console.warn("Lỗi tải thống kê:", error);
        }
    };

    const handleResetDemo = async () => {
        if (window.confirm("Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu không? Toàn bộ thay đổi thêm/sửa/xóa sẽ được làm mới.")) {
            try {
                let res = await resetDemoData();
                if (res && res.data && res.data.EC === 0) {
                    toast.success(res.data.EM || 'Khôi phục dữ liệu mẫu thành công!');
                    await fetchOverview();
                }
            } catch (err) {
                toast.error('Lỗi khi khôi phục dữ liệu');
            }
        }
    };

    const stats = [
        { label: 'Tổng số bài Quiz', count: overview.totalQuizzes, icon: '📝', color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Tổng số câu hỏi', count: overview.totalQuestions, icon: '❓', color: '#10b981', bg: '#ecfdf5' },
        { label: 'Thí sinh đăng ký', count: overview.totalUsers, icon: '👥', color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Lượt nộp bài thi', count: overview.totalSubmissions, icon: '🏆', color: '#f59e0b', bg: '#fffbeb' },
    ];

    const formatDate = (isoStr) => {
        if (!isoStr) return '--';
        const d = new Date(isoStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '700', color: '#1e293b' }}>📊 Bảng Điều Khiển Quản Trị</h3>
                <p style={{ color: '#64748b' }}>Thống kê tổng quan hệ thống giáo dục &amp; khảo thí NNT Academy.</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'default'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                    >
                        <div
                            style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                backgroundColor: item.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}
                        >
                            {item.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>{item.count}</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Submissions */}
            {overview.recentSubmissions && overview.recentSubmissions.length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>📋 Bài thi gần đây</h5>
                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                        <thead>
                            <tr style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <th>#</th>
                                <th>Quiz ID</th>
                                <th>Kết quả</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.recentSubmissions.map((sub, idx) => {
                                const pct = sub.countTotal > 0 ? Math.round((sub.countCorrect / sub.countTotal) * 100) : 0;
                                return (
                                    <tr key={sub.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>Quiz #{sub.quizId}</td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                backgroundColor: pct >= 50 ? '#dcfce7' : '#fee2e2',
                                                color: pct >= 50 ? '#15803d' : '#b91c1c'
                                            }}>
                                                {sub.countCorrect}/{sub.countTotal} ({pct}%)
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{formatDate(sub.timestamp)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>⚡ Thao tác nhanh</h5>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline-primary" style={{ borderRadius: '8px', fontWeight: '500' }} onClick={() => navigate('/admin/manageQuiz')}>
                        📝 Quản lý Đề thi
                    </button>
                    <button className="btn btn-outline-success" style={{ borderRadius: '8px', fontWeight: '500' }} onClick={() => navigate('/admin/manageQuestions')}>
                        ❓ Quản lý Câu hỏi
                    </button>
                    <button className="btn btn-outline-secondary" style={{ borderRadius: '8px', fontWeight: '500' }} onClick={() => navigate('/admin/manageruser')}>
                        👥 Quản lý Thí sinh
                    </button>
                    <button className="btn btn-outline-dark" style={{ borderRadius: '8px', fontWeight: '500' }} onClick={() => navigate('/user')}>
                        👁 Xem giao diện Thí sinh
                    </button>
                    <button className="btn btn-outline-danger" style={{ borderRadius: '8px', fontWeight: '500' }} onClick={handleResetDemo}>
                        🔄 Khôi phục dữ liệu mẫu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashBoard;