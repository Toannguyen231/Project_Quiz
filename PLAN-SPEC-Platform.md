# 📋 SPEC — Module Platform, UX/UI, Testing & DevOps (Agent-Platform / Agent-Testing / Agent-DevOps)

> **Thuộc `PLAN.md` §Phase 1 (Testing) + Phase 2 (Platform/DevOps)** · Đọc kèm: `PLAN.md` §4, §5

---

## PHẦN A — TESTING (Agent-Testing, chạy SONG SONG ngay Phase 1)

### A.1 Mục tiêu
Đảm bảo chất lượng: unit test cho logic quan trọng, integration test cơ bản, `npm test` luôn pass.

### A.2 Phạm vi — file được đụng ✅
- Tạo mới: các file `*.test.js` cạnh module tương ứng
- `src/setupTests.js` (cấu hình, nếu cần)
- **KHÔNG sửa code logic** — chỉ viết test; nếu phát hiện bug, báo lại agent chủ module qua báo cáo (hoặc sửa nếu là lỗi hiển nhiên và file thuộc quyền được ghi rõ)

### A.3 Danh sách test cần viết
- [ ] **Auth**: authSlice (login success/fail, logout, refresh), useAuth
- [ ] **Exam**: useTimer (đếm ngược, hết giờ, pause/resume), logic tính điểm/đúng-sai (nếu tách hàm thuần — đề xuất Tech-Lead tách `src/utils/score.js`), reducer quiz
- [ ] **Admin**: reducer quiz slice, component ModalCreateUser (validation), TableQuiz render
- [ ] **API service**: interceptor gắn token, xử lý 401 (mock axios)

### A.4 DoD
- [ ] `npm test -- --watchAll=false` pass toàn bộ
- [ ] Coverage tối thiểu cho 3 module chính (không bắt buộc % cứng, nhưng logic timer/score/auth phải có test)

---

## PHẦN B — PLATFORM / UX-UI (Agent-Platform, Phase 2)

### B.1 Mục tiêu
Sản phẩm chạy mượt, đẹp, responsive, dễ tiếp cận, nhanh.

### B.2 Phạm vi — file được đụng ✅
- `src/component/Common/**` (MascotCompanion, Leaderboard, CloudShader + scss)
- `src/component/Home/**`, `src/component/Header/Nav.jsx` + scss
- `src/component/sevices/gamificationService.js`, `quizzyAiService.js`, `telegramService.js`, `mockService.js` (chỉ nâng cấp, giữ interface)
- `src/styles/design-tokens.scss`, `src/App.scss`, `src/bootstrap-override.scss`, `src/index.css`
- Tạo mới: `src/hooks/useDarkMode.js`, `src/components/common/Skeleton.jsx`, `src/components/common/EmptyState.jsx`

### B.3 Yêu cầu
- [ ] **Responsive**: kiểm tra toàn bộ trang ở mobile (375px) → desktop (1440px); sidebar admin thu gọn đúng
- [ ] **Dark mode**: design tokens đã có — thêm CSS variables + toggle (lưu localStorage, tôn trọng `prefers-color-scheme`)
- [ ] **Loading experience**: skeleton thay spinner thô; NProgress đã có — tối ưu màu
- [ ] **A11y**: alt text, label form, focus visible, contrast, aria cho modal/sidebar
- [ ] **Performance**: React.lazy + Suspense cho trang Admin (chunk riêng), tối ưu ảnh (lazy loading), tránh re-render (memo nơi cần)
- [ ] **Gamification/Mascot** (đã có sẵn — đừng phá): kiểm tra chạy ổn, nâng cấp visual nếu cần
- [ ] Fix lỗi console warning khi build

### B.4 DoD
- [ ] Lighthouse mobile ≥ 85 (Performance, Accessibility) hoặc cải thiện rõ so với trước
- [ ] Không còn cảnh báo React key/console trong build
- [ ] Dark mode hoạt động toàn trang

---

## PHẦN C — DEVOPS / CI-CD (Agent-DevOps, Phase 2)

### C.1 Mục tiêu
Reproducible build, tự động test khi push, dễ deploy.

### C.2 Phạm vi — file được đụng ✅
- Tạo mới: `Dockerfile` (multi-stage: build frontend + chạy node server), `.dockerignore`, `.github/workflows/ci.yml`, `vercel.json` (đã có — xem lại), script deploy
- `package.json` (scripts mới — **chỉ khi Tech-Lead duyệt**)

### C.3 Yêu cầu
- [ ] **Dockerfile multi-stage**: stage 1 build `npm run build` (cần fix React 17 + openssl flag), stage 2 `node:20-alpine` chạy `server/index.js` + serve `build/` (express static)
- [ ] **CI**: GitHub Actions — job: install → lint (nếu có) → test → build. Trigger: push PR vào main
- [ ] **.env mẫu**: `.env.example` đầy đủ (PORT, JWT_SECRET, DB_PATH, CLIENT_ORIGIN)
- [ ] **Script npm**: `npm run dev` (concurrently), `npm run build`, `npm start` (chạy server + serve build), `npm run test`
- [ ] (Tuỳ chọn) Deploy preview: Vercel cho frontend + backend serverless? → **đề xuất để Phase 3**, vì backend SQLite không hợp serverless; ưu tiên Docker + VPS.

### C.4 DoD
- [ ] `docker build` thành công, container chạy được cả API + frontend
- [ ] CI xanh trên repo (khi push lên GitHub)
- [ ] README có section Deploy

---

## Ghi chú phối hợp chung
- **Agent-Testing** nhận danh sách test cần viết từ spec Auth/Exam/Admin; báo bug cho agent chủ module.
- **Agent-Platform** đụng `Common/**` & Home/Header — không đụng `User/**` (Exam), `Admin/**` (Admin/Auth) khi Phase 1 chưa merge.
- **Agent-DevOps** thêm dependency/script → **Tech-Lead** duyệt `package.json`.