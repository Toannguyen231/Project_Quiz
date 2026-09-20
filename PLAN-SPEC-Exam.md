# 📋 SPEC — Module Exam Engine (Agent-Exam)

> **Thuộc `PLAN.md` §Phase 1** · Agent chủ: **Agent-Exam** · Đọc kèm: `PLAN.md` §5 (File Ownership)

## 1. Mục tiêu
Nâng cấp trải nghiệm làm bài thi thành **exam engine chuyên nghiệp**: timer thông minh, auto-save, review sau nộp bài, chống gian lận cơ bản, kết quả chi tiết, đồng bộ qua API thật (không mock).

## 2. Phạm vi — file được đụng ✅
- `src/component/User/DetailQuiz.jsx` + `.scss`
- `src/component/User/Question.jsx` + `.scss`
- `src/component/User/ModalResult.jsx` + `.scss`
- `src/component/User/ListQuiz.jsx` + `.scss`
- `src/component/User/User.jsx`
- Tạo mới: `src/hooks/useTimer.js`, `src/hooks/useExamProgress.js`, `src/component/User/QuestionPalette.jsx` (thanh điều hướng câu hỏi nâng cao)
- `src/component/sevices/apiService.jsx` — **chỉ đọc** (không sửa nếu không cần; endpoint mới ghi cho Agent-Backend)

## 3. KHÔNG được đụng ❌
- `package.json`, `App.js`, `Layout.js`, `index.js`
- `src/component/Admin/**` (của Agent-Admin/Auth)
- `server/**` (của Agent-Backend) — dùng API theo contract
- `src/component/sevices/mockService.js` — có thể đọc để hiểu data cũ, nhưng **không** tiếp tục dùng mock cho luồng chính

## 4. Yêu cầu chức năng
### 4.1 Danh sách bài thi (ListQuiz)
- [ ] Gọi API thật `GET /api/v1/quiz-by-participant` (đã có endpoint cũ — xác nhận contract với Backend spec)
- [ ] Hiển thị: tên quiz, mô tả, độ khó, số câu, thời gian, trạng thái "đã làm/ chưa làm"
- [ ] Loading skeleton + empty state đẹp + toast lỗi API

### 4.2 Màn hình làm bài (DetailQuiz) — nâng cấp
- [ ] **Timer thông minh** (`useTimer.js`):
  - Đếm ngược từ `duration` quiz; hiển thị mm:ss, đổi màu khi < 5 phút
  - **Auto-pause khi rời tab/window** (visibilitychange) — chống gian lận cơ bản
  - Hết giờ → **tự nộp bài** (submit phần đã trả lời)
- [ ] **Auto-save** (`useExamProgress.js`):
  - Mỗi lần chọn đáp án → lưu vào state + persist local (localStorage) để không mất khi refresh
  - (Nâng cao, nếu backend hỗ trợ) gọi `PUT /api/v1/submissions/:id/progress` debounce 5s
- [ ] **Question Palette**: lưới số câu hỏi, tô màu trạng thái (chưa làm / đang làm / đã trả lời / đã đánh dấu review), click để nhảy câu
- [ ] Nút **Đánh dấu để review** (flag) mỗi câu
- [ ] Xác nhận trước khi nộp (modal "Bạn còn N câu chưa trả lời, nộp?")

### 4.3 Nộp bài & Kết quả
- [ ] `POST /api/v1/quiz-submit` với payload: quizId + danh sách {questionId, answers[]}
- [ ] ModalResult: điểm số, % đúng, số câu đúng/sai/bỏ trống, thời gian làm
- [ ] **Review đáp án**: xem lại từng câu, so với đáp án đúng (nếu backend trả về) — highlight đúng/sai
- [ ] Lưu lịch sử làm bài (tối thiểu localStorage; nếu backend có endpoint thì sync)

### 4.4 Chống gian lận cơ bản
- [ ] Phát hiện rời tab quá N lần (ví dụ 3) → cảnh báo; quá ngưỡng → tự nộp bài (tuỳ chính sách, ghi rõ trong spec)
- [ ] Chặn copy-paste đáp án từ câu hỏi khác (chặn context menu / copy trong vùng câu hỏi — tuỳ chọn, cân nhắc UX)
- [ ] Chặn mở DevTools? → **không làm** (dễ phá UX, ít hiệu quả) — chỉ ghi nhận hành vi

## 5. Định nghĩa "xong" (DoD)
- [ ] Làm bài qua API thật từ đầu đến cuối (list → làm → nộp → kết quả)
- [ ] Refresh trang giữa chừng → tiến độ làm bài được khôi phục (auto-save)
- [ ] Timer hết giờ tự nộp đúng
- [ ] **Agent-Testing** có test cho useTimer + logic tính điểm
- [ ] Báo cáo: danh sách file đã sửa/tạo + endpoint API mới cần Backend bổ sung

## 6. API contract cần Backend (điền khi phát hiện thiếu)
| Endpoint | Method | Mục đích |
|---|---|---|
| (xác nhận) `PUT /api/v1/submissions/:id/progress` | PUT | auto-save tiến độ |
| (xác nhận) `GET /api/v1/submissions/history` | GET | lịch sử làm bài |
| ... | | |