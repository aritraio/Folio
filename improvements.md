# Folio — Detailed Improvements Plan (Phases 17–26)

> Companion to `docs/roadmap.md` (Phases 0–16 complete) and the Principal Frontend / Fintech Security audit (`6.7 / 10`).
> This file is the single actionable backlog. Each phase is independently shippable, with problem → evidence → fix → acceptance criteria.
>
> **How to use:** work phases in order. P0 phases are correctness / security / a11y blockers. P1 phases are architectural debt. P2 phases are strategic hardening + features. Check off `[ ]` items as you land them with `npm run lint && npm test -- --run && npm run build` green.

---

## Phase Overview

| Phase | Title | Priority | Effort | Audit Dimension |
|---|---|---|---|---|
| 17 | Fintech Data Integrity Hotfixes — remove fabricated charts | **P0 Immediate** | S | Fintech 20% |
| 18 | Storage Save-Path Validation + Transactional Writes | **P0 Immediate** | M | Security 15%, Fintech 20% |
| 19 | Security Headers, CSP, XSS & Export Safety | **P0 Immediate** | S–M | Security 15% |
| 20 | Accessibility Blockers — table, sort, contrast, SR noise | **P0 Immediate** | S–M | A11y 15% |
| 21 | Architecture Refactor — split god-module, selectors | **P1 Short-term** | M–L | Architecture 20% |
| 22 | Money Math — integer paise, invariants, IRR/CAGR | **P1 Short-term** | M | Fintech 20% |
| 23 | Performance — lazy charts, virtualization, bundle budgets | **P1 Short-term** | M | Performance 15% |
| 24 | Test & Quality Gates — components, E2E, lint, types | **P1 Short-term** | M–L | Tests 15% |
| 25 | Privacy Hardening — encryption, fonts, PII minimization | **P2 Long-term** | L | Security 15% |
| 26 | Strategic Features — PWA, sync, CSV, recurring, FX | **P2 Long-term** | L–XL | Roadmap v1.1+ |

**Definition of done for every phase:** `npm run lint` (0 warnings), `npm test -- --run` (all green + new tests), `npm run build` succeeds, manual light+dark + mobile check, no new `localStorage` keys without migration.

---

## Phase 17 — Fintech Data Integrity Hotfixes [P0 Immediate, Effort: S]

**Goal:** never display misleading money. Current code renders a synthetic portfolio history and a hardcoded daily return as if they were market data.

### 17.1 Remove synthetic `PortfolioValueChart` projection

- **Problem:** `src/components/investments/PortfolioValueChart.jsx:39-51` builds a 12-month curve from `0.75 + progress*0.25` with `Math.sin(idx*1.3)*0.02` oscillation. It looks like real performance.
- **Risk:** High — user makes buy/sell decisions on fake history. Fintech trust violation.
- **Fix (pick one, in order of preference):**
  1. **Preferred:** replace with empty-state + CTA until real snapshots exist: “No price history yet — add monthly snapshots to unlock trend.” Reuse `EmptyState`.
  2. **Interim (if chart must stay):** rename to “Illustrative projection (demo)”, add diagonal hatch / dashed stroke + `aria-label` “simulated data, not market history”, and gate behind `VITE_DEMO_CHARTS=true`.
- **Steps:**
  - [ ] Delete or feature-flag the `months.map(... baseGrowth ... variance ...)` block.
  - [ ] If keeping interim: change stroke to dashed (`strokeDasharray="6 4"`), add watermark text in chart, update `aria-label`.
  - [ ] Update `src/pages/InvestmentsPage.jsx:104-107` to conditionally render real chart vs empty-state based on `priceHistory.length`.
- **Acceptance:** no `Math.sin` / `baseGrowth` in chart component; screen-reader announces “no historical data” or “simulated”; visual review confirms dashed/watermark or empty-state.
- **Files:** `src/components/investments/PortfolioValueChart.jsx`, `src/pages/InvestmentsPage.jsx`

### 17.2 Remove hardcoded `todayChange = totalCurrent * 0.0047`

- **Problem:** `src/pages/InvestmentsPage.jsx:28-36` — `todayChangePct = 0.0047` always shows +0.47% day gain.
- **Risk:** High — fake P&L.
- **Fix:**
  - [ ] Delete `todayChange` derivation. Pass `todayChange={null}` and render `—` with tooltip “Daily change requires price snapshots (roadmap Phase 26)”.
  - [ ] Add unit test: `calcInvestmentReturn` output has no `todayChange` field.
