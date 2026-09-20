# 📋 SPEC — Module Auth & User (Agent-Auth)

> **Thuộc `PLAN.md` §Phase 1** · Agent chủ: **Agent-Auth** · Đọc kèm: `PLAN.md` §5 (File Ownership)

## 1. Mục tiêu
Hoàn thiện luồng xác thực & quản lý người dùng: đăng nhập, đăng ký, profile, JWT (access + refresh), phân quyền Admin/User, quên mật khẩu, validation.

## 2. Phạm vi — file được đụng ✅
- `src/component/Admin/Auth/**` (Login.jsx, SignUp.jsx + scss)
- `src/component/sevices/apiService.jsx` (chỉ phần baseURL/headers — đã được Tech-Lead chuẩn bị Phase 0)
- Redux slice auth: tạo `src/store/authSlice.js` (nếu Tech-Lead đã tách `src/store/`) hoặc sửa `src/component/actions/redux/userReducer.jsx`
- Tạo mới: `src/hooks/useAuth.js`, `src/component/User/Profile.jsx` (nếu chưa có), `src/pages/LoginPage.jsx` (nếu cần tách route)
- `server/` **KHÔNG** sửa (thuộc Agent-Backend) — chỉ dùng API theo contract trong `PLAN-SPEC-Backend.md`

## 3. KHÔNG được đụng ❌
- `package.json` (cần dependency → ghi yêu cầu cho Tech-Lead)
- `App.js`, `Layout.js`, `index.js`
- `src/component/User/**` (của Agent-Exam), `src/component/Admin/Content/**` (của Agent-Admin)
- Đổi tên thư mục `sevices`

## 4. Yêu cầu chức năng
### 4.1 Đăng nhập / Đăng ký
- [ ] Form login: email + password, validation (required, email format, min length 6)
- [ ] Gọi `POST /api/v1/auth/login` → nhận accessToken + user info → lưu Redux + persist
- [ ] Form signup: name, email, password, confirm password → `POST /api/v1/auth/register`
- [ ] Hiển thị lỗi rõ ràng từ API (toastify đã có sẵn), disable nút khi đang submit, spinner

### 4.2 Phiên & Token
- [ ] Axios interceptor: tự đính `Authorization: Bearer <token>`
- [ ] Khi API trả `401` → tự gọi `POST /api/v1/auth/refresh` → retry request cũ
- [ ] Refresh thất bại → logout sạch state, redirect về login
- [ ] Lưu refresh token trong httpOnly cookie (backend lo) — frontend chỉ giữ accessToken (trong memory hoặc redux-persist tuỳ spec Backend)

### 4.3 Phân quyền (Role)
- [ ] Helper `isAdmin(role)` / `isUser(role)` trong `useAuth.js`
- [ ] Route guard cơ bản: chặn truy cập trang Admin nếu không phải admin (redirect về `/`)
- [ ] Ẩn/hiện menu Header theo role (phối hợp: chỉ sửa `src/component/Header/Nav.jsx` nếu file thuộc quyền bạn — nếu không, ghi yêu cầu vào báo cáo)

### 4.4 Profile
- [ ] Trang xem/sửa thông tin cá nhân: name, email, avatar (upload qua `PUT /api/v1/users/me` hoặc tương đương theo spec Backend)
- [ ] Đổi mật khẩu (mật khẩu cũ + mới) → `POST /api/v1/auth/change-password`

### 4.5 Quên mật khẩu (tuỳ chọn Phase 1 — nếu backend chưa có email service thì làm UI + ghi chú)
- [ ] UI gửi email reset + form nhập mật khẩu mới (theo contract API trong spec Backend)

## 5. Định nghĩa "xong" (DoD)
- [ ] `npm start` chạy được, login/register hoạt động với backend thật (không mock)
- [ ] Refresh token tự động hoạt động (thử bằng cách hết hạn token ngắn)
- [ ] Route guard chặn đúng role
- [ ] **Agent-Testing** có unit test cho authSlice + useAuth (phối hợp qua spec testing)
- [ ] Báo cáo: danh sách file đã sửa/tạo

## 6. Ghi chú cho Tech-Lead / Agent khác
- Cần thêm dependency? → liệt kê ở đây trước khi tự cài: ...
- API contract cần bổ sung? → ghi rõ endpoint + payload cho Agent-Backend.