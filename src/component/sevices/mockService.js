/**
 * mockService.js — Service Layer Offline (localStorage CRUD)
 * Mô phỏng hoàn toàn API backend, đọc/ghi localStorage
 * Format response giống hệt backend: { data: { EC: 0, DT: ..., EM: '...' } }
 */

import { MOCK_USERS, MOCK_QUIZZES, MOCK_QUESTIONS, MOCK_SUBMISSIONS } from './mockData';

// ── Hàm tiện ích đọc/ghi localStorage ──────────────────────
const STORAGE_KEYS = {
  USERS: 'qm_users',
  QUIZZES: 'qm_quizzes',
  QUESTIONS: 'qm_questions',
  SUBMISSIONS: 'qm_submissions',
  NEXT_IDS: 'qm_next_ids',
};

function getStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore parse errors */ }
  // Khởi tạo lần đầu từ mockData
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(entity) {
  const ids = getStore(STORAGE_KEYS.NEXT_IDS, { user: 100, quiz: 100, question: 1000, answer: 10000, submission: 1 });
  ids[entity] = (ids[entity] || 100) + 1;
  setStore(STORAGE_KEYS.NEXT_IDS, ids);
  return ids[entity];
}

// Tạo response giống hệt format backend
function ok(data, message = 'Success') {
  return { data: { EC: 0, DT: data, EM: message } };
}
function err(message = 'Error') {
  return { data: { EC: -1, DT: null, EM: message } };
}

// ── AUTH ─────────────────────────────────────────────────────
export function mockLogin(email, password) {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return err('Email hoặc mật khẩu không chính xác');
  return ok({
    access_token: 'mock_token_' + user.id + '_' + Date.now(),
    refresh_token: 'mock_refresh_' + user.id,
    username: user.username,
    email: user.email,
    roles: user.role,
    image: user.image || '',
  }, 'Đăng nhập thành công');
}

export function mockRegister(userName, email, password) {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  if (users.find(u => u.email === email)) return err('Email đã tồn tại');
  const newUser = {
    id: getNextId('user'),
    email,
    password,
    username: userName,
    role: 'USER',
    image: '',
  };
  users.push(newUser);
  setStore(STORAGE_KEYS.USERS, users);
  return ok(null, 'Đăng ký thành công');
}

// ── QUIZZES ─────────────────────────────────────────────────
export function mockGetQuizzesByParticipant() {
  const quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  // Bổ sung questionCount thực tế
  const enriched = quizzes.map(q => ({
    ...q,
    questionCount: questions[q.id] ? questions[q.id].length : 0,
  }));
  return ok(enriched);
}

export function mockGetAllQuizForAdmin() {
  const quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  return ok(quizzes);
}

export function mockCreateQuiz(name, description, difficulty, image) {
  const quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  const newQuiz = {
    id: getNextId('quiz'),
    name: name || 'Untitled Quiz',
    description: description || '',
    difficulty: difficulty || 'EASY',
    image: '',
    questionCount: 0,
    duration: 10,
  };
  quizzes.push(newQuiz);
  setStore(STORAGE_KEYS.QUIZZES, quizzes);
  // Khởi tạo mảng câu hỏi rỗng cho quiz mới
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  questions[newQuiz.id] = [];
  setStore(STORAGE_KEYS.QUESTIONS, questions);
  return ok(newQuiz, 'Tạo bài thi thành công');
}

export function mockUpdateQuiz(id, name, description, difficulty, image) {
  const quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  const idx = quizzes.findIndex(q => q.id === +id);
  if (idx === -1) return err('Không tìm thấy bài thi');
  quizzes[idx] = { ...quizzes[idx], name, description, difficulty };
  setStore(STORAGE_KEYS.QUIZZES, quizzes);
  return ok(quizzes[idx], 'Cập nhật thành công');
}

export function mockDeleteQuiz(quizId) {
  let quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  quizzes = quizzes.filter(q => q.id !== +quizId);
  setStore(STORAGE_KEYS.QUIZZES, quizzes);
  // Xóa câu hỏi đi kèm
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  delete questions[quizId];
  setStore(STORAGE_KEYS.QUESTIONS, questions);
  return ok(null, 'Xóa bài thi thành công');
}

// ── QUESTIONS ───────────────────────────────────────────────
export function mockGetQuestionsByQuizId(quizId) {
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  const quizQuestions = questions[+quizId] || [];
  // Chuyển sang format phẳng giống backend (mỗi question-answer = 1 row)
  const flat = [];
  quizQuestions.forEach(q => {
    q.answers.forEach(a => {
      flat.push({
        id: q.id,
        description: q.description,
        image: q.image,
        answers: {
          id: a.id,
          description: a.description,
          correct_answer: a.isCorrect,
        },
      });
    });
  });
  return ok(flat);
}

export function mockSubmitQuiz(quizId, answers) {
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  const quizQuestions = questions[+quizId] || [];
  let countCorrect = 0;
  const quizData = quizQuestions.map(q => {
    const userEntry = answers.find(a => +a.questionId === +q.id);
    const userAnswerIds = userEntry ? userEntry.userAnswerId : [];
    const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
    const isCorrect =
      correctIds.length > 0 &&
      correctIds.length === userAnswerIds.length &&
      correctIds.every(id => userAnswerIds.includes(id));
    if (isCorrect) countCorrect++;
    return {
      questionId: q.id,
      isCorrect,
      userAnswers: userAnswerIds,
      systemAnswers: q.answers.filter(a => a.isCorrect).map(a => ({
        id: a.id,
        description: a.description,
        correct_answer: true,
      })),
    };
  });

  // Lưu kết quả submission
  const submissions = getStore(STORAGE_KEYS.SUBMISSIONS, MOCK_SUBMISSIONS);
  submissions.push({
    id: getNextId('submission'),
    quizId: +quizId,
    countCorrect,
    countTotal: quizQuestions.length,
    timestamp: new Date().toISOString(),
  });
  setStore(STORAGE_KEYS.SUBMISSIONS, submissions);

  return ok({ countCorrect, countTotal: quizQuestions.length, quizData });
}

// Lưu câu hỏi từ Question Builder
export function mockSaveQuestionsForQuiz(quizId, questionsList) {
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  // Chuyển format từ Question Builder sang format chuẩn
  const formatted = questionsList.map(q => ({
    id: q.id || getNextId('question'),
    quizId: +quizId,
    description: q.description,
    image: q.imageFile ? URL.createObjectURL(q.imageFile) : null,
    answers: q.answer.map(a => ({
      id: a.id || getNextId('answer'),
      description: a.description,
      isCorrect: a.iscorrect || false,
    })),
  }));
  // Gộp với câu hỏi hiện có hoặc thay thế
  questions[+quizId] = [...(questions[+quizId] || []), ...formatted];
  setStore(STORAGE_KEYS.QUESTIONS, questions);
  // Cập nhật questionCount trên quiz
  const quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  const qi = quizzes.findIndex(q => q.id === +quizId);
  if (qi > -1) {
    quizzes[qi].questionCount = questions[+quizId].length;
    setStore(STORAGE_KEYS.QUIZZES, quizzes);
  }
  return ok(null, 'Lưu câu hỏi thành công');
}

// ── USERS (Admin) ───────────────────────────────────────────
export function mockGetAllUsers() {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  // Ẩn password khi trả về
  return ok(users.map(u => ({ ...u, password: undefined })));
}

export function mockGetUsersWithPage(page, limit) {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  const start = (page - 1) * limit;
  const paged = users.slice(start, start + limit).map(u => ({ ...u, password: undefined }));
  return ok({
    users: paged,
    totalPages: Math.ceil(users.length / limit),
    totalRows: users.length,
  });
}

export function mockCreateUser(email, password, username, role, image) {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  if (users.find(u => u.email === email)) return err('Email đã tồn tại');
  const newUser = {
    id: getNextId('user'),
    email,
    password,
    username,
    role: role || 'USER',
    image: '',
  };
  users.push(newUser);
  setStore(STORAGE_KEYS.USERS, users);
  return ok(newUser, 'Tạo user thành công');
}

export function mockUpdateUser(id, username, role, image) {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  const idx = users.findIndex(u => u.id === +id);
  if (idx === -1) return err('Không tìm thấy user');
  users[idx] = { ...users[idx], username, role };
  setStore(STORAGE_KEYS.USERS, users);
  return ok(users[idx], 'Cập nhật user thành công');
}

export function mockDeleteUser(userId) {
  let users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  users = users.filter(u => u.id !== +userId);
  setStore(STORAGE_KEYS.USERS, users);
  return ok(null, 'Xóa user thành công');
}

// ── DASHBOARD ───────────────────────────────────────────────
export function mockGetOverview() {
  const users = getStore(STORAGE_KEYS.USERS, MOCK_USERS);
  const quizzes = getStore(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
  const questions = getStore(STORAGE_KEYS.QUESTIONS, MOCK_QUESTIONS);
  const submissions = getStore(STORAGE_KEYS.SUBMISSIONS, MOCK_SUBMISSIONS);
  let totalQuestions = 0;
  Object.values(questions).forEach(arr => { totalQuestions += arr.length; });
  return ok({
    totalUsers: users.length,
    totalQuizzes: quizzes.length,
    totalQuestions,
    totalSubmissions: submissions.length,
    recentSubmissions: submissions.slice(-5).reverse(),
  });
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.QUIZZES);
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
  localStorage.removeItem(STORAGE_KEYS.NEXT_IDS);
  return ok(null, 'Đã đặt lại toàn bộ dữ liệu mẫu về mặc định!');
}