- **Acceptance:** grep `0.0047` returns 0 hits; UI shows em-dash, not a green +₹ value.
- **Files:** `src/pages/InvestmentsPage.jsx`, `src/components/investments/PortfolioSummary.jsx`

### 17.3 Reconcile seed balances vs transactions (docs + test)

- **Problem:** `src/data/mockData.js` account balances (e.g. `acc-1: 345000`) are not provably the sum of `INITIAL_TRANSACTIONS`. No invariant test.
- **Fix:**
  - [ ] Add dev-only script/test `seed.reconciles.test.js` that replays transactions from zero (or documents that seed balances are opening balances + deltas).
  - [ ] Add comment in `mockData.js:1-8` clarifying: “balances are opening balances as of 2026-03-01; transactions are deltas thereafter” (or fix numbers).
- **Acceptance:** test or comment exists; future seed edits must keep invariant.
- **Files:** `src/data/mockData.js`, new `src/data/seed.test.js`

---

## Phase 18 — Storage Save-Path Validation + Transactional Writes [P0 Immediate, Effort: M]

**Goal:** the permissive write path (`save*`) must enforce the same rules as the strict import path (`validateBackup`). Writes must be atomic.

### 18.1 Validate on write, not just on import

- **Problem:** `src/services/storage.js:262-271` `saveTransaction` only normalizes (`Number(amount)||0`, default date). Bypass via console: `saveTransaction({type:'expense', amount:-999})` corrupts balances (`deltaForAccount` → `-amount` flips sign). Same for `saveAccount/saveInvestment` (huge strings → quota DoS, stored `<script>`).
- **Evidence:** `validateTransaction` (strict mode checks ISO date, transfer `toAccountId`) is only called from `validateBackup:232`, never from `save*`.
- **Fix:**
  - [ ] Extract `assertValidTransaction(tx)`, `assertValidAccount`, etc. from existing validators. Call at top of every `save*/update*`. Throw `code: 'VALIDATION_ERROR'` with `details`.
  - [ ] Enforce: `type ∈ TRANSACTION_TYPES`, `amount >0 && ≤ MAX_AMOUNT (1e8, shared with `TransactionModal.jsx:21`)`, `date` ISO, `transfer` requires `toAccountId ≠ accountId` + both accounts exist, `merchant/description ≤80`, `notes ≤500`, `category` required for non-transfer.
  - [ ] UI: `TransactionsPage.jsx:125-136`, `AccountsPage.jsx:75-82`, `InvestmentsPage.jsx:60-67` already try/catch — surface `err.message` via toast/alert instead of silent `refresh()`.
- **Acceptance:** new tests: negative amount throws, bad type throws, transfer without destination throws, 600-char notes throws, oversized amount throws. Manual console injection fails.
- **Files:** `src/services/storage.js:161-212,249-308`, `src/components/transactions/TransactionModal.jsx:60-93`, pages above.

### 18.2 Make transaction→balance writes atomic

- **Problem:** `saveTransaction:265-268` writes `TRANSACTIONS` then mutates `ACCOUNTS`. If second `setItem` throws quota, ledger diverges (tx exists, balance stale). Same in `updateTransaction:304-305`, `deleteTransaction:314-318`.
- **Fix:**
  - [ ] Build both arrays in memory first (`nextTxs`, `nextAccounts` pure functions), then `setItem` both inside single try. On failure, write neither (or restore snapshot). Return typed `STORAGE_QUOTA_EXCEEDED` already defined at `storage.js:89-95`.
  - [ ] Add test: mock `localStorage.setItem` to throw on second call → assert transactions unchanged.
- **Acceptance:** quota-failure test passes; no partial-write state observable.
- **Files:** `src/services/storage.js:262-322,353-433`

### 18.3 Sanitize + cap free-text fields

