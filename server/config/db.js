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

    console.log('[QuizMaster Backend] Database seeded successfully.');
}

initSchema();
seedData();

module.exports = db;
