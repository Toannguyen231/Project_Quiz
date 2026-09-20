import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { deleteUser } from '../../sevices/apiService';
import { toast } from 'react-toastify';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteUser = (props) => {
    const {
        show,
        setShow,
        featchListUserWithPage,
        dataDelete,
        currentPage = 1,
        setCurrentPage,
    } = props;

    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        if (!loading) setShow(false);
    };

    const handleConfirmDelete = async () => {
        if (!dataDelete || !dataDelete.id) {
            toast.error('Không tìm thấy thông tin người dùng cần xóa');
            return;
        }

        try {
            setLoading(true);
            const res = await deleteUser(dataDelete.id);

            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Đã xóa người dùng thành công!');
                handleClose();
                if (setCurrentPage) setCurrentPage(currentPage);
                if (featchListUserWithPage) {
                    await featchListUserWithPage(currentPage);
                }
            } else {
                toast.error(res?.data?.EM || 'Xóa người dùng thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            toast.error('Đã xảy ra lỗi trong quá trình xóa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={!!show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton={!loading}>
                <Modal.Title className="text-danger fw-bold fs-5 d-flex align-items-center gap-2">
                    <FaExclamationTriangle />
                    <span>Xác Nhận Xóa Người Dùng</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-2 text-dark">
                    Bạn có chắc chắn muốn xóa tài khoản người dùng này không? Hành động này không thể hoàn tác.
                </p>
                <div className="p-3 bg-light rounded border">
                    <div><strong>ID:</strong> #{dataDelete?.id}</div>
                    <div><strong>Tên tài khoản:</strong> {dataDelete?.username || '--'}</div>
                    <div><strong>Email:</strong> {dataDelete?.email || '--'}</div>
                    <div><strong>Vai trò:</strong> {dataDelete?.role || 'USER'}</div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Hủy bỏ
                </Button>
                <Button variant="danger" disabled={loading} onClick={handleConfirmDelete}>
                    {loading ? 'Đang xóa...' : 'Xóa tài khoản'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteUser;