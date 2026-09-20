# Project: QuizMaster Full-Stack Online Examination Platform

## Architecture
- **Frontend Architecture**:
  - React 17 (CRA with `--openssl-legacy-provider`), React Router v6, Redux Toolkit + redux-persist.
  - UI: Bootstrap 5.3 + Custom SCSS design tokens in `src/styles/design-tokens.scss`.
  - HTTP Client: Axios instance in `src/util/axiosCutomes.jsx` with Bearer token header, 401 interception, and token refresh retry queue.
- **Backend Architecture**:
  - Express.js running on port 3001 in `server/`.
  - Database: `better-sqlite3` embedded SQLite in `server/data/quizmaster.db` with WAL mode.
  - Security: JWT access token (short-lived 15m), refresh token (7d in httpOnly cookie), bcryptjs password hashing, centralized error handler.
- **Data Flow & Proxy**:
  - Frontend runs on port 3002, proxying `/api/v1` to `http://localhost:3001` via `package.json` `"proxy"`.
  - All API calls use relative paths `/api/v1/...` without hardcoded domains.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Auth Login Form | Email + password validation, error toast, loading state | M1 (Wave A - Auth) | PLAN-SPEC-Auth.md |
| F02 | Auth Register Form | Username, email, password, confirmPassword validation | M1 (Wave A - Auth) | PLAN-SPEC-Auth.md |
| F03 | JWT & Refresh Interceptor | Axios request/response interceptor, Bearer token, auto 401 refresh & retry | M1 (Wave A - Auth) | PLAN-SPEC-Auth.md |
| F04 | Route Guards & RBAC | Role checks (ADMIN vs USER), protected routes, guest redirects | M1 (Wave A - Auth) | PLAN-SPEC-Auth.md |
| F05 | User Profile & Password Change | Profile page, avatar update, change password UI | M1 (Wave A - Auth) | PLAN-SPEC-Auth.md |
| F06 | Quiz List Participant View | Fetch real quizzes via `GET /quiz-by-participant`, cards, empty state | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F07 | useTimer Hook | Smart countdown from duration, pause on blur/visibilitychange, auto-submit at 0s | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F08 | useExamProgress Hook | Auto-save answers to localStorage with debounce and restore on reload | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F09 | Question Palette Component | Grid navigation, question statuses (unanswered, answered, flagged), jumping | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F10 | Exam Submission & Results | Submit answers to API, score calculation, ModalResult with stats | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F11 | Post-Exam Detailed Review | Review correct/incorrect answers, explanations, highlight options | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F12 | Anti-Cheat Safeguards | Tab switch counter & warning alert, copy/paste event restrictions | M2 (Wave A - Exam) | PLAN-SPEC-Exam.md |
| F13 | Admin Dashboard Analytics | Real metrics from `GET /overview` + SVG analytics charts (daily submissions, difficulty) | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F14 | User CRUD & Search/Pagination | Search by name/email, pagination, create, update, delete with confirmation | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F15 | Quiz CRUD & Management | Create/edit quiz, cover image upload, delete confirmation | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F16 | Assign Quiz to Multi-Users | Multi-select users modal, assign quiz via API | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F17 | Duplicate Quiz | Rapid clone quiz with questions via API | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F18 | Import & Export Quiz JSON | Export quiz + questions to JSON, import JSON file to create quiz | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F19 | Dynamic Question Builder | Single choice, multiple choice, true/false, add/remove answers, candidate preview | M3 (Wave A - Admin) | PLAN-SPEC-Admin.md |
| F20 | Test Utilities & Provider Harness | `src/test-utils.jsx` with Provider + MemoryRouter wrapper, setupTests mocks | M4 (Wave B - Testing) | PLAN-SPEC-Platform.md |
| F21 | Auth & Reducer Unit Tests | Unit tests for `authSlice`/`userReducer` and `useAuth` hook | M4 (Wave B - Testing) | PLAN-SPEC-Platform.md |
| F22 | Exam Logic Unit Tests | Unit tests for `useTimer` (countdown, pause, timeout) and scoring pure function | M4 (Wave B - Testing) | PLAN-SPEC-Platform.md |
| F23 | Admin Component Unit Tests | Unit tests for `ModalCreateUser` and `TableQuiz` components | M4 (Wave B - Testing) | PLAN-SPEC-Platform.md |
| F24 | SQLite Schema & Auto-Seed | Tables for users, tokens, quizzes, questions, answers, submissions + seed data | M5 (Wave C - Backend) | PLAN-SPEC-Backend.md |
| F25 | Backend Auth & User Endpoints | `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/change-password`, `/users/me` | M5 (Wave C - Backend) | PLAN-SPEC-Backend.md |
| F26 | Backend Quiz & Question Endpoints | CRUD quizzes, duplicate, import, export, assign, questions CRUD | M5 (Wave C - Backend) | PLAN-SPEC-Backend.md |
| F27 | Backend Submissions Endpoints | `POST /quiz-submit`, `PUT /submissions/:id/progress`, `GET /submissions/history` | M5 (Wave C - Backend) | PLAN-SPEC-Backend.md |
| F28 | Backend Stats & Middlewares | `GET /overview`, `GET /stats/daily`, JWT auth, requireAdmin, rate-limit, error handler | M5 (Wave C - Backend) | PLAN-SPEC-Backend.md |
| F29 | Dark Mode Theme System | Design token CSS variable overrides (`[data-theme="dark"]`), `useDarkMode`, localStorage | M6 (Wave D - Platform) | PLAN-SPEC-Platform.md |
| F30 | Mobile Responsiveness (375px) | `.table-responsive` wrappers, mobile exam layout, collapsing navigation | M6 (Wave D - Platform) | PLAN-SPEC-Platform.md |
| F31 | Skeleton Loading & UX Polish | Reusable `Skeleton.jsx` components replacing spinners | M6 (Wave D - Platform) | PLAN-SPEC-Platform.md |
| F32 | Multi-Stage Docker Container | Stage 1 build React + Stage 2 Node serve static & API, `.dockerignore` | M7 (Wave D - DevOps) | PLAN-SPEC-Platform.md |
| F33 | GitHub Actions CI Workflow | `.github/workflows/ci.yml` (install, test, build) on push & PR | M7 (Wave D - DevOps) | PLAN-SPEC-Platform.md |
| F34 | Full-Stack E2E Verification | End-to-end user & admin flow test, zero server crash, build passing | M8 (Wave D - Verification) | ORIGINAL_REQUEST.md |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| M1 | Wave A - Auth Module | F01, F02, F03, F04, F05 | None (can use mock fallback until M5) | DONE |
| M2 | Wave A - Exam Engine Module | F06, F07, F08, F09, F10, F11, F12 | None (can use mock fallback until M5) | DONE |
| M3 | Wave A - Admin Console Module | F13, F14, F15, F16, F17, F18, F19 | None (can use mock fallback until M5) | DONE |
| M4 | Wave B - Unit Test Suite | F20, F21, F22, F23 | M1, M2, M3 | DONE |
| M5 | Wave C - Backend API & SQLite | F24, F25, F26, F27, F28 | M1, M2, M3 contracts | DONE |
| M6 | Wave D - Platform UX/UI | F29, F30, F31 | M1, M2, M3 | DONE |
| M7 | Wave D - DevOps & CI/CD | F32, M33 | M4, M5 | DONE |
| M8 | Final Verification & Integration | F34 | M1-M7 | DONE |

