import React, { useState } from 'react';
import { LEADERBOARD_DATA } from '../sevices/gamificationService';
import './Leaderboard.scss';

const Leaderboard = () => {
    const [period, setPeriod] = useState('weekly'); // 'weekly' | 'monthly'

    const students = LEADERBOARD_DATA[period] || [];

    return (
        <div className="nnt-leaderboard-card">
            {/* Header */}
            <div className="leaderboard-header">
                <div className="header-title-wrap">
                    <span className="trophy-icon">🏆</span>
                    <div>
                        <h3 className="leaderboard-title">Bảng Vinh Danh Top Học Viên</h3>
                        <p className="leaderboard-subtitle">Thành tích xuất sắc &amp; điểm số ấn tượng của các sĩ tử NNT</p>
                    </div>
                </div>

                {/* Period Switcher */}
                <div className="period-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${period === 'weekly' ? 'active' : ''}`}
                        onClick={() => setPeriod('weekly')}
                    >
                        ⚡ Tuần này
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${period === 'monthly' ? 'active' : ''}`}
                        onClick={() => setPeriod('monthly')}
                    >
                        🌟 Tháng này
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="leaderboard-list">
                {students.map((student) => {
                    const isTop1 = student.rank === 1;
                    const isTop2 = student.rank === 2;
                    const isTop3 = student.rank === 3;

                    let rankClass = 'rank-badge';
                    if (isTop1) rankClass += ' gold';
                    else if (isTop2) rankClass += ' silver';
                    else if (isTop3) rankClass += ' bronze';

                    return (
                        <div key={student.rank} className={`leaderboard-item ${isTop1 ? 'top-1-item' : ''}`}>
                            {/* Rank Medal */}
                            <div className={rankClass}>
                                {student.medal}
                            </div>

                            {/* Avatar */}
                            <div className="student-avatar-wrap">
                                <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="student-avatar"
                                    onError={(e) => {
                                        // Fallback avatar nếu ảnh lỗi
                                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.name) + '&background=6C63FF&color=fff';
                                    }}
                                />
                                {isTop1 && <span className="crown-badge">👑</span>}
                            </div>

                            {/* Info */}
                            <div className="student-info">
                                <div className="name-row">
                                    <span className="student-name">{student.name}</span>
                                    <span className="student-title-pill">{student.badge}</span>
                                </div>
                                <div className="sub-stats">
                                    <span>🎯 Độ chính xác: <strong>{student.accuracy}%</strong></span>
                                    <span>•</span>
                                    <span>📝 Đã thi: <strong>{student.quizzesCount} đề</strong></span>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="student-score-box">
                                <span className="score-val">{student.score}</span>
                                <span className="score-label">Điểm tích lũy</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;
