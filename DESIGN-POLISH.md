# DESIGN-POLISH.md — Hướng dẫn áp dụng Design System vào NNT Academy

> Đọc `DESIGN.md` trước. File này là **checklist áp dụng thực tế** theo từng khu vực UI.
> Nguyên tắc: **sửa style/class, KHÔNG đổi logic/props/test**. Nếu cần đổi JSX thì chỉ thêm class wrapper, không đổi hành vi.

---

## A. Audit nhanh — tìm các vi phạm

Dùng lệnh tìm trong `src/`:
```
grep -rn "linear-gradient" src/ | wc -l
```
Kỳ vọng sau polish: số gradient giảm ~60–70% (chỉ còn CTA chính + hero + badge).

### Các vi phạm phổ biến cần sửa:
1. **Gradient lặp**: nút phụ, icon tile, card header, tag, skeleton... → đổi solid tint + border + shadow nhẹ.
2. **Cards lồng cards**: card lớn chứa card nhỏ → tách thành panel + list item (border-bottom thay vì card con).
3. **Pill 9999px tràn lan**: button to, card → đổi về `--qm-radius-lg/xl`; chỉ badge/tag/pill nhỏ giữ 9999.
4. **Text pure gray/black**: `#333`, `#666`, `#999`, `#000` → thay bằng `--qm-slate-*` tinted.
5. **Shadow chồng lớp**: bỏ shadow phụ, giữ 1 lớp + hover lift.
6. **Dark mode sai tông**: nền `#0F172A`, surface `#1E293B`, border `#334155`, text `#E2E8F0`.

---

## B. Từng khu vực

### 1. Home (Landing)
- [ ] Hero title: giữ gradient indigo→tangerine (text-gradient), 40–56px Outfit 800.
- [ ] Hero background: cloud/wave motif opacity thấp, KHÔNG gradient 3 màu.
- [ ] Nút CTA chính: gradient, hover lift + glow nhẹ.
- [ ] Nút phụ: solid white/slate + border, hover border accent.
- [ ] Feature cards: solid surface + border + shadow-sm, icon tile dùng solid tint (không gradient), hover translateY(-2px).
- [ ] Stats: số dùng accent tangerine, label caption.
- [ ] Remove: gradient trên badge rác, pill to, shadow chồng.

### 2. Header & Nav
- [ ] Logo: giữ nguyên, khi hover có micro-interaction nhẹ (scale 1.02).
- [ ] NavLink active: dùng primary indigo (solid underline/pill nhỏ), không gradient.
- [ ] Streak flame badge: giữ gradient gold, nhấp nháy nhẹ khi tăng (1 lần, không loop).

### 3. User (Quiz list / Detail / Submit)
- [ ] Quiz card: solid surface, border, shadow-sm; hover lift; icon chủ đề solid tint.
- [ ] Category filter: pill nhỏ, active = primary indigo solid; không gradient.
- [ ] Nút "Làm bài": gradient indigo→tangerine (CTA chính).
- [ ] Nút "Xem kết quả"/phụ: solid white + border.
- [ ] DetailQuiz: header panel gradient nhẹ (1 lần), progress bar accent, celebration dùng mascot Quizzy.

### 4. Admin
- [ ] Sidebar: solid surface, active item = primary tint + border-left 3px (KHÔNG gradient).
- [ ] Table header: slate-100, hover row slate-50.
- [ ] Nút chính: gradient; nút phụ: solid.
- [ ] Status badge: success/warning/danger solid tint đúng màu.

### 5. 3 trang mới (Classes / TipsNhanh / Blog) — ưu tiên cao
- [ ] Hero (nếu có): gradient 1 lần, title Outfit 800.
- [ ] Class card: solid surface, border, badge "Mở lớp"/"Đã tham gia" (success solid tint), nút "Tham gia" gradient (CTA), hover lift.
- [ ] Tips card: thumbnail dùng gradient nhẹ theo category HOẶC solid tint + icon lớn; duration badge pill nhỏ gold; hover lift.
- [ ] Blog card: solid, excerpt slate-600, tag pill nhỏ, hover lift.
- [ ] Filter chips: pill nhỏ, active indigo solid.
- [ ] Empty state: dùng mascot Quizzy 🦊 + copy hướng dẫn hành động.

---

## C. Quality Checklist (trước khi bàn giao)
- [ ] `grep -c "linear-gradient"` giảm ≥60% so với trước.
- [ ] Không còn `#000`, `#333`, `#666`, `#999`, `#ccc` làm text.
- [ ] Không còn card lồng card.
- [ ] Không còn pill 9999 trên card/button to.
- [ ] Mỗi viewport chỉ 1 CTA chính dùng gradient.
- [ ] Dark mode đủ contrast (nền/surface/border/text đúng tông).
- [ ] Hover: card lift nhẹ, button glow; không bounce.
- [ ] `prefers-reduced-motion` tắt animation.
- [ ] TOÀN BỘ test cũ vẫn pass (`npm test -- --watchAll=false` = 90+).
- [ ] `npm run build` không lỗi.
- [ ] Commit rõ ràng, ghi "style: apply NNT design system".

---

## D. Nếu cần ý kiến/tài liệu từ chủ nhân
- Background/hình ảnh mascot Quizzy: **HỎI chủ nhân** (anh ấy có thể tìm/cung cấp).
- Bất kỳ quyết định design nào ngoài phạm vi file này: **dừng và hỏi**, đừng tự ý vẽ bừa.
- Khi hỏi: nêu rõ 2–3 phương án kèm khuyến nghị, không hỏi mơ hồ.