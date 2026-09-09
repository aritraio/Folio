# Folio — Personal Wealth & Finance Tracker

> **Editorial clarity for personal wealth.** A private, local-first finance dashboard built with React 18, Vite, Tailwind CSS, Recharts, and Google Gemini.

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-63%20Passed-22c55e?style=flat-square&logo=vitest)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-0%20Warnings-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

---

## 🌟 Highlights

- 🔒 **100% Local-First & Private**: All data resides exclusively in your browser's `localStorage`. No remote database, no tracking, and zero telemetry. Statements and credentials never leave your browser.
- 📄 **In-Browser AI Statement Ingestion**: Decrypt password-protected e-statements (HDFC, ICICI, SBI, Axis, Cred) directly via `pdfjs-dist` and parse transactions via Google Gemini 1.5 Flash in strict JSON schema mode—includes an instant 1-click offline demo mode!
- 💳 **Dual Spending Engine (Savings vs. Credit)**: Clearly segregate liquid account debits (UPI, cash, debit cards) from credit card debt accumulation. Automated inter-account transfer detection ensures credit card bill payments are never double-counted.
- 💡 **AI Spending Advisor**: Proactive financial discoveries identifying high-velocity food delivery habits (Zomato/Swiggy), recurring digital subscriptions (Spotify, Netflix), budget thresholds, and liquidity safety cushions.
- 🇮🇳 **Indian Wealth Management Suite**: Multi-asset portfolio tracking across Indian Equities, Live Mutual Funds (daily NAV updates from the public AMFI India API), Fixed Deposits (quarterly compounding engine), and Sovereign Gold Bonds (SGBs).
- 🎓 **Dynamic Student Persona**: Seeded with an authentic Indian tech student profile (Aritra) featuring dynamic relative dates (`date-fns`) that ensure the dashboard is always lively and populated for the active month.
- 🏛️ **Editorial Design System**: Crafted with a print-journal private wealth aesthetic—warm ivory surfaces, Playfair Display serifs, tabular numbers for financial precision, and an OLED dark mode.
- ⚖️ **Double-Entry Balance Integrity**: Account balances update atomically on every transaction add, edit, or batch commit.
- 🛡️ **Guarded Accounts**: Prevents accidental deletion of accounts with existing transaction history without explicit reassignment.
- ⌨️ **Global Command Palette (`⌘K` / `Ctrl+K`)**: Instant search across transactions, accounts, budgets, and investments from anywhere in the app.

---

## 🚀 Key Features

### 1. In-Browser AI Statement Ingestion
- **Client-Side PDF Decryption**: Decrypts password-protected PDF e-statements inside the browser using `pdfjs-dist`. Pre-configured password hints for major Indian banks (e.g. `DOB + First 4 letters of Name`).
- **Structured JSON Extraction**: Powered by Google Gemini 1.5 Flash with strict JSON schema enforcement to parse dates, merchants, amounts, categories, and debit/credit status.
- **Instant Interactive Demo**: No Gemini API key? Test the entire ingestion wizard with 1-click using realistic bundled e-statements from **HDFC Bank** and **ICICI Amazon Pay Credit Card**.
- **Staging Review & Duplicate Protection**: Preview extracted transactions in a staging table where potential duplicate records are flagged based on date proximity, amount, and merchant matching before batch committing.

### 2. Dual Spending Engine & Spending Advisor
- **Liquid Outflows vs. Credit Liabilities**: Tracks how much was spent from cash/savings/UPI vs. charges made to credit cards.
- **Transfer Isolation**: Intelligently identifies transfers from savings accounts to pay credit card bills and excludes them from total expenses, preventing inflated metrics.
- **Spending Advisor Card**: Highlights key financial insights including delivery velocity, active recurring subscriptions, and liquid cash-to-credit debt ratios.

