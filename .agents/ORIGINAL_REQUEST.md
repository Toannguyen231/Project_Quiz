# Original User Request

## Initial Request — 2026-09-20T16:52:11Z

Biến dự án QuizMaster (Quiz-question) thành nền tảng thi trực tuyến full-stack hoàn chỉnh: Auth (JWT/roles), Exam engine (timer/auto-save/review), Admin console (dashboard/CRUD/import-export), Backend Express+SQLite, Unit tests cho code thật, Platform (responsive/dark mode) và DevOps (Docker/CI).

Working directory: D:/test-demo-react/Quiz-question
Integrity mode: development

Tham chiếu tài liệu chuẩn trong repository:
- `PLAN.md` (Master plan & File Ownership Matrix §5)
- `PLAN-SPEC-Auth.md` (Spec Module Auth)
- `PLAN-SPEC-Exam.md` (Spec Module Exam Engine)
- `PLAN-SPEC-Admin.md` (Spec Module Admin Console)
- `PLAN-SPEC-Backend.md` (Spec Module Backend API & SQLite)
- `PLAN-SPEC-Platform.md` (Spec Testing, Platform UX/UI, DevOps)
- `README-AI-AGENTS.md` (Sổ tay vận hành multi-agent)

## Context & Baseline
- Phase 0 ĐÃ HOÀN THÀNH (Tech-Lead đã làm):
  - Backend Express + better-sqlite3 chạy ở cổng 3001, healthcheck `GET /api/v1/health` OK.
  - Frontend React chạy ở cổng 3002, proxy `/api/v1` → 3001 đã cấu hình.
  - Script `npm run dev` chạy đồng thời backend + frontend (commits: 0659c07, 5a016f0, a293308, 3c15791).
- Môi trường: Node 24, Windows, React 17 + react-scripts 4 (cần flag `--openssl-legacy-provider`, đã cấu hình sẵn trong scripts). SQLite DB lưu tại `server/data/` (gitignored). Khi cài đặt package nếu gặp peer dependency lỗi thì dùng `--legacy-peer-deps`.

## Workflow & Execution Order
Triển khai theo 4 đợt tuần tự có điều kiện:
1. **Đợt A (Song song)**:
   - Worker 1 - Auth: Hoàn thiện login, register, profile, JWT token + auto refresh qua axios interceptor, role guards (`PLAN-SPEC-Auth.md`).
   - Worker 2 - Exam: Nâng cấp exam engine, `useTimer` (auto-pause khi blur/rời tab, auto-submit khi hết giờ), `useExamProgress` (auto-save), Question Palette, review đáp án sau thi (`PLAN-SPEC-Exam.md`).
   - Worker 3 - Admin: Dashboard analytics từ API thật, CRUD user/quiz/question hoàn chỉnh, tìm kiếm & phân trang user, import/export quiz JSON, duplicate quiz (`PLAN-SPEC-Admin.md`).
2. **Đợt B (Testing - Sau khi Đợt A hoàn thành)**:
   - Worker Testing: Viết unit test bằng Jest + React Testing Library cho CODE THẬT (authSlice, useAuth, useTimer, score calculation, quiz reducers/components). Đảm bảo `npm test -- --watchAll=false` pass toàn bộ.
3. **Đợt C (Backend API - Sau khi tổng hợp contract)**:
   - Worker Backend: Gom và hoàn thiện tất cả endpoint theo API contract từ Đợt A (auth routes, quiz duplicate/import/export, user search, submissions progress/history, overview analytics). Đảm bảo validation, rate-limiting, error handling tập trung.
4. **Đợt D (Platform & DevOps)**:
   - Worker Platform: Responsive toàn diện (mobile 375px đến desktop 1440px), dark mode toggle + design tokens, skeleton loading, code-splitting (`PLAN-SPEC-Platform.md` Phần B).
   - Worker DevOps: Dockerfile multi-stage (build React + run Express static), `.dockerignore`, GitHub Actions CI workflow (`.github/workflows/ci.yml`), cập nhật `.env.example` (`PLAN-SPEC-Platform.md` Phần C).

## Invariant Rules (Bắt buộc cho mọi Worker)
1. **File Ownership Matrix (`PLAN.md` §5)**: Mỗi file chỉ thuộc quyền 1 worker phụ trách. Tuyệt đối không sửa file của worker khác.
2. **File nhạy cảm / Core files**: CHỈ Orchestrator được sửa `package.json`, `App.js`, `Layout.js`, `index.js`. Worker cần thêm route hoặc dependency phải ghi vào danh sách đề xuất.
3. **Thư mục `sevices`**: Giữ nguyên tên thư mục `src/component/sevices` (không rename để tránh vỡ import).
4. **API Contract**: Khi thiếu endpoint từ backend, worker frontend ghi rõ method, endpoint, payload vào danh sách contract chờ Backend hoàn thiện.
5. **Verification & Commit**: Commit từng bước nhỏ kèm message rõ ràng; verify chạy thử `npm run dev` và test trước khi báo hoàn thành.

## Requirements

### R1. Auth & User Module
- Triển khai đầy đủ màn hình Đăng nhập, Đăng ký, Profile cá nhân và Đổi mật khẩu.
- Cấu hình Axios interceptor: tự động đính kèm `Authorization: Bearer <token>`, tự động bắt mã lỗi 401 để gọi `POST /api/v1/auth/refresh` và retry request gốc.
- Quản lý trạng thái xác thực qua Redux Toolkit + persist, route guard phân quyền (Admin vs User).