- **Problem:** `merchant/notes` stored verbatim, unbounded at service layer. React escapes today, but JSON export reuse + future `innerHTML` = stored XSS vector. Large strings accelerate quota exhaustion.
- **Fix:**
  - [ ] `normalizeTransaction`: `trim()`, collapse whitespace, cap `merchant ≤80`, `notes ≤500`, strip control chars (`[\u0000-\u001F]`). Same for account `name ≤60`, investment `name ≤120`.
  - [ ] Document that rendering must never use `dangerouslySetInnerHTML` for user fields (add ESLint `react/no-danger` rule in Phase 24).
- **Acceptance:** unit test with `<img src=x onerror=alert(1)>` merchant → stored as plain text, rendered escaped; 10KB notes rejected/truncated.
- **Files:** `src/services/storage.js:253-260`

---

## Phase 19 — Security Headers, CSP, XSS & Export Safety [P0 Immediate, Effort: S–M]

**Goal:** contain the blast radius of the unavoidable `localStorage`-plaintext reality (Phase 25 encrypts; this phase contains).

### 19.1 Add Content-Security-Policy + harden headers

- **Problem:** `vercel.json:3-15` has `nosniff/DENY/referrer` but no `Content-Security-Policy`, no `Permissions-Policy`. Any compromised npm dep gets full `localStorage` + `exportAllData()` access.
- **Fix:**
  - [ ] Add in `vercel.json` (and document for Netlify/CF equivalents):
    ```
    Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
    Permissions-Policy: camera=(), microphone=(), geolocation=()
    Strict-Transport-Security: max-age=31536000; includeSubDomains
    ```
  - [ ] Verify Google Fonts still loads; plan self-host in Phase 25 to tighten `style-src/font-src` to `'self'`.
- **Acceptance:** `curl -I` on preview deploy shows CSP + HSTS; app renders with no CSP console violations; `frame-ancestors` replaces `X-Frame-Options` (keep both for legacy).
- **Files:** `vercel.json`, `index.html`

### 19.2 Export hygiene + import size limits

- **Problem:** `exportAllData:705-718` dumps everything (PII + folio numbers + balances) as plaintext JSON with no warning. `importData:745-775` parses unbounded JSON (DoS via 100MB file) and double-fires `notifyDataUpdated + notifySettingsUpdated` (double render).
- **Fix:**
  - [ ] Settings export dialog: checkbox “Include full backup (default on)” + warning “Contains balances, names, email. Store securely, never email unencrypted.” Filename already dated — keep.
  - [ ] `importData`: reject `jsonString.length > 10MB` early (`code: 'BACKUP_TOO_LARGE'`), cap array lengths (e.g. transactions ≤50k), single notify at end.
  - [ ] `downloadBackup:721-734` — revoke object URL in `finally`, null `link` ref.
- **Acceptance:** 20MB import rejected with friendly error; single render on import (spy on subscriber count); export dialog copy reviewed.
- **Files:** `src/services/storage.js:705-775`, `src/pages/SettingsPage.jsx:37-69`

### 19.3 PII minimization in seed + docs

- **Problem:** `mockData.js:124,184` stores `foliNo: '1928471/02'`, `uam: '100982374102'`-like identifiers; `INITIAL_SETTINGS:295-304` ships real-looking `aritra.das@example.com`. Ships to every clone + export.
- **Fix:**
  - [ ] Replace with obviously fake values (`FOLIO-XXXXXX`, `user@example.com`) or remove fields. Masked `•••• 4821` pattern is fine — extend to all identifiers.
  - [ ] Add `docs/data-models.md` note: “Never store real folio/PAN/UPI IDs in demo seed or backups shared publicly.”
- **Acceptance:** grep `1928471|100982374102|aritra.das@` → 0 hits in `src/`.
- **Files:** `src/data/mockData.js`, `docs/data-models.md`

---

## Phase 20 — Accessibility Blockers [P0 Immediate, Effort: S–M]

**Goal:** unblock keyboard + screen-reader users. Design system is strong; these are discrete bugs.

### 20.1 Keyboard-accessible table sorting

- **Problem:** `src/components/transactions/TransactionTable.jsx:64-72,76-85` — `th onClick` with no keyboard support, no `aria-sort`. Violates WCAG 2.1.1 + 4.1.2.
- **Fix:**
  - [ ] Replace with `<th aria-sort="ascending|descending|none"><button class="..." onClick ... aria-label="Sort by date">Date <SortIcon/></button></th>`. Same for Amount. Ensure `:focus-visible` ring visible (already in `index.css:67-69`).
  - [ ] Add test: `fireEvent.click` + `fireEvent.keyDown Enter` both toggle direction.
