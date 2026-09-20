# 📝 PROMPTS.md — Prompt cho từng Conversation (Antigravity 2.0)

> **Cách dùng:** Mở Antigravity 2.0 → project `Quiz-question` → bấm **+ New Conversation** → dán **toàn bộ** prompt của 1 conversation vào ô chat → Enter.
>
> ⚠️ **THỨ TỰ BẮT BUỘC (cập nhật 2026-09-20):**
> 1. **Conversation 1 (Tech-Lead)** — chạy ĐẦU TIÊN, đợi xong Phase 0.
> 2. **Đợt A — Conversations 2, 3, 4 (Auth + Exam + Admin)** — chạy SONG SONG.
> 3. **Đợt B — Conversation 5 (Testing)** — chạy SAU khi 2, 3, 4 xong, để test code THẬT (không test "dự đoán").
> 4. **Conversations 6 (Backend)** — sau khi có contract từ 2, 3, 4.
> 5. **Conversations 7, 8 (Platform + DevOps)** — sau khi Phase 1 merge xong.

---

## ⚠️ LƯU Ý RỦI RO KHI CHẠY NHIỀU CONVERSATION (đọc 1 lần cho kỹ)

Chia việc cho nhiều AI song song có lợi (nhanh) nhưng kèm rủi ro. Giảm thiểu bằng cách:

| Rủi ro | Cách giảm thiểu (đã cài trong prompt) |
|---|---|
| **Xung đột file** — 2 agent sửa cùng 1 file | File Ownership Matrix (PLAN.md §5) + prompt dặn "chỉ sửa file của mình" |
| **Mất ngữ cảnh chung** — agent A đổi API, agent B không biết | Tất cả bám 1 bảng contract API duy nhất (PLAN-SPEC-Backend.md §6) |
| **package.json bị 3 agent cùng sửa** | Chỉ Tech-Lead được sửa; agent khác ghi yêu cầu vào báo cáo |
| **Testing chạy khi code chưa xong** → test "dự đoán" | **Testing Đợt B** — chỉ chạy sau khi Auth/Exam/Admin xong |
| **Merge vỡ app** (route trùng, 2 reducers) | Sau mỗi phase: kiểm tra tổng + test pass rồi mới mở phase sau |

> 💡 **Mẹo quan trọng:** Khi 1 agent báo "cần endpoint API chưa có" — **đừng** để nó tự sửa `server/`. Gom hết yêu cầu từ 2, 3, 4 lại, đưa 1 lượt cho Conversation 6 (Backend).
> 💡 **Khi 2 agent cùng cần sửa 1 file** (ví dụ `apiService.jsx`): ưu tiên agent nào có nhu cầu nhỏ hơn thì chờ, hoặc nhờ Tech-Lead làm 1 bản "nền" chung trước.

---

## ✅ CONVERSATION 1 — TECH-LEAD (chạy ĐẦU TIÊN, Phase 0)

```
/goal Bạn là Tech-Lead của dự án QuizMaster tại thư mục hiện tại.

Đọc các file sau trước khi làm:
- PLAN.md
- PLAN-SPEC-Backend.md	
- README-AI-AGENTS.md

Nhiệm vụ Phase 0 (chỉ làm đúng những việc này, KHÔNG làm thêm):
1. Tạo thư mục server/ với Express + better-sqlite3 (chạy được, có GET /api/v1/health trả { status: "ok" }).
2. Tách .env và .env.example: PORT=3001 cho backend, JWT_SECRET, DB_PATH. Thêm "proxy": "http://localhost:3001" vào package.json (frontend giữ cổng 3002).
3. Thêm concurrently vào devDependencies; thêm script "dev" chạy cả server (3001) + client (3002) cùng lúc. Giữ nguyên script start/build/test cũ.
4. Đổi baseURL trong src/util/axiosCutomes.jsx thành "/api/v1" để đi qua proxy.
5. Cập nhật README.md: hướng dẫn chạy npm run dev mới.

Luật:
- Chỉ bạn được sửa package.json, App.js, Layout.js, index.js trong Phase 0.
- Không sửa file trong src/component/User, src/component/Admin, src/component/sevices (trừ axiosCutomes.jsx).
- Commit từng bước nhỏ nếu repo là Git.
- Verify: chạy npm run dev, kiểm tra http://localhost:3001/api/v1/health và http://localhost:3002 đều OK.

Kết thúc: báo cáo danh sách file đã tạo/sửa, kết quả verify, và xác nhận "Phase 0 hoàn tất, các agent Phase 1 có thể bắt đầu".
```

---

## ✅ CONVERSATION 2 — AGENT-AUTH (ĐỢT A — chạy SONG SONG với 3, 4)

```
/goal Bạn là Agent-Auth của dự án QuizMaster.

Đọc các file:
- PLAN.md (nhất là §5 File Ownership)
- PLAN-SPEC-Auth.md
- README-AI-AGENTS.md

Nhiệm vụ: Triển khai đầy đủ module Auth theo spec:
1. Form login/register: validation, gọi POST /api/v1/auth/login và /register, lưu user vào Redux + persist, toast lỗi rõ ràng.
2. Axios interceptor: tự gắn Authorization: Bearer <token>; khi nhận 401 → tự gọi /auth/refresh → retry; refresh fail → logout sạch.
3. Route guard: chặn trang Admin nếu không phải admin (redirect về /), dùng helper isAdmin/isUser.
4. Trang Profile: xem/sửa tên, email, avatar; đổi mật khẩu (PUT /users/me, POST /auth/change-password).

Giới hạn (bắt buộc):
- CHỈ sửa file: src/component/Admin/Auth/**, src/store/authSlice.* (hoặc src/component/actions/redux/userReducer.jsx nếu chưa có store/), src/hooks/useAuth.js, src/component/User/Profile.* (nếu tạo mới).
- Nếu cần endpoint API chưa tồn tại → GHI vào báo cáo cuối, KHÔNG tự sửa server/ và KHÔNG tự sửa package.json.
- Không đụng src/component/User/DetailQuiz*, ListQuiz*, Question* (thuộc Agent-Exam), src/component/Admin/Content/** (thuộc Agent-Admin).

Kết thúc: báo cáo file đã sửa/tạo, chức năng đã chạy được, yêu cầu API cần Backend bổ sung.
```

---

## ✅ CONVERSATION 3 — AGENT-EXAM (ĐỢT A — chạy SONG SONG với 2, 4)

```
/goal Bạn là Agent-Exam của dự án QuizMaster.

Đọc các file:
- PLAN.md (§5 File Ownership)
- PLAN-SPEC-Exam.md
- README-AI-AGENTS.md

Nhiệm vụ: Nâng cấp exam engine theo spec:
1. Tạo src/hooks/useTimer.js: đếm ngược mm:ss, đổi màu khi < 5 phút, auto-pause khi rời tab (visibilitychange), hết giờ tự nộp bài.
2. Tạo src/hooks/useExamProgress.js: auto-save đáp án vào localStorage, khôi phục khi refresh, (nếu API có) debounce 5s gọi PUT /submissions/:id/progress.
3. Tạo QuestionPalette (lưới câu hỏi): màu trạng thái chưa làm/đang làm/đã trả lời/đánh dấu review, click nhảy câu, nút "đánh dấu review".
4. Modal xác nhận nộp bài (cảnh báo số câu chưa trả lời).
5. Kết nối API thật: POST /quiz-submit, hiển thị ModalResult chi tiết (điểm, % đúng, review đáp án).
6. Chống gian lận cơ bản: cảnh báo khi rời tab quá 3 lần → tự nộp bài.

Giới hạn:
- CHỈ sửa: src/component/User/**, src/hooks/useTimer.js, useExamProgress.js, src/component/User/QuestionPalette.jsx (mới).
- Không đụng Admin/**, Auth/**, package.json, server/**. Endpoint thiếu → ghi báo cáo cho Backend.

Kết thúc: báo cáo file đã sửa/tạo + danh sách endpoint API cần Backend.
```

---

## ✅ CONVERSATION 4 — AGENT-ADMIN (ĐỢT A — chạy SONG SONG với 2, 3)

```
/goal Bạn là Agent-Admin của dự án QuizMaster.

Đọc các file:
- PLAN.md (§5 File Ownership)
- PLAN-SPEC-Admin.md
- README-AI-AGENTS.md

Nhiệm vụ: Nâng cấp Admin Console theo spec:
1. Dashboard: dùng GET /api/v1/overview cho 4 card thống kê; thêm biểu đồ (số bài làm/ngày) nếu API có — thiếu thì ghi yêu cầu.
2. Quản lý User: giữ pagination, THÊM tìm kiếm theo tên/email (query search), validation form, upload avatar preview, confirm trước khi xoá.
3. Quản lý Quiz: CRUD + cover upload, gán quiz cho NHIỀU user cùng lúc (multi-select), duplicate quiz, import/export JSON.
4. Quản lý Question: builder động (giữ), hỗ trợ loại câu hỏi single/multiple/true-false, preview câu hỏi như thí sinh.
5. UX: loading skeleton, empty state, error state, toast thống nhất, confirm mọi xoá.

Giới hạn:
- CHỈ sửa: src/component/Admin/Content/** (KHÔNG đụng Admin/Auth/** — của Agent-Auth), src/component/Admin/Admin.jsx, sidebar.jsx (chỉ nếu thêm menu).
- Không đụng User/**, package.json, server/**. Endpoint thiếu → ghi báo cáo.

Kết thúc: báo cáo file đã sửa/tạo + endpoint Backend cần bổ sung.
```

---

## ✅ CONVERSATION 5 — AGENT-TESTING (ĐỢT B — chạy SAU khi 2, 3, 4 xong)

> ⚠️ **KHÔNG chạy song song với Đợt A.** Đợi Auth/Exam/Admin báo "xong" rồi mới mở con này — để test code thật, tránh viết test theo dự đoán.

```
/goal Bạn là Agent-Testing của dự án QuizMaster.

Đọc các file:
- PLAN.md
- PLAN-SPEC-Platform.md (Phần A)
- PLAN-SPEC-Auth.md, PLAN-SPEC-Exam.md, PLAN-SPEC-Admin.md (để biết module cần test)

LƯU Ý: Các agent Auth/Exam/Admin đã hoàn thành code. Hãy ĐỌC CODE THẬT hiện tại trong repo (không đoán) trước khi viết test.

Nhiệm vụ: Viết unit test + integration test cơ bản:
1. Auth: authSlice (login success/fail, logout, refresh), useAuth (nếu đã có).
2. Exam: useTimer (đếm ngược, hết giờ, pause/resume), logic tính điểm (nếu hàm thuần), reducer quiz.
3. Admin: reducer quiz slice, ModalCreateUser (validation), TableQuiz render.
4. API service: interceptor gắn token, xử lý 401 (mock axios).

Luật:
- KHÔNG sửa code logic sản phẩm — chỉ viết test. Nếu phát hiện bug: ghi vào báo cáo, KHÔNG tự sửa.
- Chạy: npm test -- --watchAll=false cho tới khi pass toàn bộ.

Kết thúc: báo cáo danh sách test đã viết, coverage, bug tìm được + danh sách file code đang lỗi cần agent chủ sửa (nếu có).
```

---

## ✅ CONVERSATION 6 — AGENT-BACKEND (chạy SAU khi Đợt A xong — tổng hợp contract từ 2, 3, 4)

```
/goal Bạn là Agent-Backend của dự án QuizMaster.

Đọc các file:
- PLAN-SPEC-Backend.md (bảng contract API §6 là chuẩn)
- Tìm trong repo các báo cáo/yêu cầu endpoint từ Agent-Auth, Agent-Exam, Agent-Admin (thường ghi trong file NOTES-* hoặc báo cáo cuối conversation) — nếu có, tổng hợp vào.

Nhiệm vụ: Hoàn thiện backend theo spec:
1. Đủ endpoints theo bảng contract: auth (login/register/refresh/logout/change-password), users/participant (CRUD + search), quiz (CRUD + assign + duplicate + import/export), questions (CRUD), submissions (submit + progress + history), stats (overview + daily), health.
2. JWT access + refresh (httpOnly cookie), bcrypt hash password.
3. Validation toàn bộ body; error handler tập trung; rate-limit cho /auth/*.
4. Seed data: admin mặc định (admin@quizmaster.dev / admin123), 3 quiz mẫu + câu hỏi, 5 user mẫu.
5. Giữ nguyên path endpoint cũ mà frontend đang dùng (login, register, participant, quiz-by-participant, quiz/all, quiz, quiz-assign-to-user, questions-by-quiz, quiz-submit, overview).

Giới hạn:
- CHỈ sửa server/**, .env, .env.example. Dependency mới → ghi yêu cầu Tech-Lead duyệt, KHÔNG tự sửa package.json.
- Không đụng src/**.

Verify: chạy server (npm run dev hoặc node server/index.js), dùng curl test login → lấy token → CRUD quiz → submit; kiểm tra seed data.

Kết thúc: báo cáo endpoint đã làm, kết quả curl test, dependency cần duyệt.
```

---

## ✅ CONVERSATION 7 — AGENT-PLATFORM (Phase 2 — chạy sau khi Phase 1 merge + test pass)

```
/goal Bạn là Agent-Platform của dự án QuizMaster.

Đọc các file:
- PLAN.md
- PLAN-SPEC-Platform.md (Phần B)

Nhiệm vụ:
1. Responsive: kiểm tra toàn trang ở 375px → 1440px; sidebar admin thu gọn đúng; bảng không bị tràn.
2. Dark mode: dùng design-tokens.scss (đã có) thêm CSS variables + toggle (lưu localStorage, tôn trọng prefers-color-scheme).
3. Loading: skeleton thay spinner thô; tối ưu NProgress.
4. A11y: alt text, label form, focus visible, contrast, aria cho modal/sidebar.
5. Performance: React.lazy + Suspense cho trang Admin, lazy load ảnh, memo nơi cần.
6. Gamification/Mascot/Leaderboard (đã có): kiểm tra chạy ổn, nâng cấp visual nếu cần, KHÔNG phá logic.
7. Dọn cảnh báo console khi build.

Giới hạn:
- CHỈ sửa: src/component/Common/**, Home/**, Header/**, styles/**, src/App.scss, bootstrap-override.scss, index.css, src/hooks/useDarkMode.js (mới).
- KHÔNG đụng User/**, Admin/Content/**, server/**.

Kết thúc: báo cáo file đã sửa/tạo + kết quả cải thiện (Lighthouse nếu đo được).
```

---

## ✅ CONVERSATION 8 — AGENT-DEVOPS (Phase 2 — chạy SONG SONG với 7)

```
/goal Bạn là Agent-DevOps của dự án QuizMaster.

Đọc các file:
- PLAN.md
- PLAN-SPEC-Platform.md (Phần C)

Nhiệm vụ:
1. Dockerfile multi-stage: stage 1 build frontend (npm run build), stage 2 node:20-alpine chạy server/index.js + serve build/ (express static).
2. .dockerignore (loại node_modules, .git, build, server/data).
3. .github/workflows/ci.yml: install → test → build, trigger push/PR vào main.
4. Cập nhật .env.example đầy đủ (PORT, JWT_SECRET, DB_PATH, CLIENT_ORIGIN).
5. Thêm script npm nếu cần (dev/build/start/test) — CHỈ khi Tech-Lead duyệt; nếu bị chặn, ghi yêu cầu vào báo cáo.
6. README.md: thêm section Deploy (docker build, docker run).

Giới hạn:
- CHỈ tạo/sửa: Dockerfile, .dockerignore, .github/workflows/**, .env.example, README.md (section Deploy).
- KHÔNG đụng src/**, server/** logic.

Verify: docker build thành công (nếu máy có Docker), hoặc báo cáo chính xác bước cần chạy.

Kết thúc: báo cáo file đã tạo, trạng thái build, yêu cầu Tech-Lead duyệt dependency/script (nếu có).
```

---

## 🧠 MẸO VẬN HÀNH

- **Thứ tự:** Conv 1 → (Đợt A) Conv 2, 3, 4 song song → (Đợt B) Conv 5 → Conv 6 → (Phase 2) Conv 7, 8.
- **Trước khi mở Đợt A:** chờ Conversation 1 báo "Phase 0 hoàn tất".
- **Trước khi mở Đợt B (Conv 5):** chờ cả 2, 3, 4 báo xong — đừng mở sớm.
- **Khi mở nhiều conversation:** nên dùng chế độ **New Worktree** để mỗi agent làm trên nhánh cô lập (nếu là Git repo) — tránh đè file nhau. Nếu dùng Local Mode thì phải tin tưởng File Ownership Matrix vì các agent đã được dặn trong prompt.
- **Nếu agent hỏi giữa chừng** (vì không có /goal): trả lời ngắn "cứ làm theo spec, tự quyết trong phạm vi của bạn".
- **Khi 1 agent báo cần endpoint API thiếu:** đừng sửa ngay — gom lại, đợi các agent khác báo xong rồi đưa cho Conversation 6 (Backend) xử lý 1 lượt.
- **Khi 2 agent cùng cần 1 file** (ví dụ `apiService.jsx`): để agent có nhu cầu nhỏ hơn chờ, hoặc nhờ Tech-Lead tạo bản "nền" chung.
- **Sau mỗi phase:** kiểm tra tổng (chạy thử app) → merge → test pass → mới mở phase sau.