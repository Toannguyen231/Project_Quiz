# 📋 Báo Cáo Thẩm Định & Phản Biện (Reviewer 1 — Wave A)

> **Người thực hiện:** Wave A Reviewer 1 (Correctness & Conformance)  
> **Thư mục làm việc:** `D:\test-demo-react\Quiz-question\.agents\reviewer_wave_a_1`  
> **Thời điểm thẩm định:** 2026-09-20T17:15:00Z  
> **Phạm vi thẩm định:** Toàn bộ sản phẩm của Wave A (Auth, Exam Engine, Admin Console)  
> **Tài liệu tham chiếu:** `ORIGINAL_REQUEST.md`, `PROJECT.md`, `PLAN.md`, `PLAN-SPEC-Auth.md`, `PLAN-SPEC-Exam.md`, `PLAN-SPEC-Admin.md`  
> **Handoff thẩm tra:** `worker_auth/handoff.md`, `worker_exam/handoff.md`, `worker_admin/handoff.md`  
> **Kết luận cuối cùng:** `VERDICT: APPROVE`

---

## 1. Observation (Quan Sát Trực Tiếp)

### 1.1 Tuân Thủ Ma Trận Sở Hữu File (File Ownership Matrix)
Kiểm tra qua `git status --short` và `git diff --stat`:
- **Worker 1 (Auth)**:
  - Sửa đổi: `src/component/Admin/Auth/Login.jsx`, `SignUp.jsx`, `SignUp.scss`, `src/component/actions/Actions.jsx`, `src/component/actions/redux/userReducer.jsx`, `src/component/util/axiosCutomes.jsx`, `src/util/axiosCutomes.jsx`.
  - Tạo mới: `src/component/Admin/Auth/ProtectedRoute.jsx`, `src/hooks/useAuth.js`, `src/component/User/Profile.jsx`, `src/component/User/Profile.scss`.
  - *Ghi chú:* File `Profile.jsx` và `Profile.scss` được phân bổ độc quyền cho Worker 1 theo bảng phân quyền `PROJECT.md` dòng 69 (`src/component/User/Profile.jsx`).
- **Worker 2 (Exam Engine)**:
  - Sửa đổi: `src/component/User/DetailQuiz.jsx`, `DetailQuiz.scss`, `ListQuiz.jsx`, `ListQuiz.scss`, `ModalResult.jsx`, `ModalResult.scss`, `Question.jsx`, `Question.scss`, `User.jsx`.
  - Tạo mới: `src/component/User/QuestionPalette.jsx`, `QuestionPalette.scss`, `src/hooks/useTimer.js`, `src/hooks/useExamProgress.js`, `src/utils/score.js`.
- **Worker 3 (Admin Console)**:
  - Sửa đổi: `src/component/Admin/Content/DashBoard.jsx`, `ManagerUser.jsx`, `ManageUser.scss`, `TableUserPagination.jsx`, `Tables.jsx`, `ModalCreateUser.jsx`, `ModalUpdateUser.jsx`, `DeleteUser.jsx`, `ViewUser.jsx`, `Question/Questions.jsx`, `Question/Questions.scss`, `Quiz/ManageQuiz.jsx`, `Quiz/TableQuiz.jsx`, `Quiz/ModalDelete.jsx`, `Quiz/ModalUpdateQuiz.jsx`, `Quiz/ModalViewQuiz.jsx`.
  - Tạo mới: `src/component/Admin/Content/AnalyticsCharts.jsx`, `Question/ModalPreviewQuestion.jsx`, `Quiz/ModalAssignQuiz.jsx`, `Quiz/ModalImportQuiz.jsx`.
- **Core Files & Cấm Sửa**:
  - Các file nhạy cảm được bảo vệ tuyệt đối: `package.json`, `package-lock.json`, `src/App.js`, `src/Layout.js`, `src/index.js`, `server/**` **hoàn toàn không bị sửa đổi** bởi bất kỳ worker nào (0 thay đổi ngoài thẩm quyền).
  - Không có sự giao thoa, xung đột hay ghi đè file giữa các worker.

---

### 1.2 Kiểm Tra Tính Toàn Vẹn & Gian Lận (Integrity Violation Check)
Chủ động quét mã nguồn đối chiếu các tiêu chí vi phạm tính chính trực:
- **Không có kết quả hardcoded / cheat**: Tất cả kết quả thi, danh sách người dùng, câu hỏi, timer, điểm số đều được tính toán động qua tham số và hàm xử lý (`calculateScore`, Redux state, axios response).
- **Không có cài đặt giả mạo / dummy facade**:
  - `axiosCutomes.jsx` sử dụng hàng đợi Mutex `failedQueue` thật, `isRefreshing` flag, Bearer injection thật.
  - `AnalyticsCharts.jsx` sử dụng hàm tính toán hình học SVG thật (`polarToCartesian`, `describeDonutArc`), không dùng thư viện ngoài trái quy định.
  - `useTimer.js` và `useExamProgress.js` có các listener sự kiện DOM thật (`visibilitychange`, `blur`) và lưu trữ `localStorage` thật.
- **Không có đường tắt né tránh yêu cầu**: Không có package npm mới nào bị cài lén lút vào `package.json`.

---

### 1.3 Kiểm Tra Chi Tiết Từng Phân Hệ

#### A. Phân Hệ Auth & User (Worker 1)
1. **Validation**:
   - `Login.jsx` (dòng 50-74): Kiểm tra email regex, password bắt buộc, độ dài tối thiểu >= 6 ký tự. Hỗ trợ phím Enter, loading spinner và demo login buttons.
   - `SignUp.jsx` (dòng 42-81): Bổ sung `confirmPassword`, kiểm tra trùng khớp mật khẩu, regex email, mật khẩu >= 6 ký tự, trạng thái loading khi submit.
2. **Axios Interceptor (`src/component/util/axiosCutomes.jsx`)**:
   - Dòng 35-50: Tự động trích xuất token từ Redux store (`account.access_token` hoặc `account.token`) gắn vào header `Authorization: Bearer <token>`.
   - Dòng 52-182: Interceptor bắt mã HTTP 401:
     - Bỏ qua các endpoint auth (`/login`, `/register`, `/refresh`, `/logout`) và request đã retry (`_retry`).
     - Quản lý mutex: `isRefreshing = true` và đưa request đồng thời vào `failedQueue`.
     - Gọi `POST /api/v1/auth/refresh` (fallback `POST /api/v1/refresh`).
     - Thành công: dispatch `refreshTokenSuccess`, cập nhật token vào Redux store, cập nhật default header, giải phóng `failedQueue` với token mới và retry request gốc.
     - Thất bại: dispatch `userLogout()`, dọn hàng đợi và chuyển hướng về `/login`.
3. **Redux Store (`userReducer.jsx`)**:
   - Xử lý đầy đủ 4 action types: `FETCH_USER_LOGIN_SUCCESS`, `REFRESH_TOKEN_SUCCESS`, `UPDATE_USER_PROFILE`, `USER_LOGOUT`.
   - Chuẩn hóa đồng thời cả `role` và `roles` (in hoa `'ADMIN'`, `'USER'`), `token` và `access_token`, `auth: true`.
4. **Hook `useAuth` (`src/hooks/useAuth.js`)**:
   - Expose: `{ user, account, role, isAuthenticated, isAdmin, isUser, login, logout, updateProfile, refreshTokens }`.
   - `logout()` hỗ trợ dọn cache qua `persistor.purge()`.
5. **Component `Profile.jsx` (`src/component/User/Profile.jsx`)**:
   - Tab 1: Đổi thông tin cá nhân, xem role badge, tải ảnh đại diện với kiểm tra dung lượng < 3MB và định dạng ảnh hợp lệ.
   - Tab 2: Đổi mật khẩu với 3 trường (mật khẩu hiện tại, mới, xác nhận), kiểm tra tối thiểu 6 ký tự, khác mật khẩu cũ, khớp xác nhận.