- **Acceptance:** Tab reaches sort buttons, Enter/Space sorts, SR announces sort direction.
- **Files:** `src/components/transactions/TransactionTable.jsx`

### 20.2 Valid table markup (remove `div` inside `tr`)

- **Problem:** `src/components/transactions/TransactionRow.jsx:29-39` renders `<tr><div>…</div><td>…` — invalid HTML, breaks SR table navigation (WCAG 1.3.1).
- **Fix:**
  - [ ] Option A (preferred): keep `<table>` for `md+`, render separate mobile card list (`<ul><li>`) below `md` via `hidden md:table` / `md:hidden` split. Option B: single responsive `<div role="table">` grid. Do not mix.
- **Acceptance:** `axe-core` (Phase 24) reports 0 table violations; VoiceOver rotor lists correct rows/columns.
- **Files:** `src/components/transactions/TransactionRow.jsx`, `TransactionTable.jsx`

### 20.3 Contrast to WCAG AA + non-color cues

- **Problem:** `text-tertiary #A1A1AA` on `ivory #FDFBF7` ≈2.2:1; `brand-amber #D97706` on white ≈3.5:1; chart `lime/sky` on white low. Body text requires 4.5:1 (WCAG 1.4.3).
- **Fix:**
  - [ ] Tokens: tertiary → `#6B7280` (light) / `#9CA3AF` (dark); amber body text → `#92400E` (light) / `#FBBF24` (dark). Keep decorative large headings as-is if ≥3:1.
  - [ ] Charts: add direct labels + `%` text (already in legend) + patterns (dashed vs solid) for income/expenses; never color-alone for status (`BudgetProgress` add icon + text “80% — warning”).
  - [ ] Verify with Lighthouse a11y + manual contrast checker; record ratios in PR.
- **Acceptance:** Lighthouse a11y ≥95; spot-check 5 text pairs ≥4.5:1; colorblind simulator (achromatopsia) still distinguishes income/expenses.
- **Files:** `tailwind.config.js:66-75`, `src/index.css:10-51`, chart components, `BudgetCard/Progress`.

### 20.4 Screen-reader noise + focus management

- **Problem:** `HeroSection.jsx:44,66-67` animates `useCountUp` every rAF (~70 renders) — SRs may announce each intermediate value. No route-change focus management (only `ScrollToTop`).
- **Fix:**
  - [ ] Hero: `<h1 aria-label={formatMoney(netWorth)}><span aria-hidden="true">{formatMoney(animatedNetWorth)}</span></h1>`. Same for any count-up.
  - [ ] `AppLayout.jsx:48-54`: on `location.pathname` change, move focus to `<main id="main-content" tabIndex={-1}>` (with `preventScroll` + existing scroll-to-top) and announce page via visually-hidden `aria-live="polite"` route title.
  - [ ] `GlobalSearch.jsx:279-303` kbd hints: `aria-hidden="true"` (decorative) + `sr-only` text alternative.
- **Acceptance:** SR hears final net worth once; Tab starts at top on navigation; kbd hints not verbose.
- **Files:** `HeroSection.jsx`, `AppLayout.jsx`, `GlobalSearch.jsx`, `useCountUp.js`

---

## Phase 21 — Architecture Refactor [P1 Short-term, Effort: M–L]

**Goal:** keep the excellent pub/sub idea, remove the god-module + coarse invalidation that will not scale past ~5MB / 10k txns.

### 21.1 Split `services/storage.js` (831 lines)

- **Problem:** one file mixes low-level IO, validation, balance engine, backup, migrations, events.
- **Fix:**
  - [ ] Split (no behavior change, pure moves + re-exports for compat):
    ```
    src/services/
      storageKeys.js      # KEYS, SCHEMA_VERSION, events
      storageIo.js        # getItem/setItem, quota mapping, initStorage, migrations
      validators.js       # isValidISODate, validate* , validateBackup
      ledger.js           # deltaForAccount, apply/revert, CRUD for tx/acct/budget/investment
      backup.js           # export/import/download/preImport/reset/erase
      storage.js          # barrel re-export (remove after callers migrate)
    ```
  - [ ] Add `README` header per file with ownership. Update imports codemod-style.
- **Acceptance:** `storage.js` barrel <50 lines or deleted; `npm test` green; no circular imports (`madge --circular` clean if added).
- **Files:** `src/services/*`

### 21.2 Fine-grained reactivity (stop full-tree re-renders)

- **Problem:** `DataContext.jsx:14-23` `readAll()` JSON-parses 6 keys on every save; new array identities invalidate every consumer (`Dashboard + Transactions + Navbar` all re-render on a single note edit).
- **Fix:**
  - [ ] Phase 21a (minimal): memoize per-slice + `useTransactions()`, `useAccounts()`, etc. selectors that subscribe once but return stable slices (`useMemo` per key). Document pattern.
  - [ ] Phase 21b (if profiler justifies): migrate to Zustand/Jotai with per-slice atoms + `subscribeWithSelector`; keep `ledger_data_updated` event as external trigger. Measure with React DevTools Profiler before/after (record commit counts).
- **Acceptance:** editing a budget no longer re-renders `TransactionTable` (profiler proof in PR); cross-tab sync still works (manual two-tab test).
- **Files:** `src/contexts/DataContext.jsx`, pages/components consuming `useData`

### 21.3 Remove import side-effect + fix provider order

- **Problem:** `storage.js:149-151` runs `initStorage()` on import — test pollution, SSR risk. `main.jsx:14-18` nests `DataProvider > ThemeProvider` but `ThemeProvider` reads settings via storage directly, not context — order works by accident.
- **Fix:**
  - [ ] Remove top-level `initStorage()`; call explicitly once in `main.jsx` before `createRoot`. Update `__tests__/setup.js` to call `eraseAllData()` deterministically.
  - [ ] Document provider contract: `DataProvider` owns data, `ThemeProvider` owns theme; theme reads via `getSettings()` subscription (already does `ledger_settings_updated:86`) — keep, but add comment.
- **Acceptance:** importing storage in a test does not seed; `main.jsx` init order explicit + commented.
- **Files:** `src/services/storage.js`, `src/main.jsx`, `src/__tests__/setup.js`

---

## Phase 22 — Money Math: Integer Paise, Invariants, IRR/CAGR [P1 Short-term, Effort: M]

**Goal:** make arithmetic audit-proof. Today everything is binary float with display-only rounding.

### 22.1 Integer-paise core (or `decimal.js` — pick one)

- **Problem:** `calculations.js` accumulates `Number` (`0.1+0.2=0.30000000000000004`), `calcNetWorthHistory:331` `Math.round(running)` loses paise, `formatMoney` default 0 fraction digits hides paise.
- **Fix (recommended: integer paise):**
  - [ ] Store `amount` as integer paise internally (migrate: `Math.round(amount*100)` once, bump `SCHEMA_VERSION 2→3` with migration in `storageIo.js`). All `calc*` sum integers; format divides by 100 with `minimumFractionDigits:2` for ledger views, `0` only for compact hero (explicit).
  - [ ] Alternative: keep floats but add `round2()` after every reduce + `decimal.js` for investment math. Record decision in `docs/data-models.md`.
- **Acceptance:** new tests: `0.1+0.2` sums to `0.30`, 10k × ₹19.99 reconciles to paise, `formatMoney(1234.5,{maximumFractionDigits:2})` → `₹1,234.50`.
- **Files:** `src/utils/calculations.js`, `formatCurrency.js`, `storage.js` migration, `calculations.test.js`, `formatCurrency.test.js`

### 22.2 Investment invariants + price snapshots schema

- **Problem:** `saveInvestment:591-611` derives `investedValue/currentValue` but `calcInvestmentReturn:222-227` falls back to recompute — drift undetected. No history → Phase 17 fake chart.
- **Fix:**
  - [ ] Always recompute `investedValue = round2(units*avgPrice)` on save (source of truth = `units,avgPrice,currentPrice`); drop stored derived fields or assert equality in validator.
  - [ ] Add `investmentSnapshots: [{investmentId, date, price}]` key + `savePriceSnapshot()`; `PortfolioValueChart` reads snapshots, empty-states otherwise. Bump schema.
- **Acceptance:** editing `units` auto-fixes derived values; snapshot test renders real trend with 3 points.
- **Files:** `src/services/storage.js:585-645`, `constants/finance.js:57-68`, new snapshot utils

