import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaTrashAlt, FaUpload } from "react-icons/fa";
import { toast } from 'react-toastify';
import { putUpdateUser } from '../../sevices/apiService';
import _ from "lodash";

function ModalUpdateUser(props) {
    const {
        show,
        setShow,
        dataUpdate,
        featchListUserWithPage,
        resetUpdateUser,
        currentPage = 1,
    } = props;

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('USER');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setShow(false);
        setEmail('');
        setUsername('');
        setRole('USER');
        setImage(null);
        setPreviewImage('');
        setIsSubmitting(false);
        if (resetUpdateUser) resetUpdateUser();
    };

    useEffect(() => {
        if (!_.isEmpty(dataUpdate)) {
            setEmail(dataUpdate.email || '');
            setUsername(dataUpdate.username || '');
            setRole(dataUpdate.role || 'USER');
            setImage(null);
            if (dataUpdate.image) {
                const src = dataUpdate.image.startsWith('data:') || dataUpdate.image.startsWith('http')
                    ? dataUpdate.image
                    : `data:image/jpeg;base64,${dataUpdate.image}`;
                setPreviewImage(src);
            } else {
                setPreviewImage('');
            }
        }
    }, [dataUpdate]);

    const handleUploadImage = (event) => {
        if (event.target && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            // Validate MIME type
            if (!file.type.startsWith('image/')) {
                toast.error('Tệp tải lên phải là hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)!');
                return;
            }

            // Validate size < 2MB
            const maxSizeInBytes = 2 * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                toast.error('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!');
                return;
            }

            setPreviewImage(URL.createObjectURL(file));
            setImage(file);
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage('');
        setImage(null);
    };

    const handleSubmitUpdateUser = async () => {
        const trimmedUsername = username.trim();

        if (!trimmedUsername || trimmedUsername.length < 2) {
            toast.error('Tên người dùng không được để trống và phải có ít nhất 2 ký tự!');
            return;
        }

        if (!['USER', 'ADMIN'].includes(role)) {
            toast.error('Vai trò người dùng không hợp lệ!');
            return;
        }

        try {
            setIsSubmitting(true);
            let res = await putUpdateUser(dataUpdate.id, trimmedUsername, role, image);

            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Cập nhật người dùng thành công!');
                handleClose();
                if (featchListUserWithPage) {
                    await featchListUserWithPage(currentPage);
                }
            } else {
                toast.error(res?.data?.EM || 'Không thể cập nhật thông tin người dùng');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật người dùng:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật tài khoản');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
            className="modal-update-user"
        >
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5 text-dark">
                    ✏️ Cập Nhật Thông Tin Người Dùng
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="updateEmail" className="form-label fw-semibold">
                            Email (Không thể thay đổi)
                        </label>
                        <input
                            type="email"
                            id="updateEmail"
                            className="form-control bg-light"
                            value={email}
                            disabled
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="updateUsername" className="form-label fw-semibold">
                            Họ và tên / Username <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            id="updateUsername"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="updateRole" className="form-label fw-semibold">
                            Vai trò hệ thống <span className="text-danger">*</span>
                        </label>
                        <select
                            id="updateRole"
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="USER">Thí sinh (USER)</option>
                            <option value="ADMIN">Quản trị viên (ADMIN)</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-semibold d-block">
                            Ảnh đại diện mới <span className="text-muted fw-normal">(&lt; 2MB, để trống nếu giữ ảnh cũ)</span>
                        </label>
                        <div className="d-flex align-items-center gap-3">
                            <label className="btn btn-outline-secondary d-flex align-items-center gap-2 mb-0" htmlFor="upload-update-photo" style={{ cursor: 'pointer' }}>
                                <FaUpload />
                                <span>Đổi ảnh đại diện...</span>
                            </label>
                            <input
                                type="file"
                                id="upload-update-photo"
                                accept="image/*"
                                hidden
                                onChange={handleUploadImage}
                            />
                            {previewImage && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                    onClick={handleRemoveImage}
                                >
                                    <FaTrashAlt size={12} />
                                    <span>Gỡ ảnh</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-12">
                        <div
                            style={{
                                height: '140px',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f8fafc',
                                overflow: 'hidden'
                            }}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Xem trước ảnh đại diện"
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    🖼 Người dùng chưa có ảnh đại diện
                                </span>
                            )}
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                    Đóng
                </Button>
                <Button variant="warning" onClick={handleSubmitUpdateUser} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalUpdateUser;