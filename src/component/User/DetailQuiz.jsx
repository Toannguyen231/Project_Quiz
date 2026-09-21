import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";
import _ from "lodash";
import { getQuestionsByQuizId, postSubmitQuiz } from '../sevices/apiService';
import { recordQuizCompletion } from '../sevices/gamificationService';
import useTimer, { formatTimer } from "../../hooks/useTimer";
import useExamProgress from "../../hooks/useExamProgress";
import { calculateScore } from "../../utils/score";
import Question from "./Question";
import QuestionPalette from "./QuestionPalette";
import ModalResult from "./ModalResult";
import './DetailQuiz.scss';

const DetailQuiz = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const quizId = params.id;
    const authUser = useSelector((state) => state.user?.account || state.user?.user || null);
    const userId = authUser?.id || null;

    const quizDurationMinutes = location?.state?.duration || 10;
    const totalDurationSeconds = quizDurationMinutes * 60;

    // Exam States
    const [dataQuiz, setDataQuiz] = useState([]);
    const [index, setIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);

    // Modals
    const [isShowModalResult, setIsShowModalResult] = useState(false);
    const [dataModalResult, setDataModalResult] = useState({});
    const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
    const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
    const [tabWarningMessage, setTabWarningMessage] = useState("");

    // Flagged questions
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);

    // Custom Hook: useExamProgress
    const {
        loadProgress,
        saveProgress,
        clearProgress,
        lastSavedAt
    } = useExamProgress(quizId, userId);

    // Time spent tracking
    const startTimeRef = useRef(Date.now());
    const finalTimeSpentRef = useRef(null);

    // Forward declaration of handleFinish
    const isSubmittedRef = useRef(false);
    isSubmittedRef.current = isSubmitted;

    // Custom Hook: useTimer
    const {
        timeLeft,
        formattedTime,
        timerStatus,
        isWarning,
        isDanger,
        tabSwitchCount,
        pauseTimer,
        resumeTimer,
        setTimeLeft,
    } = useTimer({
        initialSeconds: totalDurationSeconds,
        autoStart: !isSubmitted && !isReviewMode,
        pauseOnBlur: !isSubmitted && !isReviewMode,
        onTimeUp: () => {
            if (!isSubmittedRef.current) {
                toast.error("⏱ Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài của bạn...");
                handleFinishSubmit();
            }
        },
        onTabSwitch: (count) => {
            if (isSubmittedRef.current || isReviewMode) return;

            if (count >= 4) {
                toast.error("🚨 Vi phạm quy chế thi: Rời màn hình quá 3 lần! Bài thi của bạn đã bị tự động nộp.");
                handleFinishSubmit();
            } else {
                setTabWarningMessage(
                    `Bạn vừa rời khỏi màn hình thi (${count}/3 lần). Nghiêm cấm chuyển tab hoặc mở ứng dụng khác trong khi làm bài!`
                );
                setShowTabSwitchWarning(true);
                toast.warning(`⚠️ Cảnh báo gian lận (${count}/3 lần): Vui lòng tập trung làm bài thi!`);
            }
        }
    });

    // Build current answersMap for progress saving and palette
    const currentAnswersMap = useMemo(() => {
        const map = {};
        dataQuiz.forEach((q) => {
            const qId = q.questionId;
            const selected = (q.answers || []).filter((a) => a.isSelected).map((a) => a.id);
            if (selected.length > 0) {
                map[qId] = selected;
            }
        });
        return map;
    }, [dataQuiz]);

    // Fetch quiz questions & restore progress
    const fetchQuizDetails = useCallback(async (id) => {
        setIsLoading(true);
        try {
            const res = await getQuestionsByQuizId(id);
            if (res && res.data && res.data.EC === 0 && res.data.DT && res.data.DT.length > 0) {
                const raw = res.data.DT;
                const grouped = _.chain(raw)
                    .groupBy("id")
                    .map((value, key) => {
                        const answers = [];
                        let questionDescription = "";
                        let image = null;
                        let explanation = "";
                        let type = "SINGLE";
                        value.forEach((item, idx) => {
                            if (idx === 0) {
                                questionDescription = item.description;
                                image = item.image;
                                explanation = item.explanation || "";
                                type = item.type || "SINGLE";
                            }
                            if (item.answers) {
                                if (Array.isArray(item.answers)) {
                                    item.answers.forEach((ans) => {
                                        answers.push({
                                            ...ans,
                                            isSelected: false,
                                        });
                                    });
                                } else {
                                    answers.push({
                                        ...item.answers,
                                        isSelected: false
                                    });
                                }
                            }
                        });
                        return {
                            questionId: key,
                            answers,
                            questionDescription,
                            image,
                            explanation,
                            type
                        };
                    })
                    .value();

                // Restore saved progress from useExamProgress hook
                const saved = loadProgress();
                if (saved) {
                    if (saved.answersMap) {
                        grouped.forEach((q) => {
                            const selectedIds = saved.answersMap[q.questionId] || [];
                            q.answers.forEach((a) => {
                                if (selectedIds.includes(a.id)) {
                                    a.isSelected = true;
                                }
                            });
                        });
                    }

                    if (Array.isArray(saved.flaggedQuestions)) {
                        setFlaggedQuestions(saved.flaggedQuestions);
                    }

                    if (typeof saved.timeLeft === 'number' && saved.timeLeft > 0) {
                        setTimeLeft(saved.timeLeft);
                    }

                    if (typeof saved.currentIndex === 'number' && saved.currentIndex >= 0 && saved.currentIndex < grouped.length) {
                        setIndex(saved.currentIndex);
                    }

                    toast.info("💾 Đã khôi phục tiến trình làm bài trước đó của bạn!");
                }

                setDataQuiz(grouped);
            } else {
                toast.error("Không thể tải danh sách câu hỏi cho bài thi này.");
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu bài thi:", err);
            toast.error("Lỗi kết nối khi tải bài thi. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, [loadProgress, setTimeLeft]);

    useEffect(() => {
        fetchQuizDetails(quizId);
    }, [quizId, fetchQuizDetails]);

    // Auto-save progress whenever answers, flags, time or index change
    useEffect(() => {
        if (!quizId || dataQuiz.length === 0 || isSubmitted || isReviewMode) return;

        saveProgress({
            answersMap: currentAnswersMap,
            timeLeft,
            flaggedQuestions,
            currentIndex: index,
            tabSwitchCount,
        });
    }, [quizId, dataQuiz, currentAnswersMap, timeLeft, flaggedQuestions, index, tabSwitchCount, isSubmitted, isReviewMode, saveProgress]);

    // Handle Finish & Submission
    const handleFinishSubmit = useCallback(async () => {
        if (isSubmitted) return;
        setIsSubmitted(true);
        setShowConfirmSubmitModal(false);
        pauseTimer();

        // Calculate time spent
        const elapsedSeconds = Math.max(0, totalDurationSeconds - timeLeft);
        const formattedTimeSpent = formatTimer(elapsedSeconds);
        finalTimeSpentRef.current = formattedTimeSpent;

        // Record streak
        try {
            recordQuizCompletion();
        } catch (e) {
            /* ignore */
        }

        // Clean up localStorage for this quiz
        clearProgress();

        // Prepare submission payload
        const payload = {
            quizId: +quizId,
            answers: []
        };

        dataQuiz.forEach((q) => {
            const userAnswerId = (q.answers || [])
                .filter((a) => a.isSelected)
                .map((a) => a.id);
            payload.answers.push({
                questionId: +q.questionId,
                userAnswerId,
            });
        });

        // Try submitting to Backend API
        let apiSucceeded = false;
        try {
            const res = await postSubmitQuiz(payload);
            if (res && res.data && res.data.EC === 0) {
                apiSucceeded = true;
                const dt = res.data.DT;

                // Merge server results with question data for review mode
                const mergedQuizData = dataQuiz.map((q) => {
                    const backendQ = dt.quizData?.find((item) => +(item.questionId ?? item.id) === +q.questionId);
                    const userAnswers = (q.answers || []).filter((a) => a.isSelected).map((a) => a.id);
                    const systemAnswers = backendQ?.systemAnswers || (q.answers || []).filter((a) => a.isCorrect || a.correct_answer || a.iscorrect);

                    const isCorrect = backendQ ? !!backendQ.isCorrect : (
                        systemAnswers.length > 0 &&
                        systemAnswers.length === userAnswers.length &&
                        systemAnswers.every((id) => userAnswers.includes(id))
                    );

                    return {
                        questionId: q.questionId,
                        questionDescription: q.questionDescription,
                        isCorrect,
                        userAnswers,
                        allAnswers: q.answers,
                        systemAnswers: (q.answers || []).filter((a) => a.isCorrect || a.correct_answer || a.iscorrect),
                        explanation: q.explanation,
                    };
                });

                const countCorrect = dt.countCorrect ?? mergedQuizData.filter(m => m.isCorrect).length;
                const countTotal = dt.countTotal ?? dataQuiz.length;
                const percentage = countTotal > 0 ? Math.round((countCorrect / countTotal) * 100) : 0;
                const score = Number(((countCorrect / countTotal) * 10).toFixed(1));

                setDataModalResult({
                    countCorrect,
                    countTotal,
                    score,
                    percentage,
                    timeSpent: formattedTimeSpent,
                    quizData: mergedQuizData,
                });
                setIsShowModalResult(true);
                toast.success("🎉 Nộp bài thi thành công!");
                return;
            }
        } catch (err) {
            console.warn("Backend submit error, using pure score calculation fallback:", err);
        }

        // Pure calculation fallback via calculateScore utility
        const calculated = calculateScore(dataQuiz, payload.answers);
        const mergedOfflineQuizData = dataQuiz.map((q) => {
            const detail = calculated.details.find((d) => String(d.questionId) === String(q.questionId));
            return {
                questionId: q.questionId,
                questionDescription: q.questionDescription,
                isCorrect: detail ? detail.isCorrect : false,
                userAnswers: detail ? detail.userAnswers.map(Number) : [],
                allAnswers: q.answers,
                systemAnswers: (q.answers || []).filter((a) => a.isCorrect || a.correct_answer || a.iscorrect),
                explanation: q.explanation,
            };
        });

        setDataModalResult({
            countCorrect: calculated.countCorrect,
            countTotal: calculated.total,
            countIncorrect: calculated.countIncorrect,
            countUnanswered: calculated.countUnanswered,
            score: calculated.score,
            percentage: calculated.percentage,
            timeSpent: formattedTimeSpent,
            quizData: mergedOfflineQuizData,
        });
        setIsShowModalResult(true);
        toast.info("Đã hoàn tất chấm điểm bài thi!");
    }, [isSubmitted, quizId, dataQuiz, totalDurationSeconds, timeLeft, pauseTimer, clearProgress]);

    // Handle Option Selection
    const handleCheckBox = (answerId, questionId) => {
        if (isSubmitted || isReviewMode) return;

        setDataQuiz((prev) => {
            const next = _.cloneDeep(prev);
            const targetQ = next.find((q) => +q.questionId === +questionId);
            if (targetQ && targetQ.answers) {
                // If single-choice (SINGLE or TRUE_FALSE), deselect other answers
                if (targetQ.type === 'SINGLE' || targetQ.type === 'TRUE_FALSE' || !targetQ.type) {
                    targetQ.answers.forEach((a) => {
                        if (+a.id === +answerId) {
                            a.isSelected = !a.isSelected;
                        } else {
                            a.isSelected = false;
                        }
                    });
                } else {
                    // Multiple-choice toggle
                    targetQ.answers.forEach((a) => {
                        if (+a.id === +answerId) {
                            a.isSelected = !a.isSelected;
                        }
                    });
                }
            }
            return next;
        });
    };

    // Flag toggle
    const handleToggleFlag = (qId) => {
        if (!qId) return;
        setFlaggedQuestions((prev) => {
            return prev.includes(qId)
                ? prev.filter((id) => id !== qId)
                : [...prev, qId];
        });
    };

    // Navigation
    const handlePrev = () => {
        if (index > 0) setIndex(index - 1);
    };

    const handleNext = () => {
        if (index < dataQuiz.length - 1) setIndex(index + 1);
    };

    // Prompt before submitting
    const handleOpenSubmitConfirmation = () => {
        setShowConfirmSubmitModal(true);
    };

    // Exit exam
    const handleExit = () => {
        if (window.confirm("Bạn có chắc chắn muốn thoát phòng thi? Tiến trình tạm thời sẽ bị xóa.")) {
            clearProgress();
            navigate('/user');
        }
    };

    // Retry exam
    const handleRetry = () => {
        clearProgress();
        setIsSubmitted(false);
        setIsReviewMode(false);
        setDataModalResult({});
        setTimeLeft(totalDurationSeconds);
        setIndex(0);
        setFlaggedQuestions([]);
        fetchQuizDetails(quizId);
    };

    // Stats
    const answeredCount = dataQuiz.filter((q) => (q.answers || []).some((a) => a.isSelected)).length;
    const unansweredCount = dataQuiz.length - answeredCount;
    const progressPercent = dataQuiz.length > 0 ? Math.round((answeredCount / dataQuiz.length) * 100) : 0;

    const currentQuestion = dataQuiz[index] || {};
    const currentQuestionId = currentQuestion?.questionId;
    const isCurrentFlagged = flaggedQuestions.includes(currentQuestionId);

    if (isLoading) {
        return (
            <div className="exam-workspace loading-container">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Đang tải đề thi...</span>
                </div>
                <h4 style={{ marginTop: '16px', color: '#475569', fontWeight: 600 }}>
                    Đang chuẩn bị đề thi &amp; phòng thi an toàn...
                </h4>
            </div>
        );
    }

    return (
        <div className={`exam-workspace ${isReviewMode ? 'review-mode-active' : ''}`}>
            {/* Anti-Cheat Floating Tab Switch Warning Banner */}
            {tabSwitchCount > 0 && !isSubmitted && !isReviewMode && (
                <div className="anti-cheat-alert-bar">
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-text">
                        Cảnh báo an ninh: Bạn đã rời khỏi phòng thi <strong>{tabSwitchCount}/3 lần</strong>.
                        {tabSwitchCount >= 3 ? " CẢNH BÁO CUỐI CÙNG: Rời tab thêm một lần nữa bài thi sẽ bị tự động nộp!" : " Vui lòng không chuyển tab."}
                    </span>
                </div>
            )}

            {/* Top Bar */}
            <div className="exam-top-bar">
                <div className="exam-title-wrapper">
                    <span className="exam-icon">{isReviewMode ? '📖' : '📝'}</span>
                    <h2 className="exam-title">
                        {location?.state?.quizTittle || `Bài thi trắc nghiệm #${quizId}`}
                    </h2>
                </div>

                {/* Progress / Review Mode Banner */}
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
                                <span className="flag-summary-label"> • 🚩 {flaggedQuestions.length} cắm cờ</span>
                            )}
                            {lastSavedAt && (
                                <span className="save-status-indicator" title="Tự động lưu vào trình duyệt">
                                    • ✓ Đã lưu
                                </span>
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

                {/* Header Action Buttons */}
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
                            questionResult={dataModalResult?.quizData?.find(
                                (item) => +(item.questionId ?? item.id) === +currentQuestionId
                            )}
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

                        {/* Review Mode actions vs Submit action */}
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
                                onClick={handleOpenSubmitConfirmation}
                                disabled={isSubmitted}
                            >
                                {isSubmitted ? '✓ Đã hoàn thành' : 'Nộp bài thi ✓'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Exam Monitor Sidebar */}
                <div className="exam-monitor-sidebar">
                    {/* Timer Card */}
                    <div className={`timer-card ${timerStatus}`}>
                        <div className="timer-label">
                            {isReviewMode ? 'Trạng thái phòng thi' : 'Thời gian còn lại'}
                        </div>
                        {isReviewMode ? (
                            <div className="review-status-text">
                                ✓ Đã nộp bài
                            </div>
                        ) : (
                            <div className={`timer-countdown ${timerStatus}`}>
                                ⏱ {formattedTime}
                            </div>
                        )}
                        {!isReviewMode && isDanger && (
                            <div className="timer-alert-danger">
                                ⚠️ Sắp hết giờ! Vui lòng kiểm tra và nộp bài.
                            </div>
                        )}
                    </div>

                    {/* Question Palette Navigation */}
                    <QuestionPalette
                        questions={dataQuiz}
                        currentIndex={index}
                        onSelectQuestion={(idx) => setIndex(idx)}
                        flaggedQuestions={flaggedQuestions}
                        isReviewMode={isReviewMode}
                        reviewResults={dataModalResult?.quizData || []}
                        answersMap={currentAnswersMap}
                    />
                </div>
            </div>

            {/* Submission Confirmation Modal */}
            <Modal
                show={showConfirmSubmitModal}
                onHide={() => setShowConfirmSubmitModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>
                        📋 Xác Nhận Nộp Bài Thi
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '16px' }}>
                        Bạn có chắc chắn muốn nộp bài thi ngay bây giờ? Sau khi nộp, bạn sẽ không thể thay đổi đáp án.
                    </p>

                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '16px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Đã hoàn thành:</span>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#16a34a' }}>
                                {answeredCount} / {dataQuiz.length} câu
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Chưa trả lời:</span>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: unansweredCount > 0 ? '#ea580c' : '#16a34a' }}>
                                {unansweredCount} câu
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Đã cắm cờ xem lại:</span>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#d97706' }}>
                                {flaggedQuestions.length} câu
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Thời gian còn lại:</span>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#2563eb' }}>
                                {formattedTime}
                            </div>
                        </div>
                    </div>

                    {unansweredCount > 0 && (
                        <div style={{
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: '#92400e',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>⚠️</span>
                            <span>Bạn vẫn còn <strong>{unansweredCount} câu chưa chọn đáp án</strong>!</span>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-3 py-2 fw-semibold"
                        onClick={() => setShowConfirmSubmitModal(false)}
                    >
                        Tiếp tục làm bài
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary px-4 py-2 fw-bold"
                        onClick={handleFinishSubmit}
                    >
                        Xác nhận nộp bài ✓
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Tab Switch Warning Modal */}
            <Modal
                show={showTabSwitchWarning}
                onHide={() => setShowTabSwitchWarning(false)}
                centered
            >
                <Modal.Header closeButton style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
                    <Modal.Title style={{ color: '#c2410c', fontWeight: 800, fontSize: '1.15rem' }}>
                        ⚠️ Cảnh Báo An Toàn Thi Cử
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {tabWarningMessage}
                    </p>
                    <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        fontSize: '0.88rem'
                    }}>
                        🚨 <strong>Quy chế:</strong> Nếu thí sinh rời khỏi giao diện thi quá 3 lần, hệ thống sẽ tự động khóa bài và nộp điểm số tại thời điểm vi phạm.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-warning px-4 py-2 fw-bold"
                        onClick={() => setShowTabSwitchWarning(false)}
                    >
                        Tôi đã hiểu &amp; Cam kết tiếp tục làm bài
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Modal Result */}
            <ModalResult
                show={isShowModalResult}
                setShow={setIsShowModalResult}
                dataModalResult={dataModalResult}
                dataQuiz={dataQuiz}
                timeSpent={finalTimeSpentRef.current}
                onEnterReviewMode={() => {
                    setIsShowModalResult(false);
                    setIsReviewMode(true);
                }}
                onRetry={handleRetry}
            />
        </div>
    );
};

export default DetailQuiz;
