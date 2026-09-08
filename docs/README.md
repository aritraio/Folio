# Folio Documentation Hub

Welcome to the internal engineering and architectural documentation for **Folio**, an editorial, local-first personal finance tracker.

---

## Documentation Index

| Document                                                                                | Description                                                                                                                                          | Target Audience                     |
| :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| [Architecture](file:///Users/aritra/Code/Projects/Folio/docs/architecture.md)           | High-level system architecture, client-side data flow, React component hierarchy, state management with `DataContext`, and styling token philosophy. | All Engineers & Contributors        |
| [Data Models & Storage](file:///Users/aritra/Code/Projects/Folio/docs/data-models.md)   | LocalStorage key schema (v2), atomic CRUD operations, transfer mechanics, entity definitions, and JSON backup export/import validation.              | Feature Developers & Data Engineers |
| [Technology Stack](file:///Users/aritra/Code/Projects/Folio/docs/techstack.md)          | Detailed rationale for selecting React 18, Vite 5, Tailwind CSS, Recharts, Lucide, date-fns, and Vitest, along with dependency boundaries.           | Architecture & DevOps               |
| [Development Guide](file:///Users/aritra/Code/Projects/Folio/docs/development-guide.md) | Local development setup, npm scripts, code styling standards (ESLint/Prettier), and testing conventions.                                             | Contributors & Maintainers          |
| [Roadmap & Audit](file:///Users/aritra/Code/Projects/Folio/docs/roadmap.md)             | Development history (Phases 0–16), architecture audit findings, current grade scorecard, and future enhancements.                                    | Product Managers & Contributors     |

---

## System Overview at a Glance

Folio is designed with three strict architectural principles:

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                 React 18 + Vite                   │  │
│  │                                                   │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │  Pages   │→ │Components│→ │  UI Primitives  │  │  │
│  │  └────┬────┘  └─────┬────┘  └─────────────────┘  │  │
│  │       │             │                             │  │
│  │       ▼             ▼                             │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │   DataContext (Reactive Store & Subscriptions)│  │
│  │  └──────────────────────┬──────────────────────┘  │  │
│  │                         ▼                         │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │   Storage Service (Atomic Balances & Schema) │  │
│  │  └──────────────────────┬──────────────────────┘  │  │
│  └─────────────────────────┼─────────────────────────┘  │
│                            ▼                            │
│                   ┌─────────────────┐                   │
│                   │  localStorage   │                   │
│                   └─────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

1. **Zero-Backend Privacy**: All financial data (transactions, accounts, budgets, holdings) lives strictly within the browser's `localStorage`. No telemetry, no third-party tracking, no server database.
2. **Double-Entry Balance Integrity**: Account balances update atomically upon transaction creation, modification, or deletion. Inter-account transfers credit the destination account and debit the source account while staying excluded from income/expense metrics.
3. **Editorial Aesthetic**: A high-end private-wealth visual identity inspired by print financial journals, utilizing warm ivory tones, amber accents, dark mode support, and typography pairings of Playfair Display and Inter.
