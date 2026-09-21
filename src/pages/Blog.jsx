import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaNewspaper, FaArrowLeft, FaTag, FaCalendarAlt, FaBookOpen, FaRegCommentDots } from 'react-icons/fa';
import './Pages.scss';

// ── Dữ liệu mẫu bài viết Blog ──
const SAMPLE_POSTS = [
    {
        id: 1,
        title: 'Kinh nghiệm đạt 850+ TOEIC từ con số 0 trong 3 tháng',
        excerpt: 'Lộ trình chi tiết theo tuần: nghe chép chính tả, đọc song song, và cách chữa đề hiệu quả...',
        tag: 'TOEIC',
        date: '21/09/2026',
        readTime: '6 phút',
        author: 'Thầy Nguyễn Ngọc Toàn',
        featured: true,
    },
    {
        id: 2,
        title: 'Học React 2026: nên bắt đầu từ đâu để đi làm được ngay?',
        excerpt: 'Từ JavaScript core, ES6+, đến React 18, Vite, Redux Toolkit — lộ trình thực chiến 12 tuần...',
        tag: 'Lập trình',
        date: '18/09/2026',
        readTime: '8 phút',
        author: 'Thầy Nguyễn Ngọc Toàn',
        featured: false,
    },
    {
        id: 3,
        title: 'Bí kíp giữ chuỗi học tập không đứt — gamification thực chiến',
        excerpt: 'Chuỗi ngày học (streak) giúp bạn duy trì kỷ luật thế nào? Và mẹo để không phá vỡ chuỗi...',
        tag: 'Kỹ năng học',
        date: '15/09/2026',
        readTime: '5 phút',
        author: 'Cô Mai Anh',
        featured: false,
    },
    {
        id: 4,
        title: 'Cấu trúc đề thi VSTEP B1/B2 mới nhất 2026 và cách tính điểm',
        excerpt: 'Phân tích chi tiết 4 phần thi, thang điểm, và chiến thuật phân bổ thời gian cho từng phần...',
        tag: 'VSTEP',
        date: '10/09/2026',
        readTime: '7 phút',
        author: 'Cô Mai Anh',
        featured: false,
    },
];

const Blog = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const tags = ['all', 'TOEIC', 'VSTEP', 'Lập trình', 'Kỹ năng học'];
    const filtered = filter === 'all' ? SAMPLE_POSTS : SAMPLE_POSTS.filter(p => p.tag === filter);

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

                <div className="blog-grid">
                    {filtered.map(post => (
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
                            <button type="button" className="page-btn page-btn-primary page-btn-sm">
                                Đọc bài viết →
                            </button>
                        </article>
                    ))}
                </div>

                <div className="page-empty-state">
                    <FaNewspaper className="page-empty-icon" />
                    <h3>Đang cập nhật bài viết mới</h3>
                    <p>Đội ngũ NNT đang soạn thêm bài viết. Quay lại mỗi tuần để đọc tin mới nhất nhé!</p>
                    <button className="page-btn page-btn-ghost" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blog;