### 22.3 Real return metrics (CAGR/XIRR) + multi-currency note

- **Problem:** only simple `returnPercentage`. No time-weighted return. Currency switch (`SettingsPage.jsx:174-180`) relabels `₹→$` without FX conversion — ₹1,42,500 becomes $142,500.
- **Fix:**
  - [ ] Add `calcCAGR(start,end,years)` + `calcXIRR(cashflows)` pure functions with tests (leap-year `actual/365` day count, empty/zero guards). Surface in `PortfolioSummary` with methodology tooltip.
  - [ ] Currency: either (a) rename “Currency Display” → “Symbol” with warning “Amounts not converted — FX in Phase 26”, or (b) implement cached FX (Phase 26). Do (a) now.
- **Acceptance:** CAGR/XIRR tests incl. zero/negative/empty; settings hint text updated.
- **Files:** `src/utils/calculations.js`, `PortfolioSummary.jsx`, `SettingsPage.jsx`

---

## Phase 23 — Performance: Lazy Charts, Virtualization, Budgets [P1 Short-term, Effort: M]

**Goal:** stop shipping 422KB of charts on first paint; set enforceable budgets.

### 23.1 Lazy-load Recharts per chart

- **Problem:** Dashboard eager-imports `NetWorthChart + CashFlowChart` → `charts-stmYCmoI.js 422KB raw` on `/` (verified `npm run build`). Defeats `App.jsx:9-15` route splitting.
- **Fix:**
  - [ ] `React.lazy` each chart (`NetWorthChart`, `CashFlowChart`, `SpendingBreakdown`, `AllocationChart`, analytics charts) with skeleton fallback (`PageFallback`-style shimmer, `role=status`). Preload on `requestIdleCallback` after hero paints or on hover of nav link.
  - [ ] Consider `recharts` → `lightweight-charts`/`uPlot` spike for net-worth line (record decision; no rewrite required now).
- **Acceptance:** Lighthouse `Total Blocking Time` improves; `dist` shows `chart-*` chunks <50KB each initial; `/` initial JS (index+vendor) <250KB gzip; no layout shift (fixed `h-[280px]` containers already — keep).
- **Files:** `src/pages/DashboardPage.jsx`, `AnalyticsPage.jsx`, `InvestmentsPage.jsx`, chart components, `vite.config.js`

### 23.2 Virtualize large ledgers + index search

- **Problem:** `TransactionTable` renders up to 15/page (good) but `GlobalSearch.jsx:30-65` scans all txns + `accounts.find` per txn (O(n*m)) on every debounced keystroke; 10k-txn ledger will jank. `readAll()` sync parse blocks main thread.
- **Fix:**
  - [ ] Build `Map<accountId, account>` once per search memo; cap `txMatches` at 6 already — keep. Add `useDeferredValue` for query.
  - [ ] Beyond 1k rows: add `@tanstack/react-virtual` for table + `year-month` index (`Map<monthKey, tx[]>`) in `calculations.js` to avoid full scans for `calcMonthly*`.
  - [ ] Long-term: move to IndexedDB + worker parse (Phase 25).
- **Acceptance:** 10k-row synthetic benchmark (script) scrolls ≥50fps, search <100ms p95 on M1.
- **Files:** `GlobalSearch.jsx`, `TransactionTable.jsx`, `calculations.js`

### 23.3 Bundle budgets + font/perf hygiene in CI

- **Problem:** `vite.config.js:14` `chunkSizeWarningLimit:600` never fails CI; Google Fonts render-blocking; `useCountUp` 60fps `setState` for 1.2s per hero mount.
- **Fix:**
  - [ ] Add `rollup-plugin-visualizer` (report only) + CI check: fail if `charts` gzip >150KB or initial route >300KB gzip. Document in `docs/techstack.md`.
  - [ ] Fonts: `display=swap` already — add `preload` + self-host spike (links to Phase 25). `useCountUp`: skip animation if `end===0` or `prefers-reduced-motion`, throttle to 30fps via `Math.round` + `requestAnimationFrame` batching already adequate — just add early-return.
- **Acceptance:** CI budget check script `npm run bundlesize` green; Lighthouse Performance ≥90 on desktop.
- **Files:** `vite.config.js`, `index.html`, `useCountUp.js`, `.github/workflows/ci.yml`

