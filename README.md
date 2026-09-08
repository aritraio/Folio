# Ledger — Personal Finance Tracker

A local-first personal finance dashboard built with React, Vite, Tailwind CSS, Recharts, and Lucide React.
Editorial / private-wealth aesthetic. No backend — all data stays in your browser (`localStorage`) with
versioned JSON backup export/import.

## Features

- **Dashboard** — net worth hero, metrics strip, net-worth + cash-flow charts, spending donut, recent transactions, insights
- **Transactions** — search, month/type/category/account filters, sorting, pagination, full CRUD incl. **transfers**
- **Accounts** — assets vs liabilities, guarded delete (reassign, never orphan)
- **Budgets** — monthly limits with warning/exceeded states
- **Analytics** — period + month views, savings-rate and net-worth trends
- **Investments** — allocation donut, holdings table, estimated value trend (labelled as estimate)
- **Settings** — profile, INR/USD/EUR currency (applies instantly), theme, versioned backup export/import, reset-to-demo vs erase
- **Global search** (`Ctrl/⌘+K`) across transactions, accounts, budgets, investments
- **Dark mode** (light/dark/system), responsive mobile → desktop, reduced-motion support

## Tech Stack

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS v3 (design tokens, `dark:` class strategy)
- **Routing**: React Router v6 (lazy routes, `*` 404, scroll restoration)
- **Charts**: Recharts 2.x (code-split `charts` chunk)
- **Icons**: Lucide React · **Dates**: date-fns 3.x
- **State**: `DataContext` over a versioned `localStorage` service (no Redux needed)
- **Quality**: Vitest + Testing Library, ESLint, Prettier, GitHub Actions CI

## Getting Started

### Prerequisites

- Node.js 20 recommended (`cat .nvmrc`), 18+ minimum, plus `npm`

### Installation

```bash
npm install
npm run dev        # Vite dev server
npm run test       # Vitest (45+ unit tests: utils + storage)
npm run lint       # ESLint (0 errors required)
npm run build      # Production build to /dist
npm run preview    # Preview production build
```

## Data & Backups

- Keys: `ledger_transactions`, `ledger_accounts`, `ledger_budgets`, `ledger_investments`,
  `ledger_settings`, `ledger_networth_history`, `ledger_schema_version` (currently v2).
- **Export** downloads a versioned JSON file (Blob, safe for large data).
- **Import** validates schema first and auto-downloads a pre-import backup.
- **Reset to demo** restores seed data; **Erase everything** truly empties (empty states, no fake charts).
- Transfers (`accountId` → `toAccountId`) move balances and are excluded from income/expense totals.

## Folder Structure

```
src/
├── components/
│   ├── layout/       # AppLayout, Navbar, GlobalSearch, ErrorBoundary, ScrollToTop
│   ├── dashboard/    # Hero, metrics, charts, insights
│   ├── transactions/ # Table, filters, modal (expense/income/transfer)
│   ├── budgets/      # Cards, progress, modal
│   ├── analytics/    # Summary + trend charts
│   ├── investments/  # Summary, allocation, holdings
│   └── ui/           # Button, Modal, Input, Select, Badge, EmptyState, ConfirmDialog
├── contexts/         # DataContext (reactive store over localStorage)
├── constants/        # finance.js — types, categories, colors, currencies, schema
├── pages/            # Dashboard, Transactions, Accounts, Budgets, Analytics, Investments, Settings, 404
├── data/             # mockData.js (demo seed)
├── utils/            # calculations, formatCurrency (INR/USD/EUR), dateUtils, useCountUp
└── services/         # storage.js — versioned CRUD, validation, backup/restore
```

See `architecture.md` for system design, `techstack.md` for rationale,
`improvements.md` for the audit trail, and `todo.md` for history.

## Deployment

Vercel-ready (`vercel.json` rewrites SPA routes, immutable asset caching, security headers).
Any static host works: `npm run build` → serve `dist/`.

## License

MIT — see `LICENSE`.
