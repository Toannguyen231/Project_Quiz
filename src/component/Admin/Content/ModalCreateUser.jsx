import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaTrashAlt, FaUpload } from "react-icons/fa";
import { toast } from 'react-toastify';
import { postCreateUser } from '../../sevices/apiService';

function ModalCreateUser(props) {
    const { show, setShow, featchListUserWithPage, currentPage = 1, setCurrentPage } = props;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('USER');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setShow(false);
        setEmail('');
        setPassword('');
        setUsername('');
        setRole('USER');
        setImage(null);
        setPreviewImage('');
        setIsSubmitting(false);
    };

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

    const validateEmail = (emailStr) => {
        return String(emailStr)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmitCreateUser = async () => {
        // Validation
        const trimmedEmail = email.trim();
        const trimmedUsername = username.trim();

        if (!validateEmail(trimmedEmail)) {
            toast.error('Email không hợp lệ. Vui lòng nhập đúng định dạng!');
            return;
        }

        if (!password || password.length < 6) {
            toast.error('Mật khẩu không được để trống và phải có ít nhất 6 ký tự!');
            return;
        }

        if (!trimmedUsername || trimmedUsername.length < 2) {
            toast.error('Tên người dùng phải có ít nhất 2 ký tự!');
            return;
        }

        if (!['USER', 'ADMIN'].includes(role)) {
            toast.error('Vai trò người dùng không hợp lệ!');
            return;
        }

        try {
            setIsSubmitting(true);
            let res = await postCreateUser(trimmedEmail, password, trimmedUsername, role, image);

            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Tạo người dùng mới thành công!');
                handleClose();
                if (setCurrentPage) setCurrentPage(currentPage);
                if (featchListUserWithPage) {
                    await featchListUserWithPage(currentPage);
                }
            } else {
                toast.error(res?.data?.EM || 'Không thể tạo người dùng');
            }
        } catch (error) {
            console.error('Lỗi khi tạo người dùng:', error);
            toast.error('Đã xảy ra lỗi khi tạo tài khoản');
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
            className="modal-add-user"
        >
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5 text-dark">
                    👤 Thêm Thí Sinh / Quản Trị Viên Mới
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="createEmail" className="form-label fw-semibold">
                            Email <span className="text-danger">*</span>
                        </label>
                        <input
                            type="email"
                            id="createEmail"
                            className="form-control"
                            placeholder="example@quizmaster.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="createPassword" className="form-label fw-semibold">
                            Mật khẩu <span className="text-danger">* (tối thiểu 6 ký tự)</span>
                        </label>
                        <input
                            type="password"
                            id="createPassword"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="createUsername" className="form-label fw-semibold">
                            Họ và tên / Username <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            id="createUsername"
                            className="form-control"
                            placeholder="Nguyễn Văn A"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="createRole" className="form-label fw-semibold">
                            Vai trò hệ thống <span className="text-danger">*</span>
                        </label>
                        <select
                            id="createRole"
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
                            Ảnh đại diện (Avatar) <span className="text-muted fw-normal">(&lt; 2MB, JPG/PNG/WEBP)</span>
                        </label>
                        <div className="d-flex align-items-center gap-3">
                            <label className="btn btn-outline-secondary d-flex align-items-center gap-2 mb-0" htmlFor="upload-user-photo" style={{ cursor: 'pointer' }}>
                                <FaUpload />
                                <span>Tải ảnh lên...</span>
                            </label>
                            <input
                                type="file"
                                id="upload-user-photo"
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
                                    <span>Xóa ảnh</span>
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
                                    🖼 Chưa chọn ảnh xem trước
                                </span>
                            )}
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                    Hủy bỏ
                </Button>
                <Button variant="primary" onClick={handleSubmitCreateUser} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang tạo...' : 'Lưu người dùng'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCreateUser;