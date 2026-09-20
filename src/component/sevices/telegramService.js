/**
 * telegramService.js
 * Tiện ích tích hợp Telegram Bot API để tự động thông báo đăng ký tư vấn lộ trình
 * Dự án NNT Academy
 */

// Hàm bảo vệ chống lỗi parse HTML của Telegram khi người dùng nhập ký tự đặc biệt (<, >, &, ...)
const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Gửi thông tin đăng ký tư vấn về Telegram cá nhân/nhóm qua Telegram Bot
 * @param {Object} data - Dữ liệu form đăng ký
 * @param {string} data.fullName - Họ và tên học viên
 * @param {string} data.phone - Số điện thoại
 * @param {string} data.email - Email
 * @param {string} data.city - Tỉnh / Thành phố
 * @param {string} data.field - Lĩnh vực quan tâm
 * @param {string} data.note - Lời nhắn / Nhu cầu
 * @returns {Promise<{success: boolean, message?: string, isMock?: boolean}>}
 */
export const sendTelegramConsultation = async (data) => {
    const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

    // Thời gian đăng ký thực tế theo múi giờ Việt Nam
    const currentTime = new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Nội dung tin nhắn HTML đẹp mắt, chuyên nghiệp
    const message = `🔔 <b>CÓ HỌC VIÊN ĐĂNG KÝ TƯ VẤN MỚI!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Họ tên:</b> ${escapeHtml(data.fullName)}
📞 <b>Số điện thoại:</b> ${escapeHtml(data.phone)}
✉️ <b>Email:</b> ${escapeHtml(data.email)}
📍 <b>Khu vực:</b> ${escapeHtml(data.city || 'Chưa cung cấp')}
🎯 <b>Lĩnh vực quan tâm:</b> ${escapeHtml(data.field || 'Frontend React & JavaScript')}
📝 <b>Lời nhắn:</b> ${escapeHtml(data.note || 'Không có')}
⏰ <b>Thời gian:</b> ${currentTime}
━━━━━━━━━━━━━━━━━━
🦊 <i>Thông báo tự động từ Hệ thống NNT Academy & Quizzy</i>`;

    // Kiểm tra cấu hình biến môi trường
    if (!botToken || !chatId || botToken.includes('YOUR_') || chatId.includes('YOUR_')) {
        console.warn(
            '⚠️ [Telegram Service] Chưa cấu hình REACT_APP_TELEGRAM_BOT_TOKEN hoặc REACT_APP_TELEGRAM_CHAT_ID trong .env!\n' +
            'Tin nhắn giả lập sẽ hiển thị ở đây:\n',
            message
        );
        // Trả về thành công chế độ dev/mock để không làm gián đoạn trải nghiệm người dùng
        return {
            success: true,
            isMock: true,
            message: 'Đã xử lý thông tin thành công (chế độ demo - chưa cấu hình Telegram Bot Token trong .env)'
        };
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();

        if (result.ok) {
            return {
                success: true,
                message: 'Đã gửi thông báo đến Telegram thành công!'
            };
        } else {
            console.error('Lỗi từ Telegram API:', result);
            return {
                success: false,
                message: result.description || 'Không thể gửi tin nhắn đến Telegram.'
            };
        }
    } catch (error) {
        console.error('Lỗi kết nối Telegram API:', error);
        return {
            success: false,
            message: error.message || 'Lỗi mạng khi kết nối Telegram API.'
        };
    }
};