---

## Phase 24 — Test & Quality Gates [P1 Short-term, Effort: M–L]

**Goal:** go from “pure functions tested” to “refactor-safe”. Today 45 unit tests, 0 component/integration/E2E.

### 24.1 Component + integration tests (RTL)

- **Gap:** no render tests for `TransactionModal` validation, `DataContext` reactivity, `Modal` trap, `GlobalSearch` keyboard, import-corrupt flow, quota path.
- **Fix — add (minimum 15 new tests):**
  - [ ] `TransactionModal.test.jsx`: empty amount → error, `transfer` same-account → error, 81-char description → error, future date warning renders.
  - [ ] `DataContext.test.jsx`: `saveTransaction` → subscriber re-renders dashboard metric (integration with `storage` mock).
  - [ ] `Modal.test.jsx`: Escape closes, Tab wraps, focus restores to trigger.
  - [ ] `GlobalSearch.test.jsx`: ArrowDown/Enter navigates to `/transactions?search=`, Esc closes.
  - [ ] `storage.guards.test.js`: quota double-write atomicity (mock `setItem` throw), import 20MB rejected, negative-amount save throws (Phase 18).
- **Acceptance:** `npm test -- --coverage` ≥80% lines on `utils/` + `services/`; new tests fail before fix, pass after (record in PR).
- **Files:** new `src/**/*.test.jsx`, `src/__tests__/setup.js`

### 24.2 Lint, types, coverage enforcement

- **Problem:** `eslint.config.js:31-39` only `no-console/no-unused-vars/eqeqeq`. No `react-hooks`, `jsx-a11y`, `import`, `no-danger`. No types (`jsconfig.json` exists but no `tsc --check`).
- **Fix:**
  - [ ] Add `eslint-plugin-react-hooks` (rules-of-hooks/exhaustive-deps error), `eslint-plugin-jsx-a11y` (recommended), `eslint-plugin-import` (no-cycle, no-duplicates). Fix resulting warnings (expect `exhaustive-deps` hits in `TransactionsPage:39-40` `filters` dep, `AnalyticsPage`).
  - [ ] Options: (a) `tsc --allowJs --checkJs --noEmit` on `npm run typecheck` + JSDoc types for `calculations/storage`, or (b) migrate to TS incrementally (`allowJs` first). Do (a) now.
  - [ ] CI: `npm run lint && npm run typecheck && npm test -- --coverage --coverage.thresholds` + `npm run build` + `bundlesize`. Add `npm audit --audit-level=high` (allowlist documented).
- **Acceptance:** CI fails on missing hook dep, a11y violation, or coverage <80%; `npm run typecheck` green.
- **Files:** `eslint.config.js`, `jsconfig.json`, `package.json` scripts, `.github/workflows/ci.yml`

### 24.3 Fix docs drift + badges

- **Problem:** `README.md:8` badge “45 Passed” hardcodes count; `docs/architecture.md:125` says “Code-split” for Dashboard (actually eager — `App.jsx:5` imports directly). `docs/roadmap.md:15-20` post-hardening scores (8.5–9.0) conflict with this audit’s 6.7.
- **Fix:**
  - [ ] Badge → dynamic (`vitest --reporter=json` → shields endpoint) or remove count (“Tests passing”). Fix architecture table: Dashboard = eager, rest lazy. Add footnote reconciling internal scorecard vs external audit methodology.
- **Acceptance:** docs match code; no hardcoded test counts.
- **Files:** `README.md`, `docs/architecture.md`, `docs/roadmap.md`

---

## Phase 25 — Privacy Hardening [P2 Long-term, Effort: L]

**Goal:** make local-first actually private under XSS/theft assumptions.

