# 📋 SPEC — Module Backend (Agent-Backend)

> **Thuộc `PLAN.md` §Phase 0 (skeleton) + Phase 1/2 (hoàn thiện)** · Agent chủ: **Agent-Backend** · Đọc kèm: `PLAN.md` §4, §5

## 1. Mục tiêu
Xây dựng **backend API hoàn chỉnh chạy chung trong repo** (không repo riêng): Express + SQLite (better-sqlite3), JWT auth, validation, rate-limit, docs, seed data. Thay thế backend ngoài `localhost:8081` đang bị phụ thuộc.

## 2. Phạm vi — file được đụng ✅
- `server/**` (mới — toàn quyền)
- `package.json` — **chỉ thêm dependency khi có xác nhận của Tech-Lead** (Phase 0: Tech-Lead làm; Phase 1+: nếu bạn cần thêm, ghi yêu cầu)
- `.env`, `.env.example`
- Đọc (không sửa): `src/component/sevices/apiService.jsx`, `src/component/sevices/mockData.js` (để hiểu shape dữ liệu cũ cho tương thích)

## 3. KHÔNG được đụng ❌
- `src/**` (frontend — của các agent khác)
- `App.js`, `Layout.js`, `index.js`
- Đổi tên `sevices`, đổi endpoint cũ mà frontend đang dùng nếu chưa có thoả thuận (xem §7)

## 4. Kiến trúc
```
server/
├── index.js            # entrypoint: express app + listen
├── config/
│   ├── env.js          # đọc .env (PORT=3001, JWT_SECRET, DB_PATH...)
│   └── db.js           # khởi tạo better-sqlite3, migrate + seed
├── middleware/
│   ├── auth.js         # verify JWT, attach req.user
│   ├── roles.js        # requireRole('admin')
│   ├── validate.js     # validate req.body (express-validator hoặc tự viết)
│   ├── error.js        # error handler tập trung + async wrapper
│   └── rateLimit.js    # express-rate-limit cho /auth/*
├── routes/             # 1 file / resource
│   ├── auth.routes.js      # login, register, refresh, change-password, forgot
│   ├── users.routes.js     # CRUD participant + profile + search
│   ├── quizzes.routes.js   # CRUD quiz + assign + duplicate + import/export
│   ├── questions.routes.js # CRUD question + answers
│   ├── submissions.routes.js # submit, progress auto-save, history
│   └── stats.routes.js     # overview + analytics charts
├── controllers/        # logic theo route
├── models/             # data access (SQLite)
└── data/               # .db file (gitignored)
```

## 5. Yêu cầu kỹ thuật
- [ ] **DB**: better-sqlite3 (sync, không cần cài server DB). File DB trong `server/data/`, **gitignore**.
- [ ] **Auth**: JWT access (15–30 min) + refresh token (7 ngày, httpOnly cookie). Bcrypt hash password.
- [ ] **Validation**: tất cả body đều validate, trả lỗi chuẩn `{ message, errors? }` + status code hợp lệ (400/401/403/404/409/500).
- [ ] **Error handler tập trung** — không để crash server.
- [ ] **Rate limit** cho `/auth/*` (ví dụ 10 req/phút/IP).
- [ ] **Seed data**: tài khoản admin mặc định (admin@quizmaster.dev / admin123 — ghi rõ trong README), 2-3 quiz mẫu + câu hỏi, 5 user mẫu để frontend dev/test.
- [ ] **CORS**: cho phép `localhost:3002` (hoặc dùng proxy nên thường không cần — cân nhắc).
- [ ] **Healthcheck**: `GET /api/v1/health` → `{ status: 'ok', time }`.
- [ ] **Docs**: `GET /api/v1/docs` trả JSON mô tả endpoints (hoặc cài swagger-ui-express nếu được duyệt dependency).

## 6. Contract API (danh sách endpoint cần có — bổ sung theo spec các module)

> Quy ước: tất cả dưới `/api/v1`. Auth: Bearer token trừ login/register/refresh.

| Method | Endpoint | Mô tả | Ghi chú |
|---|---|---|---|
| POST | `/auth/login` | đăng nhập → accessToken + user | public, rate-limit |
| POST | `/auth/register` | đăng ký user | public, rate-limit |
| POST | `/auth/refresh` | refresh access token | cookie |
| POST | `/auth/logout` | xoá refresh cookie | auth |
| POST | `/auth/change-password` | đổi mật khẩu | auth |
| POST | `/auth/forgot-password` | gửi email reset (hoặc trả token mô phỏng nếu chưa có email) | public |
| GET | `/users/me` | profile hiện tại | auth |
| PUT | `/users/me` | cập nhật profile/avatar | auth |
| GET | `/participant?page=&limit=&search=` | danh sách user (admin) | admin |
| POST | `/participant` | tạo user | admin |
| PUT | `/participant` | sửa user | admin |
| DELETE | `/participant` | xoá user | admin |
| GET | `/quiz-by-participant` | quiz của thí sinh | auth |
| GET | `/quiz/all` | tất cả quiz (admin) | admin |
| POST | `/quiz` | tạo quiz + cover | admin |
| PUT | `/quiz` | sửa quiz | admin |
| DELETE | `/quiz/:id` | xoá quiz | admin |
| POST | `/quiz-assign-to-user` | gán quiz cho user | admin |
| POST | `/quiz/:id/duplicate` | nhân bản quiz + câu hỏi | admin |
| POST | `/quiz/import` | import quiz JSON | admin |
| GET | `/quiz/:id/export` | export quiz JSON | admin |
| GET | `/questions-by-quiz?quizId=` | câu hỏi + đáp án (ẩn isCorrect khi là thí sinh) | auth |
| POST | `/questions` | tạo câu hỏi (admin) | admin |
| PUT | `/questions/:id` | sửa câu hỏi | admin |
| DELETE | `/questions/:id` | xoá câu hỏi | admin |
| POST | `/quiz-submit` | nộp bài → tính điểm, lưu submission | auth |
| PUT | `/submissions/:id/progress` | auto-save tiến độ làm bài | auth |
| GET | `/submissions/history` | lịch sử làm bài của user | auth |
| GET | `/overview` | 4 số tổng dashboard | admin |
| GET | `/stats/daily` | số bài làm theo ngày (chart) | admin |
| GET | `/health` | healthcheck | public |

## 7. Tương thích frontend cũ — QUAN TRỌNG
- Frontend đang gọi `http://localhost:8081/api/v1` với các endpoint cũ (login, register, participant, quiz-by-participant, quiz/all, quiz, quiz-assign-to-user, questions-by-quiz, quiz-submit, overview).
- **Giữ nguyên path** của các endpoint cũ (trùng tên như bảng trên) để frontend không vỡ.
- Sau Phase 0 (Tech-Lead đổi baseURL → `/api/v1` qua proxy 3001), mọi request đi `localhost:3002/api/v1` → proxy → `localhost:3001/api/v1`.

## 8. Định nghĩa "xong" (DoD)
- [ ] `npm run dev` chạy được cả server + client (sau Phase 0)
- [ ] `GET /api/v1/health` OK
- [ ] Login/register CRUD quiz/question/submit hoạt động end-to-end từ frontend
- [ ] Seed data chạy tự động lần đầu
- [ ] Không có console.error / crash khi request lỗi

## 9. Ghi chú phối hợp
- Nhận spec từ **Agent-Auth** (contract auth), **Agent-Exam** (submissions), **Agent-Admin** (stats/import-export) — tổng hợp vào bảng §6.
- Dependency mới → báo **Tech-Lead** duyệt trước khi thêm vào `package.json`.