# 📋 SPEC — Module Admin Console (Agent-Admin)

> **Thuộc `PLAN.md` §Phase 1** · Agent chủ: **Agent-Admin** · Đọc kèm: `PLAN.md` §5 (File Ownership)

## 1. Mục tiêu
Nâng cấp bảng quản trị thành **command center hoàn chỉnh**: dashboard analytics thật (từ API), CRUD user/quiz/question mượt mà, import/export, tìm kiếm + phân trang, UX nhất quán.

## 2. Phạm vi — file được đụng ✅
- `src/component/Admin/Content/DashBoard.jsx` (+ scss nếu có)
- `src/component/Admin/Content/ManagerUser.jsx`, `ModalCreateUser.jsx`, `ModalUpdateUser.jsx`, `ViewUser.jsx`, `DeleteUser.jsx`, `TableUserPagination.jsx`, `Tables.jsx`, `ManageUser.scss`
- `src/component/Admin/Content/Quiz/**` (ManageQuiz.jsx, TableQuiz.jsx, ModalUpdateQuiz.jsx, ModalViewQuiz.jsx, ModalDelete.jsx + scss)
- `src/component/Admin/Content/Question/Questions.jsx` + `.scss`
- `src/component/Admin/Admin.jsx`, `sidebar.jsx` (chỉ nếu cần thêm menu mục)
- Đọc (không sửa): `src/component/sevices/apiService.jsx`

## 3. KHÔNG được đụng ❌
- `package.json`, `App.js`, `Layout.js`, `index.js`
- `src/component/Admin/Auth/**` (của Agent-Auth)
- `src/component/User/**` (của Agent-Exam)
- `server/**` (của Agent-Backend)
- Đổi tên `sevices`

## 4. Yêu cầu chức năng
### 4.1 Dashboard
- [ ] Dùng API thật `GET /api/v1/overview` (đã có) — 4 card: Users, Quizzes, Questions, Answers
- [ ] **Biểu đồ analytics** (nâng cao): số bài làm theo ngày, độ khó phân bố, tỷ lệ đúng trung bình — yêu cầu Backend thêm endpoint nếu thiếu
- [ ] Loading skeleton, refresh data khi vào trang

### 4.2 Quản lý User (CRUD)
- [ ] Giữ pagination; **thêm tìm kiếm** theo tên/email (Backend: query param `search`)
- [ ] Validation form create/update: email format, tên không trống, role hợp lệ
- [ ] Upload avatar preview (FormData) — đã có, làm cho chắc: xử lý lỗi, giới hạn dung lượng
- [ ] Xác nhận trước khi xoá (modal confirm) + toast thành công/lỗi

### 4.3 Quản lý Quiz
- [ ] CRUD quiz với cover image upload (đã có) — kiểm tra luồng update xử lý ảnh mới/cũ
- [ ] **Gán quiz cho user** (đã có `quiz-assign-to-user`) — thêm UI chọn nhiều user 1 lúc (multi-select)
- [ ] **Duplicate quiz** (nhân bản nhanh kèm câu hỏi) — cần Backend endpoint `POST /api/v1/quiz/:id/duplicate`
- [ ] **Import/Export**: export quiz + câu hỏi ra JSON; import JSON tạo quiz mới (Backend: `POST /api/v1/quiz/import`, `GET /api/v1/quiz/:id/export`)

### 4.4 Quản lý Question
- [ ] Builder câu hỏi động (đã có add/remove answers, isCorrect) — giữ + cải thiện UX
- [ ] Hỗ trợ nhiều loại câu hỏi: **single choice, multiple choice, true/false** (Backend cần field `type`)
- [ ] Gắn ảnh minh hoạ cho câu hỏi (đã có reference diagrams — làm cho chắc)
- [ ] **Xem trước** câu hỏi như thí sinh thấy (preview mode)

### 4.5 UX nhất quán
- [ ] Mọi nút destructive đều có confirm
- [ ] Empty state + error state + loading cho mọi bảng
- [ ] Toast thống nhất (react-toastify)

## 5. Định nghĩa "xong" (DoD)
- [ ] Mọi CRUD hoạt động với backend thật
- [ ] Import/export quiz JSON hoạt động
- [ ] Tìm kiếm + phân trang user hoạt động
- [ ] **Agent-Testing** có test cho reducer quiz slice + component chính
- [ ] Báo cáo: file đã sửa/tạo + endpoint Backend cần bổ sung

## 6. API contract cần Backend (điền khi phát hiện thiếu)
| Endpoint | Method | Mục đích |
|---|---|---|
| `POST /api/v1/quiz/:id/duplicate` | POST | nhân bản quiz |
| `POST /api/v1/quiz/import` | POST | import JSON |
| `GET /api/v1/quiz/:id/export` | GET | export JSON |
| `GET /api/v1/participant?search=` | GET | tìm kiếm user |
| ... | | |