# Ledger — Critical Evaluation & Improvements Roadmap

> **Review date:** 2026-09-08
> **Reviewer role:** Professional developer / code auditor
> **Scope:** `src/`, docs (`README.md`, `architecture.md`, `techstack.md`, `todo.md`), build, UX, ops
> **Build verified:** `npm run build` passes — `dist/assets/index-*.js 778.79 kB (209.24 kB gzip)` with chunk-size warning

---

## 1. Verdict — Score: **7.0 / 10**

A strong, shippable v1 for a portfolio / FSD project. Feature-complete, coherent design system, good docs. **Not a 10** because engineering rigor is missing: zero tests, zero lint/CI, a broken reactivity model, data-integrity bugs, and no production hardening (errors, 404, code-splitting, validation, migrations).

### Scoring rubric

| Category | Weight | Score /10 | Notes |
|---|---|---|---|
| Feature completeness | 20% | **9** | 7 routes, CRUD everywhere, charts, budgets, investments, search, dark mode, export/import all work |
| UI / UX / Visual design | 15% | **8** | Editorial + wealth-management aesthetic is consistent; tokens, typography, responsive, micro-interactions |
| Code architecture | 15% | **6** | Good folder split + storage abstraction, but inconsistent data-fetching, no global store, doc/code drift |
| Correctness / Data integrity | 15% | **5** | `transfer` ignored, balance clamp bug, `updateTransaction` ordering bug, orphaned transactions, static net-worth history |
| Testing & quality gates | 10% | **0** | No tests, no ESLint/Prettier, no CI, `build` is the only gate |
| Performance | 10% | **6** | 778 kB single chunk, no lazy routes, Recharts loaded everywhere, no virtualization |
| Accessibility | 5% | **6** | Semantic HTML + focus styles + modal Escape, but no skip-link, incomplete focus trap, charts have no text alternative, no `prefers-reduced-motion` |
| Ops / Docs / Release | 10% | **5** | Good `architecture.md`/`techstack.md`, thin `README.md`, no LICENSE, no CHANGELOG, no `.nvmrc`, no preview/deploy checks |

**Weighted total ≈ 7.0.** Path to 10/10 is well-defined and listed below in priority order.

### What is already excellent — do not regress

1. **Design system discipline:** Tailwind tokens (`ivory`, `brand`, `chart`, `text`), `.display-xl/.heading-lg/.label/.mono`, dark-mode CSS variables, card/backdrop patterns.
2. **Storage abstraction:** `services/storage.js` isolates `localStorage`. Right idea for future Supabase/Firebase swap.
3. **Derived-not-stored calculations:** `utils/calculations.js` is the single source of truth. Good.
4. **Documentation culture:** `architecture.md` with diagrams + data models + migration path is rare and valuable.
5. **Responsive + dark-mode coverage:** Mobile drawer modals, stacked cards, `ThemeProvider` with system respect.

---

## 2. P0 — Must fix to be production-grade (blocks 8.5+)

### P0-1. Fix reactive data layer — currently broken on Dashboard

**Problem:**
`DashboardPage.jsx:41-44` calls `getTransactions()/getAccounts()/...` directly in render body. Every render re-reads `localStorage`. The `useMemo(..., [transactions, ...])` on line 82 is useless because `transactions` is a **new array every render**, so all calculations re-run anyway. More importantly, UI does not react to changes without a full remount/reload. `TransactionsPage.jsx` does it correctly (`useState` + `useEffect` + refetch after save), so the codebase is inconsistent. `architecture.md §4.3` promises optional `DataContext` — it does not exist.

Cross-tab edits, search-driven edits, and settings changes leave Dashboard stale.

**Fix (choose one):**
- **Recommended (small):** Create `src/contexts/DataContext.jsx` with `useState` + `useEffect` + `storage` event listener + `refresh()` after every mutation. All pages consume it. Memoize derived values on stable state.
- Minimal alternative: lift the `TransactionsPage` pattern to every page (state + `refresh()` helper), plus `window.addEventListener('storage', refresh)`.

