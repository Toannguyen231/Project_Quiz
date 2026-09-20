# 📋 Báo Cáo Khảo Sát & Khai Thác Đặc Tả: Exam Engine & Admin Console

> **Tác giả:** Exam & Admin Surveyor (Specification Miner)  
> **Thời điểm:** 2026-09-20T17:05:00Z  
> **Thư mục làm việc:** `D:\test-demo-react\Quiz-question\.agents\survey_exam_admin_explorer`  
> **Mục tiêu:** Khảo sát toàn diện mã nguồn hiện tại, đối chiếu với `PLAN-SPEC-Exam.md` và `PLAN-SPEC-Admin.md`, bóc tách toàn bộ tính năng, xác định khoảng cách (gaps), ma trận sở hữu file (File Ownership Matrix) và đặc tả hợp đồng API (API Contracts) phục vụ triển khai Đợt A (Wave A).

---

## 📑 Bảng Tính Năng Đã Khai Thác (Features Discovered)

| # | Phân Hệ | Tính Năng | Mô Tả Hiện Trạng | Tham Số Vào (Inputs) | Đầu Ra (Outputs) | Hành Vi Khi Lỗi (Error Handling) | Nguồn Phát Hiện |
|---|---|---|---|---|---|---|---|
| 1 | Exam | Danh sách đề thi (`ListQuiz.jsx`) | Hiển thị danh sách bài thi từ API `getQuzizeByPage()`, lọc client-side theo tên (`searchTerm`) và độ khó (`filterDifficulty`), có leaderboard | `searchTerm`, `filterDifficulty` | Danh sách card bài thi kèm banner, badge, thời lượng, số câu hỏi | `console.warn`, fallback `mockService.js` khi mất mạng | `src/component/User/ListQuiz.jsx:27-43` |
| 2 | Exam | Đồng hồ đếm ngược inline (`DetailQuiz.jsx`) | Dùng `setInterval(1000)` đếm ngược từ `duration * 60s`, đổi màu theo ngưỡng `<120s`, `<300s`, tự gọi `handleFinish()` khi hết giờ | `location.state.duration` (mặc định 10 phút) | `timeLeft` state, format `mm:ss` | Khi `timeLeft <= 0`, tự động submit bài | `src/component/User/DetailQuiz.jsx:22, 231-248` |
| 3 | Exam | Lưu & khôi phục tiến độ inline (`DetailQuiz.jsx`) | Dùng `useEffect` trực tiếp ghi `localStorage.setItem('quiz_progress_' + id)` và khôi phục trong `fetchQuizDetails` | `answersMap`, `timeLeft`, `flaggedQuestions`, `index` | Dữ liệu JSON trong localStorage | `try/catch` bọc quanh, log `console.warn` | `src/component/User/DetailQuiz.jsx:58-90, 104-130` |
| 4 | Exam | Cắm cờ câu hỏi (Flag Question) | Cho phép thí sinh cắm cờ (🚩) để đánh dấu các câu cần kiểm tra lại | `questionId` | `flaggedQuestions` mảng ID câu hỏi | Bỏ qua nếu `!qId` | `src/component/User/DetailQuiz.jsx:280-288`, `Question.jsx:91-100` |
| 5 | Exam | Ma trận câu hỏi inline | Lưới số câu hỏi 1..N hiển thị trạng thái đã chọn/chưa chọn/cắm cờ/đang làm; trong Review Mode đổi màu Đúng/Sai | `dataQuiz`, `index`, `flaggedQuestions`, `dataModalResult` | UI button matrix | Không có xử lý lỗi riêng | `src/component/User/DetailQuiz.jsx:458-553` |
| 6 | Exam | Nộp bài & Tính điểm (`DetailQuiz.jsx`, `ModalResult.jsx`) | Gọi `postSubmitQuiz(payload)`. Nếu lỗi mạng, tự tính điểm offline dựa trên `a.isCorrect` trong danh sách câu hỏi | `payload: { quizId, answers: [{ questionId, userAnswerId }] }` | `countCorrect`, `countTotal`, `percentage`, `quizData` | Fallback offline calculation tự động | `src/component/User/DetailQuiz.jsx:133-228` |
| 7 | Exam | Chế độ xem lại bài (Review Mode) | Read-only mode sau khi nộp bài: tô màu phương án đúng (xanh), phương án sai (đỏ), hiển thị lời giải và nút kích hoạt Mascot Quizzy AI | `isReviewMode = true`, `questionResult` | UI chi tiết từng phương án kèm giải thích (`explanation`) | N/A | `src/component/User/DetailQuiz.jsx:332-340`, `Question.jsx:124-235` |
| 8 | Exam | Kết quả & Ăn mừng (`ModalResult.jsx`) | Modal popup 4 thẻ chỉ số (đúng, sai, %, điểm/10), bắn pháo hoa giấy confetti nếu `>= 80%`, có nút mở chế độ xem lại | `dataModalResult`, `dataQuiz` | Bootstrap Modal, canvas-confetti | N/A | `src/component/User/ModalResult.jsx:13-23, 40-204` |
| 9 | Admin | Tổng quan hệ thống (`DashBoard.jsx`) | Gọi `getOverview()`, hiển thị 4 thẻ số liệu (Quizzes, Questions, Users, Submissions), bảng bài thi gần đây, nút Reset Demo Data | API `GET /api/v1/overview` | 4 cards tổng quan + recent submissions table | Log `console.warn`, fallback `mockService.js` | `src/component/Admin/Content/DashBoard.jsx:20-56` |
| 10 | Admin | Quản lý Thí sinh (`ManagerUser.jsx`) | Phân trang danh sách người dùng (`LIMIT_USER = 6`), Create/Update/Delete/View người dùng qua các Modal | `page`, `LIMIT_USER`, form data user | Danh sách bảng phân trang + modal tương tác | Toast lỗi `react-toastify` | `src/component/Admin/Content/ManagerUser.jsx:22-68` |
| 11 | Admin | Quản lý Đề thi (`ManageQuiz.jsx`) | Accordion tạo mới đề thi (tên, mô tả, độ khó EASY/MEDIUM/HARD, ảnh bìa), bảng danh sách đề thi (`TableQuiz.jsx`), Modal View/Update/Delete | Form inputs, file upload, API `getAllQuizForAdmin()` | Bảng đề thi, Modal CRUD | Toast cảnh báo & lỗi | `src/component/Admin/Content/Quiz/ManageQuiz.jsx:49-72` |
| 12 | Admin | Ngân hàng Câu hỏi (`Questions.jsx`) | Chọn đề thi qua Select dropdown, form động thêm/xóa câu hỏi & đáp án, gán checkbox `iscorrect`, upload ảnh câu hỏi + Lightbox, lưu qua `postSaveQuestionsForQuiz` | `selectedQuiz`, mảng `questions` động | Gửi danh sách câu hỏi về backend | Toast cảnh báo validate (thiếu nội dung, thiếu đáp án đúng) | `src/component/Admin/Content/Question/Questions.jsx:61-197` |

---

## ⚠️ Bảng Trường Hợp Biên (Edge Cases Observed)

| # | Tính Năng | Đầu Vào / Kịch Bản | Hành Vi Ghi Nhận Thực Tế Trong Code |
|---|---|---|---|
| 1 | Exam Timer | Thí sinh chuyển tab hoặc ẩn trình duyệt | **Không dừng**: `setInterval` tiếp tục chạy ngầm trong background, không có listener `visibilitychange` hay `blur`. Không phát hiện gian lận. |
| 2 | Exam Timer | Thời gian về `<= 0` khi thí sinh đang làm | Tự động kích hoạt `handleFinish()`, nộp toàn bộ phương án đã chọn tại thời điểm đó lên server. |
| 3 | Exam Auto-save | F5 hoặc reload trình duyệt giữa lúc làm bài | Khôi phục đúng `answersMap`, `flaggedQuestions`, `timeLeft`, `index` từ `localStorage`. Nhưng **không đồng bộ với backend** nếu đổi máy tính/trình duyệt. |
| 4 | Exam Auto-save | Dữ liệu `localStorage` bị hỏng hoặc null | `JSON.parse` nằm trong `try/catch`, nếu lỗi sẽ catch và bỏ qua, tiếp tục bài thi trắng mà không gây crash trang. |
| 5 | Exam Submission | Mất kết nối mạng khi nhấn nộp bài | `postSubmitQuiz` ném lỗi mạng -> `isNetworkError` bắt được -> fallback sang tính điểm offline dựa trên thuộc tính `isCorrect` có sẵn trong bộ câu hỏi. |
| 6 | Exam Review Mode | Thí sinh nhấn chọn đáp án khi đang ở Review Mode | Bị chặn hoàn toàn: hàm `handleSelectAnswer` kiểm tra `if (isReviewMode) return;`. Không thay đổi được câu trả lời. |
| 7 | Admin User Search | Nhập từ khóa tìm kiếm thí sinh | **Chưa hỗ trợ**: `ManagerUser.jsx` và `TableUserPagination.jsx` không có ô tìm kiếm, API `getPageUserWithPage` chỉ truyền `page` và `limit`. |
| 8 | Admin User Avatar | Upload file không phải ảnh hoặc file dung lượng quá lớn (10MB+) | Không kiểm tra định dạng MIME hay kích thước file trước khi tạo URL preview và gửi FormData. |
| 9 | Admin Quiz Duplicate / Import / Export | Thao tác nhân bản đề thi, xuất JSON, nhập JSON | **Hoàn toàn chưa có**: Không có button, không có modal, không có route API tương ứng. |
| 10 | Admin Question Types | Soạn câu hỏi 1 đáp án đúng vs nhiều đáp án đúng vs Đúng/Sai | Chỉ dùng chung 1 checkbox `iscorrect`, không có logic ràng buộc radio (single choice) hay mẫu True/False cố định. |
| 11 | Admin Question Preview | Muốn xem trước giao diện hiển thị câu hỏi như thí sinh | Chưa có: chỉ có phóng to ảnh bằng Lightbox, không có modal giả lập giao diện thí sinh làm bài. |
| 12 | Admin Assign Quiz | Gán đề thi cho danh sách nhiều thí sinh | Chưa có UI: không có component gán bài thi cho nhiều user. |