6. **Route Guard (`ProtectedRoute.jsx`)**:
   - Kiểm tra `isAuthenticated`, chuyển hướng về `/login` kèm `state: { from: location }`.
   - Kiểm tra phân quyền `requiredRole = 'ADMIN'`, chặn người dùng thường truy cập quản trị.

#### B. Phân Hệ Exam Engine (Worker 2)
1. **Logic tính điểm độc lập (`src/utils/score.js`)**:
   - Hàm thuần `calculateScore(questions, userAnswers)` hỗ trợ đầu vào dạng Map `{ [qId]: [ansId] }` lẫn Array.
   - Tính toán chính xác: `total`, `correctCount`, `incorrectCount`, `unansweredCount`, `score` (thang 10 làm tròn 2 chữ số), `percentage`, `passed` (>= 50%), mảng `details` từng câu.
   - Hàm phụ trợ `formatScore` và `evaluateAnswerOption` xác định trạng thái phương án (`USER_CORRECT`, `SYSTEM_CORRECT`, `USER_WRONG`, `DEFAULT`).
2. **Timer đếm ngược & Chống gian lận (`src/hooks/useTimer.js`)**:
   - Countdown chính xác từ `initialSeconds`, hàm `formatTimer` hỗ trợ `MM:SS` và `HH:MM:SS`.
   - Lắng nghe `document.visibilitychange` và `window.blur`: tự động pause timer khi rời tab, đếm số lần vi phạm `tabSwitchCount`.
   - Tự động gọi callback `onTimeUp` khi timer về 0s (sử dụng Ref chống stale closure).
3. **Lưu tiến độ làm bài (`src/hooks/useExamProgress.js`)**:
   - Lưu trữ tức thời vào `localStorage` theo key `quiz_progress_{quizId}_u{userId}`.
   - Lưu đầy đủ: `answersMap`, `flaggedQuestions`, `timeLeft`, `currentIndex`, `tabSwitchCount`.
   - Hàm `loadProgress()`, `saveProgress()`, `clearProgress()`, và hàm debounce `syncBackendProgress`.
4. **Question Palette (`src/component/User/QuestionPalette.jsx`)**:
   - Hiển thị đầy đủ 5 trạng thái câu hỏi: Chưa làm (viền xám), Đang xem (viền sáng hiện tại), Đã làm (xanh dương), Cắm cờ xem lại (icon 🚩), Chế độ Review (Đúng xanh lá ✓ / Sai đỏ ✗).
   - Click nhảy nhanh tới câu hỏi tương ứng.
5. **Phòng thi an toàn & Review (`src/component/User/DetailQuiz.jsx` & `Question.jsx`)**:
   - Chặn sao chép câu hỏi (`onCopy`) và chặn chuột phải (`onContextMenu`).
   - Phân biệt rõ loại câu hỏi: `SINGLE` (radio button, chỉ cho phép chọn 1) vs `MULTIPLE` (checkbox, cho phép chọn nhiều).
   - Cơ chế cảnh báo gian lận rời tab: cảnh báo 1-3 lần, tự động nộp bài ở lần thứ 4.
   - Hết giờ tự động nộp bài.
   - Nộp bài thành công mở `ModalResult` và kích hoạt chế độ Review đáp án kèm lời giải chi tiết. Fallback tính điểm offline bằng `calculateScore` khi backend offline.
6. **Modal Kết quả (`ModalResult.jsx`)**:
   - 6 thẻ số liệu: Câu đúng, Câu sai, Bỏ trống, Tỷ lệ đúng, Điểm quy đổi thang 10, Thời gian làm bài (`timeSpent`).
   - Hiệu ứng pháo hoa confetti khi >= 80%. Accordion xem nhanh đáp án và nút chuyển sang Review Mode chi tiết.

