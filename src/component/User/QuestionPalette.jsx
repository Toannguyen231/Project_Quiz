import React from 'react';
import PropTypes from 'prop-types';
import './QuestionPalette.scss';

/**
 * QuestionPalette Component
 * Provides a quick-navigation grid displaying the status of each question:
 * - Unanswered (neutral outline)
 * - Currently viewed (highlighted active ring)
 * - Answered (solid primary/success)
 * - Flagged for review (amber badge/flag 🚩)
 * - In Review Mode: Correct (green ✓) and Incorrect (red ✗)
 */
const QuestionPalette = ({
  questions = [],
  currentIndex = 0,
  onSelectQuestion,
  flaggedQuestions = [],
  isReviewMode = false,
  reviewResults = [],
  answersMap = null,
}) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  // Count answered questions
  const answeredCount = questions.filter((q) => {
    if (answersMap && answersMap[q.questionId]) {
      return answersMap[q.questionId].length > 0;
    }
    return Array.isArray(q.answers) && q.answers.some((a) => a.isSelected);
  }).length;

  const correctCount = reviewResults.filter((r) => r && r.isCorrect).length;

  return (
    <div className={`question-palette-card ${isReviewMode ? 'review-mode' : ''}`}>
      <div className="palette-header">
        <div className="palette-title-wrap">
          <span className="palette-icon">{isReviewMode ? '📊' : '🧭'}</span>
          <h3 className="palette-title">
            {isReviewMode ? 'Kết quả chi tiết' : 'Ma trận câu hỏi'}
          </h3>
        </div>
        <span className="palette-badge-count">
          {isReviewMode
            ? `${correctCount}/${questions.length} đúng`
            : `${answeredCount}/${questions.length} đã làm`}
        </span>
      </div>

      <div className="palette-grid" role="navigation" aria-label="Question Grid Navigation">
        {questions.map((q, idx) => {
          const qId = q.questionId ?? q.id;
          const isCurrent = idx === currentIndex;
          const isFlagged = flaggedQuestions.includes(qId);

          let isAnswered = false;
          if (answersMap && answersMap[qId]) {
            isAnswered = answersMap[qId].length > 0;
          } else if (Array.isArray(q.answers)) {
            isAnswered = q.answers.some((a) => a.isSelected);
          }

          let statusClass = 'status-unanswered';
          let ariaStatus = 'chưa trả lời';

          if (isReviewMode) {
            const qResult = reviewResults.find(
              (r) => String(r.questionId ?? r.id) === String(qId)
            );
            if (qResult?.isCorrect) {
              statusClass = 'status-correct';
              ariaStatus = 'làm đúng';
            } else {
              statusClass = 'status-incorrect';
              ariaStatus = 'làm sai';
            }
          } else {
            if (isAnswered) {
              statusClass = 'status-answered';
              ariaStatus = 'đã trả lời';
            }
          }

          const buttonClasses = [
            'palette-btn',
            statusClass,
            isCurrent ? 'active-current' : '',
            isFlagged ? 'has-flag' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={qId || idx}
              type="button"
              className={buttonClasses}
              onClick={() => onSelectQuestion && onSelectQuestion(idx)}
              aria-current={isCurrent ? 'true' : undefined}
              aria-label={`Câu ${idx + 1}: ${ariaStatus}${isFlagged ? ', đã cắm cờ xem lại' : ''}`}
              title={`Chuyển tới câu ${idx + 1} (${ariaStatus})${isFlagged ? ' [🚩 Đã cắm cờ]' : ''}`}
            >
              <span className="btn-num">{idx + 1}</span>
              {isFlagged && <span className="flag-corner" aria-hidden="true">🚩</span>}
            </button>
          );
        })}
      </div>

      {/* Legend / Key */}
      <div className="palette-legend">
        {isReviewMode ? (
          <>
            <div className="legend-row">
              <span className="legend-indicator correct" />
              <span className="legend-label">Làm đúng (✓)</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator incorrect" />
              <span className="legend-label">Làm sai (✗)</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator current" />
              <span className="legend-label">Đang xem</span>
            </div>
            {flaggedQuestions.length > 0 && (
              <div className="legend-row">
                <span className="legend-indicator flagged">🚩</span>
                <span className="legend-label">Đã cắm cờ</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="legend-row">
              <span className="legend-indicator answered" />
              <span className="legend-label">Đã trả lời ({answeredCount})</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator unanswered" />
              <span className="legend-label">Chưa làm ({questions.length - answeredCount})</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator current" />
              <span className="legend-label">Đang xem (Câu {currentIndex + 1})</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator flagged">🚩</span>
              <span className="legend-label">Cắm cờ ({flaggedQuestions.length})</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

QuestionPalette.propTypes = {
  questions: PropTypes.array.isRequired,
  currentIndex: PropTypes.number,
  onSelectQuestion: PropTypes.func.isRequired,
  flaggedQuestions: PropTypes.array,
  isReviewMode: PropTypes.bool,
  reviewResults: PropTypes.array,
  answersMap: PropTypes.object,
};

export default QuestionPalette;
