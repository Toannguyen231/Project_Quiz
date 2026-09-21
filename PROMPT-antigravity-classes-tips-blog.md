# 🎯 NHIỆM VỤ: Hoàn thiện 3 trang mới (Lớp học / Tips Nhanh / Blog) — Từ mock → backend thật

Bạn là **Tech-Lead** của dự án **NNT Academy / QuizMaster** (`D:\test-demo-react\Quiz-question`). Teamwork đã hoàn thành Phase 1 (Auth, Exam Engine, Admin CRUD) và Phase 2 (Dark mode, Docker, CI). **Phase 3 (React 17→18 + Vite) tạm hoãn** — chỉ làm theo nhiệm vụ dưới đây.

## 📌 Bối cảnh hiện tại (đã commit — git sạch)

- **HEAD**: `74f76db` — feat(client): implement real Lớp học / Tips Nhanh / Blog pages replacing placeholder alerts
- Trước đó: `3819a0e` — fix double-prefix API `/api/v1/api/v1` + migrate backend port **3001 → 5000** (QUAN TRỌNG: proxy, env, Dockerfile đã đồng bộ 5000)
- **Runtime hiện tại**: Backend `node server/index.js` trên **port 5000** (PID 5344) | Frontend CRA trên **port 3002** (đang chạy)
- **Backend**: Express + better-sqlite3 + JWT (access+refresh) + axios interceptors Bearer/refresh mutex
- **Frontend**: React 17, react-scripts 4 (PHẢI dùng `--openssl-legacy-provider` — không gỡ, chưa migration Vite), Redux + redux-persist, react-bootstrap 5, react-icons
- **Database**: SQLite tại `server/quiz.db` (bảng: users, quizzes, questions, answers; 4 quizzes mẫu, 9 câu hỏi)
- **Tests**: 90 tests / 8 suites pass (jest) — **KHÔNG ĐƯỢC làm vỡ**

## ✅ 3 trang mới (vừa tạo ở `74f76db` — hiện dùng DATA MẪU hardcode)

| Route | File | Nội dung hiện tại |
|---|---|---|
| `/lop-hoc` | `src/pages/Classes.jsx` | 3 card lớp (TOEIC/React/VSTEP) hardcode; nút "Tham gia lớp" lưu `localStorage['nnt_joined_classes']` |
| `/tips-nhanh` | `src/pages/TipsNhanh.jsx` | 4 card video hardcode (TOEIC/VSTEP/Lập trình/Kỹ năng học) + filter chip |
| `/blog` | `src/pages/Blog.jsx` | 4 bài viết hardcode + filter tag + badge "Bài nổi bật" |

- Style chung: `src/pages/Pages.scss` (design tokens `--qm-*`, `--nnt-gradient-*` trong `index.css`, hỗ trợ dark mode)
- Routing đã nối trong `src/Layout.js`; Nav đã đổi alert → NavLink trong `src/component/Header/Nav.jsx`
- **Cả 3 trang không gọi API backend** — nút "Xem ngay"/"Đọc bài viết"/"Tham gia lớp" đều không có luồng thật

## 🎯 MỤC TIÊU CHÍNH: Đưa 3 trang này thành tính năng THẬT (backend + frontend)

### A. Backend (Express + better-sqlite3) — tạo bảng + routes + seed

1. **Migration SQLite**: tạo bảng mới trong `server/` (cách như file DB hiện có — kiểm tra cách schema/seed đang làm, ví dụ `server/`):
   - `classes` — id, code, name, description, teacher, schedule, status('active'), max_students, created_at
   - `class_members` — id, class_id, user_id, joined_at (UNIQUE class_id+user_id)
   - `tips` — id, title, category('TOEIC'|'VSTEP'|'Lập trình'|'Kỹ năng học'), level, duration_seconds, video_url, description, featured, created_at
   - `posts` — id, title, excerpt, content, tag, author_id, read_minutes, featured, published_at
   - **Seed dữ liệu mẫu** giống hệt nội dung hardcode hiện tại (3 lớp / 4 tips / 4 bài viết) để UI không đổi
2. **Routes RESTful** (đặt trong `server/routes/`, nối vào `server/index.js` theo pattern hiện có):
   - `GET /api/v1/classes` — danh sách lớp
   - `POST /api/v1/classes/:id/join` — học viên tham gia lớp (cần auth; idempotent, không trùng)
   - `GET /api/v1/classes/mine` — lớp tôi đã tham gia (auth)
   - `GET /api/v1/tips` — danh sách tips (có thể filter `?category=`)
   - `GET /api/v1/posts` — danh sách bài viết (có thể filter `?tag=`)
   - (Tùy chọn) `GET /api/v1/posts/:id` — chi tiết bài viết
