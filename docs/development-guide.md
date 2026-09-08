# Development & Contribution Guide

> Comprehensive guide for running, developing, testing, and building the Folio codebase.

---

## 1. Prerequisites

Before setting up the repository, ensure your development environment satisfies:

- **Node.js**: `v18.0.0` or higher (`v20.x` recommended, see `.nvmrc`)
- **Package Manager**: `npm` (v9+)
- **OS**: macOS, Linux, or Windows (WSL2 recommended for Windows)

Verify your active version:

```bash
node -v
npm -v
```

---

## 2. Setup & Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/aritraio/Folio.git
cd Folio
npm install
```

---

## 3. Available Scripts

All standard lifecycle and verification scripts are managed via `package.json`:

| Script                 | Command                     | Purpose                                                                                          |
| :--------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------- |
| `npm run dev`          | `vite`                      | Starts the local Vite development server with Hot Module Replacement at `http://localhost:5173`. |
| `npm run build`        | `vite build`                | Compiles the production bundle with Rollup chunk splitting to the `dist/` directory.             |
| `npm run preview`      | `vite preview`              | Serves the production build locally to test bundle behavior and assets.                          |
| `npm test`             | `vitest run`                | Executes all unit test suites once in headless JSDOM.                                            |
| `npm run test:watch`   | `vitest`                    | Runs tests in interactive watch mode, re-executing on file changes.                              |
| `npm run lint`         | `eslint src`                | Runs ESLint flat config checks across `src/` to verify code quality.                             |
| `npm run lint:fix`     | `eslint src --fix`          | Automatically resolves mechanical linting and formatting issues.                                 |
| `npm run format`       | `prettier --check src docs` | Checks formatting across source code and documentation.                                          |
| `npm run format:write` | `prettier --write src docs` | Formats all source files and markdown documentation.                                             |

---

## 4. Testing Conventions

Folio maintains automated test coverage for critical financial algorithms and storage operations:

- **Location**: Test files sit adjacent to their target module (`*.test.js`).
- **Test Runner**: Vitest configured with JSDOM environment in `vite.config.js`.
- **Key Test Suites**:
  - `src/services/storage.test.js`: Validates atomic balance updates, transfer double-entry accounting, guarded account deletion, and JSON backup validation.
  - `src/utils/calculations.test.js`: Tests net worth calculation, monthly cash flow, category breakdowns, savings rates, and portfolio valuations.
  - `src/utils/formatCurrency.test.js`: Validates multi-currency formatting (`INR`, `USD`, `EUR`) and compact numeric representations.
  - `src/utils/dateUtils.test.js`: Tests month interval slicing and relative date helpers.

### Running Specific Tests

```bash
npm test -- storage.test.js
npm test -- calculations.test.js
```

---

## 5. Code Style & Architecture Best Practices

1. **Maintain Documentation Integrity**: Always preserve existing comments, JSDoc annotations, and component documentation.
2. **Pure Calculation Utilities**: Keep business math in `src/utils/calculations.js`. Never calculate financial balances or net worth ad-hoc inside UI render bodies.
3. **Storage Abstraction**: Never call `window.localStorage` directly inside UI components. Always use `DataContext` hooks (`useData()`) or methods exported by `src/services/storage.js`.
4. **Accessible Semantics**: Use semantic HTML tags (`<nav>`, `<main>`, `<section>`, `<article>`, `<table>`), associated labels on inputs, and clear `aria-label` tags on icon-only buttons.
5. **Color & Theme Tokens**: Utilize predefined Tailwind theme classes (`bg-ivory`, `dark:bg-surface-dark`, `text-brand-amber`, `border-ivory-border`). Do not introduce hardcoded ad-hoc hex values in component templates.

---

## 6. Production Deployment

The project is pre-configured for static hosting platforms (Vercel, Netlify, Cloudflare Pages):

- **Vercel**: `vercel.json` provides SPA fallback rewrites (`/*` → `/index.html`), cache-control headers for `/assets/*` (`max-age=31536000, immutable`), and security response headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- **Static Artifacts**: Running `npm run build` outputs everything into `dist/`. No server runtime is required.
