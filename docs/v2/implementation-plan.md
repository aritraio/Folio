# Folio V2 — implementation plan

Status: original design specification from 4 November 2026. Implementation now lives on V2; see README.md in this directory for delivered scope, setup and verification. No deployment has been performed. The later user request adds the data-focused assistant and Learn section to this original scope.

## 1. Product goal and boundaries

Help users understand where their money is, what they spend, what is due next, and how they are progressing toward goals. Extend the existing React/Vite app rather than replace its framework.

Recommended delivery: first deliver a reliable responsive local/demo version; then introduce an authenticated cloud version before processing real users' statements through a paid AI service. Keep a public demo with synthetic records and no signup.

V2 priorities:

1. Responsive light/dark UI and trustworthy calculations.
2. Accounts, credit-card billing, basic investments, goals and recurring commitments.
3. Reviewed CSV statement import.
4. Authentication, user-owned cloud storage and secure processing endpoints.
5. Supported PDF formats, AI-assisted categorization and explainable insights.

Excluded initially: bank connections, payment execution, trading, tax filing, personalized investment recommendations, live prices, multi-currency conversion, universal PDF support, and unrestricted financial chatbots. A later requirement adds a narrowly scoped assistant and Learn under More. Currency selection remains display-only until real conversion is designed; do not imply converted totals.

## 2. Preserve the assignment version

- Work only on V2 or feature branches created from V2; PR targets must be V2. Do not merge into main or change its deployment configuration.
- Use a separate V2 preview deployment and origin. Branches do not isolate browser localStorage.
- Give V2 local keys their own namespace and schema. Export existing records before migrations; migrate copies with validation. Current code uses schema version 4 despite older documentation referencing v2.
- Keep a synthetic demo dataset separate from personal/cloud records. Existing student profiles are demo profiles, not authenticated users.
- Before implementing, record the existing main commit and demo URL as references; creating tags or altering deployment settings is a later explicit operation.

## 3. Information architecture and routes

| Destination        | Desktop         | Mobile               | Proposed routes                           |
| ------------------ | --------------- | -------------------- | ----------------------------------------- |
| Overview           | Sidebar         | Home                 | /                                         |
| Activity           | Sidebar         | Activity             | /transactions                             |
| Accounts           | Sidebar         | Accounts             | /accounts, /accounts/:id                  |
| Plan               | Sidebar         | Plan                 | /plan with budget, goal and upcoming tabs |
| Investments        | Sidebar         | More                 | /investments                              |
| Insights           | Sidebar         | More                 | /analytics                                |
| Statement import   | Primary action  | Home/Activity action | /imports/new, /imports/:id                |
| Settings           | Sidebar footer  | More                 | /settings                                 |
| Sign in/onboarding | Signed-out flow | Signed-out flow      | /login, /auth/callback, /onboarding       |

Preserve redirects from /budgets to the budget tab. Put less frequent features under mobile More, not in six or seven bottom tabs.

## 4. Visual and interaction specification

Direction: quiet personal finance workspace; white surfaces in light mode, charcoal surfaces in dark mode, emerald primary action, clear typography and restrained borders. Use serif only for an optional editorial headline, not tables or form labels. Retain the Folio identity without the current terminal-style density.

| Token                  | Light   | Dark    |
| ---------------------- | ------- | ------- |
| Background             | #F5F7F6 | #101714 |
| Surface                | #FFFFFF | #18221D |
| Primary text           | #172D23 | #EDF5EF |
| Secondary text         | #52675B | #A6B9AD |
| Border                 | #DFE7E1 | #34473B |
| Primary action         | #226143 | #B9E6CA |
| Primary text on action | #FFFFFF | #122D1E |
| Positive               | #226143 | #95D9B0 |
| Warning                | #80591C | #E7C37D |
| Negative               | #A63C35 | #F3A59D |

Use semantic CSS tokens, not component-specific hardcoded colors. Validate contrast before freezing tokens. Body 14–16px, mobile inputs at least 16px, section headings 18–22px, main balances 30–38px. Tabular figures for amounts; consistent Indian currency grouping. Eight-point spacing foundation, 12–16px corners, visible keyboard focus, 44px touch targets, reduced-motion support.

Responsive behavior:

- 320–767px: single column, transaction rows/cards, bottom navigation, full-width forms and filter sheets. Essential actions never depend on hover.
- 768–1099px: compact sidebar or navigation rail; two-column panels only where they remain readable.
- 1100px+: persistent sidebar, constrained wide content, chart and detail panels, transaction tables.
- No horizontal page overflow at 320px. Avoid giant dashboard stacks: prioritize spendable money, spending and upcoming bills; show investment detail on its own screen.
- Theme supports light/dark/system and persists separately from financial data; no flash of the opposite theme.

Screen requirements:

