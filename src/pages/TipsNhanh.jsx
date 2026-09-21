import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlayCircle, FaLightbulb, FaClock, FaArrowLeft, FaBookOpen, FaStar } from 'react-icons/fa';
import './Pages.scss';

// ── Dữ liệu mẫu Tips (sẽ nối YouTube/backend ở Phase sau) ──
const SAMPLE_TIPS = [
    {
        id: 1,
        title: 'Mẹo làm trắc nghiệm TOEIC Reading trong 30 giây',
        category: 'TOEIC',
        duration: '8:24',
        level: 'Mọi trình độ',
        description: 'Chiến thuật đọc lướt (skimming) + bẫy từ đồng nghĩa — tăng tốc độ mà không mất điểm.',
        featured: true,
    },
    {
        id: 2,
        title: 'Cách bấm giờ ôn thi hiệu quả với phương pháp Pomodoro',
        category: 'Kỹ năng học',
        duration: '5:12',
        level: 'Mọi trình độ',
        description: 'Chia nhỏ phiên ôn 25 phút, nghỉ 5 phút — giữ não tỉnh táo và nhớ lâu hơn.',
        featured: false,
    },
    {
        id: 3,
        title: 'Giải nhanh câu hỏi VSTEP Listening — bẫy "nghe thấy là chọn"',
        category: 'VSTEP',
        duration: '11:05',
        level: 'B1 – B2',
        description: 'Nhận diện 4 dạng bẫy kinh điển trong đề nghe VSTEP và cách né chúng.',
        featured: false,
    },
    {
        id: 4,
        title: 'React Hook dễ hiểu: useEffect thực chiến (có ví dụ quiz)',
        category: 'Lập trình',
        duration: '14:40',
        level: 'Frontend',
        description: 'Hiểu dependency array, cleanup, và tránh infinite loop — qua ví dụ quiz thật.',
        featured: false,
    },
];

const TipsNhanh = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const categories = ['all', 'TOEIC', 'VSTEP', 'Lập trình', 'Kỹ năng học'];
    const filtered = filter === 'all' ? SAMPLE_TIPS : SAMPLE_TIPS.filter(t => t.category === filter);

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

                <div className="tips-grid">
                    {filtered.map(tip => (
                        <div key={tip.id} className={`tip-card ${tip.featured ? 'featured' : ''}`}>
                            {tip.featured && (
                                <span className="tip-featured-badge"><FaStar /> Nổi bật</span>
                            )}
                            <div className="tip-thumb">
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
                                <button type="button" className="page-btn page-btn-primary page-btn-sm">
                                    <FaPlayCircle /> Xem ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="page-empty-state">
                    <FaLightbulb className="page-empty-icon" />
                    <h3>Sắp có thêm video mới</h3>
                    <p>Đội ngũ NNT đang sản xuất thêm loạt video mẹo ôn thi cho TOEIC, VSTEP và lập trình. Quay lại sau nhé!</p>
                    <button className="page-btn page-btn-ghost" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TipsNhanh;