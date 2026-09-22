# DESIGN.md — NNT Academy Design System
> Phong cách: **TRẺ TRUNG – NĂNG ĐỘNG (Playful & Energetic EdTech)**
> Dành cho: QuizMaster / NNT Academy — nền tảng ôn thi & luyện quiz cho học viên trẻ (16–25 tuổi).

## 1. Nguyên tắc cốt lõi (Product mode)
- **Năng lượng, không ồn ào**: vui tươi, màu sắc sống động nhưng giữ đọc rõ, không "sặc sỡ kiểu 2015".
- **Một signature element** để nhớ: **mascot cáo Quizzy 🦊** + **motif sóng/cloud mềm** (đang có CloudShader) — dùng có chủ đích, không nhét khắp nơi.
- **Motion mượt, có mục đích**: hover lift nhẹ (translateY(-2px) + shadow), transition 150–250ms ease-out, KHÔNG bounce/elastic.
- **Typography là cá tính**: Outfit (heading) + Plus Jakarta Sans (body) — giữ nguyên 2 font này, chỉ chuẩn hóa scale & weight.
- **Không lặp gradient**: gradient chỉ dành cho CTA chính + hero + badge "hot", phần còn lại dùng solid + shadow tinh.

## 2. Color Palette (4–6 named hex — KHÔNG gradient tràn lan)

| Vai trò | Hex | Dùng cho |
|---|---|---|
| **Primary — Indigo vui tươi** | `#6366F1` | Nút chính, link, focus, icon chủ đạo |
| **Primary hover** | `#4F46E5` | Hover nút chính |
| **Accent — Tangerine năng động** | `#FF7A2A` | CTA "hot", badge, số liệu nổi bật |
| **Accent gold** | `#FFBB35` | Badge sao, streak, phần thưởng |
| **Success** | `#10B981` | Đúng, đã tham gia, hoàn thành |
| **Surface nền** | `#F8FAFC` (slate-50) | Nền app; dark: `#0F172A` |
| **Text chính** | `#0F172A` / `#E2E8F0` (dark) | Không dùng pure black/white |

**Gradient chuẩn (chỉ 2, dùng hạn chế):**
- `--nnt-gradient-primary`: `135deg, #6366F1 → #FF7A2A` (CTA chính, hero title)
- `--nnt-gradient-gold`: `135deg, #FFBB35 → #FFB380` (badge, streak, phần thưởng)

> ❌ BỎ gradient `#1e293b → #6C63FF → #FF9963` (dark hero) — quá 3 màu, chuyển sang solid tint + glow nhẹ.

## 3. Typography Scale
| Role | Font | Size/Weight |
|---|---|---|
| Display (hero title) | Outfit, 800 | 40–56px, letter-spacing -0.03em |
| Heading 1 | Outfit, 700 | 30–36px |
| Heading 2 | Outfit, 700 | 22–26px |
| Heading 3 | Outfit, 600 | 18–20px |
| Body | Plus Jakarta Sans, 400/500 | 15–16px, line-height 1.6 |
| Caption/label | Plus Jakarta Sans, 600 | 12–13px, letter-spacing +0.02em |

## 4. Spacing, Radius, Shadow (giữ token đang có)
- Spacing: 4/8/12/16/24/32/48 (nhất quán)
- Radius: `--qm-radius-md:10px` card, `--qm-radius-xl:20px` hero/panel, **KHÔNG 9999px tràn lan** (chỉ pill nhỏ: badge, tag)
- Shadow: 1 lớp mỏng (`--qm-shadow-sm/md`), hover dùng `--qm-shadow-lg` + `translateY(-2px)`. KHÔNG đổ nhiều lớp.

## 5. Motion
- Transition: `--qm-transition-fast 150ms` / `normal 250ms` — ease-out mềm.
- Hover: lift nhẹ (card, button), glow accent khi focus.
- `prefers-reduced-motion`: tắt mọi animation.
- KHÔNG bounce/elastic.

## 6. Dark Mode
- Nền `#0F172A`, surface `#1E293B`, border `#334155`, text `#E2E8F0`.
- Gradient tối: dùng tint indigo/tangerine glow nhẹ, KHÔNG gradient 3 màu.

## 7. Signature Element — Mascot & Motif
- **Quizzy 🦊** hiện diện ở: hero, logo, empty state, celebration (khi hoàn thành quiz).
- **Cloud/wave motif**: hero background, card header, divider — mềm mại, opacity thấp (0.06–0.12), không che text.
- Nút chính dùng gradient indigo→tangerine là "chữ ký" CTA — nhưng chỉ 1 nút chính mỗi viewport.

## 8. Anti-Patterns (CẤM)
- ❌ Gradient tím–cam ở **mọi** button/badge/icon (chỉ CTA chính + hero)
- ❌ Cards lồng cards (card trong card trong card)
- ❌ Pure black/gray text (`#000`, `#ccc`) — luôn tinted
- ❌ Pill `border-radius:9999px` cho card/button to (chỉ badge/tag nhỏ)
- ❌ Bounce/elastic easing
- ❌ Purple→blue gradient ("AI slop")
- ❌ Quá nhiều box-shadow chồng lớp
- ❌ Icon tile vuông bo tròn lặp trên từng heading (SaaS rẻ tiền)

## 9. Kế thừa & Không phá vỡ
- Giữ mọi token `--qm-*`, `--nnt-*` hiện có (đổi giá trị nếu cần, KHÔNG xóa tên).
- Giữ 2 font Outfit + Plus Jakarta Sans (cá tính hiện tại).
- Giữ cấu trúc component, chỉ sửa style/class, KHÔNG đổi logic, props, test.
- `Pages.scss`, `Home.scss`, `Admin`, `User` đều áp dụng chung hệ thống này.