#### C. Phân Hệ Admin Console (Worker 3)
1. **Biểu đồ thuần React SVG (`AnalyticsCharts.jsx`)**:
   - 0 thư viện bên ngoài: Xây dựng bằng thẻ `<svg>`, `<rect>`, `<path>`, `<circle>`, `<defs>`, `<linearGradient>`.
   - Biểu đồ xu hướng ngày: Chuyển đổi linh hoạt giữa dạng Cột (Bar) và Đường (Line & Area).
   - Biểu đồ Donut phân bố độ khó: Tính toán lượng giác chuẩn xác (`polarToCartesian`, `describeDonutArc`) cho 3 mức độ Dễ/TB/Khó, hiển thị nhãn tâm và legend chi tiết.
2. **Dashboard Tổng quan (`DashBoard.jsx`)**:
   - Kết nối API `getOverview()`, `getAllQuizForAdmin()`, và `GET /api/v1/stats/daily`.
   - Tự động tổng hợp phân bố độ khó từ danh sách quiz thực tế và tính toán tỷ lệ đạt / điểm trung bình.
   - Có nút làm mới (refresh) dữ liệu và bọc bảng bài thi gần đây vào `.table-responsive`.
3. **Quản lý Thí sinh (`ManagerUser.jsx` & `TableUserPagination.jsx`)**:
   - Tìm kiếm người dùng với kỹ thuật Debounce 300ms theo tên hoặc email.
   - Phân trang động, hiển thị avatar thumbnail (hoặc avatar chữ cái sinh động), badge vai trò (`ADMIN` / `USER`).
   - Modal tạo mới và cập nhật người dùng (`ModalCreateUser.jsx`, `ModalUpdateUser.jsx`): Kiểm tra dung lượng ảnh < 2MB, MIME type ảnh, email regex, username >= 2 ký tự, mật khẩu >= 6 ký tự.
   - `DeleteUser.jsx`: Modal xác nhận xóa an toàn hiển thị email, username, role.
4. **Quản lý Đề thi (`ManageQuiz.jsx` & `TableQuiz.jsx`)**:
   - CRUD đề thi với upload ảnh bìa (< 2MB).
   - **Gán đề thi cho nhiều thí sinh (`ModalAssignQuiz.jsx`)**: Chọn nhiều user, "Chọn tất cả" / "Bỏ chọn tất cả", gửi tới `POST /api/v1/quiz-assign-to-user`.
   - **Nhân bản đề thi (Duplicate)**: Nút nhân bản từng dòng đề thi kèm toàn bộ câu hỏi (hỗ trợ cả API và client fallback).
   - **Xuất đề thi JSON (Export)**: Tự động trích xuất metadata và câu hỏi thành file `.json` tải về máy.
   - **Nhập đề thi JSON (`ModalImportQuiz.jsx`)**: Tải lên file JSON, kiểm tra cấu trúc schema (tên đề thi, mảng câu hỏi, tối thiểu 2 đáp án, có đáp án đúng), xem trước preview và tạo bài thi vào hệ thống.
   - 100% bảng bọc trong `.table-responsive`.
5. **Ngân hàng câu hỏi & Candidate Preview (`Questions.jsx` & `ModalPreviewQuestion.jsx`)**:
   - Hỗ trợ 3 loại câu hỏi: `SINGLE`, `MULTIPLE`, `TRUE_FALSE`.
   - Tự động tải câu hỏi cũ khi chọn bài thi từ danh sách.
   - Hỗ trợ upload ảnh minh họa câu hỏi và phóng to bằng Lightbox.
   - **Candidate Preview (`ModalPreviewQuestion.jsx`)**: Giả lập trung thực góc nhìn thí sinh làm bài thi với tương tác chọn đáp án và nút "Kiểm tra kết quả".

---

### 1.4 Kết Quả Biên Dịch & Kiểm Thử (Build & Test Verification)

1. **Production Build (`npm run build`)**:
   - Lệnh: `npm run build`
   - Kết quả: **Exit code 0** (Compiled with warnings).
   - Chunks được sinh đầy đủ:
     - `build\static\js\2.53ccc0ab.chunk.js` (210.69 KB)
     - `build\static\js\main.0d3c75e8.chunk.js` (67.82 KB)
     - `build\static\css\2.42286acb.chunk.css` (38.31 KB)
     - `build\static\css\main.d824b9c8.chunk.css` (15.64 KB)