**Acceptance:**
- Add/edit/delete on any page updates Dashboard without reload.
- Open app in two tabs, edit in tab A, tab B updates (or at least shows stale-data notice).
- `useMemo` deps are stable references.

```jsx
// Example: contexts/DataContext.jsx (sketch)
const DataContext = createContext(null);
export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState(() => getTransactions());
  const [accounts, setAccounts] = useState(() => getAccounts());
  const refresh = useCallback(() => {
    setTransactions(getTransactions());
    setAccounts(getAccounts());
    // budgets, investments, settings, netWorthHistory
  }, []);
  useEffect(() => {
    window.addEventListener('storage', refresh);
    window.addEventListener('ledger_data_updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('ledger_data_updated', refresh);
    };
  }, [refresh]);
  const value = useMemo(() => ({ transactions, accounts, refresh }), [transactions, accounts, refresh]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
// After every save/update/delete: window.dispatchEvent(new Event('ledger_data_updated'));
```

---

### P0-2. Add testing + lint + CI — currently 0%

**Problem:**
- No `*.test.*`, no Vitest/Jest/Playwright config. `package.json` has only `dev/build/preview`.
- No ESLint, Prettier, Husky, or `.github/workflows`. Dead code / unused imports / `console.error` in prod cannot be caught.

**Fix:**
1. `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom eslint prettier eslint-config-prettier`
2. Add scripts:
   ```json
   {
     "test": "vitest run",
     "test:watch": "vitest",
     "lint": "eslint src --ext .js,.jsx",
     "format": "prettier --check src",
     "format:write": "prettier --write src"
   }
   ```
3. Start with pure-function tests (highest ROI, no mocking):
   - `calculations.js`: assets/liabilities/net-worth, savings-rate div-by-zero, category breakdown %, budget `warning/exceeded` thresholds, cash-flow shape.
   - `formatCurrency.js`: `en-IN` grouping (`₹1,42,500`), compact `L/Cr/K`, negative `−` sign, NaN guards.
   - `dateUtils.js`: `getLastNMonths` monthKeys, `toDate` invalid-input fallback.
   - `storage.js`: CRUD round-trip with mocked `localStorage`, import validation rejects bad JSON, `clearAllData` re-seeds.
4. Add 3–5 component tests: `TransactionModal` validation, `BudgetCard` over-budget state, `ConfirmDialog` confirm/cancel.
5. Add GitHub Action: `install → lint → test → build` on PR. Block merge on failure.

**Acceptance:** `npm run lint && npm test && npm run build` green in CI. Coverage ≥60% on `utils/` + `services/` to start.

---

### P0-3. Fix transaction/account integrity bugs

**a) `transfer` type is silently dropped.**
`storage.js:updateAccountBalanceForTx` handles `expense`/`income` only; `transfer` yields `delta = 0`. UI (`TransactionModal.jsx:90-113`) only offers Expense/Income, but `architecture.md §7` documents `transfer` and old data may contain it. `calculations.js` also ignores `transfer`.

Fix: decide — either fully support transfers (`fromAccountId`/`toAccountId`, debit one + credit other, exclude from income/expense totals) or remove `transfer` from docs/types/validation. Do not leave a documented type that is a no-op.

**b) Balance update ordering + clamping.**
```js
// storage.js:158-161
balance: Math.max(0, Number(acc.balance || 0) + delta)
```
`Math.max(0, ...)` hides overdrafts and corrupts credit-card semantics (credit balances *increase* on expense, but clamp prevents negative corrections). Also `updateTransaction` reverts then re-applies using two separate `getAccounts()` reads — race-prone and wrong if `accountId` changed.

Fix: remove clamp (allow negative, render overdraft explicitly), make balance update atomic (read accounts once, apply `-oldDelta + newDelta`, write once), add unit tests for: expense/income × savings/credit, edit changing account, delete reverting.

