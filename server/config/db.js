const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { DB_PATH } = require('./env');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency performance & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            username TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            difficulty TEXT DEFAULT 'EASY',
            image TEXT,
            duration INTEGER DEFAULT 600,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            image TEXT,
            type TEXT DEFAULT 'SINGLE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            is_correct INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, quiz_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            quiz_id INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            total_correct INTEGER NOT NULL,
            score REAL NOT NULL,
            percentage REAL NOT NULL,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS submission_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            answers TEXT,
            remaining_seconds INTEGER,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, quiz_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            teacher TEXT NOT NULL,
            schedule TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            max_students INTEGER DEFAULT 50,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS class_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(class_id, user_id),
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            level TEXT DEFAULT 'Mọi trình độ',
            duration TEXT DEFAULT '5:00',
            duration_seconds INTEGER DEFAULT 300,
            video_url TEXT,
            description TEXT,
            featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            excerpt TEXT,
            content TEXT,
            tag TEXT NOT NULL,
            author TEXT DEFAULT 'Thầy Nguyễn Ngọc Toàn',
            author_id INTEGER,
            read_time TEXT DEFAULT '5 phút',
            read_minutes INTEGER DEFAULT 5,
            featured INTEGER DEFAULT 0,
            published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

// Seed initial data if database is empty
function seedData() {
    const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    if (userCount > 0) {
        return;
    }

    console.log('[QuizMaster Backend] Seeding initial database records...');

    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);
    const userHash = bcrypt.hashSync('user123', salt);

    // Seed admin & users
    const insertUser = db.prepare(`
        INSERT INTO users (email, password, username, role, image)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('admin@quizmaster.dev', adminHash, 'Admin QuizMaster', 'ADMIN', null);
    insertUser.run('admin@gmail.com', adminHash, 'Admin Default', 'ADMIN', null);
    const user1Res = insertUser.run('user1@quizmaster.dev', userHash, 'Nguyen Van A', 'USER', null);
    const user2Res = insertUser.run('user2@quizmaster.dev', userHash, 'Tran Thi B', 'USER', null);

    // Seed quizzes
    const insertQuiz = db.prepare(`
        INSERT INTO quizzes (name, description, difficulty, duration)
        VALUES (?, ?, ?, ?)
    `);

    const q1 = insertQuiz.run('JavaScript Core Essentials', 'Test your knowledge on JS fundamentals, closures, and async.', 'EASY', 600);
    const q2 = insertQuiz.run('React Fundamentals & Hooks', 'Explore useState, useEffect, custom hooks and Redux.', 'MEDIUM', 900);
    const q3 = insertQuiz.run('Node.js & Express Architecture', 'Backend design, RESTful APIs, SQLite and security.', 'HARD', 1200);

    // Seed questions & answers for Quiz 1
    const insertQuestion = db.prepare(`
        INSERT INTO questions (quiz_id, description, type)
        VALUES (?, ?, ?)
    `);
    const insertAnswer = db.prepare(`
        INSERT INTO answers (question_id, description, is_correct)
        VALUES (?, ?, ?)
    `);

    // JS Q1
    const jsQ1 = insertQuestion.run(q1.lastInsertRowid, 'What is the output of typeof null in JavaScript?', 'SINGLE');
    insertAnswer.run(jsQ1.lastInsertRowid, 'object', 1);
    insertAnswer.run(jsQ1.lastInsertRowid, 'null', 0);
    insertAnswer.run(jsQ1.lastInsertRowid, 'undefined', 0);
    insertAnswer.run(jsQ1.lastInsertRowid, 'number', 0);

    // JS Q2
    const jsQ2 = insertQuestion.run(q1.lastInsertRowid, 'Which method is used to serialize an object into a JSON string?', 'SINGLE');
    insertAnswer.run(jsQ2.lastInsertRowid, 'JSON.stringify()', 1);
    insertAnswer.run(jsQ2.lastInsertRowid, 'JSON.parse()', 0);
    insertAnswer.run(jsQ2.lastInsertRowid, 'JSON.toObject()', 0);
    insertAnswer.run(jsQ2.lastInsertRowid, 'JSON.toString()', 0);

    // JS Q3
    const jsQ3 = insertQuestion.run(q1.lastInsertRowid, 'Is JavaScript single-threaded?', 'TRUE_FALSE');
    insertAnswer.run(jsQ3.lastInsertRowid, 'True', 1);
    insertAnswer.run(jsQ3.lastInsertRowid, 'False', 0);

    // React Q1
    const rQ1 = insertQuestion.run(q2.lastInsertRowid, 'Which React hook should be used for managing side effects?', 'SINGLE');
    insertAnswer.run(rQ1.lastInsertRowid, 'useEffect', 1);
    insertAnswer.run(rQ1.lastInsertRowid, 'useState', 0);
    insertAnswer.run(rQ1.lastInsertRowid, 'useMemo', 0);
    insertAnswer.run(rQ1.lastInsertRowid, 'useRef', 0);

    // React Q2
    const rQ2 = insertQuestion.run(q2.lastInsertRowid, 'Props in React are mutable.', 'TRUE_FALSE');
    insertAnswer.run(rQ2.lastInsertRowid, 'False', 1);
    insertAnswer.run(rQ2.lastInsertRowid, 'True', 0);

    // Node Q1
    const nQ1 = insertQuestion.run(q3.lastInsertRowid, 'Which core module is used for handling file paths in Node.js?', 'SINGLE');
    insertAnswer.run(nQ1.lastInsertRowid, 'path', 1);
    insertAnswer.run(nQ1.lastInsertRowid, 'fs', 0);
    insertAnswer.run(nQ1.lastInsertRowid, 'http', 0);
    insertAnswer.run(nQ1.lastInsertRowid, 'url', 0);

    // Assign quizzes to user1 and user2
    const assignQuiz = db.prepare('INSERT OR IGNORE INTO user_quizzes (user_id, quiz_id) VALUES (?, ?)');
    assignQuiz.run(user1Res.lastInsertRowid, q1.lastInsertRowid);
    assignQuiz.run(user1Res.lastInsertRowid, q2.lastInsertRowid);
    assignQuiz.run(user2Res.lastInsertRowid, q1.lastInsertRowid);
    assignQuiz.run(user2Res.lastInsertRowid, q3.lastInsertRowid);

    console.log('[QuizMaster Backend] Core database seeded successfully.');
}

function seedClasses() {
    const classCount = db.prepare('SELECT COUNT(*) AS count FROM classes').get().count;
    if (classCount > 0) return;

    console.log('[QuizMaster Backend] Seeding classes...');
    const insertClass = db.prepare(`
        INSERT INTO classes (name, code, teacher, schedule, status, max_students, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertClass.run('Lớp Luyện Thi TOEIC 2026 — Ca Tối', 'TOEIC-26-T6', 'Thầy Nguyễn Ngọc Toàn', 'T2 · T4 · T6 — 19:00', 'active', 50, 'Luyện thi TOEIC 4 kỹ năng, cam kết đầu ra 700+.');
    insertClass.run('Lớp React & Frontend Master', 'REACT-26-M', 'Thầy Nguyễn Ngọc Toàn', 'T3 · T5 — 20:00', 'active', 40, 'Từ JS core đến React 18, Redux Toolkit, tối ưu hiệu năng.');
    insertClass.run('Lớp VSTEP B1/B2 Cấp Tốc', 'VSTEP-26-S', 'Cô Mai Anh', 'T2 · T4 — 18:00', 'active', 45, 'Luyện cấu trúc đề thi, mẹo làm bài đọc — nghe tốc độ cao.');
}

function seedTips() {
    const tipCount = db.prepare('SELECT COUNT(*) AS count FROM tips').get().count;
    if (tipCount > 0) return;

    console.log('[QuizMaster Backend] Seeding tips...');
    const insertTip = db.prepare(`
        INSERT INTO tips (title, category, duration, duration_seconds, level, description, video_url, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTip.run('Mẹo làm trắc nghiệm TOEIC Reading trong 30 giây', 'TOEIC', '8:24', 504, 'Mọi trình độ', 'Chiến thuật đọc lướt (skimming) + bẫy từ đồng nghĩa — tăng tốc độ mà không mất điểm.', 'https://www.youtube.com/watch?v=sample1', 1);
    insertTip.run('Cách bấm giờ ôn thi hiệu quả với phương pháp Pomodoro', 'Kỹ năng học', '5:12', 312, 'Mọi trình độ', 'Chia nhỏ phiên ôn 25 phút, nghỉ 5 phút — giữ não tỉnh táo và nhớ lâu hơn.', 'https://www.youtube.com/watch?v=sample2', 0);
    insertTip.run('Giải nhanh câu hỏi VSTEP Listening — bẫy "nghe thấy là chọn"', 'VSTEP', '11:05', 665, 'B1 – B2', 'Nhận diện 4 dạng bẫy kinh điển trong đề nghe VSTEP và cách né chúng.', 'https://www.youtube.com/watch?v=sample3', 0);
    insertTip.run('React Hook dễ hiểu: useEffect thực chiến (có ví dụ quiz)', 'Lập trình', '14:40', 880, 'Frontend', 'Hiểu dependency array, cleanup, và tránh infinite loop — qua ví dụ quiz thật.', 'https://www.youtube.com/watch?v=sample4', 0);
}

function seedPosts() {
    const postCount = db.prepare('SELECT COUNT(*) AS count FROM posts').get().count;
    if (postCount > 0) return;

    console.log('[QuizMaster Backend] Seeding posts...');
    const insertPost = db.prepare(`
        INSERT INTO posts (title, excerpt, content, tag, author, read_time, read_minutes, featured, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPost.run(
        'Kinh nghiệm đạt 850+ TOEIC từ con số 0 trong 3 tháng',
        'Lộ trình chi tiết theo tuần: nghe chép chính tả, đọc song song, và cách chữa đề hiệu quả...',
        'Chi tiết lộ trình 3 tháng bứt phá TOEIC 850+:\n\n1. Giai đoạn 1 (Tháng 1): Củng cố ngữ pháp cốt lõi (12 thì cơ bản, mệnh đề quan hệ, câu điều kiện) và 600 từ vựng TOEIC thường gặp nhất.\n2. Giai đoạn 2 (Tháng 2): Luyện nghe chép chính tả Part 1, 2 và đọc lướt tìm từ khóa Part 5, 6.\n3. Giai đoạn 3 (Tháng 3): Giải đề trọn vẹn 200 câu dưới áp lực thời gian thực, ghi sổ tay lỗi sai và ôn lại bẫy đề thi.\n\nChúc các bạn học viên NNT Academy đạt kết quả xuất sắc!',
        'TOEIC',
        'Thầy Nguyễn Ngọc Toàn',
        '6 phút',
        6,
        1,
        '2026-09-21'
    );
    insertPost.run(
        'Học React 2026: nên bắt đầu từ đâu để đi làm được ngay?',
        'Từ JavaScript core, ES6+, đến React 18, Vite, Redux Toolkit — lộ trình thực chiến 12 tuần...',
        'Lộ trình React thực chiến 2026 dành cho sinh viên và người chuyển ngành:\n\n- Tuần 1-3: JavaScript hiện đại (Destructuring, Spread, Promise, Async/Await, Array methods).\n- Tuần 4-6: React Core (JSX, Props, State, Component Lifecycle, useEffect & custom hooks).\n- Tuần 7-9: State management với Redux Toolkit, Redux Persist và gọi REST API chuẩn qua Axios interceptors.\n- Tuần 10-12: Dự án thực tế (Online Exam Platform, E-Commerce), tối ưu render, Dark Mode và đóng gói Docker.',
        'Lập trình',
        'Thầy Nguyễn Ngọc Toàn',
        '8 phút',
        8,
        0,
        '2026-09-18'
    );
    insertPost.run(
        'Bí kíp giữ chuỗi học tập không đứt — gamification thực chiến',
        'Chuỗi ngày học (streak) giúp bạn duy trì kỷ luật thế nào? Và mẹo để không phá vỡ chuỗi...',
        'Kỷ luật là cầu nối giữa mục tiêu và thành tựu:\n\n- Đặt mục tiêu tối thiểu (Micro-habits): Mỗi ngày chỉ cần hoàn thành 1 quiz ngắn (5 câu) hoặc xem 1 video tip.\n- Kích hoạt Gamification: Theo dõi Daily Streak trên NNT Academy để tạo động lực duy trì liên tục.\n- Neo thói quen: Học ngay sau một thói quen cố định (ví dụ: sau khi ăn tối lúc 20h00).',
        'Kỹ năng học',
        'Cô Mai Anh',
        '5 phút',
        5,
        0,
        '2026-09-15'
    );
    insertPost.run(
        'Cấu trúc đề thi VSTEP B1/B2 mới nhất 2026 và cách tính điểm',
        'Phân tích chi tiết 4 phần thi, thang điểm, và chiến thuật phân bổ thời gian cho từng phần...',
        'Phân tích cấu trúc kỳ thi VSTEP bậc 3-5 (B1-C1):\n\n1. Kỹ năng Nghe (40 phút - 3 phần - 35 câu): Nghe thông báo ngắn, hội thoại và bài giảng học thuật.\n2. Kỹ năng Đọc (60 phút - 4 bài đọc - 40 câu): Rèn kỹ năng Skimming & Scanning.\n3. Kỹ năng Viết (60 phút - 2 bài): Viết thư/email (Task 1) và viết luận 250 từ (Task 2).\n4. Kỹ năng Nói (12 phút - 3 phần): Tương tác xã hội, thảo luận giải pháp và phát triển chủ đề.',
        'VSTEP',
        'Cô Mai Anh',
        '7 phút',
        7,
        0,
        '2026-09-10'
    );
}

initSchema();
seedData();
seedClasses();
seedTips();
seedPosts();

module.exports = db;