---

## 🏛️ Báo Cáo Chuyển Giao 5 Thành Phần (5-Component Handoff Protocol)

### 1. Quan Sát Trực Tiếp (Observation)

1. **Khối Exam Engine (`src/component/User/`)**:
   - `src/component/User/User.jsx:1-9`: Là component giữ chỗ (placeholder) trả về `<div>user component</div>`, hiện không chứa logic nào.
   - `src/component/User/ListQuiz.jsx:29`: Gọi `getQuzizeByPage()` từ `src/component/sevices/apiService.jsx`, lọc đề thi cục bộ trên client (dòng 38-42).
   - `src/component/User/DetailQuiz.jsx:22, 231-248`: Timer được viết inline qua `useState(quizDuration)` và `setInterval`, không có custom hook `useTimer.js`. Không có bắt sự kiện `document.addEventListener('visibilitychange', ...)` hay `window.onblur`.
   - `src/component/User/DetailQuiz.jsx:104-130`: Tính năng lưu tiến độ làm bài (auto-save) được viết inline trực tiếp bằng `localStorage.setItem(storageKey, ...)` trong `useEffect`. Không có custom hook `useExamProgress.js` và không có lời gọi API `PUT /api/v1/submissions/:id/progress`.
   - `src/component/User/DetailQuiz.jsx:458-553`: Ma trận câu hỏi (Question Matrix) được render trực tiếp bên trong sidebar của `DetailQuiz.jsx`, chưa được tách thành `QuestionPalette.jsx`.
   - `src/component/User/Question.jsx:124-180`: Thẻ hiển thị câu hỏi đã hỗ trợ Review Mode cơ bản và tích hợp Mascot Quizzy AI (dòng 57-79), nhưng chưa có tính năng chặn copy/paste hoặc chặn context menu trong vùng câu hỏi.
   - `src/component/User/ModalResult.jsx:81-101`: Hiển thị 4 thẻ chỉ số tổng kết, chưa hiển thị thời gian làm bài thực tế (elapsed time = tổng thời gian - thời gian còn lại).

2. **Khối Admin Console (`src/component/Admin/Content/`)**:
   - `src/component/Admin/Content/DashBoard.jsx:22`: Gọi `getOverview()` từ `apiService.jsx`, hiển thị 4 card số liệu tĩnh và bảng `recentSubmissions`. Không hề có biểu đồ phân tích (analytics charts) nào (chưa có chart số bài làm theo ngày, độ khó, tỷ lệ đúng).
   - `src/component/Admin/Content/ManagerUser.jsx:12, 39`: Phân trang cứng `LIMIT_USER = 6`, gọi `getPageUserWithPage(page, LIMIT_USER)`. Hoàn toàn không có thanh tìm kiếm (search input) theo tên hoặc email.
   - `src/component/Admin/Content/TableUserPagination.jsx:20-51`: Bảng người dùng chỉ có cột ID, Username, Email, Role, Actions (View, Update, Delete). Không có avatar thumbnail trong bảng.
   - `src/component/Admin/Content/Quiz/ManageQuiz.jsx:95-188`: Chỉ hỗ trợ Tạo mới, Sửa, Xem, Xóa đề thi. Chưa có:
     - Tính năng nhân bản đề thi (Duplicate Quiz).
     - Tính năng Xuất đề thi ra JSON (Export Quiz).
     - Tính năng Nhập đề thi từ file JSON (Import Quiz).
     - Tính năng Gán đề thi cho nhiều thí sinh (Multi-user Assign).
   - `src/component/Admin/Content/Question/Questions.jsx:19-33`: Cấu trúc câu hỏi chỉ gồm `description`, `imageFile`, `answer: [{ description, iscorrect }]`. Không có trường phân loại loại câu hỏi `type` (SINGLE, MULTIPLE, TRUE_FALSE). Nút "💾 Lưu câu hỏi" nằm lặp trong từng khối câu hỏi (dòng 301-307) nhưng lại submit toàn bộ mảng `questions` (dòng 179). Không có chế độ Xem trước (Preview Mode) dành cho thí sinh.

3. **Hiện trạng Test & Build**:
   - Chạy kiểm tra `npm test -- --watchAll=false` (task-102): Kết quả thất bại với mã lỗi 1 (`Error: could not find react-redux context value; please ensure the component is wrapped in a <Provider>`). File `App.test.js` hiện tại render trực tiếp `<App />` mà thiếu `<Provider store={store}>` và `<BrowserRouter>`.

4. **Hiện trạng Backend & Package Dependencies**:
   - `package.json`: Sử dụng React 17.0.2, react-scripts 4.0.3, Bootstrap 5.3.8, react-bootstrap 2.10.10, redux-toolkit 2.11.0, react-router-dom 6.30.1. **Không có thư viện chart** (như chart.js hay recharts).
   - `server/index.js:1-24`: Hiện chỉ có bộ khung Express kết nối SQLite qua better-sqlite3 và duy nhất 1 route `GET /api/v1/health`. Các route nghiệp vụ khác đều chưa có trên server thực tế, frontend hiện đang hoạt động nhờ tầng fallback `mockService.js`.

---

### 2. Chuỗi Suy Luận Logic (Logic Chain)

1. **Về Exam Engine**:
   - Từ quan sát (1), `DetailQuiz.jsx` hiện đang đảm nhận quá nhiều trách nhiệm (God Component với 574 dòng code): vừa quản lý timer, vừa đồng bộ localStorage, vừa điều khiển navigation, vừa render ma trận câu hỏi, vừa xử lý tính điểm và review.
   - Theo yêu cầu trong `PLAN-SPEC-Exam.md` §2 và `R2` trong `ORIGINAL_REQUEST.md`, cần phải:
     - Tách logic đếm thời gian ra hook `src/hooks/useTimer.js`. Hook này cần quản lý trạng thái đếm lùi, xử lý sự kiện `visibilitychange`/`window.blur` để tự động tạm dừng (hoặc ghi nhận số lần chuyển tab chống gian lận), và kích hoạt callback khi hết giờ. Việc tách thành hook độc lập là điều kiện tiên quyết để Worker Testing có thể viết unit test riêng theo yêu cầu `R4`.
     - Tách logic lưu trữ tiến độ ra hook `src/hooks/useExamProgress.js`. Hook này quản lý việc đọc/ghi `localStorage`, có cơ chế debounce để sẵn sàng đồng bộ lên `PUT /api/v1/submissions/:id/progress` khi backend hoàn thiện.
     - Tách ma trận câu hỏi ra component `src/component/User/QuestionPalette.jsx`. Component này nhận danh sách câu hỏi, trạng thái trả lời, cờ đánh dấu và chế độ review để hiển thị trực quan và hỗ trợ nhảy nhanh đến câu hỏi tương ứng.
     - Bổ sung cơ chế chống gian lận: ghi nhận số lần rời màn hình (tối đa 3 lần cảnh báo, lần thứ 4 tự nộp bài), chặn copy/paste nội dung câu hỏi (`onCopy={(e) => e.preventDefault()}`).
     - Cải thiện `ModalResult.jsx`: tính toán và hiển thị thời gian làm bài thực tế (`timeSpent = duration - timeLeft`), phân loại chi tiết (số câu làm đúng, làm sai, bỏ trống).

2. **Về Admin Console**:
   - Từ quan sát (2), `DashBoard.jsx` thiếu hoàn toàn các biểu đồ phân tích theo yêu cầu `PLAN-SPEC-Admin.md` §4.1 ("Biểu đồ analytics: số bài làm theo ngày, độ khó phân bố, tỷ lệ đúng trung bình"). Do `package.json` bị khóa quyền sửa (chỉ Tech-Lead/Orchestrator được sửa) và CRA React 17 rất nhạy cảm với peer dependencies, giải pháp tối ưu, tin cậy nhất là xây dựng component biểu đồ thuần React SVG (`AnalyticsCharts.jsx`). Cách tiếp cận này nhẹ, đáp ứng tốt responsive, không phụ thuộc thư viện ngoài và không gây lỗi build.
   - Từ quan sát (2), `ManagerUser.jsx` thiếu ô tìm kiếm. Cần bổ sung ô input tìm kiếm (kèm debounce 300ms) ở đầu bảng, truyền tham số `search` vào hàm `featchListUserWithPage(page, search)` và cập nhật contract API cho Backend (`GET /api/v1/participant?page=&limit=&search=`).
   - Từ quan sát (2), `ManageQuiz.jsx` thiếu 4 tính năng then chốt: Duplicate, Export JSON, Import JSON, Multi-user Assign. Cần bổ sung các nút thao tác trên `TableQuiz.jsx`, tích hợp Modal gán đề thi cho nhiều thí sinh (`ModalAssignQuiz.jsx`), và Modal nhập đề thi từ file JSON (`ModalImportQuiz.jsx`).
   - Từ quan sát (2), `Questions.jsx` chưa hỗ trợ đa dạng loại câu hỏi (Single choice, Multiple choice, True/False) và thiếu chế độ xem trước (Student Preview Mode). Cần bổ sung dropdown chọn loại câu hỏi cho từng câu, tự động điều chỉnh UI phương án (radio button cho Single/True-False, checkbox cho Multiple), và thêm Modal preview (`ModalPreviewQuestion.jsx`) hiển thị câu hỏi như thí sinh nhìn thấy.

3. **Về Ranh Giới Sở Hữu File (File Ownership Matrix - `PLAN.md` §5)**:
   - Worker 2 (Exam) tuyệt đối chỉ thao tác trong `src/component/User/` và `src/hooks/` (tạo `useTimer.js`, `useExamProgress.js`). Không sửa `src/component/Admin/**`, không sửa `server/**`.
   - Worker 3 (Admin) tuyệt đối chỉ thao tác trong `src/component/Admin/`. Không sửa `src/component/User/**`, không sửa `server/**`.
   - Cả Worker Exam và Worker Admin đều **KHÔNG** sửa trực tiếp `src/component/sevices/apiService.jsx` (file này thuộc quyền Worker Auth và Tech-Lead) mà chỉ tiêu thụ API qua contract chuẩn.

---

### 3. Cảnh Báo & Giả Định (Caveats)

1. **Rào cản thư viện (Dependencies)**: Repo chưa có thư viện vẽ biểu đồ (`recharts`, `chart.js`). Không được tự ý cài đặt vào `package.json`. Phải sử dụng React SVG charts tự viết hoặc báo cáo Tech-Lead nếu muốn cài thêm.
2. **Cơ chế Fallback Mock Service**: Vì backend hiện chưa triển khai các endpoint nghiệp vụ, frontend phụ thuộc vào `mockService.js` để chạy thử nghiệm. Khi Worker Exam và Admin triển khai tính năng mới (như duplicate quiz, import/export), cần đảm bảo tính năng hoạt động tương thích hoặc có fallback trong `mockService.js` để giao diện không bị treo trước khi Backend hoàn thành ở Đợt C.
3. **Đường dẫn baseURL trong `apiService.jsx`**: Một số hàm trong `apiService.jsx` đang gọi trực tiếp URL tuyệt đối `http://localhost:8081/api/v1/...` thay vì đi qua proxy `/api/v1/...`. Vấn đề này thuộc trách nhiệm của Worker Auth ở Đợt A.

---

### 4. Kết Luận & Phân Nhiệm Chi Tiết Cho Đợt A (Conclusion & Work Breakdown)

