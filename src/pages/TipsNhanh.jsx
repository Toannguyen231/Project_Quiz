import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaPlayCircle,
    FaLightbulb,
    FaClock,
    FaArrowLeft,
    FaStar,
    FaRedo,
    FaTimes,
    FaCheck,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getTips } from '../component/sevices/apiService';
import Skeleton from '../component/Common/Skeleton';
import './Pages.scss';

const TipsNhanh = () => {
    const navigate = useNavigate();
    const [tips, setTips] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeVideo, setActiveVideo] = useState(null);

    const categories = ['all', 'TOEIC', 'VSTEP', 'Lập trình', 'Kỹ năng học'];

    const fetchTips = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const res = await getTips(filter === 'all' ? null : filter);
            if (res && res.data && res.data.EC === 0 && Array.isArray(res.data.DT)) {
                setTips(res.data.DT);
            } else {
                setTips([]);
            }
        } catch (error) {
            console.error('Lỗi tải danh sách tips:', error);
            setHasError(true);
            toast.error('Không thể tải video tips. Vui lòng kiểm tra kết nối!');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchTips();
    }, [fetchTips]);

    return (
        <div className="page-wrap">
            <div className="page-hero page-hero-amber">
                <div className="page-hero-inner">
                    <span className="page-eyebrow">NNT ACADEMY</span>
                    <h1>Tips Nhanh — Video &amp; Bí Kíp Ôn Thi</h1>
                    <p>Video ngắn, mẹo thực chiến từ giáo viên NNT — xem xong áp dụng được ngay.</p>
                </div>
            </div>

            <div className="page-container">
                <div className="page-filter-row">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`page-filter-chip ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat === 'all' ? 'Tất cả' : cat}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="tips-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="tip-card">
                                <Skeleton width="100%" height="180px" borderRadius="18px 18px 0 0" />
                                <div className="p-3">
                                    <Skeleton width="40%" height="16px" className="mb-2" />
                                    <Skeleton width="85%" height="22px" className="mb-2" />
                                    <Skeleton width="100%" height="36px" className="mb-3" />
                                    <Skeleton width="30%" height="32px" borderRadius="999px" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : hasError ? (
                    <div className="page-empty-state">
                        <FaRedo className="page-empty-icon" />
                        <h3>Lỗi tải danh sách bí kíp</h3>
                        <p>Không thể kết nối đến máy chủ. Vui lòng thử lại.</p>
                        <button className="page-btn page-btn-primary" onClick={fetchTips}>
                            Thử lại ngay
                        </button>
                    </div>
                ) : tips.length === 0 ? (
                    <div className="page-empty-state">
                        <FaLightbulb className="page-empty-icon" />
                        <h3>Không tìm thấy nội dung phù hợp</h3>
                        <p>Chưa có video mẹo nào trong danh mục này. Hãy thử chọn danh mục khác nhé!</p>
                    </div>
                ) : (
                    <div className="tips-grid">
                        {tips.map(tip => (
                            <div key={tip.id} className={`tip-card ${tip.featured ? 'featured' : ''}`}>
                                {tip.featured && (
                                    <span className="tip-featured-badge"><FaStar /> Nổi bật</span>
                                )}
                                <div className="tip-thumb" onClick={() => setActiveVideo(tip)}>
                                    <FaPlayCircle className="tip-play" />
                                    <span className="tip-duration"><FaClock /> {tip.duration}</span>
                                </div>
                                <div className="tip-body">
                                    <div className="tip-tags">
                                        <span className="tip-category">{tip.category}</span>
                                        <span className="tip-level">{tip.level}</span>
                                    </div>
                                    <h3>{tip.title}</h3>
                                    <p>{tip.description}</p>
                                    <button
                                        type="button"
                                        className="page-btn page-btn-primary page-btn-sm"
                                        onClick={() => setActiveVideo(tip)}
                                    >
                                        <FaPlayCircle /> Xem ngay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="page-empty-state">
                    <FaLightbulb className="page-empty-icon" />
                    <h3>Sắp có thêm video mới</h3>
                    <p>Đội ngũ NNT đang sản xuất thêm loạt video mẹo ôn thi cho TOEIC, VSTEP và lập trình. Quay lại sau nhé!</p>
                    <button className="page-btn page-btn-ghost" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Về trang chủ
                    </button>
                </div>
            </div>

            {/* Modal Xem Video Chi Tiết */}
            {activeVideo && (
                <div className="page-modal-backdrop" onClick={() => setActiveVideo(null)}>
                    <div className="page-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="page-modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="tip-category">{activeVideo.category}</span>
                                <span className="tip-level">{activeVideo.level}</span>
                            </div>
                            <button
                                type="button"
                                className="page-modal-close"
                                onClick={() => setActiveVideo(null)}
                                aria-label="Đóng"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="page-modal-body">
                            <h3 className="fs-5 fw-bold mb-3">{activeVideo.title}</h3>
                            <div className="tip-video-container mb-3">
                                <div className="tip-video-placeholder">
                                    <FaPlayCircle className="fs-1 text-white opacity-75" />
                                    <p className="mt-2 text-white fw-bold mb-0">Video bài giảng: {activeVideo.duration}</p>
                                    <span className="text-white-50 fs-7">Giảng viên: NNT Academy Team</span>
                                </div>
                            </div>
                            <div className="tip-notes p-3 rounded-3 mb-3 bg-light">
                                <h6 className="fw-bold mb-2 text-primary">Tóm tắt nội dung chính:</h6>
                                <p className="mb-2 text-muted">{activeVideo.description}</p>
                                <ul className="list-unstyled mb-0 d-grid gap-2 text-muted fs-7">
                                    <li><FaCheck className="text-success me-2" /> Áp dụng ngay vào các bài kiểm tra thực chiến.</li>
                                    <li><FaCheck className="text-success me-2" /> Lưu ý bẫy thường gặp trong đề thi chuẩn hóa.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="page-modal-footer">
                            <button
                                type="button"
                                className="page-btn page-btn-ghost"
                                onClick={() => setActiveVideo(null)}
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="page-btn page-btn-primary"
                                onClick={() => {
                                    setActiveVideo(null);
                                    navigate('/user');
                                }}
                            >
                                Luyện đề ngay ➜
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TipsNhanh;