# Project Roadmap & Architectural Audit

> Development history, architectural scorecard, completed milestones, and future enhancements for Folio.

---

## 1. Architectural Audit & Scorecard

During the comprehensive engineering evaluation conducted on the initial build, the architecture was assessed across eight core disciplines:

| Discipline                  | Initial Score | Post-Hardening | Summary of Improvements                                                                            |
| :-------------------------- | :-----------: | :------------: | :------------------------------------------------------------------------------------------------- |
| **Feature Completeness**    |    9 / 10     |  **9.5 / 10**  | 7 core routes, full CRUD, investments portfolio, budgets, global search (`⌘K`), dark mode.         |
| **UI / UX / Visual Design** |    8 / 10     |  **9.0 / 10**  | Editorial typography, responsive drawer modals, count-up animations, custom SVG charts.            |
| **Code Architecture**       |    6 / 10     |  **8.5 / 10**  | Centralized reactive `DataContext`, isolated storage services, pure derived calculations.          |
| **Data Integrity**          |    5 / 10     |  **9.0 / 10**  | Atomic balance updates, inter-account transfers, guarded account deletion, JSON schema validation. |
| **Testing & Quality**       |    0 / 10     |  **8.5 / 10**  | 45+ automated unit tests in Vitest + JSDOM, GitHub Actions CI workflow, strict ESLint flat config. |
| **Performance**             |    6 / 10     |  **8.5 / 10**  | Rollup code-splitting for vendor, Recharts, and date-fns chunks; route lazy loading with Suspense. |
| **Accessibility (a11y)**    |    6 / 10     |  **8.0 / 10**  | Semantic markup, focus indicators, modal Escape handlers, aria-labels on icon buttons.             |
| **Docs & Repository Ops**   |    5 / 10     |  **9.0 / 10**  | Modular `docs/` hub, detailed architecture schemas, `.nvmrc`, MIT license, clean repository root.  |

---

## 2. Completed Milestones (Phases 0 — 16)

The project has achieved complete implementation across all planned milestones:

- [x] **Phase 0 — Project Scaffolding**: Vite + React 18, Tailwind CSS, project folder layout, path aliases (`@/*`).
- [x] **Phase 1 — Design System & UI Primitives**: Color tokens, typography (`Playfair Display` + `Inter`), Button, Modal, Input, Select, Badge, EmptyState, ConfirmDialog.
- [x] **Phase 2 — Layout & Navigation**: AppLayout, Desktop Navbar with active underlines, MobileNav drawer, ScrollToTop, ErrorBoundary.
- [x] **Phase 3 — Data Layer & Persistence**: LocalStorage storage abstraction (`services/storage.js`), v2 schema migration, seed data (`mockData.js`).
- [x] **Phase 4 — Dashboard Page**: Net worth hero with count-up animation, 5-metric summary strip, timeline charts, spending donut, recent transactions.
- [x] **Phase 5 — Transactions Page**: Search, filters (month, account, category, type), sortable table, pagination, transaction modal supporting expenses, income, and transfers.
- [x] **Phase 6 — Accounts Page**: Asset vs. liability breakdown, add/edit account modal, guarded deletion requiring transaction reassignment.
- [x] **Phase 7 — Budgets Page**: Category monthly limits, real-time spending progress bars with warning and exceeded thresholds.
- [x] **Phase 8 — Analytics Page**: Cash flow comparison, category distribution, monthly expense/income breakdowns, savings rate trendline.
- [x] **Phase 9 — Investments Page**: Portfolio valuation summary, asset-class allocation donut, holdings table with gain/loss tracking.
- [x] **Phase 10 — Settings Page**: Profile information, currency switching (`INR`, `USD`, `EUR`), theme preference, versioned JSON backup export/import, reset to demo, erase all.
- [x] **Phase 11 — Dark Mode**: CSS custom properties for light and dark palettes, `ThemeProvider` with system preference detection and smooth transitions.
- [x] **Phase 12 — Global Search**: Keyboard shortcut (`⌘K` / `Ctrl+K`) overlay searching across transactions, accounts, budgets, and investments.
- [x] **Phase 13 — Responsive Polish**: Breakpoints for mobile (< 640px), tablet (640–1024px), and desktop (> 1024px); mobile drawer modals and stacked cards.
- [x] **Phase 14 — Micro-Interactions**: Chart entry animations, row hover states, count-up numeric transitions, smooth modals.
- [x] **Phase 15 — Accessibility**: Semantic elements (`<nav>`, `<main>`, `<section>`), keyboard navigation, focus rings, WCAG AA color contrast.
- [x] **Phase 16 — Production QA & Hardening**: Vitest test suites (63 passing tests), ESLint 0 warnings/errors, Vercel SPA deployment configuration, repository cleanup.
- [x] **Phase 17 — In-Browser AI Statement Ingestion**: Client-side PDF decryption with `pdfjs-dist`, bank password format hints, Google Gemini 1.5 Flash structured JSON parsing, 1-click interactive demo mode with HDFC and ICICI sample statements, and duplicate detection staging.
- [x] **Phase 18 — Dual Spending Engine & AI Advisor**: Liquid savings outflows vs. credit card liability segregation, credit card bill payment isolation, and interactive AI Spending Advisor card discovering lifestyle creep, recurring subscriptions, and liquidity safety ratio.
- [x] **Phase 19 — Indian Wealth Management Suite**: Multi-asset portfolio tabs (Stocks, Mutual Funds, Fixed Deposits, Bonds), live AMFI India daily NAV lookup and search, and Indian standard quarterly compounding FD engine.
- [x] **Phase 20 — Authentic Dynamic Student Persona**: Shifted from legacy corporate executive data to a realistic Indian college/tech student persona (Aritra) with dynamic relative dates (`subDays(now, X)`) ensuring the active month is always lively and populated.

---

## 3. Future Enhancements & Roadmap

The following capabilities are prioritized for subsequent major releases:

### High Priority (v1.1 — v1.2)

1. **CSV Bank Statement Import**:
   - Client-side parser for major banking CSV exports (Chase, HDFC, ICICI, Citi).
   - Auto-matching column selector and transaction deduplication before committing to storage.
2. **Recurring Transactions Engine**:
   - Subscription and recurring bill tracking (monthly rent, Netflix, salary).
   - Projected calendar view of upcoming expenses.
3. **Advanced Multi-Currency Conversion**:
   - Real-time or cached foreign exchange rate conversion for multi-currency accounts.

### Medium Priority (v1.3 — v2.0)

4. **Progressive Web App (PWA) Offline Support**:
   - Service worker caching for 100% offline capability on desktop and mobile.
   - Installable home-screen manifest with custom Folio icons.
5. **Encrypted Cloud Sync Adapters**:
   - Optional end-to-end encrypted backup syncing via private WebDAV, iCloud, or self-hosted Supabase instances, without compromising local-first privacy.
6. **Virtualization for Massive Ledgers**:
   - Windowing via `@tanstack/react-virtual` for transaction tables exceeding 10,000+ entries.