1. Overview: bank+cash balance, month spending/income, selected period, cash-flow chart, category drill-down, upcoming payment, goal and recent activity. Net worth is distinct from spendable cash.
2. Accounts: bank/cash/card groups; account detail ledger and reconciliation; manual last-updated timestamps. Never imply live bank sync.
3. Credit card: total outstanding, statement balance, minimum due, due date, credit limit, linked repayments; distinguish due amount from unbilled spend.
4. Activity: search, date/account/type/category filters, editable records, clear transfer/refund labels, URL-persisted filters.
5. Plan: budget progress, goals and upcoming commitments. Funding a goal allocates existing money and does not create an asset.
6. Investments: manually entered stocks, mutual funds, FD and optional gold; invested/current value, unrealized gain/loss, valuation timestamp. Simple total-value mode for FD; units/price for market holdings.
7. Import: choose account, supported-format guidance, processing, row review, duplicate warnings, reconciliation, confirmation, history and undo.
8. Sign in: one managed sign-in method, demo action, concise privacy link, failure/retry states. Onboarding offers blank start or explicit local-data migration.
9. Settings: appearance, privacy, backup/export, delete data, signed-in sessions and sign out. Lock/hide amounts is privacy convenience, not a claim of encryption.

Every feature needs loading, empty, error, validation and success states. Import additionally needs unsupported, password-protected, scanned/OCR-required, duplicate, partial extraction, expired and retryable-job states.

## 5. Architecture and migration

Keep React, React Router, Tailwind, Recharts and the existing calculation layer initially. Refactor presentation independently of storage. Existing DataContext/storage APIs are synchronous; converting to remote calls requires explicit async state, not just replacing one function body.

Recommended cloud shape, subject to a provider capability/cost check at implementation time:

- Managed authentication and PostgreSQL with row-level authorization; a service such as Supabase is a candidate, not a requirement.
- A server/worker validates sessions, handles import jobs, calls the AI provider and exposes scoped APIs. No service-role credentials or AI keys in browser bundles.
- Private temporary object storage for statements; ownership-bound access and expiry.
- Durable import-job state and an asynchronous queue when processing exceeds a normal request. Provider chosen after representative PDF trials.
- Repository interface for accounts, transactions, goals, holdings and imports. Demo/local adapter and remote adapter have identical domain contracts.
- Queries expose loading/error/retry state; mutations confirm server results and roll back failed optimistic UI where used. Financial multi-row mutations are atomic on the server.
- Use integer minor units for money, decimal-safe units/prices, explicit currency, ISO date-only posting dates, UTC timestamps and the user's timezone for reminders.

## 6. Data model

| Entity               | Key fields and constraints                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User/profile         | Auth user ID, display name, base currency, timezone, preferences                                                                                            |
| Account              | Owner ID, type, name, institution, last four digits, currency, opening balance/date, archived flag                                                          |
| Transaction          | Owner, account, posting date, positive minor-unit amount, direction/type, category, merchant, original description, source, import row ID, transfer linkage |
| Transfer             | Owner, source/destination postings linked atomically; excluded from income/consumption                                                                      |
| Card terms           | Account ID, credit limit, cycle metadata; terms versioning if needed                                                                                        |
| Card statement       | Account, period, statement balance, minimum due, due date, payments and status                                                                              |
| Holding              | Owner, investment account, asset class/name, units/cost or total-value mode, current value and valuation date                                               |
| Goal/allocation      | Owner, target/date, linked account, allocation amounts; prevent over-allocation of available funds                                                          |
| Recurring commitment | Owner, account, name, amount, frequency, next due, reminder settings; planned versus posted status                                                          |
| Import job           | Owner, target account, status, source hash, parser version, counts, statement dates, expiry, reconciliation status                                          |
| Import row           | Job ID, extracted fields, suggested/final category, duplicate candidate, review status, source location                                                     |
| Categorization rule  | Owner, merchant/description match, category, precedence, enabled flag                                                                                       |
| Balance snapshot     | Account, as-of date, amount, origin, reconciliation metadata                                                                                                |

Add owner-scoped indexes and foreign keys. Verify child records belong to the same owner; row-level access alone must not allow cross-user foreign-key relationships. Keep category changes distinct from immutable source descriptions. Do not store full card numbers, CVVs, bank credentials or statement passwords.

## 7. Financial correctness rules