3. **Auth**: route join/mine dùng middleware xác thực JWT như các route khác (kiểm tra `server/middleware` / `optionalAuth` đang dùng ở `quizzes.routes.js`)

### B. Frontend — thay data mẫu bằng API thật

- **`apiService.jsx`**: thêm 4–5 hàm `getClasses()`, `joinClass(id)`, `getMyClasses()`, `getTips(category?)`, `getPosts(tag?)` theo đúng pattern các hàm đang có (trả `{EC, EM, DT}`)
- **`Classes.jsx`**: mở bằng `getClasses()`; "Tham gia lớp" gọi `joinClass(id)` (nếu chưa đăng nhập → chuyển `/login`); hiển thị mục "Lớp của tôi" nếu đã đăng nhập; xóa dùng localStorage cũ
- **`TipsNhanh.jsx`**: mở bằng `getTips()`; giữ nguyên filter chip (lọc client hoặc query param)
- **`Blog.jsx`**: mở bằng `getPosts()`; giữ nguyên filter tag + "Đọc bài viết" nên mở trang chi tiết (có thể làm modal hoặc route `/blog/:id` — chọn cách gọn nhất)

## 🚫 GIỚI HẠN (bắt buộc)

- **KHÔNG đụng** vào: `server/routes/quizzes.routes.js`, `submissions.routes.js`, `auth` core, `DetailQuiz.jsx` flow nộp bài, `apiService.jsx` các hàm quiz hiện có (CHỈ THÊM hàm mới), `axiosCutomes.jsx`
- **KHÔNG migration** React 17→18 / Vite trong nhiệm vụ này (Phase 3 hoãn)
- **KHÔNG đổi port** 5000 / 3002, không đổi prefix API `/api/v1`
- **KHÔNG xóa** `src/pages/Pages.scss` — giữ nguyên style
- Viết test cho phần mới (tối thiểu: route backend dùng supertest nếu có pattern sẵn, hoặc test component cơ bản) — **tổng bộ test phải vẫn pass 90/90 + test mới**

## 📐 QUY ƯỚC CODE (theo dự án)

- Frontend: `src/component/sevices/apiService.jsx` — tên hàm `camelCase`, trả `{EC, EM, DT}`; component dùng `useEffect` + cleanup, handle loading/error giống `ListQuiz.jsx`
- Backend: routes trong `server/routes/`, nối vào `server/index.js`; validation nhẹ, trả `EC/EM/DT` (EC=0 thành công)
- SCSS: dùng CSS variables, đặt trong `Pages.scss` hoặc file riêng gần component
- Tiếng Việt (có dấu) cho UI text; comment tiếng Việt ngắn

## 🧪 TIÊU CHÍ HOÀN THÀNH (Definition of Done)

1. `npm run server` chạy, DB có bảng mới + seed (kiểm tra bằng lệnh query)
2. `curl http://localhost:5000/api/v1/classes` → `{EC:0, DT:[3 lớp]}`
3. `curl http://localhost:5000/api/v1/tips` → `{EC:0, DT:[4 tips]}`; `posts` tương tự
4. Join class: đăng nhập → join → `GET /classes/mine` trả đúng; join lại → idempotent (không lỗi/không trùng)
5. UI 3 trang load từ API, filter chạy, nút hành động có phản hồi (toast/message), loading/error xử lý đẹp
6. `npm test -- --watchAll=false` → **90/90 cũ + test mới đều PASS**
7. `npm run build` chạy không lỗi
8. Commit message rõ ràng, git sạch

## 📁 FILE CẦN ĐỌC TRƯỚC (context tối thiểu)

- `server/index.js` — cách nối routes + normalization
- `server/routes/quizzes.routes.js` — pattern route + optionalAuth/getUserId
- `server/routes/auth.routes.js` — pattern JWT auth middleware
- `src/component/sevices/apiService.jsx` — pattern hàm gọi API
- `src/component/User/ListQuiz.jsx` — pattern useEffect/loading/error
- `src/pages/Classes.jsx`, `TipsNhanh.jsx`, `Blog.jsx`, `Pages.scss` — code hiện cần nâng cấp
- `PLAN.md` — tổng quan dự án

## ✅ KHI XONG

Báo cáo ngắn gọn: bảng schema mới, danh sách routes, file thay đổi, kết quả test (số lượng), và bất kỳ giả định nào bạn đã làm.