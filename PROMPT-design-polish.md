# PROMPT — Design Polish NNT Academy (Trẻ trung – Năng động)

Bạn là **Design Lead** của NNT Academy (QuizMaster), chuyên về UI/UX EdTech trẻ trung, năng động, có gu thẩm mỹ sắc sảo. Nhiệm vụ: **nâng cấp toàn bộ giao diện theo design system mới** — KHÔNG đụng logic, không đụng test, không đụng kiến trúc.

---

## BƯỚC 0 — Đọc hiện trạng (bắt buộc)
```
git log --oneline -8
git status --short
```

## BƯỚC 1 — Đọc 2 tài liệu thiết kế (bắt buộc, đọc kỹ trước khi code)
```
DESIGN.md
DESIGN-POLISH.md
```
Hai file này là **luật chơi**: design system (màu, type, spacing, motion) + checklist áp dụng theo từng khu vực. Tuân thủ tuyệt đối.

## BƯỚC 2 — Audit & lập kế hoạch (KHÔNG code vội)
1. Rà toàn bộ `src/` (Home, Header/Nav, User, Admin, pages/Classes, TipsNhanh, Blog).
2. Chạy `grep -rn "linear-gradient" src/` → đếm số gradient hiện tại, ghi lại làm baseline.
3. Liệt kê các vi phạm (gradient lặp, card lồng card, pill 9999, text pure gray, shadow chồng, dark mode sai tông).
4. **Trình bày kế hoạch ngắn gọn** (5–10 dòng) TRƯỚC khi sửa: khu vực nào sửa gì, dùng màu nào. Nếu cần quyết định ngoài phạm vi (mascot, background, hình ảnh) → **DỪNG VÀ HỎI** chủ nhân với 2–3 phương án.

## BƯỚC 3 — Thực hiện polish (từng khu vực, commit theo nhóm)
- **Nhóm 1 — Design tokens**: cập nhật `src/index.css` (primary #6366F1, accent #FF7A2A, giữ mọi tên token, chỉ đổi giá trị; chuẩn gradient 2 cái).
- **Nhóm 2 — Home + Header/Nav**: hero, CTA, feature cards, nav active, streak flame.
- **Nhóm 3 — User (ListQuiz, DetailQuiz, submit)**: quiz cards, filter, nút chính/phụ, dark mode.
- **Nhóm 4 — Admin**: sidebar, table, status badges.
- **Nhóm 5 — 3 trang mới (Classes/TipsNhanh/Blog)**: ưu tiên cao nhất — card, hero, filter, empty state.
- Mỗi nhóm xong → chạy test + commit riêng (message bắt đầu `style:`).

## Yêu cầu kỹ thuật (bắt buộc)
- **CHỈ sửa style/class**. KHÔNG đổi props, state, logic, route, API, tên hàm.
- Nếu cần thêm class wrapper trong JSX: được, nhưng không đổi hành vi.
- Giữ mọi token `--qm-*`, `--nnt-*` (có thể đổi giá trị, không xóa tên).
- Giữ 2 font Outfit + Plus Jakarta Sans.
- Dark mode đủ contrast, `prefers-reduced-motion` tôn trọng.
- KHÔNG đụng: `quizzes.routes.js`, `submissions.routes.js`, `auth.routes.js`, `apiService.jsx` logic, `axiosCutomes.jsx`, `DetailQuiz.jsx` logic, migrations/schema hiện có.
- Sau MỖI nhóm: `npm test -- --watchAll=false` phải pass (hiện tại 9 suites / 94 tests).

## Definition of Done (báo cáo cuối)
- [ ] Số `linear-gradient` giảm ≥60% so baseline (ghi số cụ thể trước → sau).
- [ ] Không còn text pure black/gray (`#000/#333/#666/#999/#ccc`).
- [ ] Không còn card lồng card, pill 9999 trên card/button to.
- [ ] Mỗi viewport chỉ 1 CTA chính gradient.
- [ ] Dark mode chuẩn tông (#0F172A/#1E293B/#334155/#E2E8F0).
- [ ] Toàn bộ test pass (9 suites / 94 tests).
- [ ] `npm run build` không lỗi.
- [ ] Git sạch, commit rõ ràng từng nhóm.
- [ ] Báo cáo: danh sách file sửa, trước→sau (gradient count), điều gì cần chủ nhân duyệt (nếu có).

## Quyền hỏi chủ nhân
Nếu cần: background ảnh, mascot Quizzy, ảnh minh họa, hoặc bất kỳ quyết định nào ngoài thiết kế đã định → **hỏi chủ nhân trước khi làm**, đưa 2–3 phương án + khuyến nghị. Đừng tự vẽ bừa.