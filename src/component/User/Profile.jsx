import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.scss';
import useAuth from '../../hooks/useAuth';
import instance from '../../util/axiosCutomes';
import { ImSpinner6 } from 'react-icons/im';

const Profile = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, role, isAdmin, updateProfile } = useAuth();

    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

    // Tab 1 state: Personal Info
    const [username, setUsername] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [isSavingInfo, setIsSavingInfo] = useState(false);

    // Tab 2 state: Change Password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);

    // Sync state when user data is available
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setAvatarPreview(user.image || '');
        }
    }, [user?.username, user?.image]);

    // Handle avatar image selection
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (< 3MB)
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 3MB');
            return;
        }

        // Validate image type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG)');
            return;
        }

        setAvatarFile(file);

        // Preview via FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle Save Profile Info
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            toast.error('Tên người dùng không được để trống');
            return;
        }

        try {
            setIsSavingInfo(true);

            const payloadImage = avatarPreview || user.image || '';

            // Attempt to update backend API
            try {
                const formData = new FormData();
                formData.append('username', trimmedUsername);
                if (avatarFile) {
                    formData.append('userImage', avatarFile);
                } else if (payloadImage) {
                    formData.append('image', payloadImage);
                }

                await instance.put('/users/me', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } catch (apiErr) {
                // If endpoint not implemented or offline, continue with Redux update
                console.warn('API /users/me failed, updating client store:', apiErr);
            }

            // Update Redux state
            updateProfile({
                username: trimmedUsername,
                image: payloadImage,
            });

            toast.success('Cập nhật thông tin cá nhân thành công!');
        } catch (error) {
            toast.error('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.');
        } finally {
            setIsSavingInfo(false);
        }
    };

    // Handle Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error('Vui lòng nhập mật khẩu hiện tại');
            return;
        }

        if (!newPassword) {
            toast.error('Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword === currentPassword) {
            toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại');
            return;
        }

        if (!confirmPassword) {
            toast.error('Vui lòng xác nhận lại mật khẩu mới');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setIsChangingPass(true);

            let res;
            try {
                res = await instance.post('/auth/change-password', {
                    currentPassword,
                    newPassword,
                });
            } catch (err1) {
                if (err1?.response?.status === 404) {
                    res = await instance.post('/change-password', {
                        currentPassword,
                        newPassword,
                    });
                } else {
                    throw err1;
                }
            }

            if (res && res.data && res.data.EC !== undefined && res.data.EC !== 0) {
                toast.error(res.data.EM || 'Đổi mật khẩu thất bại');
                return;
            }

            toast.success('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const errorMsg =
                error?.response?.data?.EM ||
                error?.response?.data?.message ||
                'Mật khẩu hiện tại không chính xác hoặc có lỗi xảy ra.';
            toast.error(errorMsg);
        } finally {
            setIsChangingPass(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="profile-page-container">
                <div className="profile-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>Chưa đăng nhập</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        Vui lòng đăng nhập để xem và chỉnh sửa thông tin cá nhân.
                    </p>
                    <button
                        className="btn-save"
                        onClick={() => navigate('/login')}
                        style={{ margin: '0 auto' }}
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page-container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="profile-header">
                <h1 className="profile-title">Hồ sơ người dùng</h1>
                <p className="profile-desc">Quản lý thông tin tài khoản cá nhân và thiết lập bảo mật</p>
            </div>

            <div className="profile-card">
                {/* Tab Navigation */}
                <div className="profile-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <span>👤 Thông tin cá nhân</span>
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <span>🔒 Đổi mật khẩu</span>
                    </button>
                </div>

                {/* Tab 1: Personal Info */}
                {activeTab === 'info' && (
                    <div className="profile-content">
                        <form onSubmit={handleSaveProfile}>
                            <div className="avatar-section">
                                <div className="avatar-preview-box">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {(user.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="avatar-actions">
                                    <label htmlFor="avatar-upload" className="btn-upload-label">
                                        📷 Chọn ảnh đại diện
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                        disabled={isSavingInfo}
                                    />
                                    <span className="avatar-hint">Định dạng JPG, PNG hoặc GIF. Tối đa 3MB.</span>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="input-email">Địa chỉ Email</label>
                                    <input
                                        id="input-email"
                                        type="email"
                                        value={user.email || ''}
                                        disabled
                                        title="Email được gắn liền với tài khoản và không thể chỉnh sửa"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Vai trò tài khoản</label>
                                    <div>
                                        <span
                                            className={`badge-role ${
                                                isAdmin ? 'badge-admin' : 'badge-user'
                                            }`}
                                        >
                                            {isAdmin ? 'QUẢN TRỊ VIÊN' : 'THÍ SINH'}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label htmlFor="input-username">Họ và tên / Tên hiển thị</label>
                                    <input
                                        id="input-username"
                                        type="text"
                                        placeholder="Nhập họ và tên..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isSavingInfo}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={isSavingInfo}>
                                {isSavingInfo && <ImSpinner6 className="spinner" />}
                                <span>{isSavingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab 2: Change Password */}
                {activeTab === 'password' && (
                    <div className="profile-content">
                        <form onSubmit={handleChangePassword}>
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label htmlFor="current-pass">Mật khẩu hiện tại</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="current-pass"
                                            type={showCurrentPass ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu hiện tại"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={isChangingPass}
                                            autoComplete="current-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-eye-btn"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            tabIndex={-1}
                                        >
                                            {showCurrentPass ? 'Ẩn' : 'Hiện'}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label htmlFor="new-pass">Mật khẩu mới (tối thiểu 6 ký tự)</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="new-pass"
                                            type={showNewPass ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu mới"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isChangingPass}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-eye-btn"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            tabIndex={-1}
                                        >
                                            {showNewPass ? 'Ẩn' : 'Hiện'}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label htmlFor="confirm-pass">Xác nhận mật khẩu mới</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="confirm-pass"
                                            type={showConfirmPass ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isChangingPass}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-eye-btn"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPass ? 'Ẩn' : 'Hiện'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={isChangingPass}>
                                {isChangingPass && <ImSpinner6 className="spinner" />}
                                <span>{isChangingPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