### R2. Exam Engine Module
- Cung cấp danh sách bài thi kết nối API thật `GET /api/v1/quiz-by-participant`.
- Engine thi: Custom hook `useTimer` đếm ngược từ duration, tự động dừng (pause) khi rời tab/cửa sổ và tự nộp bài khi hết giờ.
- Custom hook `useExamProgress` tự động lưu tiến độ vào localStorage để khôi phục khi reload trang.
- Bổ sung Question Palette hiển thị trạng thái từng câu (đã làm, chưa làm, flag review) và modal xác nhận nộp bài.
- Màn hình kết quả & review chi tiết: thống kê điểm, tỷ lệ đúng, hiển thị lời giải / đáp án đúng/sai.

### R3. Admin Console Module
- Dashboard hiển thị số liệu thực từ `GET /api/v1/overview` kèm biểu đồ thống kê cơ bản.
- Quản lý Người dùng: CRUD, tìm kiếm theo tên/email, phân trang, preview avatar.
- Quản lý Quiz & Question: CRUD bộ đề, gán quiz cho nhiều user, duplicate quiz, import/export quiz sang file JSON.
- Builder câu hỏi hỗ trợ các loại câu hỏi (single choice, multiple choice, true/false) và xem trước (preview).

### R4. Unit Test Suite (Code thật)
- Viết unit test cho code thật sử dụng Jest và React Testing Library:
  - Test `authSlice` và `useAuth`.
  - Test `useTimer` (countdown, pause on visibilitychange, auto-submit) và logic tính điểm.
  - Test quiz reducer và các component admin chính (`ModalCreateUser`, `TableQuiz`).
- Toàn bộ test phải chạy độc lập và vượt qua mà không có lỗi (`npm test -- --watchAll=false`).

### R5. Backend API & SQLite Database
- Xây dựng hoàn chỉnh các REST API theo contract trong `PLAN-SPEC-Backend.md` trên nền Express và better-sqlite3:
  - Auth: login, register, refresh, logout, change-password.
  - Quizzes: CRUD, duplicate, import, export, assign to user.
  - Submissions: nộp bài, auto-save tiến độ (`PUT /submissions/:id/progress`), lịch sử làm bài.
  - Stats: overview metrics và analytics.
- Middleware: xác thực JWT, phân quyền role admin, validation request body, rate limiting cho auth endpoints, centralized error handler.
- Tự động chạy seed data ban đầu (tài khoản admin mặc định, quiz mẫu, câu hỏi mẫu).

### R6. Platform UX/UI & DevOps
- Responsive: Giao diện thích ứng chuẩn từ mobile 375px đến desktop 1440px), sidebar admin thu gọn mượt mà.
- Dark mode: Thiết lập hệ thống design tokens với CSS variables, hỗ trợ toggle theme và lưu vào localStorage.
- UX enhancements: Skeleton loading thay thế spinner thô, chuẩn hóa thông báo react-toastify.
- Docker: Cung cấp `Dockerfile` multi-stage (stage 1: build frontend React; stage 2: chạy Node.js serve static build và Express API), `.dockerignore`.
- CI/CD: Thiết lập workflow GitHub Actions (`.github/workflows/ci.yml`) tự động hóa các bước install, test và build.

## Acceptance Criteria

### Verification & Testing
- [ ] Lệnh `npm test -- --watchAll=false` thực thi thành công với 100% test pass.
- [ ] Không có lỗi runtime hoặc crash server khi gọi các endpoint chính.
- [ ] Lệnh `npm run build` hoàn thành thành công và không sinh lỗi nghiêm trọng.

### Functional Completeness
- [ ] Luồng Auth: Đăng nhập, đăng ký, refresh token tự động và route guard hoạt động chính xác trên frontend với API thật.
- [ ] Luồng Exam: Danh sách quiz hiển thị từ API, timer đếm ngược chính xác, tự nộp khi hết giờ, auto-save khôi phục câu trả lời sau khi reload trang, nộp bài tính điểm và review kết quả chuẩn xác.
- [ ] Luồng Admin: Dashboard hiển thị số liệu từ API, CRUD User/Quiz/Question hoạt động, import/export quiz JSON thành công, tìm kiếm và phân trang hoạt động trơn tru.
- [ ] Luồng Backend: Đầy đủ các endpoint theo bảng contract trong `PLAN-SPEC-Backend.md`, seed data tự động khởi tạo khi database rỗng.

### Platform & DevOps
- [ ] Dark mode toggle chuyển đổi giao diện mượt mà và lưu lại tùy chọn của người dùng.
- [ ] Giao diện không bị tràn layout (no horizontal scrollbar) trên kích thước mobile 375px.
- [ ] File `Dockerfile` và `.github/workflows/ci.yml` được cấu hình chuẩn xác, sẵn sàng cho build và CI pipeline.

### Final Report
- [ ] Cung cấp báo cáo tổng kết chi tiết: công việc đã hoàn thành của từng module, danh sách file tạo mới/chỉnh sửa, kết quả test, hướng dẫn khởi chạy ứng dụng hoàn chỉnh, và các lưu ý/tồn đọng (nếu có).
