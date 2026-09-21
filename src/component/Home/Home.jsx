import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import nntLogo from '../../accets/nnt-logo.jpg';
import nntHeroBanner from '../../accets/nnt-hero-banner.jpg';
import mascotImg from '../../accets/quizzy-mascot.jpg';
import CloudShader from '../Common/CloudShader';
import { sendTelegramConsultation } from '../sevices/telegramService';
import Leaderboard from '../Common/Leaderboard';
import './Home.scss';

const Home = () => {
    const navigate = useNavigate();

    // Redux auth state to show admin shortcut only when user is ADMIN
    const account = useSelector(state => state.user?.account);
    const isAuthenticated = useSelector(state => state.user?.isAuthenticated);
    const isAdmin = account?.roles === 'ADMIN';

    // Active category for filtering courses & practice tests: 'all' | 'web' | 'logic' | 'language'
    const [activeCategory, setActiveCategory] = useState('all');

    // Form state for consultation
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        field: 'Frontend React & JavaScript',
        note: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitSuccessData, setSubmitSuccessData] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Tự động gửi thông tin học viên về Telegram Bot cá nhân
            await sendTelegramConsultation(formData);
            
            // Lưu dữ liệu vừa gửi để hiển thị trên Modal chúc mừng
            setSubmitSuccessData({ ...formData });
            setShowSuccessModal(true);

            // Reset form về rỗng sau khi gửi thành công
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                city: '',
                field: 'Frontend React & JavaScript',
                note: ''
            });
        } catch (error) {
            console.error('Lỗi khi gửi form tư vấn:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = [
        { val: '10 Năm', desc: 'Phát Triển & Khởi Tạo' },
        { val: '35+', desc: 'Bộ Đề & Khoá Học NNT' },
        { val: '100+', desc: 'Video & Bài Giảng Chọn Lọc' },
        { val: '20K+', desc: 'Học Viên Đã Tham Gia' },
        { val: '15K+', desc: 'Thí Sinh Đạt Chuẩn Xuất Sắc' },
        { val: 'Top 1', desc: 'Nền Tảng Thi Trắc Nghiệm' },
    ];

    const courses = [
        {
            id: 1,
            categoryKey: 'web',
            category: 'Lập Trình Web',
            icon: '💻',
            title: 'Luyện Thi React & JavaScript Chuyên Sâu',
            desc: 'Làm chủ kiến thức React 18, Hooks, Redux Toolkit, tối ưu hiệu năng và xử lý toàn bộ câu hỏi trắc nghiệm kỹ thuật phỏng vấn.',
            level: 'Trung Cấp - Nâng Cao'
        },
        {
            id: 2,
            categoryKey: 'web',
            category: 'Lập Trình Web',
            icon: '⚡',
            title: 'Backend Node.js & Cơ Sở Dữ Liệu Thực Chiến',
            desc: 'Thiết kế RESTful API chuẩn mực, tối ưu hóa cơ sở dữ liệu SQL/NoSQL và xử lý các bài toán kiến trúc hệ thống backend.',
            level: 'Trung Cấp'
        },
        {
            id: 3,
            categoryKey: 'logic',
            category: 'Tư Duy Logic',
            icon: '📐',
            title: 'Toán Học Tư Duy & Trắc Nghiệm Tốc Độ Cao',
            desc: 'Phương pháp giải nhanh trắc nghiệm 30s/câu, tư duy hình học, xác suất thống kê và thuật toán tối ưu điểm số.',
            level: 'Mọi Đối Tượng'
        },
        {
            id: 4,
            categoryKey: 'logic',
            category: 'Tư Duy Logic',
            icon: '🎯',
            title: 'Chinh Phục Kỳ Thi Đánh Giá Năng Lực (ĐGNL)',
            desc: 'Tổng hợp kiến thức liên môn Khoa học, Xã hội, Tư duy định lượng & định tính cho các kỳ thi tuyển sinh đại học hàng đầu.',
            level: 'Học Sinh Lớp 12 & Thí Sinh'
        },
        {
            id: 5,
            categoryKey: 'language',
            category: 'Ngoại Ngữ',
            icon: '🌍',
            title: 'Tiếng Anh Học Thuật & Chinh Phục TOEIC/IELTS',
            desc: 'Chiến thuật làm bài Reading, Listening, ngữ pháp chuẩn mực quốc tế cùng kho ngân hàng câu hỏi sát với đề thi thật.',
            level: 'Sơ Cấp - Nâng Cao'
        },
        {
            id: 6,
            categoryKey: 'language',
            category: 'Ngoại Ngữ',
            icon: '🎓',
            title: 'Luyện Thi VSTEP B1-B2 Chuẩn Châu Âu Cấp Tốc',
            desc: 'Nắm vững cấu trúc 4 kỹ năng VSTEP, mẹo làm bài trắc nghiệm đọc - nghe và ngân hàng đề thi bám sát thực tế.',
            level: 'Mọi Đối Tượng'
        }
    ];

    const practiceTests = [
        {
            id: 1,
            categoryKey: 'web',
            icon: '⚛️',
            title: 'Trắc Nghiệm Lập Trình Frontend React',
            questions: '30 Câu hỏi',
            time: '35 Phút',
            type: 'Có chấm điểm'
        },
        {
            id: 2,
            categoryKey: 'web',
            icon: '💻',
            title: 'Đề Thi Lập Trình Web & JavaScript Cơ Bản',
            questions: '40 Câu hỏi',
            time: '45 Phút',
            type: 'Miễn phí'
        },
        {
            id: 3,
            categoryKey: 'logic',
            icon: '🎯',
            title: 'Bộ Đề Thi Thử ĐGNL & Tư Duy Logic ĐHQG',
            questions: '50 Câu hỏi',
            time: '60 Phút',
            type: 'Đếm ngược'
        },
        {
            id: 4,
            categoryKey: 'logic',
            icon: '🧮',
            title: 'Tư Duy Logic & Toán Rời Rạc Chuyên Sâu',
            questions: '25 Câu hỏi',
            time: '30 Phút',
            type: 'Có lời giải'
        },
        {
            id: 5,
            categoryKey: 'language',
            icon: '🇬🇧',
            title: 'Bộ Đề Thi Thử Tiếng Anh Chuẩn Châu Âu',
            questions: '50 Câu hỏi',
            time: '60 Phút',
            type: 'Có lời giải'
        },
        {
            id: 6,
            categoryKey: 'language',
            icon: '🎧',
            title: 'Luyện Đề Nghe & Đọc TOEIC 750+ Cấp Tốc',
            questions: '40 Câu hỏi',
            time: '45 Phút',
            type: 'Có chấm điểm'
        }
    ];

    // Filter courses & tests based on activeCategory
    const filteredCourses = activeCategory === 'all' 
        ? courses 
        : courses.filter(item => item.categoryKey === activeCategory);

    const filteredPracticeTests = activeCategory === 'all' 
        ? practiceTests 
        : practiceTests.filter(item => item.categoryKey === activeCategory);

    // 10 Strategic Partners with clean, light-friendly branding
    const partners = [
        {
            id: 1,
            name: 'VTC',
            logo: (
                <svg width="52" height="26" viewBox="0 0 95 38" fill="none">
                    <path d="M4 6 L16 32 L24 32 L36 6 L28 6 L20 25 L12 6 Z" fill="#2563eb" />
                    <path d="M34 6 L52 6 L52 11 L45 11 L45 32 L39 32 L39 11 L34 11 Z" fill="#2563eb" />
                    <circle cx="72" cy="19" r="14" stroke="#2563eb" strokeWidth="3" strokeDasharray="22 10" fill="none" />
                    <circle cx="72" cy="19" r="8" stroke="#2563eb" strokeWidth="2.5" fill="none" />
                    <circle cx="72" cy="19" r="3" fill="#2563eb" />
                </svg>
            )
        },
        {
            id: 2,
            name: 'Vietnamnet',
            logo: (
                <svg width="65" height="26" viewBox="0 0 105 32" fill="none">
                    <path d="M6 4 L16 26 L22 12 L28 26 L38 4 L30 4 L25 18 L20 4 Z" fill="#dc2626" />
                    <circle cx="16" cy="7" r="3.5" fill="#dc2626" />
                    <text x="36" y="21" fill="#dc2626" fontSize="12.5" fontWeight="900" fontFamily="sans-serif">vietnamnet</text>
                </svg>
            )
        },
        {
            id: 3,
            name: 'Giáo Dục & Thời Đại',
            logo: (
                <svg width="65" height="26" viewBox="0 0 85 32" fill="none">
                    <text x="0" y="14" fill="#dc2626" fontSize="11" fontWeight="900" fontFamily="sans-serif">GIÁO DỤC</text>
                    <text x="0" y="27" fill="#ea580c" fontSize="10" fontWeight="800" fontFamily="sans-serif">&amp; THỜI ĐẠI</text>
                </svg>
            )
        },
        {
            id: 4,
            name: '24h',
            logo: (
                <svg width="55" height="26" viewBox="0 0 80 32" fill="none">
                    <circle cx="14" cy="16" r="12" fill="#65a30d" />
                    <circle cx="14" cy="16" r="8" fill="#ffffff" />
                    <path d="M14 10 L14 16 L18 16" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" />
                    <text x="30" y="22" fill="#1e293b" fontSize="17" fontWeight="900" fontFamily="sans-serif">24<tspan fill="#65a30d" fontSize="13">h</tspan></text>
                    <text x="31" y="30" fill="#64748b" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">24Giờ</text>
                </svg>
            )
        },
        {
            id: 5,
            name: 'Tuổi Trẻ Online',
            logo: (
                <svg width="65" height="26" viewBox="0 0 90 32" fill="none">
                    <text x="0" y="22" fill="#e11d48" fontSize="18" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">tuổitrẻ</text>
                </svg>
            )
        },
        {
            id: 6,
            name: 'Nhã Nam',
            logo: (
                <svg width="48" height="26" viewBox="0 0 65 32" fill="none">
                    <path d="M14 8 C14 4, 24 4, 28 8 C33 13, 28 20, 22 20 C16 20, 14 15, 14 8 Z" fill="#ea580c" />
                    <circle cx="17" cy="7" r="1.8" fill="#ffffff" />
                    <path d="M11 16 L8 22 L13 21 L18 24 L22 21" stroke="#ea580c" strokeWidth="1.8" fill="none" />
                    <text x="4" y="30" fill="#ea580c" fontSize="8" fontWeight="800" fontFamily="sans-serif">nhã nam</text>
                </svg>
            )
        },
        {
            id: 7,
            name: 'Alphabooks',
            logo: (
                <svg width="30" height="26" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#f97316" />
                    <path d="M5 16 Q16 7 27 16" stroke="#ffffff" strokeWidth="2.2" fill="none" />
                    <path d="M5 16 Q16 25 27 16" stroke="#ffffff" strokeWidth="2.2" fill="none" />
                    <path d="M16 2 L16 30" stroke="#ffffff" strokeWidth="2.2" />
                    <path d="M2 16 L30 16" stroke="#ffffff" strokeWidth="2.2" />
                </svg>
            )
        },
        {
            id: 8,
            name: 'Futurebook',
            logo: (
                <svg width="28" height="26" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="#7c3aed" />
                    <text x="6" y="23" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif">Fb</text>
                </svg>
            )
        },
        {
            id: 9,
            name: 'Edu2Review',
            logo: (
                <svg width="55" height="26" viewBox="0 0 75 32" fill="none">
                    <path d="M20 5 L35 12 L20 18 L5 12 Z" fill="#0284c7" />
                    <path d="M10 14 L10 21 C10 25, 30 25, 30 21 L30 14" fill="#0284c7" />
                    <path d="M35 12 L35 22" stroke="#0284c7" strokeWidth="1.8" />
                    <text x="2" y="30" fill="#0284c7" fontSize="8" fontWeight="700" fontFamily="sans-serif">Edu2Review</text>
                </svg>
            )
        },
        {
            id: 10,
            name: 'IUH',
            logo: (
                <svg width="35" height="26" viewBox="0 0 45 32" fill="none">
                    <path d="M8 5 L8 21 C8 25, 16 25, 16 21 L16 5 L23 5 L23 21 C23 30, 2 30, 2 21 L2 5 Z" fill="#1d4ed8" />
                    <path d="M18 5 L21 12 L24 5 Z" fill="#eab308" />
                </svg>
            )
        }
    ];

    return (
        <div className="nnt-homepage">
            {/* 1. Hero Section (TPP Academy Style with Aceternity Cloud Shader) */}
            <section className="tpp-hero-section">
                <div className="hero-cloud-shader-bg">
                    <CloudShader 
                        speed={0.7}
                        count={5}
                        cloudColor="#ffffff"
                        skyTopColor="#4338ca"
                        skyBottomColor="#ede9fe"
                    />
                    <div className="hero-cloud-gradient-mask" />
                </div>

                <div className="hero-container">
                    <div className="hero-left">
                        <h1 className="hero-title-main">
                            <span className="text-gradient-purple-orange">HỌC TẬP THÔNG MINH,</span>
                            <br />
                            <span className="text-gradient-gold">BỨT PHÁ ĐIỂM SỐ</span>
                        </h1>

                        <div className="hero-subheading">
                            NNT ACADEMY — HỌC KHÔN NGOAN, KHÔNG GIAN NAN
                        </div>

                        <p className="hero-description-text">
                            Hệ thống giáo dục &amp; luyện thi trắc nghiệm thông minh độc quyền <strong>NNT</strong>. 
                            Đồng hành cùng <strong>Quizzy</strong> — chú cáo thông thái giúp bạn làm chủ kiến thức, 
                            kiểm soát thời gian thi và bứt phá mọi mục tiêu học tập!
                        </p>

                        <div className="hero-btn-group">
                            <button className="btn-tpp-gradient" onClick={() => navigate('/user')}>
                                Khám Phá Khoá Học &amp; Đề Thi ➜
                            </button>
                            <button 
                                className="btn-tpp-outline" 
                                onClick={() => navigate('/user')}
                            >
                                ⚡ Làm Bài Thi Thử Ngay
                            </button>
                            {isAuthenticated && isAdmin && (
                                <button 
                                    className="btn-tpp-outline btn-admin-shortcut" 
                                    onClick={() => navigate('/admin')}
                                    title="Cổng Quản Trị Đề Thi &amp; Người Dùng"
                                >
                                    ⚙️ Cổng Quản Trị
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-banner-wrapper">
                            <img 
                                src={nntHeroBanner} 
                                alt="NNT Academy Hero Banner - Quizzy Studying" 
                                className="hero-banner-img"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. 6-Item Gold Stat Strip (Exact TPP Academy Component) */}
            <section className="tpp-stat-strip-section">
                <div className="stat-strip-box">
                    {stats.map((item, index) => (
                        <div key={index} className="stat-item">
                            <div className="stat-val">{item.val}</div>
                            <div className="stat-desc">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Category Filter Tabs for Courses & Practice Tests */}
            <div className="tpp-filter-tabs-container">
                <div className="filter-tabs-pill-group">
                    <button 
                        type="button"
                        className={`filter-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        <span className="tab-icon">🌟</span> Tất cả
                    </button>
                    <button 
                        type="button"
                        className={`filter-tab-btn ${activeCategory === 'web' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('web')}
                    >
                        <span className="tab-icon">💻</span> Lập trình Web
                    </button>
                    <button 
                        type="button"
                        className={`filter-tab-btn ${activeCategory === 'logic' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('logic')}
                    >
                        <span className="tab-icon">📐</span> Tư duy Logic
                    </button>
                    <button 
                        type="button"
                        className={`filter-tab-btn ${activeCategory === 'language' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('language')}
                    >
                        <span className="tab-icon">🌍</span> Ngoại ngữ
                    </button>
                </div>
            </div>

            {/* 3. Featured Courses Section */}
            <section className="tpp-courses-section" id="courses">
                <div className="tpp-section-header">
                    <h2 className="tpp-section-title">
                        <span className="text-gradient-purple-orange">KHOÁ HỌC NỔI BẬT NNT</span>
                    </h2>
                    <p className="tpp-section-sub">
                        Chương trình đào tạo tinh hoa được xây dựng và độc quyền phát triển bởi NNT Academy
                    </p>
                </div>

                <div className="courses-grid">
                    {filteredCourses.map(course => (
                        <div key={course.id} className="course-card">
                            <div className="course-card-banner">
                                {course.icon}
                            </div>
                            <div className="course-card-content">
                                <div>
                                    <span className="course-category-badge">{course.category}</span>
                                    <h3 className="course-name">{course.title}</h3>
                                    <p className="course-desc">{course.desc}</p>
                                </div>
                                <button className="btn-course-enroll" onClick={() => navigate('/user')}>
                                    Xem Chi Tiết &amp; Đăng Ký
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Practice Test Online Section */}
            <section className="tpp-practice-section" id="practice-tests">
                <div className="tpp-section-header">
                    <h2 className="tpp-section-title">
                        <span className="text-gradient-gold">THI THỬ TRỰC TUYẾN - TEST ONLINE</span>
                    </h2>
                    <p className="tpp-section-sub">
                        Trải nghiệm phòng thi thời gian thực với đồng hồ đếm ngược tự động nộp bài và xem lại phân tích chi tiết
                    </p>
                </div>

                <div className="tests-grid">
                    {filteredPracticeTests.map(test => (
                        <div key={test.id} className="test-card">
                            <div>
                                <div className="test-card-top">
                                    <span className="test-icon">{test.icon}</span>
                                    <h4 className="test-title">{test.title}</h4>
                                </div>
                                <div className="test-meta">
                                    <span>{test.questions}</span>
                                    <span>{test.time}</span>
                                    <span>{test.type}</span>
                                </div>
                            </div>
                            <button className="btn-start-test" onClick={() => navigate('/user')}>
                                Bắt Đầu Làm Bài ➜
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Partners Section (Clean Light Harmonious Theme) */}
            <section className="tpp-partners-section">
                <div className="partners-container">
                    <div className="partners-header">
                        <div className="partners-subtitle">CÁC ĐƠN VỊ ĐỒNG HÀNH CÙNG NNT</div>
                        <h2 className="partners-main-title">
                            "BÁO CHÍ &amp; TRUYỀN THÔNG - NHÀ XUẤT BẢN - ĐỐI TÁC GIÁO DỤC"
                        </h2>
                    </div>

                    <div className="partners-grid-10">
                        {partners.map(partner => (
                            <div key={partner.id} className="partner-card-light">
                                <div className="partner-logo-box">
                                    {partner.logo}
                                </div>
                                <div className="partner-name-text">
                                    {partner.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Gamification: Bảng vinh danh Top học viên xuất sắc (Leaderboard) */}
            <section className="tpp-leaderboard-section" style={{ maxWidth: '960px', margin: '0 auto 80px', padding: '0 20px' }}>
                <Leaderboard />
            </section>

            {/* 7. Consultation Form (Exact TPP Academy Layout) */}
            <section className="tpp-consult-section">
                <div className="consult-box">
                    <h2 className="consult-title">Đăng Ký Tư Vấn Lộ Trình Ôn Luyện Cùng NNT</h2>
                    <p className="consult-desc">
                        Để lại thông tin để nhận trọn bộ tài liệu đề thi độc quyền và được <strong>Quizzy</strong> cùng đội ngũ cố vấn NNT liên hệ miễn phí!
                    </p>

                    <form className="consult-form" onSubmit={handleFormSubmit}>
                        <div>
                            <input 
                                type="text" 
                                name="fullName"
                                required
                                placeholder="Họ và tên của bạn *" 
                                className="consult-input"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <input 
                                type="email" 
                                name="email"
                                required
                                placeholder="Địa chỉ Email *" 
                                className="consult-input"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <input 
                                type="tel" 
                                name="phone"
                                required
                                placeholder="Số điện thoại liên hệ *" 
                                className="consult-input"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <input 
                                type="text" 
                                name="city"
                                placeholder="Tỉnh / Thành phố sinh sống" 
                                className="consult-input"
                                value={formData.city}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-group-full">
                            <select 
                                name="field"
                                className="consult-input consult-select"
                                value={formData.field}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            >
                                <option value="Frontend React & JavaScript">💻 Lập Trình Web: Frontend React &amp; JS Chuyên Sâu</option>
                                <option value="Backend Node.js & Cơ Sở Dữ Liệu">⚡ Backend Node.js &amp; Database Thực Chiến</option>
                                <option value="Toán Học Tư Duy & Trắc Nghiệm Tốc Độ">📐 Toán Học Tư Duy &amp; Trắc Nghiệm Tốc Độ Cao</option>
                                <option value="Ôn Thi Đánh Giá Năng Lực (ĐGNL)">🎯 Chinh Phục Kỳ Thi Đánh Giá Năng Lực (ĐGNL)</option>
                                <option value="Tiếng Anh Học Thuật TOEIC / IELTS">🌍 Tiếng Anh Học Thuật &amp; TOEIC / IELTS 750+</option>
                                <option value="Luyện Thi VSTEP B1-B2">🎓 Luyện Thi VSTEP B1-B2 Chuẩn Châu Âu</option>
                            </select>
                        </div>
                        <div className="form-group-full">
                            <input 
                                type="text" 
                                name="note"
                                placeholder="Nhu cầu ôn thi cụ thể (ví dụ: Cần luyện đề thi thử cấp tốc, thi chứng chỉ...)" 
                                className="consult-input"
                                value={formData.note}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        <button type="submit" className="btn-submit-consult" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Đang gửi thông tin đến đội ngũ cố vấn...
                                </>
                            ) : (
                                'Nhận Tư Vấn Miễn Phí & Bộ Đề Thi Mẫu ➜'
                            )}
                        </button>
                    </form>
                </div>
            </section>

            {/* Modal Thông Báo Thành Công Cực Đẹp */}
            <Modal
                show={showSuccessModal}
                onHide={() => setShowSuccessModal(false)}
                centered
                dialogClassName="consult-success-modal-dialog"
            >
                <div className="consult-success-modal">
                    <div className="modal-mascot-badge">
                        <img src={mascotImg} alt="Quizzy Mascot" className="success-mascot-img" />
                        <span className="badge-party">🎉</span>
                    </div>

                    <h3 className="modal-title">Đăng Ký Tư Vấn Thành Công!</h3>
                    
                    <p className="modal-desc">
                        Cảm ơn bạn <strong>{submitSuccessData?.fullName}</strong>! NNT Academy và linh vật <strong>Quizzy</strong> đã nhận được thông tin đăng ký tư vấn lộ trình:
                    </p>

                    <div className="registration-summary-box">
                        <div className="summary-row">
                            <span className="row-label">📞 Số điện thoại:</span>
                            <span className="row-val">{submitSuccessData?.phone}</span>
                        </div>
                        <div className="summary-row">
                            <span className="row-label">✉️ Email nhận tài liệu:</span>
                            <span className="row-val">{submitSuccessData?.email}</span>
                        </div>
                        {submitSuccessData?.city && (
                            <div className="summary-row">
                                <span className="row-label">📍 Khu vực:</span>
                                <span className="row-val">{submitSuccessData?.city}</span>
                            </div>
                        )}
                        <div className="summary-row">
                            <span className="row-label">🎯 Lĩnh vực quan tâm:</span>
                            <span className="row-val">{submitSuccessData?.field}</span>
                        </div>
                    </div>

                    <p className="modal-subtext">
                        🦊 <em>Thông tin đã được chuyển tiếp đến Telegram của Giảng viên / Cố vấn học tập. Đội ngũ NNT Academy sẽ liên hệ trực tiếp với bạn trong thời gian sớm nhất!</em>
                    </p>

                    <button
                        type="button"
                        className="btn-close-success-modal"
                        onClick={() => setShowSuccessModal(false)}
                    >
                        Tuyệt Vời, Tôi Đã Hiểu! ✓
                    </button>
                </div>
            </Modal>

            {/* 7. Footer (Exact TPP Academy Structure) */}
            <footer className="tpp-footer pb-5">
                <div className="footer-grid">
                    {/* Col 1 */}
                    <div className="footer-col">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <img src={nntLogo} alt="NNT Academy Logo" style={{ width: '42px', height: '42px', borderRadius: '8px' }} />
                            <span style={{ fontFamily: 'var(--qm-font-heading)', fontWeight: '800', fontSize: '1.25rem', color: '#1e293b' }}>
                                NNT ACADEMY
                            </span>
                        </div>
                        <p className="footer-text">
                            Hệ thống giáo dục &amp; khảo thí trắc nghiệm trực tuyến thế hệ mới thuộc thương hiệu độc quyền <strong>NNT</strong> (Nguyễn Ngọc Toàn).
                        </p>
                        <p className="footer-text">
                            Sứ mệnh mang lại phương pháp học tập khôn ngoan, trải nghiệm thi trắc nghiệm mượt mà, minh bạch và hiệu quả hàng đầu.
                        </p>
                    </div>

                    {/* Col 2 */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Chương Trình Đào Tạo</h4>
                        <ul className="footer-links-list">
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>NNT Learn Lập Trình</a></li>
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Luyện Thi Trắc Nghiệm React</a></li>
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Ôn Thi Đánh Giá Năng Lực</a></li>
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Tiếng Anh Học Thuật Quốc Tế</a></li>
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Khảo Thí &amp; Cấp Chứng Chỉ</a></li>
                        </ul>
                    </div>

                    {/* Col 3 */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Hỗ Trợ Học Viên</h4>
                        <ul className="footer-links-list">
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Hướng Dẫn Làm Bài Thi</a></li>
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Quy Chế Tính Điểm &amp; Nộp Bài</a></li>
                            <li><a href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Cổng Quản Trị Giảng Viên</a></li>
                            <li><a href="https://github.com/Toannguyen231" target="_blank" rel="noreferrer">Tài Liệu Mã Nguồn Dự Án</a></li>
                            <li><a href="/user" onClick={(e) => { e.preventDefault(); navigate('/user'); }}>Điều Khoản Sử Dụng NNT</a></li>
                        </ul>
                    </div>

                    {/* Col 4 */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Liên Hệ &amp; Bản Quyền</h4>
                        <div className="footer-contact-item">
                            📍 Tòa Nhà NNT Innovation Center, Việt Nam
                        </div>
                        <div className="footer-contact-item">
                            📞 Hotline: 1900 6868 (8:00 - 21:00)
                        </div>
                        <div className="footer-contact-item">
                            ✉️ Email: contact@nntacademy.edu.vn
                        </div>
                        <div className="footer-contact-item">
                            🦊 Người bạn đồng hành: <strong>Quizzy Fox Mascot</strong>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <div className="footer-brand-mini">
                        <img src={nntLogo} alt="NNT Logo" />
                        <span>NNT Academy © {new Date().getFullYear()}</span>
                    </div>
                    <div>
                        Phát triển độc quyền bởi <strong>Nguyễn Ngọc Toàn (NNT)</strong>. Tất cả các quyền được bảo lưu.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