- [ ] **25.1 Encrypted vault (opt-in):** WebCrypto AES-GCM, key = PBKDF2(passphrase, salt) never stored; `storageIo` encrypts values before `setItem`. Modes: `plaintext (default, warn)` vs `encrypted`. Migration + “forgot passphrase → reset (data loss)” flow. Threat-model doc.
- [ ] **25.2 Self-host fonts + telemetry audit:** vendor Inter/Playfair via `@fontsource`, remove Google Fonts links, tighten CSP to `'self'` only. `npm run audit:privacy` greps `googleapis|gstatic|analytics|telemetry`.
- [ ] **25.3 IndexedDB migration:** `idb-keyval` adapter behind storage interface; worker-based parse; quota UI with per-store usage. Keep `localStorage` adapter for tests.
- [ ] **25.4 Secure backup:** optional password-encrypted `.folio.json.enc` export (same AES-GCM), plaintext export requires explicit “I understand” checkbox + red warning.
- **Acceptance:** encrypted mode: `localStorage` values are opaque base64; wrong passphrase fails closed; Lighthouse “no third-party requests” green.
- **Files:** new `src/services/vault.js`, `storageIo.js`, `SettingsPage.jsx`, `vercel.json`, `index.html`

---

## Phase 26 — Strategic Features (v1.1+) [P2 Long-term, Effort: L–XL]

> Already in `docs/roadmap.md:52-71` — expanded here with integrity constraints from this audit. Do not start until P0 green.

- [ ] **26.1 CSV bank import (HDFC/ICICI/SBI/Chase):** client-side PapaParse, column mapper, dedupe hash (`date|amount|merchant`), preview + dry-run before commit. Must reuse Phase 18 validators + atomic writes. *Effort: L*
- [ ] **26.2 Recurring engine:** `recurring: [{rule: 'RRULE:FREQ=MONTHLY', nextRun}]` + projected calendar; scheduled txns excluded from current-month totals until posted (fix `TransactionModal.jsx:188-192` “scheduled not tracked” gap). *Effort: M*
- [ ] **26.3 Real FX conversion:** cached ECB/RBI rates + `convertedAmount` per txn currency; settings label honest until shipped (Phase 22.3). Never relabel without converting. *Effort: M*
- [ ] **26.4 PWA offline:** service worker (Workbox), manifest, installable icons, offline fallback route. *Effort: M*
- [ ] **26.5 E2E-encrypted sync adapters:** WebDAV / Supabase self-hosted, E2E-encrypted blobs (Phase 25 vault reuse), conflict resolution (last-write-wins + manual merge UI). *Effort: XL*
- [ ] **26.6 Scale:** `@tanstack/react-virtual` tables, chart downsampling, IndexedDB pagination. Target 50k txns. *Effort: M*

---

## Appendix A — Quick Verification Commands

```bash
npm run lint          # expect 0 warnings (after Phase 24: + hooks/a11y)
npm test -- --run     # 45 baseline; grows each phase
npm run build         # inspect dist/assets/* sizes
npx vitest run --coverage
npx eslint src --ext .js,.jsx
# Manual: two-tab cross-tab edit, light/dark/system theme, 360px mobile drawer, keyboard-only sort + modal, VoiceOver rotor on tables
grep -rn "0.0047\|baseGrowth\|Math.sin(idx" src/   # Phase 17 → 0 hits
grep -rn "dangerouslySetInnerHTML\|innerHTML" src/ # must stay 0 hits
grep -rn "1928471\|100982374102" src/              # Phase 19 → 0 hits
```

## Appendix B — File Index (most-touched)

```
src/services/storage.js          # Phases 18, 21, 22, 25
src/utils/calculations.js        # Phases 17, 22, 23
src/utils/formatCurrency.js      # Phase 22
src/components/investments/PortfolioValueChart.jsx  # Phase 17
src/pages/InvestmentsPage.jsx    # Phases 17, 22
src/components/transactions/TransactionTable.jsx / TransactionRow.jsx  # Phases 20, 23
src/components/transactions/TransactionModal.jsx   # Phases 18, 24
src/components/dashboard/HeroSection.jsx           # Phase 20
src/components/layout/AppLayout.jsx / GlobalSearch.jsx / Modal.jsx / MobileNav.jsx  # Phases 20, 24
vercel.json / index.html         # Phases 19, 23, 25
eslint.config.js / package.json / .github/workflows/ci.yml  # Phase 24
src/data/mockData.js             # Phases 17, 19
```

## Appendix C — Out of Scope / Non-Goals

* No backend user accounts, no server-side PII, no ad/telemetry SDKs — local-first privacy is a feature, not a limitation.
* No day-trading / tax-advice claims. CAGR/XIRR must ship with methodology footnotes.
* No rewrite to Next.js / TS monorepo in this plan — incremental hardening first.
