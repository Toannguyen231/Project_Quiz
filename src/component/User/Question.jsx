import React, { useState } from "react";
import _ from "lodash";
import Lightbox from "react-awesome-lightbox";
import { toast } from "react-toastify";
import { triggerQuizzyChat } from "../sevices/quizzyAiService";
import "./Question.scss";

const Question = (props) => {
    const { 
        data, 
        index, 
        handleCheckBox, 
        isFlagged = false, 
        onToggleFlag, 
        isReviewMode = false, 
        questionResult = null 
    } = props;
    const [isPreviewImage, setIsPreviewImage] = useState(false);

    if (_.isEmpty(data)) return null;

    const answers = data.answers || [];

    // Determine if question is multiple-choice
    const systemCorrectCount = answers.filter(a => a.isCorrect || a.correct_answer || a.iscorrect).length;
    const isMultipleChoice = data.type === 'MULTIPLE' || systemCorrectCount > 1;

    const handleSelectAnswer = (answerId) => {
        // In Review Mode (Read-only), candidate cannot modify choices
        if (isReviewMode) return;
        handleCheckBox(answerId, data.questionId);
    };

    // Find system correct answers for review display
    const correctAnswers = answers.filter(a => 
        a.isCorrect || 
        a.correct_answer || 
        a.iscorrect ||
        (questionResult?.systemAnswers?.some(s => (s.id ?? s) === a.id))
    );
    const correctLetters = correctAnswers.map(ca => {
        const idx = answers.findIndex(a => a.id === ca.id);
        return idx > -1 ? String.fromCharCode(65 + idx) : '';
    }).filter(Boolean).join(', ');

    // Determine candidate choices
    const userChosenAnswers = answers.filter(a => 
        a.isSelected || 
        (questionResult?.userAnswers?.includes(a.id))
    );

    const isQuestionWrong = isReviewMode && (
        questionResult 
            ? !questionResult.isCorrect 
            : (
                userChosenAnswers.length === 0 ||
                userChosenAnswers.length !== correctAnswers.length ||
                !correctAnswers.every(ca => userChosenAnswers.some(ua => ua.id === ca.id))
            )
    );

    // Anti-cheat: prevent copying question contents during active exam
    const handleCopyPrevent = (e) => {
        if (!isReviewMode) {
            e.preventDefault();
            toast.warning("⚠️ Cảnh báo: Không được phép sao chép nội dung câu hỏi trong phòng thi!");
        }
    };

    // Anti-cheat: prevent right-click context menu during active exam
    const handleContextMenu = (e) => {
        if (!isReviewMode) {
            e.preventDefault();
        }
    };

    // Trigger AI Tutor Quizzy for questions answered incorrectly
    const handleAskQuizzy = () => {
        const questionText = data.questionDescription || `Câu hỏi số ${index + 1}`;

        const correctText = correctAnswers.map(ca => {
            const idx = answers.findIndex(a => a.id === ca.id);
            const letter = idx > -1 ? String.fromCharCode(65 + idx) : '';
            return `${letter ? letter + '. ' : ''}${ca.description}`;
        }).join('; ') || 'Xem đáp án hệ thống';

        const userText = userChosenAnswers.length > 0
            ? userChosenAnswers.map(ua => {
                const idx = answers.findIndex(a => a.id === ua.id);
                const letter = idx > -1 ? String.fromCharCode(65 + idx) : '';
                return `${letter ? letter + '. ' : ''}${ua.description}`;
            }).join('; ')
            : 'Chưa chọn đáp án nào';

        const prompt = `Đề bài: ${questionText}. Đáp án đúng là: ${correctText}. Mình đã chọn nhầm là: ${userText}. Hãy giải thích ngắn gọn bằng giọng điệu vui vẻ, dễ thương của Quizzy giúp mình hiểu bản chất và mẹo để lần sau không sai nữa nhé!`;
        triggerQuizzyChat(prompt);
    };

    return (
        <div 
            className={`question-component ${isReviewMode ? 'review-mode-active' : ''}`}
            onCopy={handleCopyPrevent}
            onContextMenu={handleContextMenu}
        >
            {/* Question Header with Flag Toggle and Question Type Badge */}
            <div className="question-header">
                <div className="question-header-top">
                    <div className="question-badges-group">
                        <span className="question-number-badge">
                            Câu {index + 1}
                        </span>
                        <span className={`question-type-badge ${isMultipleChoice ? 'multiple' : 'single'}`}>
                            {isMultipleChoice ? '☑ Chọn nhiều đáp án' : '◉ Chọn 1 đáp án'}
                        </span>
                    </div>

                    {/* Flag for review toggle button */}
                    <button
                        type="button"
                        className={`btn-flag-toggle ${isFlagged ? 'flagged' : ''}`}
                        onClick={() => onToggleFlag && onToggleFlag(data.questionId)}
                        title={isFlagged ? "Bỏ cắm cờ câu hỏi này" : "Cắm cờ để xem lại trước khi nộp bài"}
                        aria-pressed={isFlagged}
                    >
                        <span className="flag-icon">{isFlagged ? '🚩' : '🏳️'}</span>
                        <span className="flag-text">{isFlagged ? 'Đã cắm cờ' : 'Cắm cờ xem lại'}</span>
                    </button>
                </div>

                <h3 className="question-title-text">
                    {data.questionDescription}
                </h3>
            </div>

            {/* Question Image if present */}
            {data.image && (
                <div
                    className="question-image-box"
                    onClick={() => setIsPreviewImage(true)}
                    title="Nhấn để phóng to ảnh"
                >
                    <img
                        src={`data:image/jpeg;base64,${data.image}`}
                        alt={`Minh họa câu ${index + 1}`}
                        className="q-img"
                    />
                    <span className="zoom-hint">🔍 Phóng to</span>
                </div>
            )}

            {/* Interactive / Review Option Cards */}
            <div 
                className="options-list"
                role={isMultipleChoice ? "group" : "radiogroup"}
                aria-label={`Danh sách phương án cho câu ${index + 1}`}
            >
                {answers.map((a, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = !!a.isSelected;

                    // Logic for coloring in Review Mode
                    const isSystemCorrect = !!(
                        a.isCorrect || 
                        a.correct_answer || 
                        a.iscorrect || 
                        (questionResult?.systemAnswers?.some(s => (s.id ?? s) === a.id))
                    );
                    const isUserChosen = isSelected || !!(questionResult?.userAnswers?.includes(a.id));

                    let cardClass = 'option-card';
                    let reviewTag = null;

                    if (isReviewMode) {
                        cardClass += ' review-card';
                        if (isSystemCorrect && isUserChosen) {
                            cardClass += ' user-correct';
                            reviewTag = <span className="review-badge badge-user-correct">✓ Bạn chọn chính xác!</span>;
                        } else if (isSystemCorrect && !isUserChosen) {
                            cardClass += ' system-correct';
                            reviewTag = <span className="review-badge badge-system-correct">✓ Đáp án đúng</span>;
                        } else if (!isSystemCorrect && isUserChosen) {
                            cardClass += ' user-wrong';
                            reviewTag = <span className="review-badge badge-user-wrong">✗ Lựa chọn của bạn (Sai)</span>;
                        }
                    } else {
                        if (isSelected) cardClass += ' selected';
                    }

                    return (
                        <div
                            key={a.id || idx}
                            className={cardClass}
                            onClick={() => handleSelectAnswer(a.id)}
                            role={isMultipleChoice ? "checkbox" : "radio"}
                            aria-checked={isSelected}
                            tabIndex={isReviewMode ? -1 : 0}
                            onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSelectAnswer(a.id);
                                }
                            }}
                        >
                            <span className="option-letter">{letter}</span>
                            <span className="option-text">{a.description}</span>
                            
                            {/* In exam mode: show selection indicator; in Review mode: show reviewTag */}
                            {isReviewMode ? (
                                reviewTag
                            ) : (
                                <span className={`check-indicator ${isMultipleChoice ? 'box' : 'circle'}`}>
                                    {isSelected ? '✓' : ''}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mascot Quizzy Callout for wrong answers in Review Mode */}
            {isReviewMode && isQuestionWrong && (
                <div className="quizzy-wrong-callout">
                    <div className="callout-left">
                        <span className="callout-mascot">🦊</span>
                        <div className="callout-content">
                            <h4 className="callout-title">Bạn chưa chọn đúng câu này!</h4>
                            <p className="callout-desc">
                                Đừng nản lòng nhé! Hãy để <strong>Gia sư ảo Quizzy</strong> giải thích bản chất câu hỏi và bật mí mẹo nhớ nhanh cho bạn.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn-ask-quizzy-ai"
                        onClick={handleAskQuizzy}
                        title="Mở Quizzy AI để nghe giải thích và mẹo làm bài"
                    >
                        <span className="btn-icon">🦊</span>
                        <span className="btn-label">Nhờ Quizzy giải thích câu này</span>
                        <span className="btn-sparkle">✨</span>
                    </button>
                </div>
            )}

            {/* Detailed Explanation Box in Review Mode */}
            {isReviewMode && (
                <div className="question-explanation-box">
                    <div className="exp-header">
                        <div className="exp-title-wrap">
                            <span className="exp-icon">💡</span>
                            <span className="exp-title">Lời Giải &amp; Phân Tích Chi Tiết:</span>
                        </div>
                        {isQuestionWrong && (
                            <button
                                type="button"
                                className="btn-ask-quizzy-inline"
                                onClick={handleAskQuizzy}
                                title="Nhờ Quizzy giải thích chi tiết"
                            >
                                🦊 Hỏi Quizzy AI
                            </button>
                        )}
                    </div>
                    <div className="exp-body">
                        <div className="exp-correct-summary">
                            <strong>Đáp án chuẩn xác:</strong> {correctLetters || 'A'} — {correctAnswers.map(c => c.description).join('; ') || 'Xem phương án đúng được đánh dấu xanh ở trên.'}
                        </div>
                        <p className="exp-text">
                            {data.explanation || "Ghi chú ôn luyện: Thí sinh cần đọc kỹ yêu cầu đề bài và loại trừ các phương án gây nhiễu để chọn đáp án chuẩn xác nhất."}
                        </p>
                    </div>
                </div>
            )}

            {/* Image Zoom Lightbox */}
            {isPreviewImage && data.image && (
                <Lightbox
                    image={`data:image/jpeg;base64,${data.image}`}
                    title={`Ảnh minh họa câu hỏi ${index + 1}`}
                    onClose={() => setIsPreviewImage(false)}
                />
            )}
        </div>
    );
};

export default Question;
