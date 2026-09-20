import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import _ from 'lodash';
import './ModalViewQuiz.scss';

const ModalViewQuiz = (props) => {
    const { show, setShow, dataModal, resetViewDataModal } = props;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quizType, setQuizType] = useState('EASY');
    const [image, setImage] = useState(null);

    const handleClose = () => {
        setName('');
        setDescription('');
        setQuizType('EASY');
        setImage(null);
        setShow(false);
        if (resetViewDataModal) resetViewDataModal();
    };

    useEffect(() => {
        if (show && !_.isEmpty(dataModal)) {
            setName(dataModal.name || '');
            setDescription(dataModal.description || '');
            setQuizType(dataModal.difficulty || 'EASY');
            setImage(dataModal.image || null);
        }
    }, [show, dataModal]);

    const getDifficultyLabel = (diff) => {
        switch ((diff || '').toUpperCase()) {
            case 'EASY': return 'Dễ (Easy)';
            case 'MEDIUM': return 'Trung bình (Medium)';
            case 'HARD': return 'Khó (Hard)';
            default: return diff || 'Chưa xác định';
        }
    };

    const imageSrc = image
        ? (image.startsWith('data:') || image.startsWith('http') ? image : `data:image/jpeg;base64,${image}`)
        : null;

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5 text-dark">
                    🔍 Chi Tiết Đề Thi #{dataModal?.id}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                            TÊN BÀI THI
                        </label>
                        <div className="form-control bg-light fw-bold text-dark">
                            {name || '--'}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                            MỨC ĐỘ KHÓ
                        </label>
                        <div className="form-control bg-light text-dark">
                            {getDifficultyLabel(quizType)}
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                            MÔ TẢ NỘI DUNG
                        </label>
                        <div className="form-control bg-light text-dark" style={{ minHeight: '60px' }}>
                            {description || 'Không có mô tả'}
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                            ẢNH BÌA ĐỀ THI
                        </label>
                        <div
                            style={{
                                width: '100%',
                                maxHeight: '240px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f8fafc',
                                padding: '12px',
                                overflow: 'hidden'
                            }}
                        >
                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt="Ảnh minh họa đề thi"
                                    style={{ maxHeight: '210px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <span className="text-muted">Đề thi chưa có ảnh bìa</span>
                            )}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalViewQuiz;