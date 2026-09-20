/**
 * apiService.jsx — Hybrid Service Layer
 * Mỗi hàm bọc trong try/catch: gọi API thật trước, nếu lỗi mạng → fallback mock
 * Response format luôn giống nhau: { data: { EC, DT, EM } }
 */

import instance from '../util/axiosCutomes';
import {
  mockLogin,
  mockRegister,
  mockGetQuizzesByParticipant,
  mockGetAllQuizForAdmin,
  mockCreateQuiz,
  mockUpdateQuiz,
  mockDeleteQuiz as mockDeleteQuizService,
  mockGetQuestionsByQuizId,
  mockSubmitQuiz,
  mockSaveQuestionsForQuiz,
  mockGetAllUsers,
  mockGetUsersWithPage,
  mockCreateUser as mockCreateUserService,
  mockUpdateUser,
  mockDeleteUser as mockDeleteUserService,
  mockGetOverview,
  resetDemoData as mockResetDemoData,
} from './mockService';

// Kiểm tra xem lỗi có phải do mạng/backend không kết nối
function isNetworkError(error) {
  if (!error) return true;
  if (!error.response) return true; // No response = network issue
  const code = error.code;
  if (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || code === 'ERR_CONNECTION_REFUSED') return true;
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('network error') || msg.includes('timeout')) return true;
  return false;
}

// ── AUTH ─────────────────────────────────────────────────────
const postLogin = async (email, password, delay) => {
  try {
    const data = new FormData();
    data.append('email', email);
    data.append('password', password);
    data.append('delay', delay || 5000);
    return await instance.post('http://localhost:8081/api/v1/login', data);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockLogin(email, password);
    }
    throw error;
  }
};

const postCreateSignUp = async (userName, email, password) => {
  try {
    const data = new FormData();
    data.append('userName', userName);
    data.append('email', email);
    data.append('password', password);
    return await instance.post('http://localhost:8081/api/v1/register', data);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockRegister(userName, email, password);
    }
    throw error;
  }
};

// ── USER CRUD ───────────────────────────────────────────────
const postCreateUser = async (email, password, username, role, image) => {
  try {
    const data = new FormData();
    data.append('email', email);
    data.append('password', password);
    data.append('username', username);
    data.append('role', role);
    data.append('userImage', image);
    return await instance.post('http://localhost:8081/api/v1/participant', data);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockCreateUserService(email, password, username, role, image);
    }
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    return await instance.get('http://localhost:8081/api/v1/participant/all');
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetAllUsers();
    }
    throw error;
  }
};

const putUpdateUser = async (id, username, role, image) => {
  try {
    const data = new FormData();
    data.append('id', id);
    data.append('username', username);
    data.append('role', role);
    data.append('userImage', image);
    return await instance.put('/api/v1/participant', data);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockUpdateUser(id, username, role, image);
    }
    throw error;
  }
};

const deleteUser = async (userID) => {
  try {
    return await instance.delete('/api/v1/participant', { data: { id: userID } });
  } catch (error) {
    if (isNetworkError(error)) {
      return mockDeleteUserService(userID);
    }
    throw error;
  }
};

const getPageUserWithPage = async (page, limit) => {
  try {
    return await instance.get(`/api/v1/participant?page=${page}&limit=${limit}`);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetUsersWithPage(page, limit);
    }
    throw error;
  }
};

// ── QUIZ ────────────────────────────────────────────────────
const getQuzizeByPage = async () => {
  try {
    return await instance.get('/api/v1/quiz-by-participant');
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetQuizzesByParticipant();
    }
    throw error;
  }
};

const getAllQuizForAdmin = async () => {
  try {
    return await instance.get('/api/v1/quiz/all');
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetAllQuizForAdmin();
    }
    throw error;
  }
};

const postCreateQuiz = async (description, name, difficulty, image) => {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('name', name);
    formData.append('difficulty', difficulty);
    formData.append('quizImage', image);
    return await instance.post('/api/v1/quiz', formData);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockCreateQuiz(name, description, difficulty, image);
    }
    throw error;
  }
};

const putUpdateQuiz = async (id, description, name, difficulty, image) => {
  try {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('description', description);
    formData.append('name', name);
    formData.append('difficulty', difficulty);
    formData.append('quizImage', image);
    return await instance.put('/api/v1/quiz', formData);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockUpdateQuiz(id, name, description, difficulty, image);
    }
    throw error;
  }
};

const deleteQuiz = async (quizID) => {
  try {
    return await instance.delete(`/api/v1/quiz/${quizID}`);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockDeleteQuizService(quizID);
    }
    throw error;
  }
};

// ── QUESTIONS ───────────────────────────────────────────────
const getQuestionsByQuizId = async (id) => {
  try {
    return await instance.get(`/api/v1/questions-by-quiz?quizId=${id}`);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetQuestionsByQuizId(id);
    }
    throw error;
  }
};

const postSubmitQuiz = async (data) => {
  try {
    return await instance.post('/api/v1/quiz-submit', { ...data });
  } catch (error) {
    if (isNetworkError(error)) {
      return mockSubmitQuiz(data.quizId, data.answers);
    }
    throw error;
  }
};

// ── NEW: Save questions for quiz (Admin Question Builder) ───
const postSaveQuestionsForQuiz = async (quizId, questionsList) => {
  try {
    return await instance.post('/api/v1/quiz-assign-to-quiz', { quizId, questions: questionsList });
  } catch (error) {
    if (isNetworkError(error)) {
      return mockSaveQuestionsForQuiz(quizId, questionsList);
    }
    throw error;
  }
};

// ── NEW: Dashboard overview (Admin) ─────────────────────────
const getOverview = async () => {
  try {
    return await instance.get('/api/v1/overview');
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetOverview();
    }
    throw error;
  }
};

const resetDemoData = async () => {
  return mockResetDemoData();
};

export {
  postCreateUser, getAllUsers,
  putUpdateUser, deleteUser, getPageUserWithPage,
  postCreateSignUp, postLogin, getQuzizeByPage,
  getQuestionsByQuizId, postSubmitQuiz,
  getAllQuizForAdmin, postCreateQuiz, putUpdateQuiz, deleteQuiz,
  postSaveQuestionsForQuiz, getOverview, resetDemoData,
};