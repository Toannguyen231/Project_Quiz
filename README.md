<div align="center">

# 🦊 NNT ACADEMY — QUIZMASTER
### Nền Tảng Ôn Thi Trắc Nghiệm Trực Tuyến & Học Tập Tương Tác Thông Minh

*A Modern Full-Stack EdTech Platform with AI Virtual Tutor, Real-Time Exam Engine & Gamification*

[![React](https://img.shields.io/badge/React-17.0.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-Persisted_State-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Quizzy_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage_Build-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />

[📖 Giới Thiệu](#-giới-thiệu-tổng-quan) • [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật) • [🏛️ Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống) • [🔑 Tài Khoản Trải Nghiệm](#-tài-khoản-trải-nghiệm-demo) • [🚀 Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt--khởi-chạy) • [📡 Danh Mục API](#-danh-mục-api-endpoints) • [🧪 Kiểm Thử & CI/CD](#-kiểm-thử--cicd) • [👨‍💻 Tác Giả](#-tác-giả--liên-hệ)

---

</div>

## 📖 Giới Thiệu Tổng Quan

**NNT Academy (QuizMaster)** là nền tảng kiểm tra, đánh giá năng lực và ôn thi trực tuyến toàn diện theo mô hình Full-Stack Single Page Application (SPA). Dự án được thiết kế chuyên biệt cho học sinh, sinh viên và ứng viên ôn thi học thuật & tuyển dụng, kết hợp giao diện trẻ trung, năng động (*Playful & Energetic EdTech Design System*) cùng trợ lý ảo thông minh **Quizzy 🦊** hỗ trợ giải đáp 24/7.

Hệ thống cung cấp trải nghiệm phân quyền khép kín:
1. **Cổng Học Viên & Thí Sinh (Student Portal)**: Tham gia làm bài thi trắc nghiệm trực quan với đồng hồ đếm ngược, bảng định vị câu hỏi, hệ thống tính điểm tự động, lịch sử thi cử và bảng vàng vinh danh.
2. **Hệ Sinh Thái Học Tập (Learning Ecosystem)**: Tích hợp phòng học trực tuyến, kho video/bài giảng mẹo thi cử 30 giây, blog chia sẻ kinh nghiệm học tập và trợ lý trí tuệ nhân tạo **Quizzy AI (Google Gemini)**.
3. **Trung Tâm Điều Hành Quản Trị (Admin Command Center)**: Quản lý người dùng, phân quyền vai trò (Admin / User), tạo lập ngân hàng đề thi đa cấp độ, xây dựng câu hỏi & bộ đáp án động, phân tích số liệu qua biểu đồ trực quan.

---

## ✨ Tính Năng Nổi Bật

### 🎓 1. Cổng Thi Trực Tuyến & Trải Nghiệm Thí Sinh
- **Danh mục bài thi thông minh**: Duyệt đề thi theo phân loại chủ đề (JavaScript, React, Node.js...), mức độ khó (Easy, Medium, Hard) và thời lượng dự thi.
- **Phòng thi chuẩn hoá (Exam Runner)**:
  - **Đồng hồ đếm ngược thông minh (`useTimer`)**: Đếm ngược thời gian thực, tự động cảnh báo khi gần hết giờ và tự động thu bài khi hết thời gian quy định.
  - **Bảng định vị câu hỏi (Question Palette)**: Bảng câu hỏi tương tác giúp thí sinh chuyển nhanh đến bất kỳ câu hỏi nào, nhận biết trạng thái *Đã trả lời*, *Chưa làm* hoặc *Gắn cờ xem lại*.
  - **Hiển thị đa phương tiện (Media Questions)**: Tích hợp thư viện phóng to hình ảnh/sơ đồ chuyên sâu (`react-awesome-lightbox`) chỉ với 1 cú click.
  - **Lưu tiến trình tự động**: Cơ chế lưu tạm câu trả lời phòng ngừa sự cố mất kết nối mạng.
- **Chấm điểm tức thì & Phân tích đáp án (Detailed Score Review)**:
  - Tính điểm số, tỷ lệ phần trăm chính xác ngay sau khi nộp bài.
  - Hiệu ứng pháo hoa chúc mừng (`canvas-confetti`) tạo động lực cho thí sinh.
  - Modal chẩn đoán kết quả chi tiết: So sánh câu trả lời của thí sinh với đáp án chuẩn của hệ thống kèm lời giải thích.

### 🦊 2. Trợ Lý Ảo Quizzy AI & Hệ Thống Gamification
- **Gia Sư Ảo Quizzy AI (Google Gemini 1.5 Integration)**:
  - Chú cáo thông thái **Quizzy 🦊** luôn xuất hiện hỗ trợ người học ở góc màn hình.
  - Hỗ trợ giải đáp kiến thức học thuật, tóm tắt lý thuyết, hướng dẫn giải thích câu hỏi hóc búa theo thời gian thực.
  - Các gợi ý câu hỏi nhanh (Quick Prompts): Mẹo làm bài trắc nghiệm 30s, chiến thuật thi ĐGNL, từ vựng tiếng Anh.
- **Hệ Thống Động Lực Gamification**:
  - Tích luỹ điểm kinh nghiệm (XP) và nâng cấp cấp bậc (Level).
  - Chuỗi ngày học liên tục (Daily Streak) khích lệ tính kiên trì.
  - Bảng xếp hạng học tập (Leaderboard) ghi danh những thí sinh xuất sắc nhất.
  - Hiệu ứng âm thanh chân thực tương tác khi trả lời đúng / sai / hoàn thành bài thi.
- **Tư Vấn Lộ Trình Tự Động (Telegram Bot API)**:
  - Học viên gửi yêu cầu đăng ký tư vấn lộ trình học tập trực tiếp trên hệ thống.
  - Bot tự động bắn thông báo tức thì về tài khoản Telegram của giảng viên/quản trị viên.

### 📚 3. Hệ Sinh Thái Mở Rộng
- **Lớp Học Trực Tuyến (`/lop-hoc`)**: Danh sách các lớp học đang mở, lịch học hàng tuần, thông tin giảng viên và nút đăng ký tham gia lớp học.
- **Kho Mẹo Thi Cử (`/tips-nhanh`)**: Video/bài học ngắn tổng hợp mẹo thi cử cấp tốc, bộ lọc theo danh mục môn học và thời lượng xem.
- **Góc Chia Sẻ Blog (`/blog`)**: Các bài viết hướng dẫn phương pháp học tập, kinh nghiệm ôn luyện và định hướng nghề nghiệp IT.

### 🛡️ 4. Bảng Điều Khiển Quản Trị Viên (Admin Console)
- **Báo cáo Thống Kê & Phân Tích (Analytics Dashboard)**:
  - Thẻ thống kê tổng quan: Tổng người dùng, Tổng đề thi, Tổng câu hỏi và Lượt dự thi.
  - Biểu đồ phân tích trực quan kết quả và mật độ thí sinh tham gia.
- **Quản Lý Người Dùng Toàn Diện (User CRUD)**:
  - Danh sách người dùng dạng bảng có phân trang (`react-paginate`).
  - Thêm, sửa, xoá và khoá tài khoản; hỗ trợ upload ảnh đại diện (Avatar).
  - Phân quyền vai trò linh hoạt: `ADMIN` (toàn quyền) hoặc `USER` (thí sinh).
- **Quản Lý Ngân Hàng Đề Thi (Quiz Management)**:
  - Tạo mới đề thi với ảnh bìa, mô tả, mức độ khó và thời gian làm bài quy định.
  - Phân quyền gán đề thi theo chỉ định cho từng người dùng cụ thể.
  - Tính năng Import / Export đề thi qua định dạng JSON tiện lợi.
- **Trình Soạn Thảo Câu Hỏi & Đáp Án Động (Question Builder)**:
  - Thêm / bớt động các lựa chọn đáp án cho mỗi câu hỏi.
  - Thiết lập đáp án đúng linh hoạt (Hỗ trợ câu hỏi đơn chọn và đa chọn).
  - Xem trước giao diện câu hỏi (Preview Mode) trực tiếp trước khi xuất bản.

---

## 🏛️ Kiến Trúc Hệ Thống

### 🛠️ Công Nghệ Sử Dụng

| Tầng Hệ Thống | Công Nghệ | Vai Trò & Điểm Nổi Bật |
|---|---|---|
| **Frontend Framework** | **React 17.0.2** | Kiến trúc Single Page Application hướng thành phần |
| **State Management** | **Redux Toolkit + Redux Persist** | Quản lý trạng thái xác thực toàn cục, duy trì phiên đăng nhập |
| **Routing** | **React Router DOM v6.30** | Định tuyến phân cấp với `<Routes>`, `<Route>` và `<Outlet>` |
| **UI & Styling** | **Bootstrap 5.3 + Sass (SCSS)** | Hệ thống lưới responsive, tuân thủ Design System NNT Academy |
| **Admin Navigation** | **React Pro Sidebar** | Sidebar điều hướng quản trị có thể thu gọn linh hoạt |
| **AI Integration** | **Google Gemini API** | Trí tuệ nhân tạo cung cấp năng lực cho gia sư ảo Quizzy |
| **Messaging Bot** | **Telegram Bot API** | Hệ thống thông báo tức thì về điện thoại quản trị viên |
| **Backend Framework** | **Node.js + Express 5** | RESTful API Server bảo mật, tốc độ cao |
| **Database** | **SQLite (better-sqlite3)** | Cơ sở dữ liệu nhúng, kích hoạt chế độ WAL tối ưu hiệu năng |
| **Authentication** | **JWT + Refresh Token Cookie** | Xác thực Token an toàn, mã hoá mật khẩu qua `bcryptjs` |
| **Testing** | **Jest + React Testing Library** | Bộ kiểm thử tự động toàn diện cho reducer, hooks và UI |
| **DevOps & CI/CD** | **Docker + GitHub Actions** | Dockerfile đa tầng (Multi-stage) & tự động test/build trên GitHub |

### 📂 Cấu Trúc Thư Mục Dự Án

```
Quiz-question/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Kịch bản CI/CD tự động chạy test & build
├── server/                        # Backend RESTful API Server (Node.js/Express)
│   ├── config/
│   │   ├── db.js                  # Khởi tạo SQLite, schema & dữ liệu mẫu (Seed Data)
│   │   └── env.js                 # Quản lý biến môi trường Backend
│   ├── middleware/                # JWT Auth, Upload (Multer), Error Handler
│   ├── routes/                    # API Endpoints (Auth, Quizzes, Questions, Classes...)
│   ├── data/                      # Lưu trữ tệp tin SQLite database (.db)
│   └── index.js                   # Điểm khởi chạy Backend Express Server
├── src/                           # Frontend React Application
│   ├── accets/                    # Hình ảnh, minh hoạ & mascot Quizzy 🦊
│   ├── component/
│   │   ├── Admin/                 # Phân hệ Quản trị viên (Admin Portal)
│   │   │   ├── Auth/              # Form Đăng nhập & Đăng ký
│   │   │   ├── Content/           # Dashboard, Quản lý User, Quản lý Quiz & Question
│   │   │   └── Admin.jsx          # Layout khung Admin (Sidebar + Content)
│   │   ├── Common/                # Thành phần dùng chung (MascotCompanion, CloudShader...)
│   │   ├── Header/                # Thanh điều hướng Header toàn cục & thông tin tài khoản
│   │   ├── Home/                  # Trang chủ Landing Page giới thiệu
│   │   ├── User/                  # Cổng Thí Sinh (Danh sách đề, Phòng thi, Bảng kết quả)
│   │   ├── actions/               # Redux Actions & Reducers
│   │   ├── sevices/               # Axios API Services, Quizzy AI & Telegram Service
│   │   └── util/                  # Cấu hình Axios Interceptors & NProgress loader
│   ├── hooks/                     # Custom React Hooks (useAuth, useTimer...)
│   ├── pages/                     # Các trang tiện ích (Classes, TipsNhanh, Blog)
│   ├── styles/                    # Design tokens, mixins & CSS/SCSS chuẩn hoá
│   ├── App.js                     # Root Shell Component
│   ├── Layout.js                  # Cấu hình định tuyến React Router v6
│   └── index.js                   # Bootstrap React với Redux Store Provider
├── Dockerfile                     # Multi-stage Docker build cho môi trường Production
├── package.json                   # Cấu hình dependencies & NPM scripts
└── README.md                      # Tài liệu dự án
```

---

## 🔑 Tài Khoản Trải Nghiệm (Demo)

Hệ thống đã tích hợp sẵn cơ chế **Tự Động Khởi Tạo Dữ Liệu Mẫu (Auto-Seeding)** khi Backend chạy lần đầu. Bạn có thể đăng nhập ngay với các tài khoản sau:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn & Mục Đích Trải Nghiệm |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@quizmaster.dev` | `admin123` | Toàn quyền truy cập Admin Dashboard, Quản lý User, Tạo đề thi, Sửa câu hỏi |
| **Quản trị viên (Dự phòng)** | `admin@gmail.com` | `admin123` | Tài khoản Admin tương đương dự phòng kiểm thử |
| **Thí sinh 1 (Student)** | `user1@quizmaster.dev` | `user123` | Trải nghiệm làm bài thi trắc nghiệm, xem bảng điểm và xếp hạng |
| **Thí sinh 2 (Student)** | `user2@quizmaster.dev` | `user123` | Tài khoản học viên kiểm thử tính năng phân công đề thi riêng biệt |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `16.x` đến `20.x` (hoặc mới hơn)
- **npm**: Phiên bản `8.x` trở lên
- **Git**

### 2. Tải Mã Nguồn Về Máy
```bash
git clone https://github.com/Toannguyen231/Project_Quiz.git
cd Project_Quiz
```

### 3. Cài Đặt Thư Viện Phụ Thuộc
Dự án sử dụng React 17 kết hợp các thư viện giao diện hiện đại, vui lòng dùng flag `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

### 4. Thiết Lập Biến Môi Trường (Environment Variables)

#### 🔹 Cấu hình Frontend (`.env` tại thư mục gốc)
Tạo tệp `.env` dựa theo mẫu `.env.example`:
```ini
PORT=3002

# Google Gemini API Key cho Gia sư ảo Quizzy AI (Lấy tại https://aistudio.google.com/)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Cấu hình Telegram Bot nhận thông báo tư vấn (Tuỳ chọn)
REACT_APP_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
REACT_APP_TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

#### 🔹 Cấu hình Backend (`server/.env`)
Tạo tệp `server/.env` dựa theo mẫu `server/.env.example`:
```ini
PORT=3001
JWT_SECRET=quizmaster_super_secret_jwt_key_2026
DB_PATH=./server/data/quizmaster.db
```

### 5. Khởi Chạy Ứng Dụng (Full-Stack Dev Server)

Chỉ với **MỘT câu lệnh duy nhất**, hệ thống sẽ tự động khởi động đồng thời cả **Backend (Express - Port 3001)** và **Frontend (React - Port 3002)**:

```bash
npm run dev
```

Sau khi khởi chạy thành công:
- 🌐 **Frontend Application**: [http://localhost:3002](http://localhost:3002) *(Tất cả yêu cầu `/api/v1/*` được tự động chuyển hướng proxy sang backend)*
- 🟢 **Backend Healthcheck**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

*(Tuỳ chọn chạy độc lập nếu cần):*
- Chỉ chạy Backend: `npm run server`
- Chỉ chạy Frontend: `npm start`

### 6. Đóng Gói Ứng Dụng (Production Build)
```bash
npm run build
```
Bản build tối ưu hóa cho môi trường Production sẽ được tạo ra tại thư mục `build/`.

### 7. Khởi Chạy Với Docker (Containerization)
Dự án hỗ trợ Dockerfile đa tầng (Multi-stage build) đóng gói toàn bộ Full-Stack gọn nhẹ:
```bash
# Xây dựng Docker Image
docker build -t quizmaster:latest .

# Chạy Docker Container
docker run -p 5000:5000 --name quizmaster-app quizmaster:latest
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:5000`.

---

## 📡 Danh Mục API Endpoints

Hệ thống REST API được định tuyến tại tiền tố `/api/v1`:

| Nhóm Tài Nguyên | Phương Thức | Đường Dẫn Endpoint | Mô Tả Chức Năng | Phân Quyền |
|---|:---:|---|---|:---:|
| **Hệ Thống** | `GET` | `/api/v1/health` | Kiểm tra tình trạng hoạt động của Server | Public |
| **Xác Thực** | `POST` | `/api/v1/login` | Đăng nhập tài khoản & nhận JWT Token | Public |
| | `POST` | `/api/v1/register` | Đăng ký tài khoản thí sinh mới | Public |
| | `POST` | `/api/v1/logout` | Đăng xuất và huỷ Refresh Token Cookie | User/Admin |
| **Người Dùng** | `GET` | `/api/v1/participant` | Lấy danh sách người dùng có phân trang | Admin |
| | `POST` | `/api/v1/participant` | Tạo mới người dùng (Kèm upload avatar) | Admin |
| | `PUT` | `/api/v1/participant` | Cập nhật thông tin hồ sơ người dùng | Admin |
| | `DELETE` | `/api/v1/participant` | Xoá tài khoản người dùng khỏi hệ thống | Admin |
| **Đề Thi** | `GET` | `/api/v1/quiz-by-participant` | Lấy danh sách đề thi được gán cho học viên | User |
| | `GET` | `/api/v1/quiz/all` | Lấy toàn bộ danh sách đề thi hiện có | Admin |
| | `POST` | `/api/v1/quiz` | Tạo đề thi mới (Tên, mô tả, độ khó, thời gian) | Admin |
| | `POST` | `/api/v1/quiz-assign-to-user` | Phân công đề thi cho học viên chỉ định | Admin |
| **Câu Hỏi** | `GET` | `/api/v1/questions-by-quiz?quizId={id}` | Lấy danh sách câu hỏi & các lựa chọn đáp án | User/Admin |
| | `POST` | `/api/v1/question` | Tạo mới hoặc cập nhật câu hỏi & đáp án | Admin |
| **Nộp Bài** | `POST` | `/api/v1/quiz-submit` | Nộp bài làm, tính toán điểm số và lưu lịch sử | User |
| **Thống Kê** | `GET` | `/api/v1/overview` | Lấy các chỉ số tổng quan cho Admin Dashboard | Admin |
| **Lớp Học** | `GET` | `/api/v1/classes` | Lấy danh sách các lớp học trực tuyến | Public |
| **Mẹo Thi Cử** | `GET` | `/api/v1/tips` | Lấy danh sách bài giảng & video mẹo thi cử | Public |
| **Blog** | `GET` | `/api/v1/posts` | Lấy danh sách bài viết chia sẻ kinh nghiệm | Public |

---

## 🧪 Kiểm Thử & CI/CD

### Kiểm Thử Tự Động (Automated Testing)
Dự án được trang bị hệ thống kiểm thử đơn vị (Unit Tests) và kiểm thử tích hợp (Integration Tests) bao phủ các logic trọng yếu:
- Kiểm thử Hook đồng hồ đếm ngược `useTimer` và xử lý hết giờ tự động.
- Kiểm thử luồng xác thực `useAuth` và Redux State Reducer.
- Kiểm thử thuật toán chấm điểm và xử lý đáp án thi trắc nghiệm.
- Kiểm thử giao diện Modal thêm người dùng, bảng đề thi và tích hợp API.

Thực thi kiểm thử với lệnh:
```bash
npm test -- --watchAll=false
```

### Kịch Bản Tích Hợp Liên Tục (CI/CD Pipeline)
Hệ thống tự động kích hoạt quy trình kiểm tra mã nguồn thông qua **GitHub Actions** tại `.github/workflows/ci.yml` mỗi khi có thao tác `push` hoặc tạo `pull_request`:
1. Tải mã nguồn và thiết lập môi trường Node.js.
2. Cài đặt các gói phụ thuộc với `npm ci --legacy-peer-deps`.
3. Chạy toàn bộ các bài Unit Tests để đảm bảo tính toàn vẹn hệ thống.
4. Đóng gói kiểm tra bản build Production Frontend (`npm run build`).

---

## 👨‍💻 Tác Giả & Liên Hệ

<div align="center">

**NGUYỄN NGỌC TOÀN (Toan Nguyen)**  
*Full-Stack Software Engineer — Specializing in React, Node.js & EdTech Real-Time Applications*

[![GitHub](https://img.shields.io/badge/GitHub-Toannguyen231-181717?style=flat-square&logo=github)](https://github.com/Toannguyen231)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Toan_Nguyen-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/toannguyen231)
[![Email](https://img.shields.io/badge/Email-ngoctoann06@gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:ngoctoann06@gmail.com)

*Đóng góp ý kiến hoặc báo lỗi, vui lòng mở một [Issue](https://github.com/Toannguyen231/Project_Quiz/issues) hoặc gửi Pull Request!*

</div>

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Bạn hoàn toàn có thể tự do sử dụng, chỉnh sửa và phát triển tiếp cho mục đích học tập hoặc thương mại.