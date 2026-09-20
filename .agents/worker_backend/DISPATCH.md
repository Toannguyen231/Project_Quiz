# Dispatch: Worker Backend (Wave C - Backend API & SQLite)

## Mission
Build and finalize the complete Express + SQLite backend in `server/` according to `PLAN-SPEC-Backend.md` and the master API contract in `PROJECT.md`, replacing external dependencies with a fully self-contained local backend.

## Mandatory Reading
- `D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md` (Mandatory)
- `D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md`
- `D:\test-demo-react\Quiz-question\PLAN.md` §5 (File Ownership Matrix)
- `D:\test-demo-react\Quiz-question\PLAN-SPEC-Backend.md`
- `D:\test-demo-react\Quiz-question\.agents\survey_backend_platform_explorer\handoff.md`

## File Ownership
You exclusively own and may modify:
- `server/**` (`server/index.js`, `server/config/**`, `server/routes/**`, `server/controllers/**`, `server/models/**`, `server/middleware/**`, `server/data/**`)
- `src/component/sevices/apiService.jsx` (normalize all API endpoints to relative `/api/v1/...` paths, removing any hardcoded `http://localhost:8081`)
- `.env` and `.env.example`

## Required Dependencies
If `jsonwebtoken`, `bcryptjs`, `cookie-parser` are not present, install them with `npm install jsonwebtoken bcryptjs cookie-parser --legacy-peer-deps` or use compatible implementations.

## Architectural Requirements
1. **SQLite Database (`server/config/db.js`)**:
   - `better-sqlite3` initialized at `server/data/quizmaster.db` with WAL mode.
   - Tables with proper foreign keys:
     - `users` (id, email, password_hash, username, role ['ADMIN', 'USER'], image, created_at)
     - `refresh_tokens` (id, user_id, token, expires_at)
     - `quizzes` (id, name, description, difficulty ['EASY', 'MEDIUM', 'HARD'], image, duration, created_at)
     - `user_quizzes` (id, user_id, quiz_id, assigned_at)
     - `questions` (id, quiz_id, description, question_type ['SINGLE', 'MULTIPLE', 'TRUE_FALSE'], image, created_at)
     - `answers` (id, question_id, description, is_correct)
     - `submissions` (id, user_id, quiz_id, count_correct, count_total, status, answers_json, remaining_seconds, submitted_at)
   - **Auto-Seed**: If `users` table count is 0, auto-seed:
     - Admin user: `admin@quizmaster.dev` / `admin123` (role: 'ADMIN')
     - Test user: `user@quizmaster.dev` / `user123` (role: 'USER')
     - 3 sample quizzes (from `src/component/sevices/mockData.js`), with full questions and answers.
2. **Middleware (`server/middleware/`)**:
   - `auth.js`: JWT verification, extracts Bearer token, attaches `req.user`.
   - `roles.js`: `requireAdmin` checks `req.user.role === 'ADMIN'`.
   - `error.js`: Centralized error handler returning `{ EC: -1, EM: err.message }` without crashing the server.
   - `rateLimit.js`: Rate limiting for `/api/v1/auth/*` (in-memory or express-rate-limit).
   - Cookie parser for refresh token.
3. **Routes & Controllers (`server/routes/` & `server/controllers/`)**:
   Implement standard response format `{ EC: 0, DT: data, EM: 'Success' }` for all 31 endpoints:
   - **Auth**:
     - `POST /api/v1/auth/login` (and alias `/api/v1/login`)
     - `POST /api/v1/auth/register` (and alias `/api/v1/register`)
     - `POST /api/v1/auth/refresh` (and alias `/api/v1/refresh`)
     - `POST /api/v1/auth/logout` (and alias `/api/v1/logout`)
     - `POST /api/v1/auth/change-password`
     - `GET /api/v1/users/me`
     - `PUT /api/v1/users/me`
   - **Admin User**:
     - `GET /api/v1/participant?page=1&limit=10&search=`
     - `POST /api/v1/participant`
     - `PUT /api/v1/participant`
     - `DELETE /api/v1/participant`
   - **Quiz**:
     - `GET /api/v1/quiz-by-participant`
     - `GET /api/v1/quiz/all`
     - `POST /api/v1/quiz`
     - `PUT /api/v1/quiz`
     - `DELETE /api/v1/quiz/:id`
     - `POST /api/v1/quiz-assign-to-user`
     - `POST /api/v1/quiz/:id/duplicate`
     - `GET /api/v1/quiz/:id/export`
     - `POST /api/v1/quiz/import`
   - **Questions**:
     - `GET /api/v1/questions-by-quiz?quizId=` (strip `is_correct` when participant)
     - `POST /api/v1/questions` (and alias `POST /api/v1/quiz-assign-to-quiz`)
     - `PUT /api/v1/questions/:id`
     - `DELETE /api/v1/questions/:id`
   - **Submissions**:
     - `POST /api/v1/quiz-submit`: calculate score, record submission, return score breakdown
     - `PUT /api/v1/submissions/:id/progress`: save in-progress state
     - `GET /api/v1/submissions/history`: user's past attempts
   - **Stats**:
     - `GET /api/v1/overview`: 4 counts (users, quizzes, questions, answers)
     - `GET /api/v1/stats/daily`: daily submissions and difficulty statistics
   - **System**:
     - `GET /api/v1/health`: `{ status: 'ok', time }`
4. **Normalize `src/component/sevices/apiService.jsx`**:
   - Change all hardcoded `http://localhost:8081` URLs to relative `/api/v1/...`.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Deliverables
- Verify backend boots and healthcheck responds.
- Verify key endpoints with curl or node test script.
- Ensure all existing unit tests (`npm test -- --watchAll=false`) continue to pass 100%.
- Document all implemented endpoints, schema, and verification in `D:\test-demo-react\Quiz-question\.agents\worker_backend\handoff.md`.
- Notify parent via `send_message`.

## 2026-09-20T17:31:00Z
Received invocation:
Implement all items listed in DISPATCH.md:
1. Initialize SQLite database in server/config/db.js with better-sqlite3 WAL mode and create tables for users, refresh_tokens, quizzes, user_quizzes, questions, answers, submissions.
2. Implement auto-seeding if DB is empty (default admin admin@quizmaster.dev / admin123, sample user, 3 sample quizzes from mockData.js with full questions & answers).
3. Implement middlewares: auth (JWT verify), roles (requireAdmin), error handler, rateLimit, cookie parser.
4. Implement all routes and controllers matching standard response format { EC: 0, DT, EM } for all 31 endpoints in PLAN-SPEC-Backend.md §6.
5. Normalize src/component/sevices/apiService.jsx removing http://localhost:8081 hardcodes.
6. Verify endpoints with node verification script or curl. Ensure `npm test -- --watchAll=false` continues to pass 100%.
7. Write your report to D:\test-demo-react\Quiz-question\.agents\worker_backend\handoff.md.
8. Notify parent via send_message.

