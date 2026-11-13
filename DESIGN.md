# The Ark — Design System Tokens & Rules

## Design Principles
1. **Clarity & Child Safety First:** Statuses (Checked-in, Picked-up, Expected, Authorized) must be instantly discernible at a glance.
2. **Restraint & Purpose:** Avoid superficial AI slop (floating blobs, gratuitous gradients, double border-and-shadow ghost cards). Elevation is declared once.
3. **Tactile Accessibility:** High-contrast text (>= 4.5:1 for body, >= 3:1 for headers), touch targets >= 44px for kiosk operators, clear keyboard focus rings.
4. **Data Typography:** All monetary values (₦), ratios (96/128), percentages, and timestamps must use tabular numerals (`tabular-nums`) to prevent optical jitter.

## Palette & Semantics
- **Brand Primary:** Warm Indigo (`indigo-600` / `indigo-500`) with gentle Violet accents.
- **Surface:** Warm Slate (`bg-slate-50` / `bg-white` in light mode, `bg-slate-950` / `bg-slate-900` in dark mode).
- **Success / In-Class:** Emerald (`emerald-600` text, `emerald-50` / `emerald-500/10` background, `ring-emerald-600/20`).
- **Pending / Expected:** Slate / Amber depending on urgency.
- **Safety / Alert:** Rose (`rose-600` text, `rose-50` / `rose-500/15` background).
- **Giving / Finance:** Indigo & Emerald for offerings, Amber for dues, Rose for special missions.

## Typography
- **Font:** Geist Sans (fallback: system sans-serif).
- **Scale:**
  - Page Title: `text-xl sm:text-2xl font-bold tracking-tight`
  - Section Header: `text-sm font-semibold text-slate-900 dark:text-slate-100`
  - Meta/Subtext: `text-xs text-slate-500 dark:text-slate-400 font-medium`
  - Badges/Counters: `text-[11px] font-semibold tabular-nums`

