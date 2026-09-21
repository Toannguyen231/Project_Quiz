import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getQuzizeByPage } from '../sevices/apiService';
import Leaderboard from '../Common/Leaderboard';
import './ListQuiz.scss';

const EMOJIS = ['⚡', '⚛️', '🚀', '🎯', '💡', '🔥', '🌟', '📚'];
const BG_COLORS = [
    '#EFF6FF', // Indigo/Blue tint
    '#F5F3FF', // Violet tint
    '#ECFDF5', // Emerald tint
    '#FFF7ED', // Tangerine tint
    '#FDF2F8', // Rose tint
    '#ECFEFF', // Cyan tint
];

const ListQuiz = () => {
    const [arrayQuiz, setArrayQuiz] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('ALL');
    const navigate = useNavigate();

    const getQuizData = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const res = await getQuzizeByPage();
            if (res && res.data && res.data.EC === 0 && Array.isArray(res.data.DT)) {
                setArrayQuiz(res.data.DT);
            } else if (res && res.data && Array.isArray(res.data.DT)) {
                setArrayQuiz(res.data.DT);
            } else {
                setArrayQuiz([]);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách bài thi:", error);
            setHasError(true);
            toast.error("Không thể tải danh sách bài thi. Vui lòng kiểm tra kết nối mạng!");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getQuizData();
    }, [getQuizData]);

    const filteredQuiz = arrayQuiz.filter((quiz) => {
        const title = (quiz.name || quiz.description || '').toLowerCase();
        const matchSearch = title.includes(searchTerm.toLowerCase());
        const matchDifficulty = filterDifficulty === 'ALL' || quiz.difficulty === filterDifficulty;
        return matchSearch && matchDifficulty;
    });

    return (
        <div className="list-quiz-page">
            {/* Page Header */}
            <div className="quiz-page-header">
                <span className="header-badge">Thư Viện Đề Thi Trực Tuyến</span>
                <h1 className="header-title">Danh Sách Bài Thi &amp; Thử Thách</h1>
                <p className="header-subtitle">
                    Lựa chọn bài thi phù hợp với mục tiêu học tập, rèn luyện tư duy và kiểm tra năng lực của bạn ngay hôm nay.
                </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="quiz-filter-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm kiếm theo tên đề thi, chủ đề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-pills">
                    <button
                        type="button"
                        className={`pill-btn ${filterDifficulty === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty('ALL')}
                    >
                        Tất cả ({arrayQuiz.length})
                    </button>
                    <button
                        type="button"
                        className={`pill-btn ${filterDifficulty === 'EASY' ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty('EASY')}
                    >
                        🟢 Dễ
                    </button>
                    <button
                        type="button"
                        className={`pill-btn ${filterDifficulty === 'MEDIUM' ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty('MEDIUM')}
                    >
                        🟡 Trung bình
                    </button>
                    <button
                        type="button"
                        className={`pill-btn ${filterDifficulty === 'HARD' ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty('HARD')}
                    >
                        🔴 Khó
                    </button>
                </div>
            </div>

            {/* Error Banner with Retry */}
            {hasError && !isLoading && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📡</div>
                    <h4 style={{ color: '#991b1b', fontWeight: 700, marginBottom: '6px' }}>
                        Không thể kết nối đến máy chủ bài thi
                    </h4>
                    <p style={{ color: '#7f1d1d', fontSize: '0.95rem', marginBottom: '16px' }}>
                        Đã xảy ra sự cố khi tải dữ liệu bài thi. Bạn vui lòng thử tải lại trang hoặc kiểm tra kết nối mạng.
                    </p>
                    <button
                        type="button"
                        className="btn btn-danger px-4 py-2 fw-bold"
                        onClick={getQuizData}
                    >
                        🔄 Thử Tải Lại
                    </button>
                </div>
            )}

            {/* Skeleton Loading State */}
            {isLoading && (
                <div className="quiz-cards-grid">
                    {[1, 2, 3, 4, 5, 6].map((sk) => (
                        <div key={sk} className="quiz-skeleton-card">
                            <div className="skeleton-banner" />
                            <div className="skeleton-content">
                                <div className="skeleton-line meta" />
                                <div className="skeleton-line title" />
                                <div className="skeleton-line desc" />
                                <div className="skeleton-line desc-short" />
                                <div className="skeleton-line btn" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loaded Quiz Cards Grid */}
            {!isLoading && !hasError && filteredQuiz.length > 0 && (
                <div className="quiz-cards-grid">
                    {filteredQuiz.map((quiz, index) => (
                        <div key={quiz.id || index} className="quiz-card">
                            <div
                                className="card-banner"
                                style={{ background: BG_COLORS[index % BG_COLORS.length] }}
                            >
                                {quiz.image ? (
                                    <img
                                        src={`data:image/png;base64,${quiz.image}`}
                                        className="banner-image"
                                        alt={quiz.name}
                                    />
                                ) : (
                                    <span className="banner-icon">{EMOJIS[index % EMOJIS.length]}</span>
                                )}
                                <span className={`banner-difficulty-badge ${quiz.difficulty || 'EASY'}`}>
                                    {quiz.difficulty === 'HARD' ? '🔴 Khó' : quiz.difficulty === 'MEDIUM' ? '🟡 Trung bình' : '🟢 Dễ'}
                                </span>
                            </div>

                            <div className="card-content">
                                <div>
                                    <div className="quiz-meta-tags">
                                        <span className="meta-tag">
                                            📝 {quiz.questionCount ?? 10} câu hỏi
                                        </span>
                                        <span className="meta-tag">
                                            ⏱ {quiz.duration ?? 15} phút
                                        </span>
                                    </div>
                                    <h3 className="quiz-title">
                                        {quiz.name || `Đề thi #${quiz.id}`}
                                    </h3>
                                    <p className="quiz-description">
                                        {quiz.description || 'Bài thi trắc nghiệm đánh giá năng lực toàn diện.'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn-start-quiz"
                                    onClick={() => {
                                        navigate(`/quiz/${quiz.id}`, {
                                            state: {
                                                quizTittle: quiz.name || quiz.description,
                                                duration: quiz.duration || 15
                                            }
                                        });
                                    }}
                                >
                                    Bắt đầu làm bài ➜
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasError && filteredQuiz.length === 0 && (
                <div className="quiz-empty-state">
                    <div className="empty-icon">🔎</div>
                    <div className="empty-title">Không tìm thấy bài thi phù hợp</div>
                    <p className="empty-desc">
                        Không có bài thi nào khớp với từ khóa "{searchTerm}" hoặc bộ lọc hiện tại.
                    </p>
                    <button
                        type="button"
                        className="btn-reset-filter"
                        onClick={() => {
                            setSearchTerm('');
                            setFilterDifficulty('ALL');
                        }}
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>
            )}

            {/* Gamification: Leaderboard */}
            <div style={{ marginTop: '70px' }}>
                <Leaderboard />
            </div>
        </div>
    );
};

export default ListQuiz;