- Bank-to-cash movements and own-account transfers are not income or spending.
- Card purchases raise liability and spending. Card repayments reduce bank assets and liability without recording spending again. Refunds reverse the original treatment; handle overpayments as credit assets rather than always taking absolute liability.
- Investment purchases move money into holdings; they are not consumption. Separate dividends, fees, sale proceeds and realized gains when introduced.
- Include holdings in net worth once; do not also add an investment account balance representing those same holdings.
- Net worth = bank/cash + holdings + other tracked assets − liabilities. Spendable balance excludes holdings and credit limits; allocated goals are a separate deduction only in an explicitly labeled available-to-spend figure.
- Opening balance is dated. Historical imports must use an explicit balance strategy: either reconstruct from an opening anchor or add historical records before a reconciled current-balance snapshot without applying them again. Never silently mix the two.
- Historical valuation charts use actual snapshots; label estimates and avoid fabricated portfolio performance. Month comparisons use comparable complete periods or matched elapsed days.
- Recurring schedules create upcoming items. Do not post expenses or claim a bill paid until a real or user-confirmed transaction is linked. Partial/multiple card payments must work.

## 8. Statement import pipeline

CSV first; then a published list of a few tested text-based PDF formats. Reject unsupported scans in the initial PDF release instead of silently guessing. Add OCR later only if trials justify it.

1. Authenticate, authorize the account, enforce file/page/size limits, validate actual content and reject unsupported/encrypted files with actionable messages. Never log file bodies or passwords.
2. Explicit processing consent identifies external AI involvement and retention. Extract locally or server-side by deterministic parser where practical. Minimize sensitive content before AI submission; redaction reduces exposure but does not make transaction data anonymous.
3. Parse dates, descriptions, debit/credit amounts and running balances. Preserve source locations for review. Treat PDF text as untrusted data and prevent it from becoming instructions or executable content.
4. Validate numeric amounts, currency, date locale and totals. Use strict structured output if AI assists extraction. Schema compliance does not prove accuracy.
5. Apply user rules and known merchant mappings. AI suggests categories only for unresolved rows; give it no transaction-write tools. Route ambiguous suggestions to user review; do not present model confidence as calibrated probability.
6. Detect duplicate files and candidate duplicate transactions. Match account, date, normalized description, amount and references; identical purchases can be legitimate, so allow explicit override. Match transfer/repayment candidates without silently joining unrelated rows.
7. Review/edit category, type and account; exclude rows; resolve errors; compare statement totals and balances where available. Allow exceptions only with a clear recorded explanation.
8. Commit an atomic, idempotent batch using a unique job/row key. Repeated requests cannot create repeated transactions. Return explicit imported/skipped counts.
9. Recompute deterministic metrics. Retain import metadata; delete original statement after terminal processing or expiry according to policy. Include failure paths and scheduled cleanup, not just success deletion.
10. Undo by compensating/reversing the batch safely. If imported records were subsequently edited or linked, show conflicts and offer a reviewed reversal; preserve an audit trail.

Insights are calculations with links to evidence: category change, budget remaining, largest merchants, recurring charges, upcoming bills and savings progress. AI can phrase verified aggregates; it must not invent numbers or suggest investments.

## 9. Authentication, privacy and operational controls

- Demo is synthetic and requires no login. Cloud users use managed authentication; no custom password database.
- Enforce ownership in database policies and every processing endpoint. A hidden route is not authorization. Test user A cannot read/mutate user B's accounts, imports or files.
- Use an established session strategy suited to web and Capacitor. Prefer secure HttpOnly cookies for a browser backend; design CSRF and native redirect/deep-link handling explicitly. Avoid long-lived credentials in localStorage.
- HTTPS, restrictive content security policy, safe text rendering, upload validation, per-user rate limits, processing quotas, cancellation and cost ceilings.
- Private storage, restricted service credentials, minimal logs and secrets managed outside source control. Do not claim end-to-end encryption: server AI processing needs access to data.
- Export and delete flows cover DB records, storage, pending jobs and the stated backup-retention window. Sign-out clears app caches and personal data from shared-device views.
- Background callbacks and job completion must verify current owner/job state, including deletion or cancellation during processing.
- Reminders start as in-app upcoming items. Push/email notifications require explicit opt-in and must not disclose amounts on a lock screen by default.
- Local-to-cloud migration: show preview, require explicit choice, upload once with migration ID, verify counts/totals, retain local backup until confirmed and avoid automatically uploading demo profiles.

## 10. Implementation phases and acceptance gates

Effort ranges are estimates for one developer familiar with the app, not delivery promises. Total roughly 36–53 working days plus unknowns uncovered by PDF/provider trials; phases can be released separately.