**c) Orphaned data.**
`deleteAccount` leaves `transactions.accountId` dangling. Filters then show empty account names.

Fix: block delete if transactions reference the account (show count + reassignment picker), or cascade-reassign to a chosen account. Same for budget category renames.

**d) `Date.now()` ID collisions.**
`tx-${Date.now()}` collides on rapid double-click/import. Use `crypto.randomUUID()` with `Date.now()` fallback.

**e) Doc/code drift.**
`architecture.md §6` documents `saveTransaction(tx)`, `updateTransaction(id, data)`, `deleteAccount(id)` etc. Implementation is `updateTransaction(updatedTx)`, missing `delete*` docs, plus undocumented `getNetWorthHistory/saveNetWorthHistory`. Sync docs or generate API docs from JSDoc.

---

### P0-4. Add error boundaries + 404 + router hardening

**Problem:** No `*` route, no `ErrorBoundary`. Any render throw (bad import JSON, corrupt `localStorage`, Recharts NaN) whitescreens the app. No `ScrollToTop` on navigation.

**Fix:**
- `src/components/layout/ErrorBoundary.jsx` (class component) wrapping `<Outlet />` + a top-level boundary in `main.jsx`.
- `src/pages/NotFoundPage.jsx` + `<Route path="*" element={<NotFoundPage />} />`.
- `ScrollToTop` on `pathname` change.
- Replace `console.error` in `storage.js` with a caller-visible result (`{ ok, error }` or thrown typed error) + user toast, not silent fallback to `INITIAL_*` (which can duplicate seed data on parse failure).

---

## 3. P1 — High value, required for 9/10

### P1-1. Split the 778 kB bundle

Vite warns: single `index-*.js 778 kB / 209 kB gzip`. All of Recharts + Router + date-fns loads on first paint, including Settings.

Fix:
- `React.lazy()` for `AnalyticsPage`, `InvestmentsPage`, `SettingsPage`, `BudgetsPage` + `<Suspense fallback={<PageSkeleton/>}>`.
- `vite.config.js → build.rollupOptions.output.manualChunks: { vendor: ['react','react-dom','react-router-dom'], charts: ['recharts'], dates: ['date-fns'] }`.
- Audit `lucide-react` imports (named imports are tree-shaken, but verify no `import *`).
- Target: initial JS `< 250 kB gzip`, Lighthouse Performance ≥90 on desktop.

### P1-2. Validate + version persistence layer

- `importData` only checks `Array.isArray`. Add schema validation (Zod or hand-rolled): required fields, `amount` finite, `date` ISO, `type` enum. Reject with field-level message, never partially overwrite.
- Add `version: 2` + migration function (`migrateV1toV2`). Store `ledger_schema_version`.
- Handle `QuotaExceededError` on `setItem` with user-facing “storage full — export & prune” flow.
- `exportAllData`: use `Blob` + `URL.createObjectURL` instead of `data:` URI (breaks on large datasets). Include `exportedAt`, `schemaVersion`.
- `clearAllData` currently wipes then re-seeds — surprising for “Clear”. Split into `ResetToDemo` vs `EraseEverything` (truly empty). Confirm dialog must state which.

### P1-3. Make currency / settings actually work

`SettingsPage` offers INR/USD/EUR but `formatINR` is hardcoded to `₹` + `en-IN`. `defaultAccount` dropdown hardcodes `acc-1..acc-5` labels that drift from real accounts.

Fix: central `formatMoney(amount, currency)` honoring `settings.currency` + `locale`; derive account options from `getAccounts()`; remove hardcoded merchant email (`aritra.das@example.com`) from seed or mark clearly as demo.

### P1-4. Net-worth history must be derived, not static

`INITIAL_NETWORTH_HISTORY` is a 13-point static seed that never updates when transactions/accounts change. Dashboard compares live `netWorth` against stale `prevNetWorth`.

