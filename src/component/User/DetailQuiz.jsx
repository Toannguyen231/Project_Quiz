import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getQuestionsByQuizId, postSubmitQuiz } from '../sevices/apiService';
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

    const [dataQuiz, setDataQuiz] = useState([]);
    const [index, setIndex] = useState(0);
    const [isShowModalResult, setIsShowModalResult] = useState(false);
    const [dataModalResult, setDataModalResult] = useState({});
    const [timeLeft, setTimeLeft] = useState(quizDuration);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
                        value.forEach((item, idx) => {
                            if (idx === 0) {
                                questionDescription = item.description;
                                image = item.image;
                            }
                            item.answers.isSelected = false;
                            answers.push(item.answers);
                        });
                        return { questionId: key, answers, questionDescription, image };
                    })
                    .value();
                setDataQuiz(data);
            }
        } catch (e) {
            console.warn("Lỗi tải câu hỏi:", e);
        }
    }, []);

    useEffect(() => {
        fetchQuizDetails(quizId);
    }, [quizId, fetchQuizDetails]);

    const handleFinish = useCallback(async () => {
        if (isSubmitted) return;
        setIsSubmitted(true);

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
                    setDataModalResult({
                        countCorrect: res.data.DT.countCorrect,
                        countTotal: res.data.DT.countTotal,
                        quizData: res.data.DT.quizData
                    });
                    setIsShowModalResult(true);
                    return;
                }
            } catch (err) {
                console.warn("Submit lỗi, tính điểm offline:", err);
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
    }, [isSubmitted, quizId, dataQuiz]);

    // Timer countdown
    useEffect(() => {
        if (isSubmitted) return;
        if (timeLeft <= 0) {
            handleFinish();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted, handleFinish]);

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

    const handleCheckBox = (answerId, questionId) => {
        if (isSubmitted) return;
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
        if (window.confirm("Bạn có chắc muốn thoát bài thi? Toàn bộ tiến trình sẽ không được lưu.")) {
            navigate('/user');
        }
    };

    const answeredCount = dataQuiz.filter(q => q.answers.some(a => a.isSelected)).length;
    const progressPercent = dataQuiz.length > 0 ? Math.round((answeredCount / dataQuiz.length) * 100) : 0;

    const timerStatus = timeLeft < 120 ? 'danger' : timeLeft < 300 ? 'warning' : 'normal';

    return (
        <div className="exam-workspace">
            {/* Top Bar */}
            <div className="exam-top-bar">
                <div className="exam-title-wrapper">
                    <span className="exam-icon">📝</span>
                    <h2 className="exam-title">
                        {location?.state?.quizTittle || `Bài thi trắc nghiệm #${quizId}`}
                    </h2>
                </div>

                <div className="exam-progress-wrapper">
                    <span className="progress-label">
                        Tiến độ: {answeredCount}/{dataQuiz.length} câu ({progressPercent}%)
                    </span>
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <button type="button" className="btn-exit-exam" onClick={handleExit}>
                    ✕ Thoát bài thi
                </button>
            </div>

            {/* Main Exam Workspace */}
            <div className="exam-body-grid">
                {/* Left: Question Panel */}
                <div className="question-panel">
                    <div className="question-body">
                        <Question
                            index={index}
                            handleCheckBox={handleCheckBox}
                            data={dataQuiz && dataQuiz.length > 0 ? dataQuiz[index] : {}}
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

                        <button
                            type="button"
                            className="btn-submit-exam"
                            onClick={handleConfirmSubmit}
                            disabled={isSubmitted}
                        >
                            {isSubmitted ? '✓ Đã hoàn thành' : 'Nộp bài thi ✓'}
                        </button>
                    </div>
                </div>

                {/* Right: Exam Monitor Sidebar */}
                <div className="exam-monitor-sidebar">
                    {/* Timer Card */}
                    <div className="timer-card">
                        <div className="timer-label">Thời gian còn lại</div>
                        <div className={`timer-countdown ${timerStatus}`}>
                            ⏱ {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Question Navigator Matrix */}
                    <div className="matrix-card">
                        <div className="matrix-header">
                            <span className="matrix-title">Ma trận câu hỏi</span>
                            <span className="matrix-answered-count">
                                {answeredCount}/{dataQuiz.length} đã làm
                            </span>
                        </div>

                        <div className="questions-matrix-grid">
                            {dataQuiz.map((q, qIdx) => {
                                const hasAnswered = q.answers.some(a => a.isSelected);
                                const isCurrent = qIdx === index;

                                let btnClass = 'matrix-btn';
                                if (hasAnswered) btnClass += ' answered';
                                if (isCurrent) btnClass += ' current';

                                return (
                                    <button
                                        key={q.questionId || qIdx}
                                        type="button"
                                        className={btnClass}
                                        onClick={() => setIndex(qIdx)}
                                        title={`Chuyển tới câu ${qIdx + 1}`}
                                    >
                                        {qIdx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="matrix-legend">
                            <div className="legend-item">
                                <span className="legend-dot answered" />
                                <span>Đã chọn đáp án</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot current" />
                                <span>Đang xem</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot unanswered" />
                                <span>Chưa trả lời</span>
                            </div>
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
            />
        </div>
    );
};

export default Detail;
