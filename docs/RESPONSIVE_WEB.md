# CareerPilot AI Responsive Web Client

## 1. Responsive Design Philosophy

The CareerPilot AI web client adapts to all viewport sizes without shrinking or breaking desktop controls. It uses modern CSS layout primitives (CSS Grid, Flexbox, media queries, CSS custom properties) to provide a tailored user experience from small smartphones to ultrawide desktop monitors.

---

## 2. Breakpoint Matrix

The application is engineered and tested against the following responsive breakpoints:

| Device Category | Viewport Width Range | Tested Resolutions | Key Layout Adaptations |
| :--- | :--- | :--- | :--- |
| **Mobile Phone** | 320px – 480px | 320px, 375px, 390px, 414px | Sidebar off-canvas slideover; fixed bottom nav bar (5 destinations); single-column stacked forms; touch targets ≥ 44px; horizontal table scroll. |
| **Large Mobile** | 481px – 767px | 480px, 600px, 700px | Single-column grids; collapsible cards; full-width action buttons. |
| **Tablet / iPad** | 768px – 1024px | 768px, 820px, 834px, 1024px | Two-column card grids; slideover sidebar drawer via top-left hamburger; 2-column form grids; split career detail views. |
| **Laptop** | 1025px – 1439px | 1280px, 1366px | Persistent sidebar (260px); 2-column and 3-column card layouts; fixed sticky header. |
| **Desktop / Monitor** | 1440px+ | 1440px, 1920px | Expanded sidebar (280px); maximum container constraint (1400px centered); 3-column analysis grids. |

---

## 3. Key Responsive Adaptations

### A. Navigation Transformation
- **Desktop (≥ 1025px)**: Persistent left sidebar containing the full 12-item navigation hierarchy and engine status indicators.
- **Tablet (768px – 1024px)**: Sidebar converts into an off-canvas drawer triggered by the header menu toggle button with backdrop overlay.
- **Mobile Phone (≤ 480px)**: Dedicated bottom mobile navigation bar featuring the 5 primary user workflows (Home, Profile, Assess, Careers, Report) with comfortable 44×44px touch pads.

### B. Form Inputs & Touch Targets
- All interactive controls (`.btn`, `input`, `select`, `textarea`) have a minimum touch height of **44px** on screens ≤ 1024px to prevent accidental taps.
- Inputs enforce a minimum font size of **16px (1rem)** on mobile devices to prevent automatic viewport zoom in iOS Safari and mobile Chrome.
- Two-column form grids collapse into single columns on screens < 600px.

### C. Prevention of Horizontal Overflow
- Global rule `* { max-width: 100%; }` and `body { overflow-x: hidden; }` prevent horizontal jitter.
- Tables are wrapped in `.table-responsive` with `-webkit-overflow-scrolling: touch` for smooth touch scrolling.
- Long technical strings and feature importance tags utilize `word-break: break-word;`.

---

## 4. Empirical Browser Verification

The responsive web interface was verified in real Chromium browser sessions at multiple viewports:

1. **Desktop (1280×800)**: **PASS** — Persistent sidebar visible, layout aligned.
2. **Mobile (390×844 — iPhone 13/14 size)**: **PASS** — Sidebar hidden, bottom navigation bar fixed at bottom, no horizontal scroll, comfortable touch inputs.
3. **iPad Air Portrait (820×1180)**: **PASS** — Hamburger menu active, 2-column cards, full height utilization.
4. **iPad Air Landscape (1180×820)**: **PASS** — Persistent sidebar, two-column split cards.