### 3. Indian Wealth Portfolio
- **Wealth Class Tabs**: Dedicated tabs for **Stocks, Mutual Funds, Fixed Deposits, and Bonds**.
- **AMFI India Mutual Fund Integration**: Instant search across 10,000+ Indian mutual funds with live daily NAV updates from AMFI (`api.mfapi.in`).
- **Fixed Deposit Compounding Calculator**: Indian banking quarterly compounding engine ($A = P(1 + r/4)^{4t}$) tracking real-time accrued interest, maturity valuation, days remaining, and progress meters.
- **Bonds & Sovereign Gold Bonds (SGBs)**: Track bond quantities, coupon yields (e.g. 2.5% p.a.), and maturity dates.

### 4. Core Finance Tracking
- **Dashboard**: Net worth hero with count-up animations, 5-metric summary strip, net-worth timeline, income vs. expense cash flow, and category donuts.
- **Transactions Ledger**: Full CRUD, multi-field filters (date, type, category, account), column sorting, and pagination.
- **Budgets**: Monthly category spending limits with visual progress meters and dynamic warning/over-budget states.
- **Analytics**: Cash flow charts, savings-rate trends, category spend comparisons, and dual savings vs. credit spending breakdown.
- **Settings**: Multi-currency display (`INR ₹`, `USD $`, `EUR €`), Gemini API key configuration with test button, versioned JSON backup export/import, and demo reset.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20.x` recommended, see `.nvmrc`)
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

## 🧪 Quality Gates & Verification

```bash
npm run test         # Run 63 automated unit test suites via Vitest
npm run lint         # Verify zero ESLint errors or warnings
npm run format:write # Format all source files and docs with Prettier
npm run build        # Compile optimized production bundle to /dist
npm run preview      # Preview production build locally
```

---

## 📚 Documentation Section

Detailed technical guides, architectural patterns, and specifications are located in [`docs/`](docs/README.md):

| Guide | Description |
| :--- | :--- |
| **[Architecture](docs/architecture.md)** | High-level system architecture, component hierarchy, AI statement ingestion pipeline, and reactive `DataContext` model. |
| **[Data Models & Storage](docs/data-models.md)** | LocalStorage key schema (v2), atomic balance updates, transfer mechanics, investment holdings, and JSON backup export/import. |
| **[Technology Stack](docs/techstack.md)** | Technical decisions and rationale behind React 18, Vite 5, Tailwind CSS, Recharts, Lucide, pdfjs-dist, and Vitest. |
| **[Development Guide](docs/development-guide.md)** | Local development workflows, npm scripts, code standards, and testing conventions. |
| **[Roadmap & Audit](docs/roadmap.md)** | Engineering audit scorecard, completed milestones (Phases 0–19), and future capabilities. |

---

## 📂 Repository Structure

```
Folio/
├── .github/              # CI workflows (GitHub Actions)
├── docs/                 # Modular engineering documentation suite
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
│   │   ├── analytics/    # Deep-dive analytics, Dual Spending chart, AI Advisor
│   │   ├── budgets/      # Category limit cards & progress bars
│   │   ├── dashboard/    # Hero, metrics, charts, insights
│   │   ├── investments/  # Wealth tabs, FD modal, AMFI MF search, holdings table
│   │   ├── layout/       # AppLayout, Navbar, MobileNav, GlobalSearch
│   │   ├── statements/   # In-browser AI Statement Ingestion modal & staging
│   │   ├── transactions/ # Table, filters, modal forms
│   │   └── ui/           # Button, Modal, Input, Select, Badge, EmptyState
│   ├── constants/        # Financial categories, colors, bank password hints
│   ├── contexts/         # DataContext reactive store & ThemeProvider
│   ├── data/             # Dynamic student seed data (mockData.js)
│   ├── pages/            # Top-level code-split route pages
│   ├── services/         # Storage, AMFI live NAV, PDF parser, Gemini AI service
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

## 🌐 Deployment

Folio is designed for zero-config static hosting:

- **Vercel**: Includes `vercel.json` with SPA routing rewrites (`/*` → `/index.html`), immutable asset caching, and security headers.
- **Static Hosting**: Run `npm run build` to generate the standalone `/dist` folder. Can be served via Netlify, Cloudflare Pages, GitHub Pages, or any static HTTP server.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
