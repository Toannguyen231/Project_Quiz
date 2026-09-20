import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaEye, FaCheckCircle, FaTimesCircle, FaLightbulb, FaRedo } from 'react-icons/fa';

const ModalPreviewQuestion = ({ show, setShow, question, questionIndex = 1, quizName = '' }) => {
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [isChecked, setIsChecked] = useState(false);

    const handleClose = () => {
        setShow(false);
        setSelectedAnswers([]);
        setIsChecked(false);
    };

    useEffect(() => {
        if (show) {
            setSelectedAnswers([]);
            setIsChecked(false);
        }
    }, [show, question]);

    if (!question) return null;

    const qType = question.type || 'SINGLE';
    const isSingleChoice = qType === 'SINGLE' || qType === 'TRUE_FALSE';
    const answers = question.answer || question.answers || [];

    const handleSelectOption = (ansId) => {
        if (isChecked) return; // Locked after checking

        if (isSingleChoice) {
            setSelectedAnswers([ansId]);
        } else {
            setSelectedAnswers((prev) =>
                prev.includes(ansId) ? prev.filter((id) => id !== ansId) : [...prev, ansId]
            );
        }
    };

    const handleResetTest = () => {
        setSelectedAnswers([]);
        setIsChecked(false);
    };

    const getTypeName = (type) => {
        switch (type) {
            case 'SINGLE':
                return 'Trắc nghiệm 1 đáp án đúng';
            case 'MULTIPLE':
                return 'Trắc nghiệm nhiều đáp án đúng';
            case 'TRUE_FALSE':
                return 'Câu hỏi Đúng / Sai';
            default:
                return 'Trắc nghiệm';
        }
    };

    // Calculate result if checked
    let isCorrectResult = false;
    if (isChecked) {
        const correctIds = answers.filter((a) => a.iscorrect || a.isCorrect).map((a) => a.id);
        const selectedSet = new Set(selectedAnswers);
        const correctSet = new Set(correctIds);
        isCorrectResult =
            selectedSet.size === correctSet.size &&
            [...selectedSet].every((id) => correctSet.has(id));
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
            backdrop="static"
        >
            <Modal.Header closeButton>
                <div className="d-flex align-items-center gap-2">
                    <FaEye className="text-primary" />
                    <div>
                        <Modal.Title className="fw-bold fs-5 text-dark mb-0">
                            👁 Xem Trước Góc Nhìn Thí Sinh (Candidate Preview)
                        </Modal.Title>
                        {quizName && (
                            <small className="text-muted">Bộ đề: {quizName}</small>
                        )}
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: '#f8fafc' }}>
                {/* Exam Card Simulation */}
                <div
                    className="card shadow-sm border-0"
                    style={{ borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}
                >
                    {/* Header Bar */}
                    <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary px-3 py-2" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
                                Câu hỏi {questionIndex}
                            </span>
                            <span className="badge bg-secondary" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                                {getTypeName(qType)}
                            </span>
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                            {isSingleChoice ? 'Chọn 1 phương án duy nhất' : 'Có thể chọn nhiều phương án'}
                        </span>
                    </div>

                    {/* Question Content */}
                    <div className="p-4">
                        <h5 className="fw-semibold text-dark mb-3" style={{ lineHeight: 1.5 }}>
                            {question.description || '(Chưa nhập nội dung câu hỏi)'}
                        </h5>

                        {/* Question Image if uploaded */}
                        {(question.imageFile || question.image) && (
                            <div className="mb-4 text-center">
                                <img
                                    src={
                                        question.imageFile
                                            ? URL.createObjectURL(question.imageFile)
                                            : question.image?.startsWith('data:')
                                            ? question.image
                                            : `data:image/jpeg;base64,${question.image}`
                                    }
                                    alt="Minh họa câu hỏi"
                                    style={{
                                        maxHeight: '260px',
                                        maxWidth: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}
                                />
                            </div>
                        )}

                        {/* Answer Options */}
                        <div className="d-flex flex-column gap-2">
                            {answers.map((ans, idx) => {
                                const isSelected = selectedAnswers.includes(ans.id);
                                const isCorrect = ans.iscorrect || ans.isCorrect;

                                let itemBorder = '1px solid #e2e8f0';
                                let itemBg = '#ffffff';
                                let statusIcon = null;

                                if (isChecked) {
                                    if (isCorrect) {
                                        itemBorder = '2px solid #10b981';
                                        itemBg = '#ecfdf5';
                                        statusIcon = <FaCheckCircle className="text-success ms-auto" size={18} />;
                                    } else if (isSelected && !isCorrect) {
                                        itemBorder = '2px solid #ef4444';
                                        itemBg = '#fef2f2';
                                        statusIcon = <FaTimesCircle className="text-danger ms-auto" size={18} />;
                                    }
                                } else if (isSelected) {
                                    itemBorder = '2px solid #3b82f6';
                                    itemBg = '#eff6ff';
                                }

                                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                                const label = letters[idx] || `${idx + 1}`;

                                return (
                                    <div
                                        key={ans.id || idx}
                                        onClick={() => handleSelectOption(ans.id)}
                                        className="p-3 rounded d-flex align-items-center gap-3"
                                        style={{
                                            border: itemBorder,
                                            backgroundColor: itemBg,
                                            cursor: isChecked ? 'default' : 'pointer',
                                            transition: 'all 0.15s ease-in-out'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: isSingleChoice ? '50%' : '6px',
                                                border: `2px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                                                backgroundColor: isSelected ? '#3b82f6' : '#fff',
                                                color: isSelected ? '#fff' : '#64748b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                flexShrink: 0
                                            }}
                                        >
                                            {label}
                                        </div>
                                        <div className="flex-grow-1 text-dark" style={{ fontSize: '0.96rem' }}>
                                            {ans.description || '(Phương án trống)'}
                                        </div>
                                        {statusIcon}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Result Banner when checked */}
                        {isChecked && (
                            <div
                                className={`alert ${isCorrectResult ? 'alert-success' : 'alert-danger'} mt-4 mb-0 d-flex align-items-center gap-2`}
                            >
                                <FaLightbulb size={20} />
                                <div>
                                    <strong>{isCorrectResult ? '🎉 Thí sinh trả lời ĐÚNG!' : '❌ Thí sinh trả lời SAI!'}</strong>
                                    <div style={{ fontSize: '0.88rem' }}>
                                        {isCorrectResult
                                            ? 'Câu trả lời đã được hệ thống ghi nhận điểm tuyệt đối.'
                                            : 'Đáp án chính xác được đánh dấu màu xanh viền nổi bật.'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    {isChecked ? (
                        <Button variant="outline-secondary" size="sm" onClick={handleResetTest} className="d-flex align-items-center gap-1">
                            <FaRedo size={12} />
                            <span>Làm lại thử nghiệm</span>
                        </Button>
                    ) : (
                        <small className="text-muted">
                            💡 Hãy thử nhấp vào các phương án để kiểm tra trải nghiệm thí sinh
                        </small>
                    )}
                </div>
                <div className="d-flex gap-2">
                    {!isChecked && selectedAnswers.length > 0 && (
                        <Button variant="primary" onClick={() => setIsChecked(true)}>
                            Kiểm tra kết quả
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng xem trước
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalPreviewQuestion;
