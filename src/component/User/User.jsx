import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ListQuiz from './ListQuiz';
import './ListQuiz.scss';

const User = () => {
    const authUser = useSelector((state) => state.user?.account || state.user?.user || {});
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('quizzes');
    const [submissionHistory, setSubmissionHistory] = useState([]);

    // Load past submissions from localStorage for candidate review
    useEffect(() => {
        try {
            const raw = localStorage.getItem('qm_submissions');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setSubmissionHistory(parsed.reverse());
                }
            }
        } catch (e) {
            console.warn("Could not read submissions history:", e);
        }
    }, []);

    const totalSubmissions = submissionHistory.length;
    const avgScore = totalSubmissions > 0
        ? (submissionHistory.reduce((acc, curr) => acc + (curr.countCorrect / (curr.countTotal || 1) * 10), 0) / totalSubmissions).toFixed(1)
        : 0;

    return (
        <div className="container py-4">
            {/* Candidate Profile Welcome Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff'
            }}>
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                color: '#ffffff',
                                border: '3px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                {authUser.username ? authUser.username.charAt(0).toUpperCase() : '👨‍🎓'}
                            </div>
                            <div>
                                <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill mb-1">
                                    Cổng Thông Tin Thí Sinh
                                </span>
                                <h2 className="fw-bold mb-0 text-white">
                                    Xin chào, {authUser.username || 'Thí Sinh'}!
                                </h2>
                                <p className="text-secondary mb-0" style={{ color: '#94a3b8' }}>
                                    {authUser.email || 'Học viên trực tuyến'}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="d-flex gap-4">
                            <div className="text-center">
                                <div className="fw-bold fs-3 text-info">{totalSubmissions}</div>
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Bài đã nộp</div>
                            </div>
                            <div className="text-center">
                                <div className="fw-bold fs-3 text-warning">{avgScore}/10</div>
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Điểm TB</div>
                            </div>
                            <div className="text-center">
                                <div className="fw-bold fs-3 text-success">🔥 3</div>
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Streak ngày</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="d-flex gap-2 border-bottom mb-4">
                <button
                    type="button"
                    className={`btn px-4 py-2 fw-bold border-bottom rounded-0 ${activeTab === 'quizzes' ? 'border-primary text-primary border-3' : 'text-muted border-0'}`}
                    onClick={() => setActiveTab('quizzes')}
                >
                    📚 Đề Thi Khảo Thí
                </button>
                <button
                    type="button"
                    className={`btn px-4 py-2 fw-bold border-bottom rounded-0 ${activeTab === 'history' ? 'border-primary text-primary border-3' : 'text-muted border-0'}`}
                    onClick={() => setActiveTab('history')}
                >
                    📜 Lịch Sử Làm Bài ({submissionHistory.length})
                </button>
            </div>

            {/* Tab 1: Quiz Library */}
            {activeTab === 'quizzes' && (
                <ListQuiz />
            )}

            {/* Tab 2: Submission History */}
            {activeTab === 'history' && (
                <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h4 className="fw-bold mb-3 text-dark">Lịch Sử Khảo Thí Gần Đây</h4>
                    {submissionHistory.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Mã Đề</th>
                                        <th>Số Câu Đúng</th>
                                        <th>Điểm Quy Đổi</th>
                                        <th>Thời Điểm</th>
                                        <th>Kết Quả</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissionHistory.map((sub, sIdx) => {
                                        const percent = sub.countTotal > 0 ? Math.round((sub.countCorrect / sub.countTotal) * 100) : 0;
                                        const isPass = percent >= 50;
                                        const scoreVal = sub.countTotal > 0 ? (sub.countCorrect / sub.countTotal * 10).toFixed(1) : '0.0';
                                        return (
                                            <tr key={sub.id || sIdx}>
                                                <td className="fw-bold">{sIdx + 1}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        Đề #{sub.quizId}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>{sub.countCorrect}</strong> / {sub.countTotal} câu
                                                </td>
                                                <td className="fw-bold text-primary">
                                                    {scoreVal} / 10
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '0.88rem' }}>
                                                    {sub.timestamp ? new Date(sub.timestamp).toLocaleString('vi-VN') : 'Vừa xong'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${isPass ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-pill`}>
                                                        {isPass ? '✓ Đạt' : '✗ Chưa đạt'} ({percent}%)
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary fw-semibold"
                                                        onClick={() => navigate(`/quiz/${sub.quizId}`)}
                                                    >
                                                        Làm Lại
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
                            <h5 className="fw-bold">Bạn chưa có bài thi nào</h5>
                            <p className="mb-3">Hãy chọn một đề thi từ danh sách và bắt đầu thử thách ngay bây giờ!</p>
                            <button
                                type="button"
                                className="btn btn-primary fw-bold px-4 py-2 rounded-pill"
                                onClick={() => setActiveTab('quizzes')}
                            >
                                Xem Danh Sách Đề Thi ➜
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default User;