import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import _ from "lodash";

function ViewUser(props) {
    const { show, setShow, dataUpdate, resetUpdateUser } = props;

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('USER');
    const [previewImage, setPreviewImage] = useState('');

    const handleClose = () => {
        setShow(false);
        if (resetUpdateUser) resetUpdateUser();
    };

    useEffect(() => {
        if (!_.isEmpty(dataUpdate)) {
            setEmail(dataUpdate.email || '');
            setUsername(dataUpdate.username || '');
            setRole(dataUpdate.role || 'USER');
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

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
            className="modal-view-user"
        >
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5 text-dark">
                    🔍 Chi Tiết Thông Tin Thí Sinh / Người Dùng
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row g-3">
                    <div className="col-12 col-md-4 text-center">
                        <div
                            style={{
                                width: '130px',
                                height: '130px',
                                borderRadius: '50%',
                                margin: '0 auto 12px',
                                overflow: 'hidden',
                                border: '3px solid #e2e8f0',
                                backgroundColor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Ảnh đại diện"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ fontSize: '2.5rem', color: '#94a3b8' }}>
                                    {(username || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span
                            className={`badge ${role === 'ADMIN' ? 'bg-primary' : 'bg-success'}`}
                            style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '14px' }}
                        >
                            {role}
                        </span>
                    </div>

                    <div className="col-12 col-md-8">
                        <div className="mb-3">
                            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                ID NGƯỜI DÙNG
                            </label>
                            <div className="form-control bg-light fw-bold text-dark">
                                #{dataUpdate?.id || '--'}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                HỌ VÀ TÊN / USERNAME
                            </label>
                            <div className="form-control bg-light text-dark">
                                {username || '--'}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                ĐỊA CHỈ EMAIL
                            </label>
                            <div className="form-control bg-light text-dark">
                                {email || '--'}
                            </div>
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
}

export default ViewUser;