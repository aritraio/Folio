# Folio — Personal Wealth & Finance Tracker

> **Editorial clarity for personal wealth.** A private, local-first finance dashboard built with React 18, Vite, Tailwind CSS, and Recharts.

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-45%20Passed-22c55e?style=flat-square&logo=vitest)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-0%20Warnings-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

---

## Highlights

- 🔒 **100% Local-First & Private**: All data lives strictly in your browser's `localStorage`. No cloud database, no tracking, no telemetry.
- 🏛️ **Editorial Design System**: Crafted with a print-journal private wealth aesthetic—warm ivory surfaces, Playfair Display serifs, tabular monetary figures, and OLED dark mode.
- ⚖️ **Double-Entry Balance Integrity**: Account balances update atomically upon transaction save, update, or deletion. Inter-account transfers credit destination accounts while being excluded from income/expense totals.
- 🛡️ **Guarded Accounts**: Prevents deletion of accounts with existing transaction history without explicit reassignment, preserving ledger integrity.
- ⚡ **Lightning Fast & Lightweight**: Zero runtime state management overhead; routes, charts, and date utilities are split into optimized Rollup chunks.
- ⌨️ **Global Command Palette (`⌘K` / `Ctrl+K`)**: Rapid search across transactions, accounts, budgets, and investments from anywhere in the app.

---

## Core Features

- **Dashboard**: Net worth hero with count-up animations, 5-metric summary strip, net-worth timeline, income vs. expense cash flow, category donut, and recent activity.
- **Transactions**: Full CRUD with instant search, multi-field filters (date, type, category, account), column sorting, pagination, and transfer support.
- **Accounts**: Assets vs. liabilities breakdown, balance tracking, and safe deletion with transaction re-mapping.
- **Budgets**: Monthly category spending limits with visual progress meters and dynamic warning/over-budget states.
- **Analytics**: Cash flow charts, savings-rate trends, category spend comparisons, and historical growth insights.
- **Investments**: Portfolio valuation summary, asset-class distribution donut, and holdings tracker.
- **Settings**: Multi-currency display (`INR ₹`, `USD $`, `EUR €`), theme customization (`light`, `dark`, `system`), versioned JSON backup export/import, and demo reset.

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher (`v22.x` recommended, see `.nvmrc`)
- **npm**: `v9.0.0` or higher

### Quickstart

```bash
# Clone repository
git clone https://github.com/aritraio/Folio.git
cd Folio

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Quality Gates & Verification

```bash
npm run test       # Run 45 unit test suites via Vitest
npm run lint       # Verify zero ESLint errors or warnings
npm run format     # Check formatting across src/ and docs/
npm run build      # Compile production bundle to /dist
npm run preview    # Preview production build locally
```

---

## 📚 Documentation Section

Detailed technical guides, architectural patterns, and specifications are located in [`docs/`](docs/README.md):

| Guide | Description |
| :--- | :--- |
| **[Architecture](docs/architecture.md)** | High-level system architecture, component hierarchy, reactive `DataContext`, and styling token philosophy. |
| **[Data Models & Storage](docs/data-models.md)** | LocalStorage key schema (v2), atomic balance updates, transfer mechanics, and JSON backup export/import validation. |
| **[Technology Stack](docs/techstack.md)** | Technical decisions and rationale behind React 18, Vite 5, Tailwind CSS, Recharts, Lucide, and Vitest. |
| **[Development Guide](docs/development-guide.md)** | Local development workflows, npm scripts, code standards, and testing conventions. |
| **[Roadmap & Audit](docs/roadmap.md)** | Engineering audit scorecard, completed milestones (Phases 0–16), and future capabilities. |

---

## Repository Structure

```
Folio/
├── .github/              # CI workflows (GitHub Actions)
├── docs/                 # Engineering documentation suite
│   ├── README.md         # Documentation index & navigation hub
│   ├── architecture.md   # System architecture & data flow
│   ├── data-models.md    # LocalStorage schemas & transfer logic
│   ├── development-guide.md # Setup, testing, and contribution guide
│   ├── roadmap.md        # Audit scorecard, completed phases & roadmap
│   └── techstack.md      # Tooling & library rationale
├── public/               # Static assets & brand favicon.svg
├── src/
│   ├── components/       # UI primitives, layout, and domain components
│   │   ├── accounts/     # Account cards and balance forms
│   │   ├── analytics/    # Deep-dive financial analysis charts
│   │   ├── budgets/      # Category limit cards & progress bars
│   │   ├── dashboard/    # Hero, metrics, charts, insights
│   │   ├── investments/  # Portfolio allocation and holdings table
│   │   ├── layout/       # AppLayout, Navbar, MobileNav, GlobalSearch
│   │   ├── transactions/ # Table, filters, modal forms
│   │   └── ui/           # Button, Modal, Input, Select, Badge, EmptyState
│   ├── constants/        # Financial categories, colors, currencies, schema
│   ├── contexts/         # DataContext reactive store & ThemeProvider
│   ├── data/             # Demo seed data (mockData.js)
│   ├── pages/            # Top-level code-split route pages
│   ├── services/         # Storage service with atomic balance logic
│   ├── utils/            # Pure calculation algorithms & currency formatters
│   ├── App.jsx           # Top-level route configuration & Suspense
│   ├── index.css         # Tailwind tokens & dark-mode CSS variables
│   └── main.jsx          # React DOM entrypoint
├── eslint.config.js      # ESLint 9+ flat configuration
├── package.json          # Package manifest & scripts
├── tailwind.config.js    # Theme typography, spacing, and color tokens
├── vercel.json           # Vercel SPA routing and caching headers
└── vite.config.js        # Vite configuration & Rollup chunking
```

---

## Deployment

Folio is designed for zero-config static hosting:

- **Cloudflare Pages**: Includes [wrangler.toml](wrangler.toml), [public/\_headers](public/_headers), and [public/\_redirects](public/_redirects) for instant SPA routing, asset caching, and security headers. Deploy via Cloudflare Dashboard Git integration or with `npm run deploy:cf`.
- **Vercel**: Includes `vercel.json` with SPA routing rewrites (`/*` → `/index.html`), immutable asset caching, and security headers.
- **Static Hosting**: Run `npm run build` to generate the standalone `/dist` folder. Can be served via Cloudflare Pages, Vercel, Netlify, GitHub Pages, or any static HTTP server.

---

## License

This project is licensed under the [MIT License](LICENSE).
