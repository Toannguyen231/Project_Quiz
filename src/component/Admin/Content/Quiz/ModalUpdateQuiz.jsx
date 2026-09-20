import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import _ from 'lodash';
import './ModalViewQuiz.scss';
import { FcPlus } from "react-icons/fc";
import { putUpdateQuiz } from '../../../sevices/apiService';
import { toast } from "react-toastify";
import '../Quiz/ModalUpdateQuiz.scss';

const ModalUpdateQuiz = (props) => {
    const { show, setShow, dataModal, resetUpdateDataModal, fetchListQuiz } = props;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quizType, setQuizType] = useState('EASY');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        setName('');
        setDescription('');
        setQuizType('EASY');
        setImage(null);
        setPreviewImage('');
        setShow(false);
        if (resetUpdateDataModal) resetUpdateDataModal();
    };

    const handleUploadImage = (event) => {
        const file = event.target && event.target.files && event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Tệp tải lên phải là hình ảnh (PNG, JPG, WEBP)!');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!');
                return;
            }
            setPreviewImage(URL.createObjectURL(file));
            setImage(file);
        } else {
            setImage(null);
            setPreviewImage('');
        }
    };

    const handleSaveUpdateQuiz = async () => {
        if (!name.trim()) {
            toast.warning('Tên bài thi không được để trống!');
            return;
        }

        try {
            setSubmitting(true);
            let res = await putUpdateQuiz(
                dataModal.id,
                description,
                name,
                quizType,
                image
            );
            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || "Cập nhật bài thi thành công!");
                handleClose();
                if (fetchListQuiz) await fetchListQuiz();
            } else {
                toast.error(res?.data?.EM || "Cập nhật bài thi thất bại!");
            }
        } catch (error) {
            console.error('Lỗi cập nhật quiz:', error);
            toast.error("Lỗi khi cập nhật bài thi");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (show && !_.isEmpty(dataModal)) {
            setName(dataModal.name || '');
            setDescription(dataModal.description || '');
            setQuizType(dataModal.difficulty || 'EASY');
            if (dataModal.image) {
                const src = dataModal.image.startsWith('data:') || dataModal.image.startsWith('http')
                    ? dataModal.image
                    : `data:image/jpeg;base64,${dataModal.image}`;
                setPreviewImage(src);
            } else {
                setPreviewImage('');
            }
            setImage(null);
        }
    }, [show, dataModal]);

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5 text-dark">
                    ✏️ Cập Nhật Bài Thi #{dataModal?.id}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="inputQuizName" className="form-label fw-semibold">
                            Tên bài thi <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputQuizName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="inputQuizType" className="form-label fw-semibold">
                            Độ khó
                        </label>
                        <select
                            id="inputQuizType"
                            className="form-select"
                            value={quizType}
                            onChange={(e) => setQuizType(e.target.value)}
                        >
                            <option value="EASY">Dễ (Easy)</option>
                            <option value="MEDIUM">Trung bình (Medium)</option>
                            <option value="HARD">Khó (Hard)</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label htmlFor="inputQuizDesc" className="form-label fw-semibold">
                            Mô tả bài thi
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputQuizDesc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="col-12">
                        <label className="label-upload" htmlFor="upload-quiz-photo" style={{ cursor: 'pointer' }}>
                            <FcPlus />
                            <span>Đổi ảnh bìa mới (&lt; 2MB)...</span>
                        </label>
                        <input
                            type="file"
                            id="upload-quiz-photo"
                            accept="image/*"
                            hidden
                            onChange={handleUploadImage}
                        />
                    </div>
                    <div className="col-12 d-flex justify-content-center">
                        <div
                            style={{
                                width: '100%',
                                maxHeight: '220px',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f8fafc',
                                padding: '10px',
                                overflow: 'hidden'
                            }}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Xem trước ảnh bìa đề thi"
                                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                                    className="img-preview"
                                />
                            ) : (
                                <span className="text-muted">Chưa có ảnh bìa</span>
                            )}
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={submitting}>
                    Hủy bỏ
                </Button>
                <Button variant="warning" onClick={handleSaveUpdateQuiz} disabled={submitting}>
                    {submitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUpdateQuiz;