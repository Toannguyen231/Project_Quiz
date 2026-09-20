# 📋 Báo Cáo Chuyển Giao: Module Exam Engine (Worker 2 - Wave A)

> **Tác giả:** Worker 2 (Exam Engine Worker)  
> **Thời điểm:** 2026-09-20T17:07:00Z  
> **Thư mục làm việc:** `D:\test-demo-react\Quiz-question\.agents\worker_exam`  
> **Milestone:** Wave A - Exam Engine Module (M2)  
> **Trạng thái:** HOÀN THÀNH (HARD HANDOFF)

---

## 1. Quan Sát Trực Tiếp (Observation)

1. **Khảo sát ban đầu trước khi sửa đổi**:
   - `DetailQuiz.jsx` (574 dòng): Chứa timer inline bằng `setInterval`, lưu localStorage inline không bọc trong hook độc lập, ma trận câu hỏi render trực tiếp trong sidebar, modal xác nhận nộp bài dùng `window.confirm` sơ sài, không có cơ chế phát hiện chuyển tab hay chống gian lận.
   - `Question.jsx` (251 dòng): Chưa phân biệt rõ giao diện Single Choice (radio) vs Multiple Choice (checkbox), chưa có chặn copy/paste hoặc context menu trong khi thi.
   - `ModalResult.jsx` (206 dòng): Chỉ hiển thị 4 card số liệu cơ bản, chưa có thống kê thời gian làm bài thực tế (`timeSpent`), chưa hiển thị số câu bỏ trống.
   - `ListQuiz.jsx` (187 dòng): Thiếu trạng thái Skeleton Loading khi tải API, khi gặp lỗi mạng không có banner thử lại (retry).
   - `User.jsx` (9 dòng): Là component rỗng chỉ có `<div>user component</div>`.
   - Chưa tồn tại: `src/hooks/useTimer.js`, `src/hooks/useExamProgress.js`, `src/component/User/QuestionPalette.jsx`, `src/utils/score.js`.

2. **Kết quả thực hiện & Các file đã tạo / chỉnh sửa**:
   - `src/utils/score.js` (Created - 5,980 bytes): Triển khai pure function `calculateScore(questions, userAnswers)` hỗ trợ cả định dạng Map và Array, tính toán `total`, `correctCount`, `incorrectCount`, `unansweredCount`, `score` (thang 10), `percentage`, `passed`, `details`. Hàm bổ trợ `evaluateAnswerOption` và `formatScore`.
   - `src/hooks/useTimer.js` (Created - 7,099 bytes): Countdown từ thời lượng bài thi (giây), format `MM:SS` và `HH:MM:SS`, ngưỡng cảnh báo (<300s warning, <120s danger), bắt sự kiện `visibilitychange` và `window.blur` để tự động tạm dừng đồng hồ, đếm số lần vi phạm `tabSwitchCount`, tự động kích hoạt callback nộp bài khi thời gian về 0s.
   - `src/hooks/useExamProgress.js` (Created - 4,649 bytes): Quản lý lưu trữ tiến độ làm bài độc lập vào `localStorage` theo `quizId` và `userId`, khôi phục an toàn qua `loadProgress()`, dọn dẹp qua `clearProgress()`, hỗ trợ hàm đồng bộ debounce `syncBackendProgress(submissionId, payload)` gọi `PUT /api/v1/submissions/:id/progress`.
   - `src/component/User/QuestionPalette.jsx` (Created - 6,046 bytes) & `QuestionPalette.scss` (3,800 bytes): Lưới câu hỏi thông minh với 5 trạng thái màu sắc: Chưa làm (xám/outline), Đang xem (viền vàng nổi bật), Đã làm (xanh dương), Cắm cờ xem lại (icon cờ 🚩 góc trên), Chế độ Review (Đúng xanh lá ✓ / Sai đỏ ✗). Nhấn vào số câu để chuyển nhanh đến câu hỏi.
   - `src/component/User/Question.jsx` (Enhanced - 13,113 bytes) & `Question.scss` (Enhanced): Bổ sung chặn sao chép câu hỏi (`onCopy`), chặn chuột phải khi thi (`onContextMenu`), badge phân loại `(◉ Chọn 1 đáp án)` vs `(☑ Chọn nhiều đáp án)`, indicator radio tròn vs checkbox vuông, giữ nguyên Lightbox phóng to ảnh, lời giải chi tiết và nút gọi mascot Quizzy AI khi làm sai trong Review Mode.
   - `src/component/User/ModalResult.jsx` (Enhanced - 11,851 bytes) & `ModalResult.scss` (Enhanced): 6 thẻ chỉ số trực quan (Câu đúng, Câu sai, Bỏ trống, Tỷ lệ đúng, Điểm quy đổi thang 10, Thời gian làm bài `timeSpent`), pháo hoa giấy confetti khi >= 80%, bảng đáp án nhanh, nút chuyển trực tiếp sang Chế độ Review chi tiết.
   - `src/component/User/DetailQuiz.jsx` (Enhanced - 31,700 bytes) & `DetailQuiz.scss` (Enhanced): Tích hợp toàn diện `useTimer`, `useExamProgress`, `QuestionPalette`. Modal xác nhận nộp bài hiển thị chi tiết số câu hoàn thành, chưa làm, đã cắm cờ và thời gian còn lại. Modal và banner cảnh báo gian lận khi rời tab (cảnh báo 1-3 lần, tự động nộp bài ở lần thứ 4). Tự nộp khi hết giờ. Chế độ Review sau khi nộp bài. Fallback tính điểm offline bằng `calculateScore`.
   - `src/component/User/ListQuiz.jsx` (Enhanced - 11,360 bytes) & `ListQuiz.scss` (Enhanced): Thêm 6 thẻ Skeleton Loading dạng shimmer khi đang fetch API, banner thông báo lỗi kèm nút "Thử Tải Lại", hiển thị badge độ khó (Dễ/Trung bình/Khó), số câu hỏi, thời lượng, tìm kiếm và bộ lọc độ khó.
   - `src/component/User/User.jsx` (Enhanced - 10,424 bytes): Nâng cấp thành cổng thông tin thí sinh hoàn chỉnh: thẻ chào mừng, thông số tổng quan (số bài đã nộp, điểm trung bình, streak), tab xem danh sách đề thi và tab bảng lịch sử làm bài gần đây với nút "Làm Lại".