## Code Layout & File Ownership Matrix
| Module / Area | Owner | Exclusive Files / Directories |
|---|---|---|
| Wave A - Auth | Worker 1 (Auth) | `src/component/Admin/Auth/**`, `src/hooks/useAuth.js`, `src/component/User/Profile.jsx`, `src/component/actions/redux/userReducer.jsx`, `src/util/axiosCutomes.jsx` |
| Wave A - Exam | Worker 2 (Exam) | `src/component/User/**` (DetailQuiz, Question, ModalResult, ListQuiz, User, QuestionPalette), `src/hooks/useTimer.js`, `src/hooks/useExamProgress.js`, `src/utils/score.js` |
| Wave A - Admin | Worker 3 (Admin) | `src/component/Admin/Content/**` (DashBoard, ManagerUser, Quiz/**, Question/**, AnalyticsCharts), `src/component/Admin/Admin.jsx`, `src/component/Admin/sidebar.jsx` |
| Wave B - Testing | Worker 4 (Testing) | `src/test-utils.jsx`, `src/setupTests.js`, `src/App.test.js`, `src/**/*.test.js`, `src/**/*.test.jsx` |
| Wave C - Backend | Worker 5 (Backend) | `server/**` (config, routes, controllers, models, middleware, data), `src/component/sevices/apiService.jsx` (normalize endpoints) |
| Wave D - Platform | Worker 6 (Platform) | `src/styles/design-tokens.scss`, `src/hooks/useDarkMode.js`, `src/component/Common/Skeleton.jsx`, `src/component/Header/Nav.jsx` |
| Wave D - DevOps | Worker 7 (DevOps) | `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml`, `.env.example` |

## Interface Contracts (Backend API v1)
Standard Response Format:
```json
{
  "EC": 0,
  "DT": {},
  "EM": "Success message"
}
```

1. **Auth Endpoints**:
   - `POST /api/v1/auth/login`: `{ email, password }` -> `{ token, refresh_token, user: { id, email, username, role, image } }`
   - `POST /api/v1/auth/register`: `{ username, email, password }` -> `{ user }`
   - `POST /api/v1/auth/refresh`: cookie `refreshToken` -> `{ token }`
   - `POST /api/v1/auth/logout`: clear refresh cookie -> `{ status: "ok" }`
   - `POST /api/v1/auth/change-password`: `{ currentPassword, newPassword }` -> `{ status: "ok" }`
   - `GET /api/v1/users/me`: Bearer -> `{ user }`
   - `PUT /api/v1/users/me`: `{ username, image }` -> `{ user }`

2. **Exam & Quiz Endpoints**:
   - `GET /api/v1/quiz-by-participant`: Bearer -> list of assigned quizzes
   - `GET /api/v1/questions-by-quiz?quizId=`: Bearer -> list of questions & answers (answers have no `is_correct` when candidate)
   - `POST /api/v1/quiz-submit`: Bearer, `{ quizId, answers: [{ questionId, userAnswer: [] }] }` -> `{ countCorrect, total, percentage, details: [] }`
   - `PUT /api/v1/submissions/:id/progress`: Bearer, `{ answers, remainingSeconds }` -> `{ status: "saved" }`
   - `GET /api/v1/submissions/history`: Bearer -> user's past submission records

3. **Admin Endpoints**:
   - `GET /api/v1/overview`: Bearer Admin -> `{ users: N, quizzes: N, questions: N, answers: N }`
   - `GET /api/v1/stats/daily`: Bearer Admin -> `{ dailySubmissions: [{ date, count }], difficultyStats: [] }`
   - `GET /api/v1/participant?page=1&limit=10&search=`: Bearer Admin -> `{ totalRows, totalPages, users: [] }`
   - `POST /api/v1/participant`: Bearer Admin -> create user
   - `PUT /api/v1/participant`: Bearer Admin -> update user
   - `DELETE /api/v1/participant`: Bearer Admin -> delete user
   - `GET /api/v1/quiz/all`: Bearer Admin -> list all quizzes
   - `POST /api/v1/quiz`: Bearer Admin -> create quiz
   - `PUT /api/v1/quiz`: Bearer Admin -> update quiz
   - `DELETE /api/v1/quiz/:id`: Bearer Admin -> delete quiz
   - `POST /api/v1/quiz-assign-to-user`: Bearer Admin, `{ quizId, userIds: [] }` -> assign
   - `POST /api/v1/quiz/:id/duplicate`: Bearer Admin -> clone quiz with questions
   - `GET /api/v1/quiz/:id/export`: Bearer Admin -> full quiz JSON export
   - `POST /api/v1/quiz/import`: Bearer Admin, `{ quizData }` -> import quiz JSON
   - `POST /api/v1/questions`: Bearer Admin, `{ quiz_id, description, question_type, answers: [] }` -> create question
   - `PUT /api/v1/questions/:id`: Bearer Admin -> update question
   - `DELETE /api/v1/questions/:id`: Bearer Admin -> delete question
