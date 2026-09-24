# 🚀 Hướng Dẫn Deploy NNT Academy (Backend: Render • Frontend: Vercel)

Tài liệu này hướng dẫn chi tiết từng bước để đưa hệ thống **NNT Academy (QuizMaster)** lên môi trường online với tên miền **`nnt-academy`** hoàn toàn miễn phí.

---

## 📌 BƯỚC 1: Deploy Backend lên Render (Làm trước để lấy URL API)

Backend Node.js/Express quản lý Cơ sở dữ liệu SQLite, Authentication (JWT), đề thi, câu hỏi và tính điểm.

### Các bước thực hiện:

1. Đẩy code mới nhất lên GitHub:
   ```bash
   git add .
   git commit -m "feat: prepare production deployment for Render & Vercel"
   git push origin main
   ```
2. Truy cập [dashboard.render.com](https://dashboard.render.com) và đăng nhập bằng tài khoản GitHub.
3. Bấm nút **New +** ➔ Chọn **Web Service**.
4. Chọn kết nối với repository: **`Toannguyen231/Project_Quiz`**.
5. Cấu hình thông số Web Service:
   - **Name**: `nnt-academy-backend`
   - **Region**: `Singapore` (để server phản hồi nhanh nhất tại Việt Nam)
   - **Branch**: `main`
   - **Root Directory**: *(Để trống)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Instance Type**: `Free`
6. Kéo xuống mục **Environment Variables** ➔ Bấm **Add Environment Variable** để thêm 3 biến:
   - 🔑 `PORT`: `10000`
   - 🔑 `JWT_SECRET`: `quizmaster_secret_jwt_key_2026_nnt_academy` (hoặc chuỗi bảo mật tùy ý)
   - 🔑 `CLIENT_URL`: `https://nnt-academy.vercel.app` (domain frontend Vercel ở Bước 2)
7. Bấm **Create Web Service** và chờ Render build trong khoảng 1-2 phút.
8. Khi build hoàn tất, Render sẽ cấp cho bạn URL Backend có dạng:
   👉 **`https://nnt-academy-backend.onrender.com`** *(Hãy copy đường link này!)*

---

## 📌 BƯỚC 2: Deploy Frontend lên Vercel (Tên miền `nnt-academy`)

Frontend React Single Page Application (SPA) chứa toàn bộ giao diện học viên, phòng thi trắc nghiệm, gia sư Quizzy AI và bảng điều khiển Admin.

### Các bước thực hiện:

1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Bấm **Add New...** ➔ Chọn **Project**.
3. Tìm và chọn repository: **`Project_Quiz`** ➔ Bấm **Import**.
4. Cấu hình Project trên Vercel:
   - **Project Name**: `nnt-academy` *(Để đường link sinh ra là `https://nnt-academy.vercel.app`)*
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./` *(mặc định)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Mở mục **Environment Variables** và thêm các biến môi trường sau:
   - 🌐 **Biến 1 (API Backend vừa lấy ở Bước 1)**:
     - **Key**: `REACT_APP_API_URL`
     - **Value**: Dán URL backend Render (Ví dụ: `https://nnt-academy-backend.onrender.com`)
   - 🤖 **Biến 2 (Quizzy AI Google Gemini)**:
     - **Key**: `REACT_APP_GEMINI_API_KEY`
     - **Value**: Mã API Key Gemini của bạn (đã có trong file `.env`)
   - ⚙️ **Biến 3 (Fix OpenSSL trên Node 18+)**:
     - **Key**: `NODE_OPTIONS`
     - **Value**: `--openssl-legacy-provider`
6. Bấm **Deploy**.
7. Chờ khoảng 1 - 2 phút, Vercel sẽ cấp cho bạn tên miền chính thức:
   👉 **`https://nnt-academy.vercel.app`**

---

## 🔑 Tài Khoản Đăng Nhập Trải Nghiệm Mẫu

Hệ thống đã tự động kích hoạt chế độ **Auto-Seed Data** ngay khi Backend khởi động lần đầu:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@quizmaster.dev` | `admin123` | Toàn quyền Admin: Quản lý đề thi, câu hỏi, tài khoản người dùng |
| **Học viên (Student)** | `user1@quizmaster.dev` | `user123` | Trải nghiệm làm bài thi trắc nghiệm, xem bảng xếp hạng |

---

## 💡 Lưu Ý Quan Trọng Về Gói Miễn Phí Của Render
- Trên gói Free của Render, server sẽ tạm "ngủ" (Spin down) nếu không có truy cập sau 15 phút.
- Lần đầu tiên truy cập lại sau khi ngủ, Render sẽ mất khoảng **30 - 50 giây** để khởi động lại máy chủ (sau đó hệ thống sẽ phản hồi rất nhanh).
- Để kiểm tra Backend đã tỉnh chưa, bạn có thể mở đường dẫn: `https://nnt-academy-backend.onrender.com/api/v1/health`. Khi thấy trả về `{"status":"ok"}` là Backend đã sẵn sàng!