3. **Kết quả kiểm tra biên dịch**:
   - `node -e` chạy unit test cho `src/utils/score.js`: 100% pass (tính điểm chuẩn xác cho single, multiple choice, unanswered, score thang 10).
   - `node -e` chạy test cho `src/hooks/useTimer.js`: formatTimer pass cho các mốc 0s, 65s, 600s, 3665s.
   - Babel AST compilation (`babel.transformSync` với preset `react-app`): Toàn bộ 9 file JSX/JS biên dịch thành công 100% không có lỗi cú pháp.
   - Sass compilation (`sass.compile`): Toàn bộ 5 file SCSS biên dịch thành công 100% không có lỗi cú pháp.

---

## 2. Chuỗi Suy Luận Logic (Logic Chain)

1. **Tách module độc lập để phục vụ Unit Testing (Wave B)**:
   - Theo yêu cầu trong `PLAN-SPEC-Exam.md` §2 và `R4` trong `ORIGINAL_REQUEST.md`, Worker Testing sẽ viết unit test riêng cho `useTimer` và logic tính điểm.
   - Do đó, việc tách `useTimer.js` và `score.js` thành các module thuần túy, nhận đầu vào rõ ràng và không phụ thuộc vòng đời DOM phức tạp giúp đảm bảo test suite chạy bằng Jest sẽ pass trọn vẹn mà không cần mock môi trường giả lập cồng kềnh.

2. **Cơ chế chịu lỗi & Tính toàn vẹn tiến độ (Fault Tolerance & Resilience)**:
   - Thí sinh có thể gặp sự cố mất mạng hoặc vô tình nhấn F5 tải lại trang. `useExamProgress` lưu ngay lập tức `answersMap`, `flaggedQuestions`, `timeLeft`, `index`, `tabSwitchCount` vào `localStorage`. Khi tải lại trang, hook tự động nạp lại toàn bộ trạng thái, thí sinh tiếp tục làm bài mà không mất dữ liệu.
   - Khi nộp bài, nếu API backend gặp lỗi mạng hoặc chưa sẵn sàng, hệ thống không làm gián đoạn thí sinh mà kích hoạt hàm thuần `calculateScore` để chấm điểm offline dựa trên đáp án có sẵn, hiển thị kết quả và mở chế độ Review ngay lập tức.

3. **Chống gian lận cân bằng trải nghiệm (Balanced Anti-Cheat UX)**:
   - Chặn copy nội dung câu hỏi (`onCopy`) và chặn context menu nhằm hạn chế sao chép đề thi sang công cụ tìm kiếm.
   - Tích hợp phát hiện chuyển tab thông qua `visibilitychange` và `window.blur`. Để tránh phạt oan khi người dùng vô tình nhấp chuột ngoài vùng, hệ thống áp dụng cơ chế 3 lần cảnh báo (banner cảnh báo nổi và popup nhắc nhở quy chế). Chỉ khi vi phạm đến lần thứ 4 (rời phòng thi quá 3 lần), hệ thống mới cưỡng chế tự động nộp bài.

4. **Nâng cấp Review Mode và Palette**:
   - Tách ma trận câu hỏi thành component `QuestionPalette` giúp giao diện tinh gọn, tái sử dụng được cả trong lúc làm bài và lúc xem lại đáp án.
   - Trong Review Mode, Palette đổi màu thành Đúng (Xanh) / Sai (Đỏ), thí sinh chỉ cần click vào bất kỳ câu nào để xem giải thích chi tiết, đáp án đúng và đáp án mình đã chọn.

---

## 3. Cảnh Báo & Giả Định (Caveats)

1. **API Đồng bộ tiến độ (`PUT /api/v1/submissions/:id/progress`)**:
   - Hook `useExamProgress` đã sẵn sàng hàm debounce `syncBackendProgress` để đồng bộ lên máy chủ. Tuy nhiên, endpoint này thuộc phạm vi triển khai của Worker Backend (Wave C). Khi chạy ở Wave A, hook ghi nhận tiến độ chính tại `localStorage` và bắt lỗi ngoại lệ nếu API chưa phản hồi, đảm bảo frontend không bị treo.
2. **Lịch sử làm bài thí sinh (`/api/v1/submissions/history`)**:
   - Component `User.jsx` hiện đọc dữ liệu lịch sử từ khóa `qm_submissions` trong `localStorage` (được lưu sau mỗi lần nộp bài). Khi Worker Backend hoàn thành endpoint này ở Wave C, `User.jsx` có thể dễ dàng gắn thêm API fetch từ server.

---

## 4. Kết Luận (Conclusion)

Worker 2 (Exam Engine Worker) đã hoàn thành 100% tất cả 7 hạng mục công việc được giao trong `DISPATCH.md` theo chuẩn thiết kế `PLAN-SPEC-Exam.md` và `PROJECT.md`:
1. `src/hooks/useTimer.js` hoàn chỉnh.
2. `src/hooks/useExamProgress.js` hoàn chỉnh.
3. `src/component/User/QuestionPalette.jsx` + `.scss` hoàn chỉnh.
4. `src/utils/score.js` hoàn chỉnh.
5. `src/component/User/DetailQuiz.jsx` + `.scss` & `src/component/User/Question.jsx` + `.scss` hoàn chỉnh.
6. `src/component/User/ModalResult.jsx` + `.scss` hoàn chỉnh.
7. `src/component/User/ListQuiz.jsx` + `.scss` & `src/component/User/User.jsx` hoàn chỉnh.

Toàn bộ code không có lỗi cú pháp, đã biên dịch qua Babel và Sass thành công. Không sửa bất kỳ file nào nằm ngoài phạm vi phân quyền.

---

## 5. Phương Pháp Xác Minh Độc Lập (Verification Method)

1. **Kiểm tra tính toàn vẹn cú pháp**:
   ```bash
   node -e "
   process.env.NODE_ENV = 'development';
   const babel = require('@babel/core');
   const fs = require('fs');
   const files = [
     'src/utils/score.js',
     'src/hooks/useTimer.js',
     'src/hooks/useExamProgress.js',
     'src/component/User/QuestionPalette.jsx',
     'src/component/User/DetailQuiz.jsx',
     'src/component/User/Question.jsx',
     'src/component/User/ModalResult.jsx',
     'src/component/User/ListQuiz.jsx',
     'src/component/User/User.jsx'
   ];
   files.forEach(f => babel.transformSync(fs.readFileSync(f, 'utf8'), { filename: f, presets: ['react-app'] }));
   console.log('All 9 files compiled successfully!');
   "
   ```

2. **Kiểm tra SCSS compilation**:
   ```bash
   node -e "
   const sass = require('sass');
   ['QuestionPalette.scss', 'DetailQuiz.scss', 'Question.scss', 'ModalResult.scss', 'ListQuiz.scss']
     .forEach(f => sass.compile('src/component/User/' + f));
   console.log('All 5 SCSS files compiled successfully!');
   "
   ```

3. **Kiểm tra logic tính điểm tự động**:
   ```bash
   node -e "
   const { calculateScore } = require('./src/utils/score.js');
   const res = calculateScore([
     { id: 1, answers: [{ id: 10, isCorrect: true }, { id: 11, isCorrect: false }] },
     { id: 2, answers: [{ id: 20, isCorrect: true }] }
   ], { '1': [10], '2': [99] });
   console.log('Correct count:', res.correctCount, 'Score:', res.score, 'Pass:', res.passed);
   "
   ```

4. **Kiểm tra giao diện người dùng**:
   - Khởi chạy frontend và điều hướng đến `/user`: Kiểm tra hiển thị danh sách bài thi với skeleton loading, bộ lọc độ khó, ô tìm kiếm.
   - Nhấn "Bắt đầu làm bài": Kiểm tra phòng thi với Timer đếm ngược, thanh QuestionPalette, nút cắm cờ xem lại 🚩.
   - Chuyển tab sang ứng dụng khác: Quan sát bộ đếm cảnh báo vi phạm tăng lên kèm thông báo cảnh báo.
   - Chọn một vài câu rồi nhấn F5: Toàn bộ câu trả lời, câu cắm cờ và thời gian còn lại được khôi phục nguyên vẹn.
   - Nhấn "Nộp bài thi": Kiểm tra modal xác nhận nộp bài hiển thị chính xác số câu đã làm, chưa làm.
   - Sau khi nộp bài: Bảng điểm `ModalResult` hiển thị 6 thẻ chỉ số, có thời gian làm bài, có thể mở Review Mode để xem lại chi tiết từng câu.
