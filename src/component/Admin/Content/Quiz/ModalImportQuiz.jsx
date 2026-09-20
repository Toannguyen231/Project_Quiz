import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { FaFileImport, FaUpload, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import instance from '../../../util/axiosCutomes';
import { postCreateQuiz, postSaveQuestionsForQuiz } from '../../../sevices/apiService';
import { v4 as uuidv4 } from 'uuid';

const ModalImportQuiz = ({ show, setShow, fetchListQuiz }) => {
    const [fileName, setFileName] = useState('');
    const [validationError, setValidationError] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleClose = () => {
        if (!submitting) {
            setShow(false);
            setFileName('');
            setValidationError('');
            setParsedData(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            toast.error('Vui lòng chọn tệp định dạng .json');
            return;
        }

        setFileName(file.name);
        setValidationError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const parsed = JSON.parse(text);
                validateAndSetData(parsed);
            } catch (err) {
                setValidationError('Tệp JSON không hợp lệ: cú pháp JSON bị lỗi!');
                setParsedData(null);
            }
        };
        reader.onerror = () => {
            setValidationError('Không thể đọc tệp tin đã chọn.');
            setParsedData(null);
        };
        reader.readAsText(file);
    };

    const validateAndSetData = (data) => {
        // Schema normalization
        const quizMeta = data.quiz || {
            name: data.name,
            description: data.description || '',
            difficulty: data.difficulty || 'EASY'
        };

        if (!quizMeta || !quizMeta.name || !quizMeta.name.trim()) {
            setValidationError('Dữ liệu JSON thiếu tên bài thi (quiz.name)!');
            setParsedData(null);
            return;
        }

        const questions = Array.isArray(data.questions) ? data.questions : [];
        if (questions.length === 0) {
            setValidationError('Dữ liệu JSON không chứa danh sách câu hỏi nào (mảng questions rỗng)!');
            setParsedData(null);
            return;
        }

        // Validate each question
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.description || !q.description.trim()) {
                setValidationError(`Câu hỏi thứ ${i + 1} thiếu nội dung (description)!`);
                setParsedData(null);
                return;
            }
            const answers = q.answers || q.answer || [];
            if (!Array.isArray(answers) || answers.length < 2) {
                setValidationError(`Câu hỏi thứ ${i + 1} phải có ít nhất 2 đáp án lựa chọn!`);
                setParsedData(null);
                return;
            }
            const hasCorrect = answers.some(a => a.isCorrect || a.iscorrect);
            if (!hasCorrect) {
                setValidationError(`Câu hỏi thứ ${i + 1} chưa có đáp án đúng nào (isCorrect: true)!`);
                setParsedData(null);
                return;
            }
        }

        // Schema is valid!
        setValidationError('');
        setParsedData({
            quiz: quizMeta,
            questions: questions
        });
        toast.success(`Tệp hợp lệ! Tìm thấy đề thi "${quizMeta.name}" với ${questions.length} câu hỏi.`);
    };

    const handleConfirmImport = async () => {
        if (!parsedData) return;

        try {
            setSubmitting(true);
            // 1. Try calling the direct import API endpoint
            let importedViaEndpoint = false;
            try {
                const res = await instance.post('/api/v1/quiz/import', { quizData: parsedData });
                if (res && res.data && res.data.EC === 0) {
                    importedViaEndpoint = true;
                    toast.success(res.data.EM || 'Nhập đề thi qua API thành công!');
                }
            } catch (err) {
                console.warn('Backend /api/v1/quiz/import endpoint not ready, activating client fallback:', err);
            }

            // 2. Client-side orchestrated fallback if direct endpoint not available
            if (!importedViaEndpoint) {
                const { quiz, questions } = parsedData;
                // Create quiz first
                const quizRes = await postCreateQuiz(
                    quiz.name,
                    quiz.description || '',
                    (quiz.difficulty || 'EASY').toUpperCase(),
                    null
                );

                if (!quizRes || !quizRes.data || quizRes.data.EC !== 0) {
                    throw new Error(quizRes?.data?.EM || 'Không thể tạo mới bài thi');
                }

                const newQuizId = quizRes.data.DT?.id;

                // Format questions for postSaveQuestionsForQuiz
                const formattedQuestions = questions.map((q) => {
                    const answers = q.answers || q.answer || [];
                    return {
                        id: uuidv4(),
                        description: q.description,
                        imageFile: '',
                        imageName: '',
                        type: q.type || 'SINGLE',
                        answer: answers.map((ans) => ({
                            id: uuidv4(),
                            description: ans.description || '',
                            iscorrect: !!(ans.isCorrect || ans.iscorrect),
                        })),
                    };
                });

                if (newQuizId) {
                    await postSaveQuestionsForQuiz(newQuizId, formattedQuestions);
                }

                toast.success(`Nhập đề thi "${quiz.name}" kèm ${questions.length} câu hỏi thành công!`);
            }

            handleClose();
            if (fetchListQuiz) await fetchListQuiz();
        } catch (error) {
            console.error('Lỗi khi nhập đề thi:', error);
            toast.error(error.message || 'Nhập đề thi thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
            keyboard={!submitting}
        >
            <Modal.Header closeButton={!submitting}>
                <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
                    <FaFileImport className="text-success" />
                    <span>📥 Nhập Đề Thi &amp; Câu Hỏi Từ File JSON</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* File Upload Area */}
                <div
                    style={{
                        border: '2px dashed #94a3b8',
                        borderRadius: '10px',
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        marginBottom: '16px'
                    }}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                    <FaUpload size={32} className="text-primary mb-2" />
                    <h6 className="fw-bold text-dark mb-1">
                        {fileName ? fileName : 'Nhấn để chọn tệp .json hoặc kéo thả vào đây'}
                    </h6>
                    <small className="text-muted">
                        Hỗ trợ cấu trúc JSON tiêu chuẩn QuizMaster (metadata bài thi + danh sách câu hỏi)
                    </small>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json,application/json"
                        hidden
                        onChange={handleFileChange}
                    />
                </div>

                {/* Validation Error Banner */}
                {validationError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                        <FaExclamationCircle size={20} />
                        <div>{validationError}</div>
                    </div>
                )}

                {/* Validated Content Preview */}
                {parsedData && (
                    <div className="card border-success shadow-sm mb-3">
                        <div className="card-header bg-success bg-opacity-10 text-success fw-bold d-flex align-items-center gap-2">
                            <FaCheckCircle />
                            <span>Thông Tin Đề Thi Được Nhận Diện</span>
                        </div>
                        <div className="card-body">
                            <div className="row g-2 mb-2">
                                <div className="col-md-6">
                                    <strong>Tên bài thi:</strong> {parsedData.quiz.name}
                                </div>
                                <div className="col-md-3">
                                    <strong>Độ khó:</strong>{' '}
                                    <span className="badge bg-primary">
                                        {(parsedData.quiz.difficulty || 'EASY').toUpperCase()}
                                    </span>
                                </div>
                                <div className="col-md-3">
                                    <strong>Số câu hỏi:</strong>{' '}
                                    <span className="badge bg-success">
                                        {parsedData.questions.length} câu
                                    </span>
                                </div>
                                {parsedData.quiz.description && (
                                    <div className="col-12 text-muted" style={{ fontSize: '0.9rem' }}>
                                        <strong>Mô tả:</strong> {parsedData.quiz.description}
                                    </div>
                                )}
                            </div>

                            {/* Preview first 2 questions */}
                            <div className="mt-3 pt-2 border-top">
                                <h6 className="fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>
                                    Xem trước câu hỏi mẫu:
                                </h6>
                                {parsedData.questions.slice(0, 2).map((q, idx) => (
                                    <div key={idx} className="p-2 bg-light rounded mb-2" style={{ fontSize: '0.85rem' }}>
                                        <div className="fw-bold">
                                            Câu {idx + 1}: {q.description}
                                        </div>
                                        <div className="text-muted mt-1">
                                            Đáp án: {(q.answers || q.answer || []).map(a => a.description).join(' | ')}
                                        </div>
                                    </div>
                                ))}
                                {parsedData.questions.length > 2 && (
                                    <small className="text-muted">
                                        ...và {parsedData.questions.length - 2} câu hỏi khác
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={submitting}>
                    Hủy bỏ
                </Button>
                <Button
                    variant="success"
                    onClick={handleConfirmImport}
                    disabled={!parsedData || submitting}
                >
                    {submitting ? 'Đang nhập dữ liệu...' : 'Xác nhận nhập đề thi'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalImportQuiz;
