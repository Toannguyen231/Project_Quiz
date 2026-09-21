import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaNewspaper,
    FaArrowLeft,
    FaTag,
    FaCalendarAlt,
    FaBookOpen,
    FaRegCommentDots,
    FaRedo,
    FaTimes,
    FaShareAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPosts, getPostDetail } from '../component/sevices/apiService';
import Skeleton from '../component/Common/Skeleton';
import './Pages.scss';

const Blog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const tags = ['all', 'TOEIC', 'VSTEP', 'Lập trình', 'Kỹ năng học'];

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const res = await getPosts(filter === 'all' ? null : filter);
            if (res && res.data && res.data.EC === 0 && Array.isArray(res.data.DT)) {
                setPosts(res.data.DT);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error('Lỗi tải bài viết blog:', error);
            setHasError(true);
            toast.error('Không thể tải bài viết blog. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleReadPost = async (post) => {
        setActivePost(post);
        setLoadingDetail(true);
        try {
            const res = await getPostDetail(post.id);
            if (res && res.data && res.data.EC === 0 && res.data.DT) {
                setActivePost(res.data.DT);
            }
        } catch (e) {
            // Keep basic post data if detail endpoint has issue
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Đã sao chép liên kết bài viết!');
        } else {
            toast.info('Bạn có thể chia sẻ liên kết trang này!');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-hero page-hero-violet">
                <div className="page-hero-inner">
                    <span className="page-eyebrow">NNT ACADEMY</span>
                    <h1>Blog Tin Tức &amp; Kinh Nghiệm Thi</h1>
                    <p>Bài viết từ đội ngũ giáo viên — tin tức, kinh nghiệm và chiến thuật ôn thi mới nhất.</p>
                </div>
            </div>

            <div className="page-container">
                <div className="page-filter-row">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            className={`page-filter-chip ${filter === tag ? 'active' : ''}`}
                            onClick={() => setFilter(tag)}
                        >
                            {tag === 'all' ? 'Tất cả' : tag}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="blog-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="blog-card">
                                <div className="d-flex gap-2 mb-2">
                                    <Skeleton width="60px" height="24px" borderRadius="999px" />
                                    <Skeleton width="80px" height="24px" />
                                </div>
                                <Skeleton width="90%" height="24px" className="mb-2" />
                                <Skeleton width="100%" height="60px" className="mb-3" />
                                <div className="d-flex justify-content-between mb-3">
                                    <Skeleton width="40%" height="16px" />
                                    <Skeleton width="30%" height="16px" />
                                </div>
                                <Skeleton width="120px" height="36px" borderRadius="999px" />
                            </div>
                        ))}
                    </div>
                ) : hasError ? (
                    <div className="page-empty-state">
                        <FaRedo className="page-empty-icon" />
                        <h3>Lỗi tải danh sách bài viết</h3>
                        <p>Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.</p>
                        <button className="page-btn page-btn-primary" onClick={fetchPosts}>
                            Thử lại ngay
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="page-empty-state">
                        <FaNewspaper className="page-empty-icon" />
                        <h3>Chưa có bài viết trong chuyên mục này</h3>
                        <p>Chúng tôi đang cập nhật thêm nội dung. Bạn hãy chọn chuyên mục khác nhé!</p>
                    </div>
                ) : (
                    <div className="blog-grid">
                        {posts.map(post => (
                            <article key={post.id} className={`blog-card ${post.featured ? 'featured' : ''}`}>
                                {post.featured && <span className="blog-featured-badge">⭐ Bài nổi bật</span>}
                                <div className="blog-tags">
                                    <span className="blog-tag"><FaTag /> {post.tag}</span>
                                    <span className="blog-date"><FaCalendarAlt /> {post.date}</span>
                                </div>
                                <h3>{post.title}</h3>
                                <p className="blog-excerpt">{post.excerpt}</p>
                                <div className="blog-footer">
                                    <span className="blog-author"><FaBookOpen /> {post.author}</span>
                                    <span className="blog-readtime"><FaRegCommentDots /> {post.readTime}</span>
                                </div>
                                <button
                                    type="button"
                                    className="page-btn page-btn-primary page-btn-sm align-self-start"
                                    onClick={() => handleReadPost(post)}
                                >
                                    Đọc bài viết →
                                </button>
                            </article>
                        ))}
                    </div>
                )}

                <div className="page-empty-state">
                    <FaNewspaper className="page-empty-icon" />
                    <h3>Đang cập nhật bài viết mới</h3>
                    <p>Đội ngũ NNT đang soạn thêm bài viết. Quay lại mỗi tuần để đọc tin mới nhất nhé!</p>
                    <button className="page-btn page-btn-ghost" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Về trang chủ
                    </button>
                </div>
            </div>

            {/* Modal Chi Tiết Bài Viết Blog */}
            {activePost && (
                <div className="page-modal-backdrop" onClick={() => setActivePost(null)}>
                    <div className="page-modal-card page-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="page-modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="blog-tag"><FaTag /> {activePost.tag}</span>
                                <span className="blog-date text-muted"><FaCalendarAlt /> {activePost.date}</span>
                            </div>
                            <button
                                type="button"
                                className="page-modal-close"
                                onClick={() => setActivePost(null)}
                                aria-label="Đóng"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="page-modal-body">
                            <h2 className="fs-3 fw-bold mb-3">{activePost.title}</h2>
                            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom text-muted fs-7">
                                <span><FaBookOpen className="me-1" /> Tác giả: <strong>{activePost.author}</strong></span>
                                <span><FaRegCommentDots className="me-1" /> Thời gian đọc: {activePost.readTime}</span>
                            </div>

                            {loadingDetail ? (
                                <div className="py-4">
                                    <Skeleton width="100%" height="20px" className="mb-2" />
                                    <Skeleton width="95%" height="20px" className="mb-2" />
                                    <Skeleton width="90%" height="20px" className="mb-4" />
                                    <Skeleton width="100%" height="20px" className="mb-2" />
                                    <Skeleton width="85%" height="20px" />
                                </div>
                            ) : (
                                <div className="blog-post-content">
                                    <p className="lead fw-normal text-muted mb-4">{activePost.excerpt}</p>
                                    <div className="article-body" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                                        {activePost.content || activePost.excerpt}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="page-modal-footer">
                            <button
                                type="button"
                                className="page-btn page-btn-ghost"
                                onClick={handleShare}
                            >
                                <FaShareAlt /> Chia sẻ
                            </button>
                            <button
                                type="button"
                                className="page-btn page-btn-primary"
                                onClick={() => setActivePost(null)}
                            >
                                Đã đọc xong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blog;