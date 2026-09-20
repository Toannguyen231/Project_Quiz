import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { LuImagePlus } from "react-icons/lu";
import { FaEye, FaSave, FaInfoCircle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import './Questions.scss';
import Lightbox from "react-awesome-lightbox";
import {
    getAllQuizForAdmin,
    postSaveQuestionsForQuiz,
    getQuestionsByQuizId
} from '../../../sevices/apiService';
import { toast } from 'react-toastify';
import ModalPreviewQuestion from './ModalPreviewQuestion';

const questionTypeOptions = [
    { value: 'SINGLE', label: '🔘 Trắc nghiệm 1 đáp án (Single Choice)' },
    { value: 'MULTIPLE', label: '☑️ Trắc nghiệm nhiều đáp án (Multiple Choice)' },
    { value: 'TRUE_FALSE', label: '⚖️ Đúng / Sai (True / False)' },
];

const createDefaultAnswer = () => ({
    id: uuidv4(),
    description: '',
    iscorrect: false,
});

const createDefaultQuestion = (type = 'SINGLE') => {
    if (type === 'TRUE_FALSE') {
        return {
            id: uuidv4(),
            description: '',
            type: 'TRUE_FALSE',
            imageFile: '',
            imageName: '',
            answer: [
                { id: uuidv4(), description: 'Đúng (True)', iscorrect: true },
                { id: uuidv4(), description: 'Sai (False)', iscorrect: false },
            ],
        };
    }
    return {
        id: uuidv4(),
        description: '',
        type: type,
        imageFile: '',
        imageName: '',
        answer: [
            createDefaultAnswer(),
            createDefaultAnswer(),
        ],
    };
};

const Questions = () => {
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizOptions, setQuizOptions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [questions, setQuestions] = useState([createDefaultQuestion('SINGLE')]);

    // Lightbox image preview state
    const [isPreviewImage, setIsPreviewImage] = useState(false);
    const [dataImageQuestion, setDataImageQuestion] = useState({
        title: '',
        URL: '',
    });

    // Candidate preview modal state
    const [previewModalShow, setPreviewModalShow] = useState(false);
    const [previewQuestionData, setPreviewQuestionData] = useState(null);
    const [previewQuestionIndex, setPreviewQuestionIndex] = useState(1);

    const fetchListQuiz = useCallback(async () => {
        try {
            let res = await getAllQuizForAdmin();
            if (res && res.data && res.data.EC === 0) {
                const options = res.data.DT.map(quiz => ({
                    value: quiz.id,
                    label: `#${quiz.id} - ${quiz.name || quiz.description} (${quiz.difficulty || 'EASY'})`,
                    name: quiz.name || quiz.description,
                }));
                setQuizOptions(options);
            }
        } catch (error) {
            console.warn('Lỗi tải quiz:', error);
            toast.error('Không thể tải danh sách bộ đề');
        }
    }, []);

    useEffect(() => {
        fetchListQuiz();
    }, [fetchListQuiz]);

    // When admin selects a quiz, load its existing questions
    const handleSelectQuiz = async (selected) => {
        setSelectedQuiz(selected);
        if (!selected) {
            setQuestions([createDefaultQuestion('SINGLE')]);
            return;
        }

        try {
            setLoadingQuestions(true);
            const res = await getQuestionsByQuizId(selected.value);
            if (res && res.data && res.data.EC === 0 && Array.isArray(res.data.DT) && res.data.DT.length > 0) {
                const loadedQuestions = res.data.DT.map((q) => {
                    const rawAnswers = q.answers || q.answer || [];
                    const normalizedAnswers = rawAnswers.map((a) => ({
                        id: a.id || uuidv4(),
                        description: a.description || '',
                        iscorrect: !!(a.iscorrect || a.isCorrect),
                    }));

                    return {
                        id: q.id || uuidv4(),
                        description: q.description || '',
                        type: q.type || (normalizedAnswers.filter(a => a.iscorrect).length > 1 ? 'MULTIPLE' : 'SINGLE'),
                        imageFile: '',
                        imageName: q.image ? 'Ảnh đính kèm' : '',
                        image: q.image || '',
                        answer: normalizedAnswers.length >= 2 ? normalizedAnswers : [
                            createDefaultAnswer(),
                            createDefaultAnswer(),
                        ],
                    };
                });

                setQuestions(loadedQuestions);
                toast.info(`Đã tải ${loadedQuestions.length} câu hỏi của bộ đề #${selected.value}`);
            } else {
                setQuestions([createDefaultQuestion('SINGLE')]);
            }
        } catch (err) {
            console.warn('Lỗi lấy câu hỏi của quiz:', err);
            setQuestions([createDefaultQuestion('SINGLE')]);
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Add / Remove Question
    const handleAddRemoveQuestion = (action, id) => {
        if (action === "ADD") {
            setQuestions([...questions, createDefaultQuestion('SINGLE')]);
        } else if (action === "REMOVE") {
            if (questions.length <= 1) {
                toast.warning('Bộ đề phải có ít nhất 1 câu hỏi!');
                return;
            }
            const filtered = questions.filter(q => q.id !== id);
            setQuestions(filtered);
        }
    };

    // Change Question Type (SINGLE, MULTIPLE, TRUE_FALSE)
    const handleChangeQuestionType = (questionId, newType) => {
        const cloned = _.cloneDeep(questions);
        const index = cloned.findIndex(q => q.id === questionId);
        if (index > -1) {
            cloned[index].type = newType;
            if (newType === 'TRUE_FALSE') {
                cloned[index].answer = [
                    { id: uuidv4(), description: 'Đúng (True)', iscorrect: true },
                    { id: uuidv4(), description: 'Sai (False)', iscorrect: false },
                ];
            } else if (newType === 'SINGLE') {
                // In single choice, ensure at most one answer is marked correct
                let foundCorrect = false;
                cloned[index].answer = cloned[index].answer.map(a => {
                    if (a.iscorrect && !foundCorrect) {
                        foundCorrect = true;
                        return a;
                    }
                    return { ...a, iscorrect: false };
                });
                if (!foundCorrect && cloned[index].answer.length > 0) {
                    cloned[index].answer[0].iscorrect = true;
                }
            }
            setQuestions(cloned);
        }
    };

    // Add / Remove Answer Option
    const handleAddRemoveAnswer = (action, qid, aid) => {
        const cloned = _.cloneDeep(questions);
        const qIndex = cloned.findIndex(item => item.id === qid);
        if (qIndex === -1) return;

        if (cloned[qIndex].type === 'TRUE_FALSE') {
            toast.info('Câu hỏi Đúng/Sai có 2 lựa chọn cố định');
            return;
        }

        if (action === "ADD") {
            cloned[qIndex].answer.push(createDefaultAnswer());
            setQuestions(cloned);
        } else if (action === "REMOVE") {
            if (cloned[qIndex].answer.length <= 2) {
                toast.warning('Mỗi câu hỏi cần có ít nhất 2 đáp án lựa chọn');
                return;
            }
            cloned[qIndex].answer = cloned[qIndex].answer.filter(item => item.id !== aid);
            setQuestions(cloned);
        }
    };

    // Update question description
    const handleOnChangeDescription = (questionID, value) => {
        const cloned = _.cloneDeep(questions);
        const index = cloned.findIndex(item => item.id === questionID);
        if (index > -1) {
            cloned[index].description = value;
            setQuestions(cloned);
        }
    };

    // Image upload handler
    const handleOnChangeFileQuestion = (questionID, event) => {
        const file = event.target && event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Tệp tải lên phải là hình ảnh (PNG, JPG, WEBP)!');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!');
            return;
        }

        const cloned = _.cloneDeep(questions);
        const index = cloned.findIndex(item => item.id === questionID);
        if (index > -1) {
            cloned[index].imageFile = file;
            cloned[index].imageName = file.name;
            setQuestions(cloned);
        }
    };

    // Handle answer changes (text or correctness)
    const handleAnswerChange = (type, questionID, answerID, value) => {
        const cloned = _.cloneDeep(questions);
        const qIndex = cloned.findIndex(item => item.id === questionID);
        if (qIndex === -1) return;

        const currentQ = cloned[qIndex];
        const isSingleSelection = currentQ.type === 'SINGLE' || currentQ.type === 'TRUE_FALSE';

        currentQ.answer = currentQ.answer.map(ans => {
            if (type === "CORRECT") {
                if (isSingleSelection) {
                    // Radio behavior: only the clicked answer is marked correct
                    return { ...ans, iscorrect: ans.id === answerID };
                }
                // Multiple choice behavior: toggle checkbox
                if (ans.id === answerID) {
                    return { ...ans, iscorrect: value };
                }
            } else if (type === "DESCRIPTION" && ans.id === answerID) {
                return { ...ans, description: value };
            }
            return ans;
        });

        setQuestions(cloned);
    };

    // Save questions for quiz
    const handleSubmitQuestionsForQuiz = async () => {
        if (!selectedQuiz) {
            toast.warning('Vui lòng chọn bài thi trước khi lưu!');
            return;
        }

        // Comprehensive validation
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.description || !q.description.trim()) {
                toast.warning(`Câu hỏi ${i + 1} chưa có nội dung!`);
                return;
            }

            const hasEmptyAnswer = q.answer.some(a => !a.description.trim());
            if (hasEmptyAnswer) {
                toast.warning(`Câu hỏi ${i + 1} có đáp án còn để trống nội dung!`);
                return;
            }

            const hasCorrect = q.answer.some(a => a.iscorrect);
            if (!hasCorrect) {
                toast.warning(`Câu hỏi ${i + 1} chưa được chọn đáp án đúng!`);
                return;
            }
        }

        try {
            setIsSaving(true);
            let res = await postSaveQuestionsForQuiz(selectedQuiz.value, questions);
            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || `Đã lưu thành công ${questions.length} câu hỏi cho bài thi!`);
            } else {
                toast.error(res?.data?.EM || 'Lưu câu hỏi thất bại!');
            }
        } catch (error) {
            console.error('Lỗi lưu câu hỏi:', error);
            toast.error('Đã xảy ra lỗi khi lưu câu hỏi');
        } finally {
            setIsSaving(false);
        }
    };

    // Preview image in lightbox
    const handlePreviewImage = (questionID) => {
        const q = questions.find(item => item.id === questionID);
        if (q) {
            let imgUrl = '';
            if (q.imageFile) {
                imgUrl = URL.createObjectURL(q.imageFile);
            } else if (q.image) {
                imgUrl = q.image.startsWith('data:') ? q.image : `data:image/jpeg;base64,${q.image}`;
            }
            if (imgUrl) {
                setDataImageQuestion({
                    URL: imgUrl,
                    title: q.imageName || `Ảnh câu hỏi #${q.id}`,
                });
                setIsPreviewImage(true);
            }
        }
    };

    // Open candidate preview modal
    const handleOpenCandidatePreview = (question, index) => {
        setPreviewQuestionData(question);
        setPreviewQuestionIndex(index + 1);
        setPreviewModalShow(true);
    };

    return (
        <div className="questions-container p-3 p-md-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 pb-2 border-bottom">
                <div>
                    <h3 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                        ❓ Quản Lý Ngân Hàng Câu Hỏi (Question Builder)
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: 0 }}>
                        Soạn thảo câu hỏi trắc nghiệm đơn, nhiều đáp án, đúng/sai, gắn ảnh minh họa và xem trước giao diện thí sinh.
                    </p>
                </div>
                {selectedQuiz && (
                    <button
                        className="btn btn-warning d-flex align-items-center gap-2 shadow-sm fw-semibold"
                        style={{ borderRadius: '8px', padding: '10px 20px' }}
                        onClick={handleSubmitQuestionsForQuiz}
                        disabled={isSaving}
                    >
                        <FaSave />
                        <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả câu hỏi'}</span>
                    </button>
                )}
            </div>

            {/* Quiz Selector Card */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-7 col-lg-6">
                            <label className="form-label fw-bold text-dark mb-1">
                                🎯 Chọn Bộ Đề Thi Để Soạn Câu Hỏi:
                            </label>
                            <Select
                                value={selectedQuiz}
                                onChange={handleSelectQuiz}
                                options={quizOptions}
                                placeholder="-- Chọn bài thi cần thêm hoặc chỉnh sửa câu hỏi --"
                                isClearable
                            />
                        </div>
                        <div className="col-12 col-md-5 col-lg-6 d-flex justify-content-md-end align-items-center gap-2">
                            {selectedQuiz ? (
                                <div className="p-2 bg-light rounded text-muted" style={{ fontSize: '0.9rem' }}>
                                    <FaInfoCircle className="text-primary me-1" />
                                    Đang soạn <strong>{questions.length}</strong> câu hỏi cho đề: <strong>{selectedQuiz.name}</strong>
                                </div>
                            ) : (
                                <span className="text-muted" style={{ fontSize: '0.88rem' }}>
                                    💡 Vui lòng chọn một đề thi để bắt đầu biên soạn
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {loadingQuestions ? (
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang tải danh sách câu hỏi của bộ đề...
                </div>
            ) : (
                <div className="questions-builder-body">
                    {questions.map((question, index) => {
                        const qType = question.type || 'SINGLE';
                        const isSingle = qType === 'SINGLE' || qType === 'TRUE_FALSE';

                        return (
                            <div
                                key={question.id}
                                className="card shadow-sm border-0 mb-4"
                                style={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}
                            >
                                {/* Question Header */}
                                <div className="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="badge bg-primary px-3 py-2 fs-6" style={{ borderRadius: '8px' }}>
                                            Câu hỏi #{index + 1}
                                        </span>
                                        {/* Type Selector Dropdown */}
                                        <div style={{ minWidth: '280px' }}>
                                            <Select
                                                value={questionTypeOptions.find(opt => opt.value === qType)}
                                                onChange={(selected) => handleChangeQuestionType(question.id, selected.value)}
                                                options={questionTypeOptions}
                                                isSearchable={false}
                                            />
                                        </div>
                                    </div>

                                    {/* Action buttons: Candidate Preview & Remove */}
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                                            style={{ borderRadius: '6px' }}
                                            onClick={() => handleOpenCandidatePreview(question, index)}
                                            title="Xem trước góc nhìn thí sinh trong kỳ thi"
                                        >
                                            <FaEye size={13} />
                                            <span>Xem trước (Thí sinh)</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                            style={{ borderRadius: '6px' }}
                                            onClick={() => handleAddRemoveQuestion("REMOVE", question.id)}
                                            disabled={questions.length <= 1}
                                            title="Xóa câu hỏi này"
                                        >
                                            <AiFillMinusSquare size={16} />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body p-3 p-md-4">
                                    {/* Question Description Input */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-12 col-lg-8">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id={`question-desc-${question.id}`}
                                                    placeholder="Nhập nội dung câu hỏi..."
                                                    value={question.description}
                                                    onChange={(e) => handleOnChangeDescription(question.id, e.target.value)}
                                                />
                                                <label htmlFor={`question-desc-${question.id}`}>
                                                    Nội dung câu hỏi {index + 1} *
                                                </label>
                                            </div>
                                        </div>

                                        {/* Question Image Attachment */}
                                        <div className="col-12 col-lg-4 d-flex align-items-center gap-2">
                                            <label
                                                className="btn btn-outline-secondary d-flex align-items-center gap-2 mb-0"
                                                htmlFor={`file-${question.id}`}
                                                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <LuImagePlus size={18} />
                                                <span>{question.imageName || (question.image ? 'Đổi ảnh' : 'Gắn ảnh...')}</span>
                                            </label>
                                            <input
                                                type="file"
                                                id={`file-${question.id}`}
                                                accept="image/*"
                                                onChange={(e) => handleOnChangeFileQuestion(question.id, e)}
                                                hidden
                                            />

                                            {(question.imageFile || question.image) && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handlePreviewImage(question.id)}
                                                    title="Xem ảnh phóng to"
                                                >
                                                    Xem ảnh
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Answer Options Section */}
                                    <div className="answers-section ps-2 border-start border-3 border-primary ms-1">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                                                Các phương án lựa chọn:
                                                <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.82rem' }}>
                                                    ({isSingle ? 'Chọn nút tròn cho đáp án đúng' : 'Đánh dấu các ô vuông cho các đáp án đúng'})
                                                </span>
                                            </div>
                                            {qType !== 'TRUE_FALSE' && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                                    onClick={() => handleAddRemoveAnswer("ADD", question.id, null)}
                                                >
                                                    <CiCirclePlus size={16} />
                                                    <span>Thêm đáp án</span>
                                                </button>
                                            )}
                                        </div>

                                        {question.answer && question.answer.map((ans, ansIdx) => {
                                            const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                                            const letter = letters[ansIdx] || `${ansIdx + 1}`;

                                            return (
                                                <div
                                                    key={ans.id}
                                                    className="d-flex align-items-center gap-2 mb-2 p-2 rounded bg-light"
                                                    style={{ border: ans.iscorrect ? '1px solid #10b981' : '1px solid #e2e8f0' }}
                                                >
                                                    {/* Correctness Selector (Radio for Single/TrueFalse, Checkbox for Multiple) */}
                                                    <div className="d-flex align-items-center justify-content-center px-1">
                                                        <input
                                                            className="form-check-input mt-0"
                                                            type={isSingle ? "radio" : "checkbox"}
                                                            name={`correct-group-${question.id}`}
                                                            checked={ans.iscorrect}
                                                            onChange={(e) =>
                                                                handleAnswerChange(
                                                                    "CORRECT",
                                                                    question.id,
                                                                    ans.id,
                                                                    isSingle ? true : e.target.checked
                                                                )
                                                            }
                                                            style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                                            title={ans.iscorrect ? 'Đây là đáp án ĐÚNG' : 'Đánh dấu là đáp án đúng'}
                                                        />
                                                    </div>

                                                    <span className="badge bg-secondary" style={{ minWidth: '26px' }}>
                                                        {letter}
                                                    </span>

                                                    {/* Answer Description Input */}
                                                    <div className="flex-grow-1">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder={`Nội dung đáp án ${letter}...`}
                                                            value={ans.description}
                                                            disabled={qType === 'TRUE_FALSE'}
                                                            onChange={(e) =>
                                                                handleAnswerChange("DESCRIPTION", question.id, ans.id, e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    {/* Remove Answer Option */}
                                                    {qType !== 'TRUE_FALSE' && question.answer.length > 2 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-danger p-1"
                                                            onClick={() => handleAddRemoveAnswer("REMOVE", question.id, ans.id)}
                                                            title="Xóa đáp án này"
                                                        >
                                                            <CiCircleMinus size={22} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Bottom Action Bar */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 bg-white rounded border shadow-sm">
                        <button
                            type="button"
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={() => handleAddRemoveQuestion("ADD", null)}
                        >
                            <AiFillPlusSquare size={20} />
                            <span className="fw-semibold">Thêm Câu Hỏi Tiếp Theo</span>
                        </button>

                        <button
                            type="button"
                            className="btn btn-warning px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                            onClick={handleSubmitQuestionsForQuiz}
                            disabled={isSaving || !selectedQuiz}
                        >
                            <FaSave />
                            <span>{isSaving ? 'Đang lưu vào hệ thống...' : `Lưu ${questions.length} Câu Hỏi Cho Bộ Đề`}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Lightbox for Image Preview */}
            {isPreviewImage && (
                <Lightbox
                    onClose={() => setIsPreviewImage(false)}
                    image={dataImageQuestion.URL}
                    title={dataImageQuestion.title}
                />
            )}

            {/* Candidate Preview Modal */}
            <ModalPreviewQuestion
                show={previewModalShow}
                setShow={setPreviewModalShow}
                question={previewQuestionData}
                questionIndex={previewQuestionIndex}
                quizName={selectedQuiz?.name || ''}
            />
        </div>
    );
};

export default Questions;