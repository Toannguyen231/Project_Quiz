import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getQuestionsByQuizId, postSubmitQuiz } from '../sevices/apiService';
import { recordQuizCompletion } from '../sevices/gamificationService';
import _ from "lodash";
import './DetailQuiz.scss';
import Question from "./Question";
import ModalResult from "./ModalResult";

const Detail = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const quizId = params.id;
    const quizDuration = (location?.state?.duration || 10) * 60; // phút → giây
    const storageKey = `quiz_progress_${quizId}`;

    const [dataQuiz, setDataQuiz] = useState([]);
    const [index, setIndex] = useState(0);
    const [isShowModalResult, setIsShowModalResult] = useState(false);
    const [dataModalResult, setDataModalResult] = useState({});
    const [timeLeft, setTimeLeft] = useState(quizDuration);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 1. Tính năng Đánh dấu xem lại (Flag Question): lưu danh sách questionId được cắm cờ
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);

    // 3. Chế độ Xem lại lời giải chi tiết (Review Answers): Read-only mode sau khi nộp bài
    const [isReviewMode, setIsReviewMode] = useState(false);

    // Fetch dữ liệu câu hỏi và khôi phục tiến trình từ LocalStorage
    const fetchQuizDetails = useCallback(async (id) => {
        try {
            let res = await getQuestionsByQuizId(id);
            if (res && res.data && res.data.EC === 0 && res.data.DT && res.data.DT.length > 0) {
                let raw = res.data.DT;
                let data = _.chain(raw)
                    .groupBy("id")
                    .map((value, key) => {
                        let answers = [];
                        let questionDescription = "";
                        let image = null;
                        let explanation = "";
                        value.forEach((item, idx) => {
                            if (idx === 0) {
                                questionDescription = item.description;
                                image = item.image;
                                explanation = item.explanation || "";
                            }
                            item.answers.isSelected = false;
                            answers.push(item.answers);
                        });
                        return { questionId: key, answers, questionDescription, image, explanation };
                    })
                    .value();

                // 2. Tự động khôi phục tiến trình làm bài từ LocalStorage khi tải lại trang (F5)
                try {
                    const saved = localStorage.getItem(`quiz_progress_${id}`);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (parsed) {
                            // Khôi phục câu trả lời đã chọn
                            if (parsed.answersMap) {
                                data.forEach(q => {
                                    const savedAnswers = parsed.answersMap[q.questionId] || [];
                                    q.answers.forEach(a => {
                                        if (savedAnswers.includes(a.id)) {
                                            a.isSelected = true;
                                        }
                                    });
                                });
                            }
                            // Khôi phục danh sách câu cắm cờ
                            if (Array.isArray(parsed.flaggedQuestions)) {
                                setFlaggedQuestions(parsed.flaggedQuestions);
                            }
                            // Khôi phục thời gian làm bài còn lại
                            if (typeof parsed.timeLeft === 'number' && parsed.timeLeft > 0) {
                                setTimeLeft(parsed.timeLeft);
                            }
                            // Khôi phục vị trí câu hỏi đang làm dở
                            if (typeof parsed.index === 'number' && parsed.index >= 0 && parsed.index < data.length) {
                                setIndex(parsed.index);
                            }
                        }
                    }
                } catch (storageErr) {
                    console.warn("Lỗi khi đọc dữ liệu khôi phục từ LocalStorage:", storageErr);
                }

                setDataQuiz(data);
            }
        } catch (e) {
            console.warn("Lỗi tải câu hỏi:", e);
        }
    }, []);

    useEffect(() => {
        fetchQuizDetails(quizId);
    }, [quizId, fetchQuizDetails]);

    // 2. Tự động lưu tiến độ vào LocalStorage (Auto-save State) mỗi khi có thay đổi
    useEffect(() => {
        // Chỉ lưu khi bài thi đang diễn ra, chưa nộp và chưa vào chế độ Review
        if (!quizId || dataQuiz.length === 0 || isSubmitted || isReviewMode) return;

        try {
            const answersMap = {};
            dataQuiz.forEach(q => {
                const selected = q.answers.filter(a => a.isSelected).map(a => a.id);
                if (selected.length > 0) {
                    answersMap[q.questionId] = selected;
                }
            });

            const progressData = {
                quizId,
                answersMap,
                timeLeft,
                flaggedQuestions,
                index,
                lastSavedAt: Date.now()
            };

            localStorage.setItem(storageKey, JSON.stringify(progressData));
        } catch (err) {
            console.warn("Không thể lưu tiến trình vào LocalStorage:", err);
        }
    }, [quizId, dataQuiz, timeLeft, flaggedQuestions, index, isSubmitted, isReviewMode, storageKey]);

    // Xử lý nộp bài thi
    const handleFinish = useCallback(async () => {
        if (isSubmitted) return;
        setIsSubmitted(true);

        // Gamification: Ghi nhận hoàn thành bài quiz để cập nhật chuỗi Streak 🔥
        recordQuizCompletion();

        // Xóa sạch dữ liệu lưu tạm trong LocalStorage khi đã nộp bài thành công
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.warn("Lỗi xóa LocalStorage:", e);
        }

        let payload = {
            quizId: +quizId,
            answers: []
        };

        if (dataQuiz && dataQuiz.length > 0) {
            dataQuiz.forEach(item => {
                let questionId = item.questionId;
                let userAnswerId = [];
                item.answers.forEach(a => {
                    if (a.isSelected === true) {
                        userAnswerId.push(a.id);
                    }
                });
                payload.answers.push({
                    questionId: +questionId,
                    userAnswerId: userAnswerId
                });
            });

            try {
                let res = await postSubmitQuiz(payload);
                if (res && res.data && res.data.EC === 0) {
                    // Trộn dữ liệu chi tiết giữa backend và frontend để phục vụ Review Mode
                    const mergedQuizData = dataQuiz.map(q => {
                        const backendQ = res.data.DT.quizData?.find(item => +item.questionId === +q.questionId);
                        const userAnswers = q.answers.filter(a => a.isSelected).map(a => a.id);
                        const systemAnswers = backendQ?.systemAnswers || q.answers.filter(a => a.isCorrect || a.correct_answer);
                        const isCorrect = backendQ ? !!backendQ.isCorrect : (
                            systemAnswers.length > 0 &&
                            systemAnswers.length === userAnswers.length &&
                            systemAnswers.every(id => userAnswers.includes(id))
                        );
                        return {
                            questionId: q.questionId,
                            questionDescription: q.questionDescription,
                            isCorrect,
                            userAnswers,
                            allAnswers: q.answers,
                            systemAnswers: q.answers.filter(a => a.isCorrect || a.correct_answer)
                        };
                    });

                    setDataModalResult({
                        countCorrect: res.data.DT.countCorrect,
                        countTotal: res.data.DT.countTotal || dataQuiz.length,
                        quizData: mergedQuizData
                    });
                    setIsShowModalResult(true);
                    return;
                }
            } catch (err) {
                console.warn("Submit API gặp lỗi, chuyển sang tính điểm offline:", err);
            }

            // Fallback tính điểm offline
            let countCorrect = 0;
            let quizData = dataQuiz.map(item => {
                let userAnswers = item.answers.filter(a => a.isSelected).map(a => a.id);
                let correctAnswers = item.answers.filter(a => a.isCorrect || a.correct_answer).map(a => a.id);
                let isCorrect = correctAnswers.length > 0 &&
                    correctAnswers.length === userAnswers.length &&
                    correctAnswers.every(id => userAnswers.includes(id));
                if (isCorrect) countCorrect++;

                return {
                    questionId: item.questionId,
                    questionDescription: item.questionDescription,
                    isCorrect: isCorrect,
                    userAnswers: userAnswers,
                    allAnswers: item.answers,
                    systemAnswers: item.answers.filter(a => a.isCorrect || a.correct_answer)
                };
            });

            setDataModalResult({
                countCorrect: countCorrect,
                countTotal: dataQuiz.length,
                quizData: quizData
            });
            setIsShowModalResult(true);
        }
    }, [isSubmitted, quizId, dataQuiz, storageKey]);

    // Timer countdown (chỉ đếm khi chưa nộp và chưa vào review mode)
    useEffect(() => {
        if (isSubmitted || isReviewMode) return;
        if (timeLeft <= 0) {
            handleFinish();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted, isReviewMode, handleFinish]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handlePrev = () => {
        if (index <= 0) return;
        setIndex(index - 1);
    };

    const handleNext = () => {
        if (index >= dataQuiz.length - 1) return;
        setIndex(index + 1);
    };

    // Chọn đáp án (vô hiệu hóa khi ở chế độ Review)
    const handleCheckBox = (answerId, questionId) => {
        if (isSubmitted || isReviewMode) return;
        let dataQuizClone = _.cloneDeep(dataQuiz);
        let question = dataQuizClone.find(item => +item.questionId === +questionId);
        if (question && question.answers) {
            question.answers = question.answers.map(item => {
                if (+item.id === +answerId) {
                    item.isSelected = !item.isSelected;
                }
                return item;
            });
        }
        let qIdx = dataQuizClone.findIndex(item => +item.questionId === +questionId);
        if (qIdx > -1) {
            dataQuizClone[qIdx] = question;
            setDataQuiz(dataQuizClone);
        }
    };

    // 1. Cắm cờ / Bỏ cắm cờ câu hỏi
    const handleToggleFlag = (qId) => {
        if (!qId) return;
        setFlaggedQuestions(prev => {
            return prev.includes(qId)
                ? prev.filter(id => id !== qId)
                : [...prev, qId];
        });
    };

    const handleConfirmSubmit = () => {
        const unanswered = dataQuiz.filter(q => !q.answers.some(a => a.isSelected)).length;
        let confirmMsg = "Bạn có chắc chắn muốn nộp bài thi ngay?";
        if (unanswered > 0) {
            confirmMsg = `Bạn vẫn còn ${unanswered} câu chưa trả lời! Bạn có chắc chắn muốn nộp bài không?`;
        }
        if (window.confirm(confirmMsg)) {
            handleFinish();
        }
    };

    const handleExit = () => {
        if (window.confirm("Bạn có chắc muốn thoát bài thi? Toàn bộ tiến trình tạm thời sẽ bị xóa.")) {
            try {
                localStorage.removeItem(storageKey);
            } catch (e) {
                console.warn(e);
            }
            navigate('/user');
        }
    };

    const answeredCount = dataQuiz.filter(q => q.answers.some(a => a.isSelected)).length;
    const progressPercent = dataQuiz.length > 0 ? Math.round((answeredCount / dataQuiz.length) * 100) : 0;
    const timerStatus = timeLeft < 120 ? 'danger' : timeLeft < 300 ? 'warning' : 'normal';

    const currentQuestion = dataQuiz && dataQuiz.length > 0 ? dataQuiz[index] : {};
    const currentQuestionId = currentQuestion?.questionId;
    const isCurrentFlagged = flaggedQuestions.includes(currentQuestionId);

    return (
        <div className={`exam-workspace ${isReviewMode ? 'review-mode-active' : ''}`}>
            {/* Top Bar */}
            <div className="exam-top-bar">
                <div className="exam-title-wrapper">
                    <span className="exam-icon">{isReviewMode ? '📖' : '📝'}</span>
                    <h2 className="exam-title">
                        {location?.state?.quizTittle || `Bài thi trắc nghiệm #${quizId}`}
                    </h2>
                </div>

                {/* Chế độ làm bài: Hiển thị tiến độ & cờ. Chế độ Review: Hiển thị điểm số & banner */}
                {isReviewMode ? (
                    <div className="review-mode-banner">
                        <span className="review-badge-pill">📖 ĐANG XEM LỜI GIẢI CHI TIẾT</span>
                        <span className="review-score-text">
                            Kết quả: <strong>{dataModalResult?.countCorrect || 0}/{dataQuiz.length}</strong> câu đúng (
                            {dataQuiz.length > 0 ? Math.round(((dataModalResult?.countCorrect || 0) / dataQuiz.length) * 100) : 0}%)
                        </span>
                    </div>
                ) : (
                    <div className="exam-progress-wrapper">
                        <span className="progress-label">
                            Tiến độ: {answeredCount}/{dataQuiz.length} câu ({progressPercent}%)
                            {flaggedQuestions.length > 0 && (
                                <span className="flag-summary-label"> • 🚩 {flaggedQuestions.length} câu xem lại</span>
                            )}
                        </span>
                        <div className="progress-bar-track">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {isReviewMode ? (
                    <button
                        type="button"
                        className="btn-exit-exam btn-reopen-modal"
                        onClick={() => setIsShowModalResult(true)}
                        title="Mở lại bảng điểm tổng kết"
                    >
                        📊 Xem bảng điểm
                    </button>
                ) : (
                    <button type="button" className="btn-exit-exam" onClick={handleExit}>
                        ✕ Thoát bài thi
                    </button>
                )}
            </div>

            {/* Main Exam Workspace */}
            <div className="exam-body-grid">
                {/* Left: Question Panel */}
                <div className="question-panel">
                    <div className="question-body">
                        <Question
                            index={index}
                            handleCheckBox={handleCheckBox}
                            data={currentQuestion}
                            isFlagged={isCurrentFlagged}
                            onToggleFlag={handleToggleFlag}
                            isReviewMode={isReviewMode}
                            questionResult={dataModalResult?.quizData?.find(item => +item.questionId === +currentQuestionId)}
                        />
                    </div>

                    <div className="question-navigation-footer">
                        <div className="nav-btn-group">
                            <button
                                type="button"
                                className="btn-nav-prev"
                                onClick={handlePrev}
                                disabled={index <= 0}
                            >
                                ← Câu trước
                            </button>
                            <button
                                type="button"
                                className="btn-nav-next"
                                onClick={handleNext}
                                disabled={index >= dataQuiz.length - 1}
                            >
                                Câu tiếp theo ➜
                            </button>
                        </div>

                        {/* Trong chế độ Review: nút chuyển sang mở bảng điểm hoặc quay về */}
                        {isReviewMode ? (
                            <div className="review-footer-actions">
                                <button
                                    type="button"
                                    className="btn-reopen-summary"
                                    onClick={() => setIsShowModalResult(true)}
                                >
                                    📊 Bảng điểm tổng kết
                                </button>
                                <button
                                    type="button"
                                    className="btn-back-user-list"
                                    onClick={() => navigate('/user')}
                                >
                                    📚 Về danh sách đề
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn-submit-exam"
                                onClick={handleConfirmSubmit}
                                disabled={isSubmitted}
                            >
                                {isSubmitted ? '✓ Đã hoàn thành' : 'Nộp bài thi ✓'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Exam Monitor Sidebar */}
                <div className="exam-monitor-sidebar">
                    {/* Timer Card (Ẩn hoặc đổi sang trạng thái hoàn thành trong Review Mode) */}
                    <div className="timer-card">
                        <div className="timer-label">
                            {isReviewMode ? 'Trạng thái phòng thi' : 'Thời gian còn lại'}
                        </div>
                        {isReviewMode ? (
                            <div className="review-status-text">
                                ✓ Đã nộp bài
                            </div>
                        ) : (
                            <div className={`timer-countdown ${timerStatus}`}>
                                ⏱ {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    {/* Question Navigator Matrix */}
                    <div className="matrix-card">
                        <div className="matrix-header">
                            <span className="matrix-title">
                                {isReviewMode ? 'Kết quả từng câu' : 'Ma trận câu hỏi'}
                            </span>
                            <span className="matrix-answered-count">
                                {isReviewMode
                                    ? `${dataModalResult?.countCorrect || 0}/${dataQuiz.length} đúng`
                                    : `${answeredCount}/${dataQuiz.length} đã làm`}
                            </span>
                        </div>

                        <div className="questions-matrix-grid">
                            {dataQuiz.map((q, qIdx) => {
                                const hasAnswered = q.answers.some(a => a.isSelected);
                                const isCurrent = qIdx === index;
                                const isFlagged = flaggedQuestions.includes(q.questionId);

                                let btnClass = 'matrix-btn';

                                if (isReviewMode) {
                                    // Tô màu đúng/sai trong chế độ Review
                                    const qResult = dataModalResult?.quizData?.find(item => +item.questionId === +q.questionId);
                                    if (qResult?.isCorrect) {
                                        btnClass += ' review-correct';
                                    } else {
                                        btnClass += ' review-incorrect';
                                    }
                                } else {
                                    if (hasAnswered) btnClass += ' answered';
                                }

                                if (isFlagged) btnClass += ' flagged';
                                if (isCurrent) btnClass += ' current';

                                return (
                                    <button
                                        key={q.questionId || qIdx}
                                        type="button"
                                        className={btnClass}
                                        onClick={() => setIndex(qIdx)}
                                        title={`Chuyển tới câu ${qIdx + 1}${isFlagged ? ' (Đã cắm cờ xem lại)' : ''}`}
                                    >
                                        {qIdx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Bảng chú thích (Legend) */}
                        <div className="matrix-legend">
                            {isReviewMode ? (
                                <>
                                    <div className="legend-item">
                                        <span className="legend-dot correct" />
                                        <span>Làm đúng (✓)</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot incorrect" />
                                        <span>Làm sai (✗)</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot current" />
                                        <span>Đang xem</span>
                                    </div>
                                    {flaggedQuestions.length > 0 && (
                                        <div className="legend-item">
                                            <span className="legend-dot flagged" />
                                            <span>Đã cắm cờ (🚩)</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="legend-item">
                                        <span className="legend-dot answered" />
                                        <span>Đã chọn đáp án</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot flagged" />
                                        <span>Cắm cờ xem lại (🚩)</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot current" />
                                        <span>Đang xem</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot unanswered" />
                                        <span>Chưa trả lời</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Result */}
            <ModalResult
                show={isShowModalResult}
                setShow={setIsShowModalResult}
                dataModalResult={dataModalResult}
                setDataModalResult={setDataModalResult}
                dataQuiz={dataQuiz}
                onEnterReviewMode={() => {
                    setIsShowModalResult(false);
                    setIsReviewMode(true);
                }}
            />
        </div>
    );
};

export default Detail;

