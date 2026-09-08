# Folio System Architecture

> Architectural design and patterns for the Folio local-first personal wealth tracker.

---

## 1. High-Level Overview

Folio is a **fully client-side** single-page application built on React 18 and Vite. There is no backend database or external server dependency. All data resides in the user's browser via `localStorage` and is managed through a clean storage abstraction layer paired with a reactive `DataContext`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Browser                                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                        React 18 SPA                            │   │
│   │                                                                │   │
│   │   ┌──────────────┐      ┌──────────────┐      ┌────────────┐   │   │
│   │   │  Route Pages │  ──▶ │  Components  │  ──▶ │UI Primitives│  │
│   │   └──────┬───────┘      └──────┬───────┘      └────────────┘   │   │
│   │          │                     │                               │   │
│   │          ▼                     ▼                               │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │           DataContext (Reactive Store & State)         │   │   │
│   │   │    - Cross-tab synchronization (`storage` events)      │   │   │
│   │   │    - Custom event dispatch (`ledger_data_updated`)     │   │   │
│   │   └───────────────────────────┬────────────────────────────┘   │   │
│   │                               │                                │   │
│   │                               ▼                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │            Storage Service (`services/storage.js`)     │   │   │
│   │   │    - Schema v2 validation & migrations                 │   │   │
│   │   │    - Atomic double-entry balance updates               │   │   │
│   │   │    - Guarded account deletes & transfer integrity      │   │   │
│   │   │    - JSON backup export / import validation            │   │   │
│   │   └───────────────────────────┬────────────────────────────┘   │   │
│   │                               │                                │   │
│   │                               ▼                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │     Pure Calculations Layer (`utils/calculations.js`)   │   │   │
│   │   │    - Single source of truth for net worth & metrics    │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └───────────────────────────────┼────────────────────────────────┘   │
│                                   ▼                                    │
│                         ┌───────────────────┐                          │
│                         │   localStorage    │                          │
│                         └───────────────────┘                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy

```mermaid
graph TD
    App["App.jsx"] --> Router["React Router v6"]
    Router --> Layout["AppLayout.jsx"]
    Layout --> Navbar["Navbar.jsx"]
    Layout --> MobileNav["MobileNav.jsx"]
    Layout --> GlobalSearch["GlobalSearch.jsx (⌘K)"]
    Layout --> ScrollToTop["ScrollToTop.jsx"]
    Layout --> ErrorBoundary["ErrorBoundary.jsx"]
    Layout --> Outlet["<Outlet />"]

    subgraph Pages
        Outlet --> Dashboard["DashboardPage.jsx"]
        Outlet --> Transactions["TransactionsPage.jsx"]
        Outlet --> Accounts["AccountsPage.jsx"]
        Outlet --> Budgets["BudgetsPage.jsx"]
        Outlet --> Analytics["AnalyticsPage.jsx"]
        Outlet --> Investments["InvestmentsPage.jsx"]
        Outlet --> Settings["SettingsPage.jsx"]
        Outlet --> NotFound["NotFoundPage.jsx"]
    end

    Dashboard --> HeroSection
    Dashboard --> FinancialMetrics
    Dashboard --> NetWorthChart
    Dashboard --> CashFlowChart
    Dashboard --> SpendingBreakdown
    Dashboard --> RecentTransactions
    Dashboard --> AccountOverview
    Dashboard --> FinancialInsights

    Transactions --> TransactionFilters
    Transactions --> TransactionTable
    Transactions --> TransactionModal
    TransactionTable --> TransactionRow

    Accounts --> AccountCard
    Accounts --> AccountModal

    Budgets --> BudgetCard
    Budgets --> BudgetProgress
    Budgets --> BudgetModal

    Investments --> PortfolioSummary
    Investments --> AllocationChart
    Investments --> HoldingsTable
    Investments --> HoldingModal
    Investments --> PortfolioValueChart
```

---

## 3. State Management & Reactivity

| Concern                    | Implementation                               | Characteristics                                                                                                                                                                            |
| :------------------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persisted Data**         | `DataContext.jsx` over `services/storage.js` | Synchronous `localStorage` access wrapped in a reactive Context provider. Emits and listens to `ledger_data_updated` custom events and window `storage` events for instant multi-tab sync. |
| **Active Theme**           | `ThemeProvider.jsx`                          | Supports `light`, `dark`, and `system` modes. Toggles the `.dark` CSS class on `<html>` and persists preference in storage.                                                                |
| **Route State**            | React Router v6                              | Lazy route loading with React `Suspense`, dynamic title hooks, and scroll-to-top on route changes.                                                                                         |
| **Derived Financial Data** | `utils/calculations.js`                      | Pure functional calculators compute net worth, cash flow, category distributions, and savings rates on the fly. Zero stored aggregates prevent stale state bugs.                           |
| **Local UI State**         | React `useState` & `useMemo`                 | Modals, active filters, search drawers, and pagination maintain local state, with URL query syncing where appropriate.                                                                     |

---

## 4. Routing Architecture

Folio uses code-split route definitions to optimize bundle size:

| Path            | Component              | Chunk Strategy | Purpose                                                           |
| :-------------- | :--------------------- | :------------- | :---------------------------------------------------------------- |
| `/`             | `DashboardPage.jsx`    | Code-split     | Executive wealth overview, net worth timeline, recent activity    |
| `/transactions` | `TransactionsPage.jsx` | Code-split     | Complete ledger, search, filters, pagination, transaction CRUD    |
| `/accounts`     | `AccountsPage.jsx`     | Code-split     | Asset and liability accounts, guarded balance adjustments         |
| `/budgets`      | `BudgetsPage.jsx`      | Code-split     | Monthly budget allocations and utilization progress meters        |
| `/analytics`    | `AnalyticsPage.jsx`    | Code-split     | Deep dive financial insights, monthly comparisons, savings trends |
| `/investments`  | `InvestmentsPage.jsx`  | Code-split     | Portfolio allocation, asset-class breakdown, holdings tracker     |
| `/settings`     | `SettingsPage.jsx`     | Code-split     | Currency format, data export/import, backup restoration, theme    |
| `*`             | `NotFoundPage.jsx`     | Code-split     | Graceful 404 fallback page                                        |

---

## 5. Design System & Theming

The visual language follows an **editorial private-wealth aesthetic**:

- **Palette**: Warm ivory backgrounds (`#FDFBF7`), zinc text hierarchies (`#18181B`), and warm amber brand accents (`#D97706`).
- **Dark Mode**: OLED dark backgrounds (`#141414`), charcoal cards (`#1E1E1E`), and soft golden accents (`#F59E0B`).
- **Typography**:
  - Headings: `Playfair Display` (editorial serif)
  - Body & UI: `Inter` (neutral geometric sans)
  - Numerics: Monospace formatting (`mono` class) with tabular numbers for financial balance precision.
- **Micro-Interactions**: Smooth cubic-bezier transitions, hover underlines, count-up animations for large currency values, and responsive drawer modals.

---

## 6. Zero-Backend Migration Trajectory

Folio's clean storage abstraction enables future remote backend integrations without altering presentation components:

```js
// Current: Synchronous LocalStorage Adapter
export function getTransactions() {
  return read(STORAGE_KEYS.TRANSACTIONS, []);
}

// Future: Cloud / Supabase Adapter
export async function getTransactions() {
  const { data } = await supabase.from('transactions').select('*');
  return data;
}
```

Because component pages interact solely with `DataContext` and `storage.js` contracts, migrating to Supabase, Firebase, or an encrypted WebDAV store requires swapping the storage service implementation without refactoring the UI.