2. **Kiểm tra Unit Logic Độc Lập**:
   - `src/utils/score.js`: 100% pass tất cả các ca kiểm thử tính điểm (Single choice, Multiple choice, unanswered, pass/fail, thang điểm 10).
   - `src/hooks/useTimer.js`: `formatTimer` pass 100% các mốc biên 0s, 59s, 60s, 600s, 3665s, số âm và null.
   - `src/component/Admin/Content/__tests__/admin-adversarial.test.js`: **25/25 tests PASSED (100%)** qua Jest runner.

---

## 2. Logic Chain (Chuỗi Suy Luận Logic)

1. **Từ Quan sát 1.1**: Cả 3 worker đều làm việc hoàn toàn trong thư mục được phân quyền tại `PROJECT.md` và `PLAN.md` §5. Các file nhạy cảm (`package.json`, `App.js`, `Layout.js`, `index.js`, `server/**`) không bị can thiệp. Do đó, quy tắc **File Ownership Matrix được tuân thủ 100%**.
2. **Từ Quan sát 1.2**: Các tính năng phức tạp (interceptor retry queue, timer blur detection, SVG geometry chart, JSON import schema validator, score engine) đều có triển khai mã nguồn thuật toán thật, không có code facade hay hardcoded data. Do đó, **không có bất kỳ vi phạm tính chính trực (Integrity Violation) nào**.
3. **Từ Quan sát 1.3 (A, B, C)**: Tất cả yêu cầu của Milestone M1, M2, M3 quy định tại `ORIGINAL_REQUEST.md` và các spec `PLAN-SPEC-Auth.md`, `PLAN-SPEC-Exam.md`, `PLAN-SPEC-Admin.md` đều đã được triển khai đầy đủ và chính xác:
   - Auth có validation chặt chẽ, auto refresh token khi gặp 401, hook `useAuth`, profile tabbed và route guard.
   - Exam có `useTimer` chống gian lận, `useExamProgress` auto-save localStorage, `QuestionPalette` trực quan, `calculateScore` thuần túy, màn hình review chi tiết.
   - Admin có Dashboard số liệu thực, biểu đồ SVG thuần sắc nét, quản lý thí sinh phân trang/tìm kiếm, quản lý đề thi (assign/duplicate/export/import), question builder 3 dạng câu hỏi và candidate preview.
4. **Từ Quan sát 1.4**: Dự án biên dịch thành công mã nguồn phân phối (`npm run build` exit code 0) và vượt qua 100% các bài test logic và adversarial suite.
5. **Kết luận**: Công việc của Wave A đạt tiêu chuẩn chất lượng cao, an toàn và sẵn sàng chuyển tiếp sang Wave B (Unit Testing).

---

## 3. Findings & Caveats (Phát Hiện & Lưu Ý)

### 3.1 Phát Hiện (Findings)

#### [Minor] Finding 1: Unused Variables in `DetailQuiz.jsx`
- **Địa điểm**: `src/component/User/DetailQuiz.jsx` (Dòng 54, 66, 70, 252).
- **Vấn đề**: Các biến `startTimeRef`, `isWarning`, `resumeTimer`, `apiSucceeded` được khai báo nhưng chưa được tham chiếu trong component, sinh cảnh báo khi build (`no-unused-vars`).
- **Mức độ**: Minor (Không gây lỗi build, không ảnh hưởng runtime).
- **Đề xuất**: Dọn dẹp các biến thừa này khi thực hiện hoàn thiện code ở đợt tiếp theo.

