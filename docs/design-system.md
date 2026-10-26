# CareBridge — Professional Healthcare Design System

**Version:** 2.0  
**Design Philosophy:** Calm, trustworthy, accessible, clinical clarity without coldness.

---

## 1. Color Palette & Tokens

### Primary Palette (Clinical Teal & Trust Blue)
- **Primary 900 (`#134E4A`):** High-contrast medical text, dark navigation headers.
- **Primary 800 (`#115E59`):** Deep accent, active state text.
- **Primary 700 (`#0F766E`):** Primary buttons hover state.
- **Primary 600 (`#0D9488`):** Main interactive brand color (buttons, active tabs, links).
- **Primary 500 (`#14B8A6`):** Vibrant highlight, focus rings, progress bars.
- **Primary 100 (`#CCFBF1`):** Subtle tinted surfaces, pill backgrounds.
- **Primary 50 (`#F0FDFA`):** Soft background tints, active row highlights.

### Neutral Palette (Slate & Soft Medical White)
- **Background App:** `#F8FAFC` (Slate 50)
- **Card / Surface Background:** `#FFFFFF` (Pure White)
- **Elevated Surface:** `#FFFFFF` with soft shadow (`0 4px 20px -2px rgba(15, 23, 42, 0.05)`)
- **Border Default:** `#E2E8F0` (Slate 200)
- **Border Subtle:** `#F1F5F9` (Slate 100)
- **Text Main:** `#0F172A` (Slate 900)
- **Text Muted:** `#64748B` (Slate 500)
- **Text Subtle:** `#94A3B8` (Slate 400)

### Status & Semantic Colors
- **Success (Green):** Text `#15803D`, BG `#DCFCE7`, Border `#86EFAC`
- **Warning (Amber):** Text `#B45309`, BG `#FEF3C7`, Border `#FDE68A`
- **Critical / Emergency (Red):** Text `#B91C1C`, BG `#FEE2E2`, Border `#FCA5A5`
- **Information (Blue):** Text `#1D4ED8`, BG `#DBEAFE`, Border `#93C5FD`

---

## 2. Typography Scale

Font Family: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 36px - 44px | 800 | 1.15 | -0.025em | Landing page headline |
| **Page Title** | 28px - 32px | 700 | 1.25 | -0.02em | Dashboard and module titles |
| **Section Title** | 20px - 24px | 600 | 1.3 | -0.015em | Card headers, table headings |
| **Subtitle / Metric** | 16px - 18px | 600 | 1.4 | normal | Stat metrics, list titles |
| **Body Default** | 14px - 15px | 400 / 500 | 1.5 | normal | General interface copy |
| **Caption / Helper** | 12px - 13px | 500 | 1.4 | 0.01em | Timestamps, form hints, badges |
| **Micro Badge** | 10px - 11px | 600 | 1.2 | 0.05em | Uppercase status chips |

---

## 3. Spacing & Radius Tokens

- **Border Radius:**
  - Badges / Chips: `9999px` (Full rounded)
  - Inputs / Buttons: `10px` (`rounded-lg`)
  - Cards / Panels: `16px` (`rounded-2xl`)
  - Modals / Checkout Containers: `24px` (`rounded-3xl`)
- **Spacing Scale:**
  - Micro: `4px`, `8px`
  - Compact: `12px`, `16px`
  - Generous: `24px`, `32px`
  - Section Spacing: `48px`, `64px`

---

## 4. Reusable Component Standards

1. **Buttons:**
   - Primary: Solid `#0D9488`, white text, soft shadow, focus ring `#14B8A6`.
   - Secondary: White background, Slate 200 border, Slate 700 text, hover background Slate 50.
   - Danger: Red 600, white text, for cancellations and urgent actions.
2. **Status Badges:** Consistent dot + label format (`APPROVED`, `PENDING_PAYMENT`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
3. **Cards:** Minimal border (`border-slate-200/80`), subtle shadow, clean padding (`p-6`).
4. **Form Inputs:** Height 42px, radius 10px, clear focus states (`ring-2 ring-teal-500/20 border-teal-500`).
5. **Loading Skeletons:** Animated pulse with `bg-slate-200/60`, matching exact layout dimensions to eliminate Cumulative Layout Shift (CLS).
