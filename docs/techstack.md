# Technology Stack & Rationale

> A detailed breakdown of the technical decisions, architecture libraries, and tooling chosen for Folio.

---

## 1. Core Framework & Bundler

| Technology               | Version    | Purpose            | Rationale                                                                                                                             |
| :----------------------- | :--------- | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **React**                | 18.3.1     | Core UI Library    | Component-driven architecture, efficient reconciliation, hooks (`useMemo`, `useCallback`, `useContext`), and idiomatic state sharing. |
| **Vite**                 | 5.4.x      | Frontend Toolchain | Sub-second cold start via native ESM, lightning-fast Hot Module Replacement (HMR), and production bundling via Rollup.                |
| **JavaScript (ES2022+)** | ECMAScript | Application Code   | Native modules, `crypto.randomUUID()`, modern async/await patterns, optional chaining, and nullish coalescing.                        |

### Why React + Vite?

- Zero complex build pipeline: Vite starts immediately with ESBuild pre-bundling.
- Code-splitting out of the box: Configured in `vite.config.js` to split `vendor`, `charts` (Recharts), and `dates` (date-fns) into independent cacheable chunks.
- SPA focus: No unnecessary SSR overhead—Folio is a private, client-side personal ledger.

---

## 2. Styling & Design System

| Technology                 | Version        | Purpose               | Rationale                                                                                             |
| :------------------------- | :------------- | :-------------------- | :---------------------------------------------------------------------------------------------------- |
| **Tailwind CSS**           | 3.4.10         | Utility-First Styling | Co-located styling with zero runtime CSS-in-JS penalty. Highly customizable via `tailwind.config.js`. |
| **PostCSS & Autoprefixer** | 8.4.x / 10.4.x | CSS Processing        | Automatic vendor prefixing and CSS pipeline integration.                                              |

### Custom Design Tokens

Folio defines custom design tokens reflecting an **editorial private-banking aesthetic**:

- **Colors**:
  - Light: Ivory base (`#FDFBF7`), warm border (`#E8E3D9`), zinc text (`#18181B`), amber accents (`#D97706`), emerald profit (`#059669`), crimson debit (`#E11D48`).
  - Dark: Charcoal OLED base (`#141414`), surface card (`#1E1E1E`), border (`#333333`), amber highlight (`#F59E0B`).
- **Typography**:
  - `Playfair Display`: Refined editorial serif for titles, hero statistics, and primary cards.
  - `Inter`: Highly legible neutral sans-serif for forms, metadata, and interface tables.
  - `mono`: Tabular monospace numbers for alignment in financial statements.

---

## 3. Data Visualization

| Technology   | Version | Purpose               | Rationale                                                                                                                     |
| :----------- | :------ | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Recharts** | 2.12.7  | Composable SVG Charts | React-native JSX components built atop D3 primitives. Fluid responsiveness via `<ResponsiveContainer>` and clean SVG styling. |

### Visualizations Implemented

1. **Net Worth Growth**: Area chart with soft gradient fill and time-window toggles (1M, 6M, 1Y, ALL).
2. **Cash Flow Comparison**: Grouped dual-bar chart showing monthly income vs. expenses.
3. **Category Spending**: Multi-slice donut chart with interactive hover sectors and percentage tooltips.
4. **Savings Rate Trend**: Minimalist line chart with dotted target thresholds.
5. **Portfolio Allocation**: Asset-class distribution donut with dynamic palette mapping.

---

## 4. UI Components & Utilities

| Technology       | Version | Purpose                    | Rationale                                                                                                                       |
| :--------------- | :------ | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **React Router** | 6.26.0  | Declarative Client Routing | Nested route layouts (`AppLayout` with `<Outlet />`), browser history management, and code-split route lazy loading.            |
| **Lucide React** | 0.427.0 | Iconography                | Clean, modern feather-style icons. Fully tree-shakeable with zero extraneous bundle weight.                                     |
| **date-fns**     | 3.6.0   | Date Manipulation          | Functional, immutable date calculations (`format`, `subMonths`, `startOfMonth`, `isWithinInterval`). Treeshaken to under 25 kB. |

---

## 5. Quality & Verification Suite

| Technology          | Version | Purpose                  | Rationale                                                                                                        |
| :------------------ | :------ | :----------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Vitest**          | 3.2.7   | Unit Test Runner         | Native Vite integration sharing the same config and transforms. Sub-second test execution.                       |
| **Testing Library** | 16.3.3  | DOM Testing Utilities    | User-centric DOM testing with `@testing-library/jest-dom` matchers.                                              |
| **JSDOM**           | 30.0.1  | Headless DOM Environment | Simulates browser environment for fast, headless local and CI test execution.                                    |
| **ESLint**          | 10.10.0 | Static Analysis          | ESLint 9+ flat config (`eslint.config.js`) enforcing clean code style, no unused variables, and JSX correctness. |
| **Prettier**        | 3.9.6   | Code Formatting          | Standardized code formatting across `src/` and `docs/`.                                                          |
| **GitHub Actions**  | v4      | CI Pipeline              | Runs lint, unit tests, and production build checks on every push and pull request.                               |