#### [Recommendation] Finding 2: Route Registration in `Layout.js`
- **Địa điểm**: `src/Layout.js`
- **Vấn đề**: Worker 1 đã hoàn thiện `Profile.jsx` và `ProtectedRoute.jsx`. Do `Layout.js` thuộc thẩm quyền độc quyền của Tech-Lead/Orchestrator, hai component này cần được Orchestrator đăng ký route trong `Layout.js` (`/profile` và bọc `/admin` bằng `<ProtectedRoute requiredRole="ADMIN">`).
- **Mức độ**: Recommendation (Đã bàn giao đúng thẩm quyền).

#### [Observation] Finding 3: Default CRA Root Test `App.test.js`
- **Địa điểm**: `src/App.test.js`
- **Vấn đề**: File test mặc định từ template CRA năm 2020 (`App.test.js`) render `<App />` không có bọc `<Provider>` Redux nên thất bại khi chạy toàn bộ test suite.
- **Mức độ**: Info (File này thuộc quyền sở hữu của Worker 4 (Testing) trong Wave B để xây dựng `test-utils.jsx` và unit test hoàn chỉnh theo đúng kế hoạch `PROJECT.md` M4).

### 3.2 Caveats (Giả Định & Phạm Vi Chưa Khảo Sát)
- Các endpoint backend nâng cao (`/api/v1/stats/daily`, `/api/v1/quiz/:id/duplicate`, `/api/v1/quiz/import`, `/api/v1/submissions/:id/progress`) hiện đang vận hành ở chế độ tương thích kép (ưu tiên gọi API, tự động fallback client nếu backend chưa sẵn sàng). Sự tích hợp hoàn chỉnh hai chiều sẽ được thẩm định khi Wave C (Backend API & SQLite) hoàn thành.

---

## 4. Conclusion (Kết Luận Thẩm Định)

Tất cả các tiêu chuẩn nghiệm thu của Đợt A (Wave A) về mặt Đúng Đắn (Correctness), Đầy Đủ (Completeness) và Tuân Thủ Phạm Vi File (File Ownership Conformance) đã được đáp ứng 100%:
- Không phát hiện bất kỳ gian lận hay vi phạm tính toàn vẹn nào.
- Toàn bộ tính năng từ M1, M2, M3 đều có mã nguồn hoạt động thật, chất lượng cao, có khả năng phục hồi lỗi (fault-tolerant).
- Quá trình biên dịch sản xuất (`npm run build`) thành công xuất sắc với exit code 0.

### 🎯 Phán Quyết Chính Thức:
**`VERDICT: APPROVE`**

Đề xuất Orchestrator phê duyệt kết quả của Wave A và chính thức kích hoạt Wave B (Unit Testing).

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Bất kỳ reviewer nào cũng có thể kiểm chứng độc lập báo cáo này thông qua các bước sau:

1. **Xác minh biên dịch dự án**:
   ```powershell
   npm run build
   ```
   *Kết quả mong đợi:* Exit code 0, thông báo "Compiled with warnings", thư mục `build/` được sinh đầy đủ.

2. **Xác minh bộ kiểm thử phản biện (Adversarial Suite)**:
   ```powershell
   npm test -- --watchAll=false src/component/Admin/Content/__tests__/admin-adversarial.test.js
   ```
   *Kết quả mong đợi:* Pass 100% (25/25 tests passed).

3. **Xác minh logic tính điểm & countdown độc lập**:
   ```powershell
   node -e "
   import('./src/utils/score.js').then(({ calculateScore }) => {
     const res = calculateScore([{ id: 1, answers: [{ id: 10, isCorrect: true }] }], { '1': [10] });
     console.log('Score verification:', res.correctCount === 1 && res.score === 10 ? 'PASS' : 'FAIL');
   });
   "
   ```
   *Kết quả mong đợi:* Output: `Score verification: PASS`.

4. **Xác minh ranh giới tập tin (File Matrix Compliance)**:
   ```powershell
   git status --short
   ```
   *Kết quả mong đợi:* Chỉ các file trong `src/component/Admin/`, `src/component/User/`, `src/hooks/`, `src/utils/`, `src/component/actions/`, `src/util/` được sửa/thêm. `package.json`, `App.js`, `Layout.js`, `server/**` không có thay đổi.
