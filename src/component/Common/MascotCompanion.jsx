import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FaYoutube, FaGithub, FaPaperPlane, FaRedo, FaTimes } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import mascotImg from '../../accets/quizzy-mascot.jpg';
import { askQuizzyAI, QUIZZY_EVENT_ASK } from '../sevices/quizzyAiService';
import './MascotCompanion.scss';

const QUICK_PROMPTS = [
    '💡 Mẹo làm bài trắc nghiệm 30s',
    '⚛️ Giải thích React Hooks cơ bản',
    '🎯 Chiến thuật làm bài thi ĐGNL',
    '🇬🇧 Cách nhớ từ vựng tiếng Anh'
];

const MascotCompanion = () => {
    const location = useLocation();

    const [showBubble, setShowBubble] = useState(true);
    const [showCard, setShowCard] = useState(false);

    // AI Chat State
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'model',
            text: 'Chào bạn! Mình là **Quizzy** 🦊 — chú cáo thông thái của **NNT Academy**!\n\nBạn đang ôn thi môn nào hay cần Quizzy giải đáp kiến thức, chia sẻ mẹo làm bài trắc nghiệm gì không nè? Hãy gõ câu hỏi cho mình nhé! ✨'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesRef = useRef(messages);
    const isLoadingRef = useRef(isLoading);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (showCard) {
            scrollToBottom();
        }
    }, [messages, showCard]);

    const getPageMessage = () => {
        const path = location.pathname;
        if (path === '/') {
            return "Chào bạn! Mình là Quizzy 🦊. Cần mẹo ôn thi hay giải đáp gì, cứ nhấp vào mình nhé!";
        }
        if (path === '/user') {
            return "Kho đề thi NNT rất phong phú! Cần gợi ý bài thi nào thì hỏi Quizzy nha!";
        }
        if (path.startsWith('/quiz')) {
            return "Tập trung và bình tĩnh làm bài nhé! Quizzy luôn đồng hành cùng bạn! ✨";
        }
        if (path.startsWith('/admin')) {
            return "Chào Quản trị viên NNT! Chúc bạn một ngày làm việc hiệu quả!";
        }
        return "Học khôn ngoan – không gian nan! Nhấp vào Quizzy để trò chuyện cùng AI nhé!";
    };

    const handleAvatarClick = () => {
        setShowCard(!showCard);
        setShowBubble(false);
    };

    const handleSendMessage = useCallback(async (textToSend) => {
        const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
        if (!text || isLoadingRef.current) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: text
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const currentHistory = messagesRef.current;
            const aiReply = await askQuizzyAI(currentHistory, text);
            const modelMsg = {
                id: Date.now() + 1,
                role: 'model',
                text: aiReply
            };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            console.error('Lỗi nhận phản hồi từ Quizzy AI:', error);
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'model',
                    text: 'Quizzy đang bị gián đoạn kết nối một chút. Bạn thử gửi lại câu hỏi nhé! 🦊'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

    // Lắng nghe sự kiện yêu cầu Quizzy giải thích từ phòng thi (Review Mode)
    useEffect(() => {
        const handleAskQuizzyEvent = (e) => {
            const prompt = e.detail?.prompt;
            if (prompt) {
                setShowCard(true);
                setShowBubble(false);
                // Đợi animation mở cửa sổ hoàn tất rồi tự động gửi prompt
                setTimeout(() => {
                    handleSendMessage(prompt);
                }, 200);
            }
        };

        window.addEventListener(QUIZZY_EVENT_ASK, handleAskQuizzyEvent);
        return () => {
            window.removeEventListener(QUIZZY_EVENT_ASK, handleAskQuizzyEvent);
        };
    }, [handleSendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleResetChat = () => {
        setMessages([
            {
                id: Date.now(),
                role: 'model',
                text: 'Chào bạn! Quizzy đã sẵn sàng cho buổi học tập mới. Hãy đặt câu hỏi bất kỳ cho mình nhé! 🦊✨'
            }
        ]);
    };

    // Format text with bold and line breaks simply
    const renderFormattedText = (text) => {
        return text.split('\n').map((line, idx) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={idx} style={{ minHeight: line ? 'auto' : '8px' }}>git commit -m "feat: revamp UI/UX, upgrade quiz engine with auto-save, gamification and Quizzy AI"
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </div>
            );
        });
    };

    return (
        <>
            {/* 1. Dedicated Floating Social Contact Bar (Pinned to middle right edge) */}
            <div className="tpp-social-sidebar" aria-label="Kênh liên hệ nhanh">
                <a
                    href="https://zalo.me"
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn zalo"
                    title="Tư vấn nhanh qua Zalo"
                >
                    <SiZalo />
                </a>

                <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn youtube"
                    title="Kênh bài giảng YouTube NNT Academy"
                >
                    <FaYoutube />
                </a>

                <a
                    href="https://github.com/Toannguyen231"
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn github"
                    title="GitHub Tác giả Toàn (NNT)"
                >
                    <FaGithub />
                </a>
            </div>

            {/* 2. Dedicated Mascot Companion (Pinned bottom-right, independent & never shifts) */}
            <div className="nnt-mascot-fixed-widget">
                {/* Speech Bubble (positioned to the LEFT of the avatar, arrow pointing right) */}
                {showBubble && !showCard && (
                    <div className="mascot-speech-bubble" onClick={() => setShowCard(true)}>
                        <div className="bubble-header">
                            <span className="bubble-name">🦊 Quizzy AI (NNT)</span>
                            <button
                                type="button"
                                className="btn-close-bubble"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowBubble(false);
                                }}
                                title="Tạm ẩn lời nhắc"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="bubble-text">{getPageMessage()}</p>
                    </div>
                )}

                {/* Expanded AI Chat Card (opens above the avatar, fixed position) */}
                {showCard && (
                    <div className="mascot-study-card ai-chat-card">
                        {/* Header */}
                        <div className="study-card-header">
                            <div className="header-info">
                                <img src={mascotImg} alt="Quizzy" className="mascot-thumb" />
                                <div>
                                    <h5 className="title">Trợ Lý AI Quizzy</h5>
                                    <span className="ai-status">
                                        <span className="status-dot" /> Gemini 3.5 Flash-Lite (Online)
                                    </span>
                                </div>
                            </div>
                            <div className="header-actions">
                                <button
                                    type="button"
                                    className="btn-header-action"
                                    onClick={handleResetChat}
                                    title="Làm mới cuộc trò chuyện"
                                >
                                    <FaRedo size={12} />
                                </button>
                                <button
                                    type="button"
                                    className="btn-header-action"
                                    onClick={() => setShowCard(false)}
                                    title="Đóng cửa sổ"
                                >
                                    <FaTimes size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages List */}
                        <div className="chat-messages-container">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`chat-message-row ${msg.role}`}>
                                    {msg.role === 'model' && (
                                        <img src={mascotImg} alt="Quizzy" className="chat-avatar" />
                                    )}
                                    <div className="chat-bubble">
                                        {renderFormattedText(msg.text)}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="chat-message-row model">
                                    <img src={mascotImg} alt="Quizzy" className="chat-avatar" />
                                    <div className="chat-bubble typing-bubble">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span style={{ fontSize: '0.82rem', marginLeft: '6px', color: '#64748b' }}>
                                            Quizzy đang suy nghĩ...
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts Chips */}
                        <div className="chat-quick-prompts">
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="prompt-chip"
                                    onClick={() => handleSendMessage(prompt)}
                                    disabled={isLoading}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {/* Chat Input Bar */}
                        <div className="chat-input-bar">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Hỏi Quizzy về ôn thi, kiến thức..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="btn-send-chat"
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isLoading}
                                title="Gửi câu hỏi"
                            >
                                <FaPaperPlane size={13} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Floating Mascot Button */}
                <button
                    type="button"
                    className="mascot-avatar-btn"
                    onClick={handleAvatarClick}
                    title="Trò chuyện cùng Quizzy AI — Linh vật NNT Academy"
                >
                    <img src={mascotImg} alt="Quizzy Mascot" className="mascot-img" />
                    <span className="mascot-status-pulse" />
                </button>
            </div>
        </>
    );
};

export default MascotCompanion;