Fix: compute history from `accounts` + monthly `income-expenses` deltas, or append a snapshot on mutation (`saveNetWorthSnapshot()` monthly). Remove synthetic `factor = 1 - ...*0.035` fallback in `calcNetWorthHistory` — it fabricates growth. Empty state is better than fake data.

### P1-5. Accessibility hardening

- Add skip-link (`Skip to content` → `#main`), one `<h1>` per page audit, landmark roles.
- Complete modal focus trap: trap `Tab`/`Shift+Tab` inside, restore focus (already done), lock scroll (done), set `aria-describedby` for forms.
- Charts: every Recharts chart gets `role="img"` + `aria-label` summary + adjacent visually-hidden data table or “View as table” toggle. Check contrast of `chart.*` palette in both themes (plum/rose/sky on ivory/charcoal often fails AA).
- Honor `prefers-reduced-motion`: disable `animate-fade-in`, count-up (`useCountUp.js`), chart animation when reduced.
- Keyboard: `Cmd+K` documented? Add visible hint + `Esc` closes search (verify). All icon-only buttons already have `aria-label` — audit for regressions.

### P1-6. Forms, validation, and double-submit

- `TransactionModal`: `amount` allows `e`, pastes, huge values; `date` allows future dates without warning; `description` trims but does not cap length; no duplicate-submit guard.
- Fix: `inputMode="decimal"`, `max` разумные limits, `maxLength` on text/notes, disable submit while saving, show inline + summary errors with `aria-describedby`, confirm on dirty-close.
- Normalize `merchant` vs `description` naming (modal maps `description → merchant`; table/row/search use both). Pick one canonical field.

---

## 4. P2 — Needed for a true 10/10 polish

1. **State consistency:** Replace ad-hoc `getX()` calls with selectors (`useTransactions(month)`, `useAccounts()`). Add `useMemo` correctly with stable deps. Remove unused `contexts/` mention or implement it.
2. **Table scale:** Verify `TransactionTable` pagination (page size, total count, URL-synced `?page&month&type`). Beyond ~500 rows add virtualization (`@tanstack/virtual`) or server-style windowing. Persist filter state in URL so back/forward + share works.
3. **Search scope:** `GlobalSearch` searches transactions only. Extend to accounts/budgets/holdings + actions (“Add transaction”, “Go to budgets”). Debounce input, highlight matches, show `↑↓ Enter Esc` hints.
4. **Budgets v2:** Month selector + rollover (“remaining rolls to next month”), per-budget notes, yearly view, overspend explanation (“₹2,340 over — 3 Swiggy orders”).
5. **Investments honesty:** `PortfolioValueChart` is “simulated 12-month growth” — label it as simulated or compute from `currentPrice` history. Support XIRR/CAGR, SIP tracking, and `stock|mutual_fund|gold|epf` type consistency (mock uses `equity/gold/fixed_income`, docs say `stock/mutual_fund/gold/other`).
6. **Analytics export:** CSV/PNG export per chart, date-range presets (3M/6M/YTD/All), comparison vs prior period.
7. **PWA + offline:** `vite-plugin-pwa` manifest + icons + offline fallback. Finance apps are opened on flaky networks.
8. **SEO/social:** `index.html` needs `og:*`, `twitter:*`, `theme-color` (light/dark), real `favicon.svg` (verify exists), `robots.txt`.
9. **Internationalization ready:** Extract strings, use `Intl` for dates/numbers with `settings.locale`. At minimum, do not hardcode `₹` in `TransactionModal` icon.
10. **Constants + aliases:** Central `src/constants/categories.js`, `accountTypes.js`, `chartColors.js`. Enforce `@/` alias everywhere (today `@/` and `../` are mixed).

---

## 5. P3 — Ops, docs, and release hygiene

