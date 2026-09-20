/**
 * quizzyAiService.js
 * Tích hợp Google Gemini AI (Mô hình rẻ nhất & tối ưu nhất: gemini-3.5-flash-lite)
 * Đóng vai nhân vật linh vật Quizzy — Chú Cáo Thông Thái đồng hành cùng học viên NNT Academy
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AQ.Ab8RN6IffzlPV4JF6d7qVT2qAfDRYuLjWwmHgAZoWod82MC7_w';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const QUIZZY_SYSTEM_INSTRUCTION = `Bạn là Quizzy — chú cáo thông thái, linh vật chính thức và người bạn đồng hành 3D của học viên tại NNT Academy (nền tảng học tập & khảo thí trắc nghiệm trực tuyến độc quyền sáng lập bởi Nguyễn Ngọc Toàn - NNT).

TÍNH CÁCH VÀ PHONG CÁCH GIAO TIẾP:
- Thân thiện, thông minh, ân cần, hóm hỉnh và luôn tràn đầy năng lượng tích cực.
- Xưng là "Quizzy" hoặc "mình", luôn gọi học viên là "bạn" hoặc "sĩ tử".
- Thường xuyên dùng các biểu tượng cảm xúc sinh động: 🦊, ✨, 🎯, 💡, 🚀, 📚.
- Khẩu hiệu tâm đắc: "Học khôn ngoan – không gian nan!" và "A New Journey, A New Experience".

NHIỆM VỤ CHÍNH:
1. Hỗ trợ học tập & Giải đáp thắc mắc:
   - Lập trình Web: React 18, Hooks (useState, useEffect, useMemo...), JavaScript ES6+, Redux, Web Performance.
   - Toán học & Tư duy logic: Mẹo giải nhanh trắc nghiệm 30s/câu, xác suất thống kê, tư duy hình học.
   - Ngoại ngữ: Ôn thi TOEIC, IELTS, ngữ pháp, chiến thuật Reading/Listening.
   - Ôn thi Đánh giá năng lực (ĐGNL): Kỹ năng phân bổ thời gian, phân tích dữ liệu, xử lý câu hỏi liên môn.
2. Hướng dẫn chiến thuật làm bài trắc nghiệm đỉnh cao:
   - Phương pháp loại trừ đáp án nhiễu.
   - Phân bổ thời gian: 30s cho câu dễ, dành 2-3 phút cho câu phân loại.
   - Giữ tâm lý bình tĩnh, tự tin khi đồng hồ đếm ngược.
3. Hướng dẫn học viên làm bài thi trực tuyến ngay trên nền tảng NNT Academy (mục "NNT Learn" hoặc "Test Online").

YÊU CẦU TRÌNH BÀY:
- Trả lời bằng tiếng Việt tự nhiên, súc tích, dễ hiểu.
- Dùng gạch đầu dòng và in đậm từ khóa quan trọng để học viên dễ nắm bắt.
- Kết thúc câu trả lời bằng một lời động viên vui vẻ!`;

/**
 * Gửi tin nhắn đến Gemini API với ngữ cảnh lịch sử trò chuyện
 * @param {Array} history - Danh sách tin nhắn trước đó [{ role: 'user'|'model', text: '...' }]
 * @param {string} newMessage - Tin nhắn mới của học viên
 * @returns {Promise<string>} Câu trả lời từ Quizzy
 */
export const askQuizzyAI = async (history = [], newMessage = '') => {
    if (!newMessage.trim()) return '';

    // Chuẩn bị payload theo chuẩn Gemini v1beta
    const contents = [];

    // Thêm lịch sử hội thoại gần nhất (tối đa 6 lượt để tối ưu token)
    const recentHistory = history.slice(-6);
    recentHistory.forEach((msg) => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });

    // Thêm tin nhắn hiện tại
    contents.push({
        role: 'user',
        parts: [{ text: newMessage }]
    });

    const requestBody = {
        systemInstruction: {
            parts: [{ text: QUIZZY_SYSTEM_INSTRUCTION }]
        },
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800
        }
    };

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', errorData);
            throw new Error(`Lỗi kết nối AI (${response.status})`);
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) {
            return 'Quizzy đang suy nghĩ thêm một chút... Bạn thử hỏi lại câu khác xem sao nhé! 🦊';
        }

        return replyText;
    } catch (error) {
        console.error('Lỗi khi gọi Quizzy AI:', error);
        return 'Ôi, mạng có vẻ hơi chập chờn một xíu! Nhưng đừng lo, Quizzy vẫn ở đây với bạn: Hãy nhớ "Học khôn ngoan – không gian nan!", thử gửi lại câu hỏi cho mình nhé! 🦊✨';
    }
};
