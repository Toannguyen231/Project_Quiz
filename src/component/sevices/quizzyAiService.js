/**
 * quizzyAiService.js
 * Tích hợp Google Gemini AI (Mô hình rẻ nhất & tối ưu nhất: gemini-3.5-flash-lite)
 * Đóng vai nhân vật linh vật Quizzy — Chú Cáo Thông Thái đồng hành cùng học viên NNT Academy
 */

/**
 * quizzyAiService.js
 * Tích hợp Google Gemini AI (Gia sư ảo Quizzy cho học viên NNT Academy)
 * 
 * BẢO MẬT: API Key được đọc trực tiếp từ biến môi trường REACT_APP_GEMINI_API_KEY
 * Tuyệt đối không hardcode API key vào mã nguồn.
 */

// Lấy API Key an toàn từ biến môi trường
export const getGeminiApiKey = () => {
    return process.env.REACT_APP_GEMINI_API_KEY || '';
};

// Model tối ưu: gemini-1.5-flash (tốc độ cao, chi phí rẻ, phản hồi nhanh)
const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash';

export const QUIZZY_EVENT_ASK = 'QUIZZY_ASK_QUESTION';

/**
 * Kích hoạt mở khung chat Quizzy và tự động gửi prompt giải thích
 * @param {string} prompt - Nội dung câu hỏi/yêu cầu giải thích
 */
export const triggerQuizzyChat = (prompt) => {
    if (typeof window !== 'undefined' && prompt) {
        const event = new CustomEvent(QUIZZY_EVENT_ASK, {
            detail: { prompt: prompt.trim() }
        });
        window.dispatchEvent(event);
    }
};

const QUIZZY_SYSTEM_INSTRUCTION = `Bạn là Quizzy — chú cáo thông thái, linh vật chính thức và người bạn đồng hành 3D của học viên tại NNT Academy (nền tảng học tập & khảo thí trắc nghiệm trực tuyến sáng lập bởi Nguyễn Ngọc Toàn - NNT).

TÍNH CÁCH VÀ PHONG CÁCH GIAO TIẾP:
- Thân thiện, thông minh, ân cần, hóm hỉnh và luôn tràn đầy năng lượng tích cực.
- Xưng là "Quizzy" hoặc "mình", luôn gọi học viên là "bạn" hoặc "sĩ tử".
- Thường xuyên dùng các biểu tượng cảm xúc sinh động: 🦊, ✨, 🎯, 💡, 🚀, 📚.
- Khẩu hiệu tâm đắc: "Học khôn ngoan – không gian nan!" và "A New Journey, A New Experience".

NHIỆM VỤ GIA SƯ ẢO KHI GIẢI THÍCH CÂU SAI:
1. An ủi, động viên học viên không nản lòng khi làm sai.
2. Phân tích rõ ràng vì sao đáp án đúng lại chính xác (bản chất vấn đề).
3. Chỉ ra bẫy hoặc lý do học viên dễ nhầm với đáp án đã chọn.
4. Tặng ngay 1 mẹo (tip/trick) ngắn gọn để lần sau gặp dạng này nhớ ngay trong 10 giây!

YÊU CẦU TRÌNH BÀY:
- Trả lời bằng tiếng Việt tự nhiên, súc tích, dễ hiểu.
- Dùng gạch đầu dòng và in đậm từ khóa quan trọng.
- Kết thúc bằng một lời chúc hoặc động viên tinh thần!`;

/**
 * Gửi tin nhắn đến Gemini API với ngữ cảnh lịch sử trò chuyện
 * @param {Array} history - Danh sách tin nhắn trước đó [{ role: 'user'|'model', text: '...' }]
 * @param {string} newMessage - Tin nhắn mới của học viên
 * @returns {Promise<string>} Câu trả lời từ Quizzy
 */
export const askQuizzyAI = async (history = [], newMessage = '') => {
    if (!newMessage.trim()) return '';

    const apiKey = getGeminiApiKey();

    // Kiểm tra cấu hình API Key
    if (!apiKey) {
        console.warn('Chưa cấu hình REACT_APP_GEMINI_API_KEY trong file .env');
        return `🦊 **Quizzy chào bạn!**\n\nMình rất sẵn lòng giải thích câu này cho bạn, nhưng hiện tại hệ thống chưa tìm thấy **REACT_APP_GEMINI_API_KEY** trong file \`.env\`.\n\n💡 **Cách kích hoạt:**\n1. Mở file \`.env\` ở thư mục gốc dự án.\n2. Thêm dòng: \`REACT_APP_GEMINI_API_KEY=your_gemini_api_key\`\n3. Khởi động lại dự án (\`npm start\`) để Quizzy AI đồng hành cùng bạn nhé! ✨`;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    // Chuẩn bị payload theo chuẩn Gemini v1beta
    const contents = [];

    // Thêm lịch sử hội thoại gần nhất (tối đa 6 lượt để tối ưu token)
    const recentHistory = (history || []).slice(-6);
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
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', errorData);
            
            // Xử lý thông báo thân thiện nếu key không hợp lệ hoặc hết quota
            if (response.status === 400 || response.status === 403) {
                return `🦊 **Quizzy thông báo:**\n\nAPI Key hiện tại có thể chưa chính xác hoặc chưa kích hoạt quyền Gemini API. Bạn kiểm tra lại biến \`REACT_APP_GEMINI_API_KEY\` trong \`.env\` nhé!\n\n💡 *Mẹo:* Bạn có thể lấy API Key miễn phí tại [Google AI Studio](https://aistudio.google.com/).`;
            }
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

/**
 * Yêu cầu Quizzy giải thích câu hỏi sai với cấu trúc chuẩn
 */
export const askQuizzyExplainWrongQuestion = async ({
    questionDescription,
    correctAnswer,
    userAnswer,
    history = []
}) => {
    const prompt = `Đề bài: ${questionDescription}. Đáp án đúng là: ${correctAnswer}. Mình đã chọn nhầm là: ${userAnswer}. Hãy giải thích ngắn gọn bằng giọng điệu vui vẻ, dễ thương của Quizzy giúp mình hiểu bản chất và mẹo để lần sau không sai nữa nhé!`;
    return askQuizzyAI(history, prompt);
};

