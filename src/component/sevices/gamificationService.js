/**
 * gamificationService.js
 * Quản lý tính năng Game hóa học tập (Gamification):
 * 1. Daily Streak 🔥: Theo dõi chuỗi ngày học tập liên tiếp
 * 2. Celebration Effect 🎉: Pháo hoa giấy confetti khi đạt điểm cao (>= 80%)
 * 3. Leaderboard 🏆: Dữ liệu bảng vinh danh Top học viên xuất sắc
 */

const STREAK_KEY = 'nnt_daily_streak';
export const STREAK_EVENT = 'NNT_STREAK_UPDATED';

/**
 * Lấy chuỗi ngày hiện tại theo định dạng YYYY-MM-DD
 */
export const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Tính số ngày chênh lệch giữa hai chuỗi ngày YYYY-MM-DD
 */
const getDayDifference = (dateStr1, dateStr2) => {
    if (!dateStr1 || !dateStr2) return null;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Lấy thông tin chuỗi ngày học tập hiện tại
 * @returns {{ streak: number, lastCompletedDate: string|null, isActiveToday: boolean }}
 */
export const getStreakInfo = () => {
    try {
        const raw = localStorage.getItem(STREAK_KEY);
        const today = getLocalDateString();

        if (!raw) {
            return { streak: 1, lastCompletedDate: null, isActiveToday: false };
        }

        const data = JSON.parse(raw);
        const { streak = 1, lastCompletedDate = null } = data;

        if (!lastCompletedDate) {
            return { streak: 1, lastCompletedDate: null, isActiveToday: false };
        }

        const diff = getDayDifference(lastCompletedDate, today);

        if (diff === 0) {
            // Đã hoàn thành ít nhất 1 bài quiz hôm nay
            return { streak: Math.max(1, streak), lastCompletedDate, isActiveToday: true };
        } else if (diff === 1) {
            // Ngày hôm qua có học, hôm nay chưa làm bài -> Chuỗi vẫn giữ, chờ học viên làm bài
            return { streak: Math.max(1, streak), lastCompletedDate, isActiveToday: false };
        } else {
            // Đứt quãng quá 1 ngày -> Chuỗi bị gián đoạn, reset về 1
            return { streak: 1, lastCompletedDate, isActiveToday: false };
        }
    } catch (e) {
        console.warn('Lỗi đọc streak từ LocalStorage:', e);
        return { streak: 1, lastCompletedDate: null, isActiveToday: false };
    }
};

/**
 * Ghi nhận hoàn thành bài quiz để tăng hoặc duy trì Streak
 * @returns {{ streak: number, isNewStreakDay: boolean }}
 */
export const recordQuizCompletion = () => {
    try {
        const today = getLocalDateString();
        const raw = localStorage.getItem(STREAK_KEY);
        let streak = 1;
        let lastCompletedDate = null;
        let isNewStreakDay = false;

        if (raw) {
            const data = JSON.parse(raw);
            streak = data.streak || 1;
            lastCompletedDate = data.lastCompletedDate;
        }

        if (lastCompletedDate === today) {
            // Đã tính streak cho ngày hôm nay rồi, không tăng thêm
            isNewStreakDay = false;
        } else if (lastCompletedDate) {
            const diff = getDayDifference(lastCompletedDate, today);
            if (diff === 1) {
                // Làm bài trong ngày kế tiếp liên tiếp -> Tăng streak lên 1
                streak += 1;
                isNewStreakDay = true;
            } else {
                // Đứt quãng quá 1 ngày -> Bắt đầu lại chuỗi mới = 1
                streak = 1;
                isNewStreakDay = true;
            }
        } else {
            // Lần đầu tiên hoàn thành bài quiz
            streak = 1;
            isNewStreakDay = true;
        }

        const newStreakData = {
            streak,
            lastCompletedDate: today,
            updatedAt: Date.now()
        };

        localStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData));

        // Bắn sự kiện để Header (Nav) và các component khác tự động cập nhật ngay
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(STREAK_EVENT, {
                detail: { streak, isNewStreakDay, today }
            }));
        }

        return { streak, isNewStreakDay };
    } catch (e) {
        console.warn('Lỗi lưu streak vào LocalStorage:', e);
        return { streak: 1, isNewStreakDay: false };
    }
};

/**
 * Hiệu ứng pháo hoa giấy (Confetti Celebration) khi đạt điểm cao (>= 80%)
 */
