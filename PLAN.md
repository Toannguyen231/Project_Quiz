# 🗺️ PLAN.md — QuizMaster (Quiz-question) — Multi-Agent Master Plan

> **Phiên bản:** 1.0 · **Ngày:** 2026-09-20
> **Mục đích:** Biến dự án quiz frontend hiện tại thành **nền tảng quiz hoàn chỉnh full-stack**, vận hành bởi nhiều AI agent song song trong Google Antigravity 2.0.
>
> **Đọc cùng:** [README-AI-AGENTS.md](./README-AI-AGENTS.md) — cách vận hành agents · Các file spec: `PLAN-SPEC-*.md`

---

## 1. Tầm nhìn (Vision)

**QuizMaster** — nền tảng thi/kiểm tra trực tuyến hoàn chỉnh:

- 🎓 **Candidate Portal**: làm bài thi với timer, auto-save, chống gian lận cơ bản, kết quả chi tiết, gamification.
- 🛡️ **Admin Console**: dashboard analytics, CRUD người dùng / bộ đề / câu hỏi, phân quyền, import/export.
- ⚙️ **Backend tích hợp**: REST API chạy **chung trong repo này** (không repo riêng) — Node.js/Express + SQLite (dễ chạy local, không cần cài DB ngoài).
- 🚀 **Product quality**: unit test, CI/CD, Docker, responsive, dark mode, performance, a11y.

---

## 2. Hiện trạng (As-Is) — đã kiểm chứng 2026-09-20

| Hạng mục | Hiện trạng |
|---|---|
| Frontend | React **17.0.2**, react-scripts **4.0.3** (CRA, cũ), Bootstrap 5.3, Redux Toolkit + Redux Persist, React Router v6 |
| Test | Chỉ có `App.test.js` mặc định — **chưa có test thật** |
| Backend | **Không có trong repo** — frontend gọi API ngoài `http://localhost:8081/api/v1` |
| TypeScript | **Chưa có** (toàn bộ `.jsx`) |
| Cấu trúc | `src/component/` — Admin (Auth, Content: Dashboard/User/Quiz/Question), User (ListQuiz, DetailQuiz, Question, ModalResult), Common (Mascot, Leaderboard, CloudShader), services (apiService, mockService, gamificationService, quizzyAiService, telegramService) |
| Extras có sẵn | Gamification, leaderboard, mascot companion, mock service, telegram service, CloudShader |

### ⚠️ Rủi ro kỹ thuật đã ghi nhận
1. **React 17 + react-scripts 4 + Node 24** — đã cũ (2020). Build phải dùng flag `--openssl-legacy-provider` (dấu hiệu lỗi OpenSSL). **Nâng cấp React 18 + Vite là khoản nợ kỹ thuật lớn nhất** — nên làm như 1 luồng riêng, không xen vào luồng tính năng.
2. **Backend 8081 ngoài repo** — không kiểm soát được. Giai đoạn này phải dựng backend riêng trong repo.
3. **Thư mục `sevices` (sai chính tả)** — giữ nguyên tên để tránm vỡ import, ghi chú trong spec; **không rename** trong đợt này.

---

## 3. Kiến trúc đích (To-Be)

```
Quiz-question/
├── server/                    # 🆕 BACKEND (Node/Express + SQLite)
│   ├── index.js               # entrypoint
│   ├── config/                # env, db init
│   ├── routes/                # auth, users, quizzes, questions, submissions, stats
│   ├── controllers/
│   ├── models/                # (SQLite qua better-sqlite3)
│   ├── middleware/            # auth (JWT), roles, validation, error
│   └── data/                  # database file (gitignored)
├── src/
│   ├── component/
│   │   ├── Admin/             # (giữ cấu trúc, thêm tính năng)
│   │   ├── User/              # (giữ, nâng cấp exam engine)
│   │   ├── Common/            # Mascot, Leaderboard...
│   │   ├── sevices/           # (giữ tên) + apiService.jsx nâng cấp
│   │   └── util/
│   ├── pages/                 # 🆕 (nếu cần tách route)
│   ├── hooks/                 # 🆕 custom hooks (useTimer, useAuth...)
│   ├── store/                 # 🆕 tách Redux slices rõ ràng
│   ├── App.js / Layout.js / index.js
│   └── styles/design-tokens.scss
├── tests/                     # 🆕 integration/e2e (nếu có)
├── docker/                    # 🆕 Dockerfile
├── .github/workflows/         # 🆕 CI/CD
├── PLAN.md                    # (file này)
├── PLAN-SPEC-*.md             # specs từng module
└── package.json               # thêm scripts: dev:server, dev:client, test
```

