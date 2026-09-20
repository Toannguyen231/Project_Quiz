import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { deleteQuiz } from '../../../sevices/apiService';
import { toast } from 'react-toastify';
import { FaExclamationTriangle } from 'react-icons/fa';

const ModalDelete = (props) => {
    const { show, setShow, resetDeleteDataModal, fetchListQuiz, dataDelete } = props;
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        if (!submitting) {
            setShow(false);
            if (resetDeleteDataModal) resetDeleteDataModal();
        }
    };

    const handleConfirmDelete = async () => {
        if (!dataDelete || !dataDelete.id) {
            toast.error("Không tìm thấy thông tin đề thi cần xóa");
            return;
        }

        try {
            setSubmitting(true);
            let res = await deleteQuiz(dataDelete.id);
            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || "Xóa đề thi thành công!");
                handleClose();
                if (fetchListQuiz) await fetchListQuiz();
            } else {
                toast.error(res?.data?.EM || "Xóa đề thi thất bại!");
            }
        } catch (error) {
            console.error('Lỗi khi xóa đề thi:', error);
            toast.error("Đã xảy ra lỗi khi xóa đề thi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
        >
            <Modal.Header closeButton={!submitting}>
                <Modal.Title className="text-danger fw-bold fs-5 d-flex align-items-center gap-2">
                    <FaExclamationTriangle />
                    <span>Xác Nhận Xóa Đề Thi</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-2 text-dark">
                    Bạn có chắc chắn muốn xóa bài thi này không? Toàn bộ câu hỏi liên quan cũng sẽ bị gỡ bỏ.
                </p>
                <div className="p-3 bg-light rounded border">
                    <div><strong>Mã đề:</strong> #{dataDelete?.id}</div>
                    <div><strong>Tên đề thi:</strong> {dataDelete?.name || '--'}</div>
                    <div><strong>Mức độ:</strong> {dataDelete?.difficulty || 'EASY'}</div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={submitting}>
                    Hủy bỏ
                </Button>
                <Button variant="danger" onClick={handleConfirmDelete} disabled={submitting}>
                    {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalDelete;