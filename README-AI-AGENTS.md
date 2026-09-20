# 🤖 README-AI-AGENTS.md — Vận hành Multi-Agent trên QuizMaster trong Antigravity 2.0

> Đây là **sổ tay điều hành**: cách khởi động nhiều AI agent song song, prompt chuẩn để dán vào từng conversation, và quy tắc phối hợp.

---

## 0. Chuẩn bị 1 lần (trong Antigravity 2.0)

1. **Project:** tạo project `QuizMaster` trỏ vào `D:\test-demo-react\Quiz-question` (bỏ các folder rác đang "Missing").
2. **Chế độ làm việc:** khuyến nghị **New Worktree** cho các agent Phase 1 (mỗi agent 1 worktree riêng → không đụng code của nhau). Nếu anh muốn sửa thẳng, dùng **Local Mode** nhưng phải tôn trọng File Ownership Matrix trong `PLAN.md` §5.
3. **Tài liệu:** mỗi agent khi bắt đầu sẽ được yêu cầu đọc `PLAN.md` + spec của mình.

---

## 1. Thứ tự khởi động (bắt buộc)

```
Phase 0: Tech-Lead (1 agent) — làm XONG, merge, test pass
              ↓
Phase 1: Auth + Exam + Admin + Testing (4 agent SONG SONG)
              ↓
Phase 2: Platform + Backend-v2 + DevOps (3 agent SONG SONG)
              ↓
Phase 3: Tech-Lead (nâng cấp React/Vite)
```

> ⚠️ Đừng mở Phase 1 trước khi Phase 0 xong — backend skeleton chưa có thì các agent kia không có API để bám.

---

## 2. Prompt chuẩn cho từng agent (copy-paste vào từng conversation)

### 🔷 Conversation 1 — TECH-LEAD (chạy trước, Phase 0)
```
/goal Bạn là Tech-Lead của dự án QuizMaster tại thư mục hiện tại.
Đọc PLAN.md, PLAN-SPEC-Backend.md. Thực hiện Phase 0:
1. Tạo server/ (Express + better-sqlite3) với GET /api/v1/health.
2. Tách .env: PORT=3001 cho backend; thêm "proxy" vào package.json trỏ localhost:3001.
3. Thêm concurrently vào devDependencies, script "dev" chạy cả server + client.
4. Đổi baseURL trong src/util/axiosCutomes.jsx thành "/api/v1".
Không làm gì ngoài Phase 0. Commit từng bước nếu repo là Git. Báo cáo danh sách file đã tạo/sửa.
```

### 🔷 Conversation 2 — AGENT-AUTH (Phase 1, chạy sau khi Tech-Lead xong)
```
/goal Bạn là Agent-Auth của QuizMaster. Đọc PLAN.md (nhất là §5 File Ownership) và PLAN-SPEC-Auth.md.
Triển khai đầy đủ module Auth theo spec: login/register/profile, JWT + refresh qua axios interceptor,
route guard phân quyền Admin/User, validation. Chỉ sửa file trong phạm vi spec.
Nếu cần dependency mới hoặc endpoint API chưa có, GHI VÀO BÁO CÁO, không tự sửa package.json.
Chạy thử npm start (nếu được) để verify. Báo cáo file đã sửa/tạo + yêu cầu cho Backend.
```

### 🔷 Conversation 3 — AGENT-EXAM (Phase 1)
```
/goal Bạn là Agent-Exam của QuizMaster. Đọc PLAN.md §5 và PLAN-SPEC-Exam.md.
Nâng cấp exam engine: useTimer (auto-pause khi rời tab, hết giờ tự nộp), auto-save tiến độ,
question palette, review đáp án sau nộp bài, kết nối API thật theo spec Backend.
Chỉ sửa file trong src/component/User/** và hooks mới. Báo cáo + endpoint API cần Backend bổ sung.
```

### 🔷 Conversation 4 — AGENT-ADMIN (Phase 1)
```
/goal Bạn là Agent-Admin của QuizMaster. Đọc PLAN.md §5 và PLAN-SPEC-Admin.md.
Nâng cấp Admin Console: dashboard analytics từ API, CRUD user/quiz/question hoàn chỉnh,
tìm kiếm + phân trang user, import/export quiz JSON, duplicate quiz, validation.
Chỉ sửa file trong src/component/Admin/Content/** (trừ Auth/**). Báo cáo + endpoint Backend cần bổ sung.
```

### 🔷 Conversation 5 — AGENT-TESTING (Phase 1 — chạy song song)
```
/goal Bạn là Agent-Testing của QuizMaster. Đọc PLAN.md và PLAN-SPEC-Platform.md Phần A.
Viết unit test cho: authSlice + useAuth (xem spec Auth), useTimer + logic chấm điểm (spec Exam),
reducer quiz + component chính (spec Admin). Dùng Jest + @testing-library/react có sẵn.
KHÔNG sửa code logic sản phẩm — chỉ viết test; nếu gặp bug, ghi vào báo cáo.
Chạy "npm test -- --watchAll=false" cho tới khi pass. Báo cáo coverage + bug tìm được.
```

### 🔷 Conversation 6 — AGENT-BACKEND (Phase 1.5 hoặc 2, sau khi có đủ contract từ Auth/Exam/Admin)
```
/goal Bạn là Agent-Backend của QuizMaster. Đọc PLAN-SPEC-Backend.md và tổng hợp các "API contract cần
Backend" từ báo cáo của Agent-Auth/Exam/Admin (nếu có file ghi chú trong repo, hãy đọc).
Hoàn thiện server/: đầy đủ endpoints theo bảng contract, validation, rate-limit, JWT refresh cookie,
seed data admin + quiz mẫu, docs. Chỉ sửa server/** và .env. Dependency mới phải báo Tech-Lead.
Verify: chạy server, test bằng curl các endpoint chính. Báo cáo.
```

### 🔷 Conversation 7 — AGENT-PLATFORM (Phase 2)
```
/goal Bạn là Agent-Platform của QuizMaster. Đọc PLAN.md và PLAN-SPEC-Platform.md Phần B.
Responsive toàn trang, dark mode (design tokens + toggle), skeleton loading, a11y, React.lazy code-splitting,
tối ưu ảnh/render. Chỉ sửa Common/**, Home/**, Header/**, styles/**. Không đụng User/** Admin/** nếu chưa merge.
Báo cáo + Lighthouse trước/sau nếu đo được.
```

### 🔷 Conversation 8 — AGENT-DEVOPS (Phase 2)
```
/goal Bạn là Agent-DevOps của QuizMaster. Đọc PLAN.md và PLAN-SPEC-Platform.md Phần C.
Tạo Dockerfile multi-stage, .dockerignore, .github/workflows/ci.yml, cập nhật .env.example,
thêm scripts build/dev/test vào package.json (chỉ khi Tech-Lead duyệt — ghi yêu cầu nếu bị chặn).
Verify docker build thành công. Báo cáo.
```

---

## 3. Luật phối hợp (nhắc lại để tránh tai nạn)

| Luật | Chi tiết |
|---|---|
| **1 file = 1 chủ** | Xem File Ownership Matrix `PLAN.md` §5. Agent khác cần sửa → ghi yêu cầu trong báo cáo, KHÔNG tự sửa. |
| **Dependency** | Chỉ Tech-Lead (hoặc DevOps được duyệt) sửa `package.json`. |
| **Route tổng** | `App.js`/`Layout.js` chỉ Tech-Lead. |
| **Merge** | Xong phase → kiểm tra tổng → merge → mới mở phase sau. |
| **Backend là xương sống** | Phase 0 tạo skeleton -> Phase 1 các agent bám contract -> Agent-Backend hoàn thiện theo contract thu thập được. |

---

## 4. Theo dõi tiến trình trong Antigravity 2.0

- **Sidebar trái**: mỗi conversation là 1 agent — vòng xoay = đang chạy, tick = xong, ⚠️ = cần duyệt.
- **Inbox**: yêu cầu approval (chạy lệnh, sửa file ngoài scope...) từ từng agent → anh duyệt ở đây.
- **Subagent panel**: nếu dùng `/teamwork-preview`, thấy cả đội subagent (Orchestrator, Worker, Critic...) chạy nền.
- **Log lệnh**: nằm ngay trong từng conversation (stream real-time).

---

## 5. Nếu muốn "1 cục việc to" giao hẳn cho đội ngũ tự lo

Thay vì chia 8 conversation, anh có thể gõ 1 lần:

```
/teamwork-preview Biến dự án Quiz-question thành nền tảng quiz hoàn chỉnh full-stack:
backend Express+SQLite trong repo, auth JWT, exam engine (timer, auto-save, review),
admin console (dashboard, CRUD, import/export), unit test, Docker + CI.
Đọc PLAN.md và các PLAN-SPEC-*.md làm tài liệu chuẩn.
```

→ Antigravity tự dựng team (Orchestrator → Workers → Critic/Auditor), tự chia milestone, tự verify. Cách này **ít kiểm soát tay** hơn nhưng **tự động hơn** — hợp khi anh tin việc đã được spec rõ như bộ file này.

---

*Soạn bởi amee 🦊 · 2026-09-20 · Kèm PLAN.md + 5 spec.*