import { useEffect, useState } from "react";
import { getQuzizeByPage } from '../sevices/apiService';
import Leaderboard from '../Common/Leaderboard';
import './ListQuiz.scss';
import { useNavigate } from "react-router-dom";

const EMOJIS = ['⚡', '⚛️', '🚀', '🎯', '💡', '🔥', '🌟', '📚'];
const GRADIENTS = [
    'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
];

const ListQuiz = () => {
    const [arrayQuiz, setArrayQuiz] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        getQuizData();
    }, []);

    const getQuizData = async () => {
        try {
            let res = await getQuzizeByPage();
            if (res && res.data && res.data.EC === 0 && res.data.DT && res.data.DT.length > 0) {
                setArrayQuiz(res.data.DT);
            }
        } catch (error) {
            console.warn("Lỗi tải danh sách bài thi:", error);
        }
    };

    const filteredQuiz = arrayQuiz.filter(quiz => {
        const matchSearch = (quiz.name || quiz.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchDifficulty = filterDifficulty === 'ALL' || quiz.difficulty === filterDifficulty;
        return matchSearch && matchDifficulty;
    });

    return (
        <div className="list-quiz-page">
            {/* Page Header */}
            <div className="quiz-page-header">
                <span className="header-badge">Thư Viện Đề Thi Trực Tuyến</span>
                <h1 className="header-title">Danh Sách Bài Thi & Thử Thách</h1>
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

            {/* Quiz Cards Grid */}
            {filteredQuiz && filteredQuiz.length > 0 ? (
                <div className="quiz-cards-grid">
                    {filteredQuiz.map((quiz, index) => (
                        <div key={quiz.id || index} className="quiz-card">
                            <div
                                className="card-banner"
                                style={{ background: GRADIENTS[index % GRADIENTS.length] }}
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
                                            📝 {quiz.questionCount || 0} câu hỏi
                                        </span>
                                        <span className="meta-tag">
                                            ⏱ {quiz.duration || 10} phút
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
                                                duration: quiz.duration || 10
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
            ) : (
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

            {/* Gamification: Bảng vinh danh Top học viên xuất sắc */}
            <div style={{ marginTop: '70px' }}>
                <Leaderboard />
            </div>
        </div>
    );
};

export default ListQuiz;