export const triggerCelebrationConfetti = async () => {
    try {
        let confetti = null;

        // Ưu tiên sử dụng canvas-confetti từ npm package nếu có
        try {
            const confettiModule = require('canvas-confetti');
            confetti = confettiModule.default || confettiModule;
        } catch (e) {
            // Nếu chưa bundler nạp kịp, kiểm tra window.confetti
            if (typeof window !== 'undefined' && window.confetti) {
                confetti = window.confetti;
            }
        }

        // Nếu cả hai chưa có, nạp nhanh qua CDN script
        if (!confetti && typeof window !== 'undefined' && typeof document !== 'undefined') {
            if (!document.getElementById('canvas-confetti-script')) {
                const script = document.createElement('script');
                script.id = 'canvas-confetti-script';
                script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
                script.async = true;
                script.onload = () => {
                    if (window.confetti) {
                        launchConfettiCannon(window.confetti);
                    }
                };
                document.body.appendChild(script);
                return;
            } else if (window.confetti) {
                confetti = window.confetti;
            }
        }

        if (confetti) {
            launchConfettiCannon(confetti);
        }
    } catch (err) {
        console.warn('Không thể khởi tạo hiệu ứng confetti:', err);
    }
};

/**
 * Bắn pháo hoa giấy hai bên cánh gà màn hình tạo cảm giác ăn mừng chiến thắng
 */
const launchConfettiCannon = (confettiInstance) => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
    };

    function fire(particleRatio, opts) {
        confettiInstance({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    // Đợt 1: Bắn pháo chùm màu sắc đa dạng
    fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#6C63FF', '#FF9963', '#10b981', '#f59e0b', '#ec4899']
    });
    fire(0.2, {
        spread: 60,
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f97316']
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        colors: ['#fbbf24', '#f43f5e', '#a855f7']
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45
    });

    // Đợt 2: Bắn hai khẩu pháo từ góc dưới trái và phải
    setTimeout(() => {
        confettiInstance({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#6C63FF', '#f59e0b', '#10b981'],
            zIndex: 9999
        });
        confettiInstance({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#FF9963', '#ec4899', '#3b82f6'],
            zIndex: 9999
        });
    }, 250);
};

/**
 * Dữ liệu Mock Bảng Vinh Danh Top Học Viên (Leaderboard)
 */
export const LEADERBOARD_DATA = {
    weekly: [
        {
            rank: 1,
            name: 'Nguyễn Hoàng Nam',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            badge: 'Thủ khoa React',
            score: '980 / 1000',
            quizzesCount: 18,
            accuracy: 98,
            medal: '🥇'
        },
        {
            rank: 2,
            name: 'Trần Mai Anh',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
            badge: 'Thánh tốc độ 30s',
            score: '950 / 1000',
            quizzesCount: 15,
            accuracy: 95,
            medal: '🥈'
        },
        {
            rank: 3,
            name: 'Lê Quốc Bảo',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            badge: 'Chiến thần TOEIC',
            score: '920 / 1000',
            quizzesCount: 14,
            accuracy: 92,
            medal: '🥉'
        },
        {
            rank: 4,
            name: 'Phạm Minh Đức',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
            badge: 'Bậc thầy Thuật toán',
            score: '890 / 1000',
            quizzesCount: 12,
            accuracy: 89,
            medal: '4'
        },
        {
            rank: 5,
            name: 'Đặng Thu Thảo',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
            badge: 'Chuyên gia ĐGNL',
            score: '870 / 1000',
            quizzesCount: 11,
            accuracy: 87,
            medal: '5'
        }
    ],
    monthly: [
        {
            rank: 1,
            name: 'Trần Mai Anh',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
            badge: 'Thánh tốc độ 30s',
            score: '3,850 pts',
            quizzesCount: 52,
            accuracy: 97,
            medal: '🥇'
        },
        {
            rank: 2,
            name: 'Nguyễn Hoàng Nam',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            badge: 'Thủ khoa React',
            score: '3,720 pts',
            quizzesCount: 48,
            accuracy: 96,
            medal: '🥈'
        },
        {
            rank: 3,
            name: 'Vũ Đức Thành',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
            badge: 'Chiến thần TOEIC',
            score: '3,540 pts',
            quizzesCount: 45,
            accuracy: 93,
            medal: '🥉'
        },
        {
            rank: 4,
            name: 'Lê Quốc Bảo',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            badge: 'Bậc thầy Thuật toán',
            score: '3,410 pts',
            quizzesCount: 41,
            accuracy: 91,
            medal: '4'
        },
        {
            rank: 5,
            name: 'Hoàng Yến Nhi',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
            badge: 'Chuyên gia ĐGNL',
            score: '3,280 pts',
            quizzesCount: 39,
            accuracy: 89,
            medal: '5'
        }
    ]
};