| Phase                  | Estimate | Deliverables                                                                 | Acceptance gate                                                                               |
| ---------------------- | -------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A. Baseline/isolation  | 1–2 days | V2 preview/storage separation, backup fixtures, current calculation audit    | Main unchanged; independent demo data; reproducible baseline                                  |
| B. Design system/shell | 4–6 days | Tokens, light/dark/system, desktop/sidebar, mobile/nav, accessible forms     | 320/390/768/1024/1440px verified; keyboard navigation; no overflow                            |
| C. Money model         | 5–7 days | Dated balances, card semantics, holdings integration, migrations             | Transfer/refund/card/investment and reconciliation fixtures pass                              |
| D. Core screens        | 5–7 days | Overview, activity, accounts/card detail, investments, linked charts         | Filters consistent across figures; touch drill-down; honest timestamps                        |
| E. Planning            | 3–5 days | Budgets, goals/allocations, recurring commitments and upcoming list          | No duplicated assets; no automatic fake payments; edit/skip recurrence works                  |
| F. CSV import          | 4–6 days | Staging, field mapping, duplicates, reconciliation, atomic import/undo       | Repeat import idempotent; failures leave no partial changes                                   |
| G. Cloud/auth          | 6–8 days | Auth, repositories, ownership rules, migration, secure sessions/storage/jobs | Cross-user access denied; logout/deletion verified; demo remains isolated                     |
| H. PDF/AI pilot        | 5–8 days | Tested PDF formats, private processing, suggestions, review, quotas          | Exact amounts/dates on reference corpus; ambiguous rows flagged; cleanup and retries verified |
| I. Release QA          | 3–4 days | Responsive/accessibility/security regression, docs and rollout               | Required CI checks pass; preview approved; rollback/export verified                           |

Dependency order: A → B/C → D → E/F → G → H → I. CSV may ship locally; real-user cloud PDF processing waits for G. Do not add a temporary public AI proxy to skip authentication.

Release slices: first B–E as local/demo V2; next F for CSV; then G–H as authenticated cloud beta. Small releases keep the assignment version safe and expose calculation errors early.

## 11. Mapping to existing source

- src/index.css, ThemeProvider.jsx, ui/*: introduce tokens and shared form/accessibility patterns.
- layout/AppLayout.jsx, Navbar.jsx, SidebarDrawer.jsx: responsive shell and bottom navigation; retain command search and skip link.
- pages/DashboardPage.jsx and dashboard/*: actionable overview; date/account filters; distinct cash/net-worth figures.
- pages/AccountsPage.jsx and accounts/*: grouped accounts, new detail page, card-specific fields and statements.
- transactions/*: card repayment/refund/transfer types, responsive activity, import-source badges and query filters.
- investments/*: simpler FD form, valuation timestamps and shared net-worth source.
- BudgetsPage.jsx plus new Plan/Goals/Recurring components: planning workspace; preserve old route redirect.
- services/storage.js and contexts/DataContext.jsx: migration boundary and repository adapters; explicit asynchronous state for cloud operations.
- utils/calculations.js: single tested financial calculation model; no independently computed UI totals.
- Add imports feature module and server-side auth/processing modules; inspect deployment and Capacitor constraints before choosing hosting/queue products.

## 12. Validation and definition of done

Run existing lint, tests and production build throughout meaningful changes; add tests for domain risk rather than visual implementation details.

- Unit: card purchase/repayment/refund/overpayment; transfers; minor-unit arithmetic; holdings counted once; goal allocation; date boundaries; duplicate-candidate logic; statement reconciliation.
- Integration: import commit atomicity/idempotency, undo conflicts, migration/retry, concurrent edits and balance consistency, job cancellation/deletion.
- End-to-end: demo journey; authenticated onboarding; create account → add transaction → see chart; review import → fix category → import → undo; failed sign-in; export/delete/sign out; keyboard-only mobile and desktop navigation.
- Authorization: two real test users and direct API/storage calls, not just UI hiding. Verify owner validation on linked IDs.
- PDF corpus: synthetic or appropriately redacted samples from each supported bank/card layout; invalid dates, repeated rows, refunds, multiline descriptions, negatives, comma grouping, overlapping periods and missing pages. Document supported formats and exact-match failures. Never use personal professor/demo records as fixtures.
- Visual: both themes at target widths, enlarged text, contrast, charts with accessible summaries, focus trapping/restoration for dialogs, reduced motion and touch interaction.
- Operational: secrets absent from build, quota enforced, logs exclude financial content, statements cleaned after failures, provider outages produce retryable states and deletion removes pending work.

Done means reviewed V2 preview, passing required checks, documented limitations, honest data/privacy labels, and no main branch or assignment deployment change. Shipping to production is a separate action after reviewing the concrete implementation.

## 13. Mockup coverage and limits

The accompanying interactive concept covers overview, activity/category drill-down, accounts/cards, budgets/goals/upcoming, holdings, statement review, settings and sign-in. Light and dark appearance and compact mobile preview are selectable. It uses synthetic INR data and local presentation-only interactions. It performs no authentication, file parsing, AI calls, payments, data persistence or real financial operations.

Use it to agree on navigation, visual hierarchy, theme, card presentation and import review before implementation. It is a design reference, not production code or evidence of backend/security completion.
