import React, { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from "react-router-dom";
import mascotImg from '../../accets/quizzy-mascot.jpg';
import './ModalResult.scss';

const ModalResult = (props) => {
    const { show, setShow, dataModalResult, dataQuiz } = props;
    const [showReview, setShowReview] = useState(false);
    const navigate = useNavigate();

    const countCorrect = dataModalResult?.countCorrect || 0;
    const countTotal = dataModalResult?.countTotal || dataQuiz?.length || 0;
    const percentage = countTotal > 0 ? Math.round((countCorrect / countTotal) * 100) : 0;
    const isPassed = percentage >= 50;

    const handleClose = () => {
        setShow(false);
    };

    const handleRetry = () => {
        setShow(false);
        window.location.reload();
    };

    const handleGoHome = () => {
        setShow(false);
        navigate('/user');
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            size="lg"
            centered
            dialogClassName="modal-result-dialog"
        >
            <div className="modal-result-header">
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                    <img
                        src={mascotImg}
                        alt="Quizzy Mascot"
                        style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            border: '4px solid #ffffff',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                            objectFit: 'cover'
                        }}
                    />
                    <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        fontSize: '1.8rem'
                    }}>
                        {percentage >= 80 ? '🏆' : isPassed ? '🎉' : '💪'}
                    </span>
                </div>
                <h2 className="result-title">
                    {percentage >= 80 ? 'Xuất Sắc! Hoàn Thành Bài Thi' : isPassed ? 'Chúc Mừng! Bạn Đã Đạt Yêu Cầu' : 'Cố Gắng Hơn Ở Lần Sau!'}
                </h2>
                <div className={`result-status-badge ${isPassed ? 'passed' : 'failed'}`}>
                    {isPassed ? `✓ ĐẠT (${percentage}%)` : `✗ CHƯA ĐẠT (${percentage}%)`}
                </div>
            </div>

            <div className="modal-result-body">
                {/* 4 Summary Cards */}
                <div className="metrics-summary-grid">
                    <div className="metric-card">
                        <div className="metric-val green">{countCorrect}</div>
                        <div className="metric-lbl">Câu đúng</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-val red">{countTotal - countCorrect}</div>
                        <div className="metric-lbl">Câu sai</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-val blue">{percentage}%</div>
                        <div className="metric-lbl">Tỷ lệ chính xác</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-val">
                            {(countTotal > 0 ? (countCorrect / countTotal * 10).toFixed(1) : 0)}/10
                        </div>
                        <div className="metric-lbl">Điểm quy đổi</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="result-actions-group">
                    <button
                        type="button"
                        className="btn-action secondary"
                        onClick={() => setShowReview(!showReview)}
                    >
                        {showReview ? '▲ Thu gọn đáp án' : '🔍 Xem chi tiết đáp án'}
                    </button>
                    <button
                        type="button"
                        className="btn-action secondary"
                        onClick={handleRetry}
                    >
                        🔄 Làm lại bài thi
                    </button>
                    <button
                        type="button"
                        className="btn-action primary"
                        onClick={handleGoHome}
                    >
                        📚 Về danh sách đề thi
                    </button>
                </div>

                {/* Detailed Answer Review */}
                {showReview && (
                    <div className="review-container">
                        <div className="review-header">
                            <span>📋 Chi tiết từng câu hỏi:</span>
                        </div>

                        <div className="review-question-list">
                            {dataQuiz && dataQuiz.map((q, qIdx) => {
                                const questionResult = dataModalResult?.quizData?.find(
                                    item => +item.questionId === +q.questionId
                                );

                                const isQuestionCorrect = questionResult ? !!questionResult.isCorrect : false;

                                return (
                                    <div
                                        key={q.questionId || qIdx}
                                        className={`review-q-card ${isQuestionCorrect ? 'correct' : 'incorrect'}`}
                                    >
                                        <div className="q-card-top">
                                            <div className="q-num-text">
                                                Câu {qIdx + 1}: {q.questionDescription}
                                            </div>
                                            <span className={`q-verdict-badge ${isQuestionCorrect ? 'correct' : 'incorrect'}`}>
                                                {isQuestionCorrect ? '✓ Đúng' : '✗ Sai'}
                                            </span>
                                        </div>

                                        <div className="review-answers-grid">
                                            {q.answers && q.answers.map((ans, aIdx) => {
                                                const isUserChosen = !!ans.isSelected;
                                                const isSystemCorrect = ans.isCorrect || ans.correct_answer;

                                                let itemClass = 'review-answer-item';
                                                let tag = null;

                                                if (isSystemCorrect) {
                                                    itemClass += ' system-correct';
                                                    tag = <span className="ans-tag correct-tag">Đáp án đúng ✓</span>;
                                                } else if (isUserChosen && !isSystemCorrect) {
                                                    itemClass += ' user-wrong';
                                                    tag = <span className="ans-tag wrong-tag">Lựa chọn của bạn ✗</span>;
                                                }

                                                return (
                                                    <div key={ans.id || aIdx} className={itemClass}>
                                                        <span>{String.fromCharCode(65 + aIdx)}.</span>
                                                        <span>{ans.description}</span>
                                                        {tag}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ModalResult;