#### 🚀 Khối Exam Engine (Worker 2 - Exam):
- **File cần tạo mới**:
  1. `src/hooks/useTimer.js`: Hook đếm lùi thời gian, auto-pause khi blur/rời tab, đếm số lần vi phạm tab switch, auto-submit khi hết giờ.
  2. `src/hooks/useExamProgress.js`: Hook tự động lưu & khôi phục tiến độ làm bài từ localStorage, hỗ trợ debounced sync.
  3. `src/component/User/QuestionPalette.jsx` & `QuestionPalette.scss`: Bảng điều hướng câu hỏi độc lập, hiển thị trạng thái (chưa làm, đã làm, cắm cờ, đúng, sai).
  4. `src/component/User/ModalConfirmSubmit.jsx`: Modal xác nhận nộp bài hiển thị số câu đã làm / chưa làm / cắm cờ.
- **File cần chỉnh sửa**:
  1. `src/component/User/DetailQuiz.jsx` & `DetailQuiz.scss`: Tích hợp `useTimer`, `useExamProgress`, `QuestionPalette`, thêm cảnh báo khi chuyển tab quá 3 lần, ngăn chặn copy/paste.
  2. `src/component/User/Question.jsx` & `Question.scss`: Cải thiện hiển thị phương án lựa chọn, radio vs checkbox tùy theo loại câu hỏi.
  3. `src/component/User/ModalResult.jsx` & `ModalResult.scss`: Thêm thống kê thời gian làm bài, số câu đúng/sai/bỏ trống.
  4. `src/component/User/ListQuiz.jsx` & `ListQuiz.scss`: Cải thiện hiển thị loading skeleton và thông báo lỗi.
  5. `src/component/User/User.jsx`: Nâng cấp giao diện trang thí sinh (thông tin cá nhân, lịch sử các bài thi đã làm).

#### 🛠️ Khối Admin Console (Worker 3 - Admin):
- **File cần tạo mới**:
  1. `src/component/Admin/Content/AnalyticsCharts.jsx` & `.scss`: Biểu đồ SVG thuần phân tích số bài thi theo ngày, phân bố độ khó, tỷ lệ đúng.
  2. `src/component/Admin/Content/Quiz/ModalAssignQuiz.jsx`: Modal gán đề thi cho nhiều người dùng (multi-user assignment).
  3. `src/component/Admin/Content/Quiz/ModalImportQuiz.jsx`: Modal tải lên file JSON để tạo đề thi và danh sách câu hỏi.
  4. `src/component/Admin/Content/Question/ModalPreviewQuestion.jsx`: Modal xem trước câu hỏi hiển thị dưới góc nhìn thí sinh.
- **File cần chỉnh sửa**:
  1. `src/component/Admin/Content/DashBoard.jsx`: Tích hợp biểu đồ thống kê từ `AnalyticsCharts.jsx`, hiển thị loading skeleton.
  2. `src/component/Admin/Content/ManagerUser.jsx` & `TableUserPagination.jsx`: Bổ sung ô tìm kiếm người dùng (search input với debounce 300ms), xem thumbnail avatar, kiểm tra giới hạn kích thước file upload.
  3. `src/component/Admin/Content/Quiz/ManageQuiz.jsx` & `TableQuiz.jsx`: Bổ sung nút "Nhân bản" (Duplicate), "Xuất JSON" (Export), "Nhập JSON" (Import), "Gán thí sinh" (Assign Users).
  4. `src/component/Admin/Content/Question/Questions.jsx` & `Questions.scss`: Bổ sung chọn loại câu hỏi (Single choice, Multiple choice, True/False), tích hợp nút xem trước câu hỏi (`ModalPreviewQuestion.jsx`), tải danh sách câu hỏi cũ của quiz được chọn để cho phép chỉnh sửa.
  5. `src/component/Admin/sidebar.jsx`: Giữ ổn định các liên kết điều hướng.

---

### 5. Phương Pháp Kiểm Tra & Xác Minh (Verification Method)

1. **Kiểm tra Unit Test của CRA**:
   - Lệnh chạy: `npm test -- --watchAll=false`
   - *Ghi chú cho Worker Testing*: Cần bổ sung bọc `<Provider store={store}>` và `<BrowserRouter>` trong `App.test.js` để khắc phục lỗi Redux context hiện tại.
2. **Kiểm tra luồng Exam Engine**:
   - Truy cập `/user`, chọn bài thi -> chuyển hướng sang `/quiz/:id`.
   - Kiểm tra timer đếm ngược chính xác.
   - Thử chuyển sang tab khác trong trình duyệt: kiểm tra xem bộ đếm cảnh báo vi phạm có tăng lên không.
   - Chọn một vài câu trả lời, nhấn F5 tải lại trang: kiểm tra toàn bộ câu trả lời, câu cắm cờ và thời gian còn lại có được phục hồi nguyên vẹn không.
   - Chờ hết giờ hoặc nhấn Nộp bài: kiểm tra bảng điểm `ModalResult` hiển thị đúng điểm số, thời gian làm và mở được Review Mode.
3. **Kiểm tra luồng Admin Console**:
   - Truy cập `/admin`: kiểm tra 4 thẻ số liệu và các biểu đồ thống kê SVG hiển thị chuẩn xác.
   - Truy cập `/admin/manageruser`: thử gõ từ khóa tìm kiếm thí sinh, kiểm tra bảng người dùng lọc tương ứng.
   - Truy cập `/admin/manageQuiz`: thử nhân bản đề thi (Duplicate), thử xuất file JSON (Export), thử nhập file JSON (Import), mở modal gán đề thi cho người dùng.
   - Truy cập `/admin/manageQuestions`: thử tạo câu hỏi dạng Single Choice (radio), Multiple Choice (checkbox), True/False và nhấn nút "Xem trước" để kiểm tra giao diện thí sinh.

---

## 📡 Bảng Đặc Tả Hợp Đồng API Backend Cần Thiết (API Contracts Required)

Dưới đây là bảng hợp đồng chi tiết dành cho Worker Backend (Đợt C) và Worker Auth (Đợt A) để đảm bảo đồng bộ hoàn hảo:

### 1. Nhóm API Khảo Thí (Exam Engine Endpoints)
| Method | Endpoint | Xác Thực | Request Headers / Body / Query | Response Format Chuẩn |
|---|---|---|---|---|
| `GET` | `/api/v1/quiz-by-participant` | Bearer Token (Thí sinh) | Query: None | `{ "EC": 0, "DT": [ { "id": 1, "name": "React Basics", "description": "Kiểm tra kiến thức React", "difficulty": "EASY", "duration": 15, "questionCount": 10, "image": "base64..." } ], "EM": "Success" }` |
| `GET` | `/api/v1/questions-by-quiz` | Bearer Token (Thí sinh) | Query: `?quizId=1` | `{ "EC": 0, "DT": [ { "id": 101, "description": "JSX là gì?", "image": null, "type": "SINGLE", "answers": { "id": 1001, "description": "Cú pháp mở rộng của JS" } } ], "EM": "Success" }`<br>*(Lưu ý: Ẩn thuộc tính `isCorrect` khi người gọi là thí sinh đang thi)* |
| `POST` | `/api/v1/quiz-submit` | Bearer Token (Thí sinh) | Body JSON:<br>`{ "quizId": 1, "answers": [ { "questionId": 101, "userAnswerId": [1001] } ] }` | `{ "EC": 0, "DT": { "countCorrect": 8, "countTotal": 10, "score": 8.0, "percentage": 80, "quizData": [ { "questionId": 101, "isCorrect": true, "userAnswers": [1001], "systemAnswers": [1001] } ] }, "EM": "Submit success" }` |
| `PUT` | `/api/v1/submissions/:id/progress` | Bearer Token (Thí sinh) | Param: `:id`<br>Body JSON:<br>`{ "quizId": 1, "answersMap": { "101": [1001] }, "timeLeft": 750, "flaggedQuestions": [102], "currentIndex": 2 }` | `{ "EC": 0, "DT": { "savedAt": "2026-09-20T17:00:00Z" }, "EM": "Progress saved" }` |
| `GET` | `/api/v1/submissions/history` | Bearer Token (Thí sinh) | Query: `?page=1&limit=10` | `{ "EC": 0, "DT": { "submissions": [ { "id": 1, "quizId": 1, "quizName": "React Basics", "countCorrect": 8, "countTotal": 10, "score": 8.0, "percentage": 80, "createdAt": "..." } ], "totalPages": 1, "totalRows": 1 }, "EM": "Success" }` |