### ⚙️ Quyết định kiến trúc (ADRs — mức gọn)
| Quyết định | Chọn | Lý do |
|---|---|---|
| Backend | **Express + better-sqlite3** (chạy chung repo) | Không repo riêng, không cần cài DB, dễ chạy local, đồng bộ với frontend qua 1 cổng |
| Auth | **JWT access + refresh token**, lưu refresh trong httpOnly cookie | Chuẩn, an toàn, dễ làm với multi-agent |
| State | Giữ **Redux Toolkit** + thêm **RTK Query** (optional) | Không phá kiến trúc cũ, chuẩn hoá async |
| Styling | Giữ **Bootstrap 5 + SCSS**, thêm **design tokens** đã có | Không đập đi xây lại |
| Test | **Jest + React Testing Library** (đã có sẵn trong CRA) | Không cài thêm framework mới |
| Nâng React | **React 18 + Vite** — luồng riêng, cuối cùng | Tránh xung đột với luồng tính năng |

---

## 4. Lộ trình (Roadmap) & Phân luồng Multi-Agent

> ⚠️ **Luật bất biến:** Giai đoạn sau **chỉ bắt đầu khi** giai đoạn trước đã merge + test pass. **File nóng** (`package.json`, `App.js`, `Layout.js`, `index.js`, `util/axiosCutomes.jsx`) chỉ **1 agent duy nhất** được sửa tại 1 thời điểm (xem §5).

### 🟢 Phase 0 — Nền móng (1 agent: **Tech-Lead**)
**Mục tiêu:** chuẩn hoá repo, backend skeleton chạy được, mọi spec rõ ràng.
- [ ] Tạo `server/` (Express + SQLite) với healthcheck `GET /api/v1/health`
- [ ] Tách `.env` chuẩn (`PORT=3001` cho backend, `PORT=3002` cho frontend proxy)
- [ ] Cấu hình proxy trong `package.json`: `"proxy": "http://localhost:3001"`
- [ ] Thêm `concurrently` script: `npm run dev` chạy cả server + client
- [ ] Cập nhật `README.md` (hướng dẫn chạy mới)
- **File được đụng:** `package.json`, `server/**` (mới), `src/util/axiosCutomes.jsx` (đổi baseURL → `/api/v1`), `.env`

### 🔵 Phase 1 — Tính năng cốt lõi (4 agent SONG SONG: Auth · Exam · Admin · Testing)
Mỗi agent 1 luồng, đọc spec của mình, làm trọn module. Chi tiết trong từng file spec:
- **Agent-Auth** (`PLAN-SPEC-Auth.md`): login/register/profile, JWT, role, quên mật khẩu, validation.
- **Agent-Exam** (`PLAN-SPEC-Exam.md`): timer nâng cao, auto-save, review sau nộp bài, chống gian lận cơ bản, nộp bài qua API mới.
- **Agent-Admin** (`PLAN-SPEC-Admin.md`): dashboard analytics thật (từ API), CRUD quiz/question nâng cao, import/export, tìm kiếm.
- **Agent-Testing** (`PLAN-SPEC-Testing.md` — nằm trong spec Platform hoặc riêng): unit test Auth + Exam logic + reducers, đảm bảo `npm test` pass.

### 🟠 Phase 2 — Hoàn thiện (3 agent SONG SONG: Platform · Backend-v2 · DevOps)
- **Agent-Platform** (`PLAN-SPEC-Platform.md`): responsive, dark mode, skeleton loading, a11y, code-splitting, tối ưu render.
- **Agent-Backend** (`PLAN-SPEC-Backend.md`): hoàn thiện API (validation, rate-limit, pagination, docs, seed data).
- **Agent-DevOps** (trong `PLAN-SPEC-Platform.md`): Dockerfile, GitHub Actions CI/CD, deploy script.

### 🔴 Phase 3 — Nâng cấp nền (1 agent: **Tech-Lead**)
- [ ] Migrate React 17 → 18, react-scripts → **Vite**
- [ ] Bỏ flag `--openssl-legacy-provider`
- [ ] (Tuỳ chọn) TypeScript hoá dần

---

## 5. Bản đồ file — ai được đụng file nào (File Ownership Matrix)