| Gap | Fix |
|---|---|
| Thin `README.md` (no screenshots, demo, scripts) | Add hero screenshot/GIF, live Vercel link, `Node 18+` badge, full scripts table, testing section, roadmap link, license |
| No `LICENSE` | Add MIT (or chosen) `LICENSE` file; show version in Settings → About from `package.json`, not hardcoded `1.0.0` |
| No `.nvmrc` / `engines` | Add `.nvmrc` (`18` or `20`) + `package.json.engines`; document in README |
| No env handling | Add `.env.example` even if unused today (prepares Supabase keys); ensure `.env*` in `.gitignore` (already) |
| Font loading | Add `display=swap` (already via Google URL), `preload` critical fonts, self-host if privacy-conscious |
| Error observability | Add Sentry or at least `window.onerror` → persisted log + “Report issue” button; remove raw `console.*` from prod via ESLint `no-console` |
| Backup safety | Before `importData` overwrite, auto-download current state as `ledger_backup_pre_import_*.json` |
| Git hygiene | Conventional commits already good; add PR template + `CODEOWNERS` if collaborative |
| `vercel.json` | Only rewrite today — add `headers` (cache `assets/` immutable, `X-Content-Type-Options`, `Referrer-Policy`), `cleanUrls` if desired |
| `todo.md` all-checked | Move to `CHANGELOG.md`; keep `todo.md` for *future* work or delete to avoid “100% done but known bugs” confusion |

---

## 6. Suggested roadmap to 10/10 (2-week plan)

- [ ] **Days 1–2 (P0):** DataContext + reactivity fix; transfer decision; balance-clamp + atomic update fix; `crypto.randomUUID`; orphan guard.
- [ ] **Days 3–4 (P0):** Vitest + Testing Library + first 30 unit tests (`utils`/`services`); ESLint + Prettier + CI workflow.
- [ ] **Day 5 (P0):** ErrorBoundary + 404 + ScrollToTop + storage-error toasts.
- [ ] **Days 6–7 (P1):** Lazy routes + `manualChunks`; Blob export; Zod import validation + schema version + quota handling.
- [ ] **Days 8–9 (P1):** Currency-aware formatting; dynamic account options; derived net-worth history (remove fake fallback).
- [ ] **Day 10 (P1):** A11y pass: skip-link, full focus trap, chart tables, reduced-motion, contrast audit.
- [ ] **Days 11–12 (P2):** URL-synced filters + pagination audit; GlobalSearch v2; budget rollover; investment label honesty.
- [ ] **Days 13–14 (P3 + release):** README screenshots/demo, LICENSE, `.nvmrc`, PWA manifest, Sentry, CHANGELOG, Lighthouse ≥90 + re-score.

**Re-score targets:** 8.0 after P0, 9.0 after P1, 9.7+ after P2, 10 after P3 + sustained green CI + user validation.

---

## 7. File-by-file pointers (where to start)

- `src/pages/DashboardPage.jsx:41-44,82` — reactivity + broken memo
- `src/services/storage.js:75-164,187-208,360-398` — transfer, clamp, atomicity, IDs, import/export, clear semantics
- `src/utils/calculations.js:291-308,256-267` — synthetic history fallback, hardcoded `'2026-08'` default
- `src/components/transactions/TransactionModal.jsx:9-17,90-113` — transfer toggle missing, `description/merchant` duality, validation limits
- `src/pages/SettingsPage.jsx:33-46,157-169` — data-URI export, hardcoded accounts, currency no-op
- `src/App.jsx` — add lazy, `*` route, ErrorBoundary, ScrollToTop
- `src/components/layout/AppLayout.jsx` — search state + main `id` for skip-link
- `src/components/ui/Modal.jsx:43-65` — add Tab trap (currently Escape + initial focus only)
- `package.json`, `vite.config.js`, `index.html` — scripts, chunks, meta/PWA

---

*End of review. Current score **7.0/10** — excellent foundation, one focused hardening sprint away from 8.5+, two sprints from 10/10.*