### 2. Nhóm API Quản Trị (Admin Console Endpoints)
| Method | Endpoint | Xác Thực | Request Headers / Body / Query | Response Format Chuẩn |
|---|---|---|---|---|
| `GET` | `/api/v1/overview` | Bearer Token (Admin) | Query: None | `{ "EC": 0, "DT": { "totalUsers": 12, "totalQuizzes": 5, "totalQuestions": 45, "totalSubmissions": 28, "recentSubmissions": [ { "id": 1, "quizId": 1, "quizName": "...", "username": "...", "countCorrect": 8, "countTotal": 10, "timestamp": "..." } ] }, "EM": "Success" }` |
| `GET` | `/api/v1/stats/daily` | Bearer Token (Admin) | Query: `?days=7` | `{ "EC": 0, "DT": [ { "date": "2026-09-19", "submissions": 12, "avgScore": 7.5, "passRate": 75 } ], "EM": "Success" }` |
| `GET` | `/api/v1/participant` | Bearer Token (Admin) | Query: `?page=1&limit=6&search=toan` | `{ "EC": 0, "DT": { "users": [ { "id": 1, "username": "toan", "email": "toan@dev.vn", "role": "USER", "image": "base64..." } ], "totalPages": 1, "totalRows": 1 }, "EM": "Success" }` |
| `POST` | `/api/v1/participant` | Bearer Token (Admin) | FormData: `email`, `password`, `username`, `role`, `userImage` | `{ "EC": 0, "DT": { "id": 15, "username": "new_user", "email": "..." }, "EM": "User created" }` |
| `PUT` | `/api/v1/participant` | Bearer Token (Admin) | FormData: `id`, `username`, `role`, `userImage` | `{ "EC": 0, "DT": { "id": 15, "username": "updated_user" }, "EM": "User updated" }` |
| `DELETE` | `/api/v1/participant` | Bearer Token (Admin) | Body JSON: `{ "id": 15 }` | `{ "EC": 0, "DT": null, "EM": "User deleted" }` |
| `GET` | `/api/v1/quiz/all` | Bearer Token (Admin) | Query: None | `{ "EC": 0, "DT": [ { "id": 1, "name": "...", "description": "...", "difficulty": "EASY", "image": "...", "questionCount": 10, "duration": 15 } ], "EM": "Success" }` |
| `POST` | `/api/v1/quiz` | Bearer Token (Admin) | FormData: `name`, `description`, `difficulty`, `quizImage` | `{ "EC": 0, "DT": { "id": 6, "name": "New Quiz" }, "EM": "Quiz created" }` |
| `PUT` | `/api/v1/quiz` | Bearer Token (Admin) | FormData: `id`, `name`, `description`, `difficulty`, `quizImage` | `{ "EC": 0, "DT": { "id": 6, "name": "Updated Quiz" }, "EM": "Quiz updated" }` |
| `DELETE` | `/api/v1/quiz/:id` | Bearer Token (Admin) | Param: `:id` | `{ "EC": 0, "DT": null, "EM": "Quiz deleted" }` |
| `POST` | `/api/v1/quiz/:id/duplicate` | Bearer Token (Admin) | Param: `:id` | `{ "EC": 0, "DT": { "id": 7, "name": "Bản sao của ...", "questionCount": 10 }, "EM": "Quiz duplicated" }` |
| `GET` | `/api/v1/quiz/:id/export` | Bearer Token (Admin) | Param: `:id` | `{ "EC": 0, "DT": { "quiz": { "name": "...", "description": "...", "difficulty": "EASY", "duration": 15 }, "questions": [ { "description": "...", "type": "SINGLE", "answers": [ { "description": "...", "isCorrect": true } ] } ] }, "EM": "Export success" }` |
| `POST` | `/api/v1/quiz/import` | Bearer Token (Admin) | Body JSON: Dữ liệu quiz + questions theo format Export | `{ "EC": 0, "DT": { "quizId": 8, "questionCount": 10 }, "EM": "Quiz imported" }` |
| `POST` | `/api/v1/quiz-assign-to-user` | Bearer Token (Admin) | Body JSON: `{ "quizId": 1, "userIds": [2, 3, 5] }` | `{ "EC": 0, "DT": { "assignedCount": 3 }, "EM": "Assigned successfully" }` |
| `POST` | `/api/v1/quiz-assign-to-quiz` | Bearer Token (Admin) | Body JSON:<br>`{ "quizId": 1, "questions": [ { "description": "...", "type": "SINGLE", "answer": [ { "description": "...", "iscorrect": true } ] } ] }` | `{ "EC": 0, "DT": { "savedCount": 5 }, "EM": "Questions saved" }` |

---
*Báo cáo được hoàn thành và đối chiếu kỹ lưỡng với mã nguồn dự án QuizMaster.*