> 🔥 **Đây là quy tắc quan trọng nhất** để nhiều agent chạy song song không đè nhau.

| File / Thư mục | Chủ sở hữu (Agent) | Ghi chú |
|---|---|---|
| `package.json`, `package-lock.json` | **Tech-Lead** (+ DevOps ở Phase 2) | Agent khác cần thêm dependency → ghi yêu cầu vào spec, **không tự sửa** |
| `App.js`, `Layout.js`, `index.js`, `index.css` | **Tech-Lead** | Routing tổng — agent khác chỉ đề xuất route trong spec |
| `src/util/axiosCutomes.jsx` | **Tech-Lead** (Phase 0) → **Agent-Auth** (Phase 1) | Chỉ 1 người sửa |
| `src/component/Admin/Auth/**` | **Agent-Auth** | — |
| `src/component/User/**` | **Agent-Exam** | — |
| `src/component/Admin/Content/DashBoard.jsx`, `ManagerUser.jsx`, `Quiz/**`, `Question/**` | **Agent-Admin** | — |
| `src/component/sevices/apiService.jsx` | **Agent-Auth** (baseURL/headers) + **Agent-Backend** (endpoint mới) | Phối hợp qua spec; ưu tiên Agent-Auth sửa file, Agent-Backend chỉ thêm endpoint vào spec |
| `src/component/sevices/gamificationService.js`, `mockService.js`, `quizzyAiService.js`, `telegramService.js`, `Leaderboard.jsx`, `MascotCompanion.jsx` | **Agent-Platform** | Giữ ổn định, nâng cấp UX |
| `server/**` | **Tech-Lead** (Phase 0) → **Agent-Backend** (Phase 1/2) | — |
| `src/**/*.test.js`, `src/setupTests.js` | **Agent-Testing** | — |
| `README.md`, `PLAN.md`, `PLAN-SPEC-*.md` | **Tech-Lead** | Docs chỉ Tech-Lead sửa |
| `docker/`, `.github/workflows/` | **Agent-DevOps** (Phase 2) | — |

---

## 6. Luồng làm việc chuẩn (Definition of Done)

Mỗi agent khi nhận việc phải tuân theo:

1. **Đọc** `PLAN.md` + spec của mình + `README-AI-AGENTS.md`.
2. **Khảo sát** code hiện tại trước khi sửa (đọc file liên quan, tìm import).
3. **Chỉ sửa file thuộc quyền** của mình (xem §5). Không đụng file của agent khác.
4. **Commit theo từng bước nhỏ** (nếu repo Git) với message rõ ràng.
5. **Tự kiểm tra**: chạy build/test nếu được phép, fix lỗi do mình gây ra.
6. **Báo cáo cuối**: danh sách file đã tạo/sửa, tính năng đã xong, việc còn dang dở, yêu cầu với agent khác (nếu có).
7. **Không** tự ý nâng cấp dependency, đổi kiến trúc, hoặc đổi tên thư mục (`sevices` giữ nguyên).

---

## 7. Cấu hình chạy (Runbook)

```bash
# Sau Phase 0 (khi đã có server/):
npm install                # cài concurrently + better-sqlite3...
npm run dev                # chạy CẢ backend (3001) + frontend (3002)
# - Backend:  http://localhost:3001/api/v1/health
# - Frontend: http://localhost:3002
```

> **Lưu ý cổng:** dự án hiện đang chạy ở **3002** (đã kiểm chứng). Backend mới dùng **3001** và frontend proxy sang `/api/v1`.

---

## 8. Danh sách Spec đính kèm

| File | Module | Agent phụ trách |
|---|---|---|
| `PLAN-SPEC-Auth.md` | Đăng nhập, đăng ký, profile, JWT, phân quyền | Auth |
| `PLAN-SPEC-Exam.md` | Quy trình làm bài thi, timer, auto-save, kết quả | Exam |
| `PLAN-SPEC-Admin.md` | Dashboard, CRUD quiz/question/user, import/export | Admin |
| `PLAN-SPEC-Backend.md` | REST API, DB, seed, validation, docs | Backend |
| `PLAN-SPEC-Platform.md` | UX/UI, responsive, dark mode, perf, DevOps, Testing | Platform / DevOps / Testing |

---

*File này do amee 🦊 soạn cho Toàn, dựa trên khảo sát code thực tế 2026-09-20. Các file spec chi tiết nằm cùng thư mục.*