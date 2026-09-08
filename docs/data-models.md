# Data Models & Storage Specification

> Comprehensive specification of Folio's client-side data layer, entity definitions, schema versioning, and validation rules.

---

## 1. Storage Keys & Schema Versioning

Folio stores all data under the following key names in browser `localStorage`. Schema versioning guarantees safe forward migration:

| Key                       | Constant                        | Version | Description                                              |
| :------------------------ | :------------------------------ | :------ | :------------------------------------------------------- |
| `ledger_transactions`     | `STORAGE_KEYS.TRANSACTIONS`     | v2      | Array of user transactions (income, expense, transfer).  |
| `ledger_accounts`         | `STORAGE_KEYS.ACCOUNTS`         | v2      | Array of user financial accounts (assets & liabilities). |
| `ledger_budgets`          | `STORAGE_KEYS.BUDGETS`          | v2      | Array of category monthly budgets.                       |
| `ledger_investments`      | `STORAGE_KEYS.INVESTMENTS`      | v2      | Array of portfolio holdings and asset positions.         |
| `ledger_settings`         | `STORAGE_KEYS.SETTINGS`         | v2      | Object storing user preferences, profile, and currency.  |
| `ledger_networth_history` | `STORAGE_KEYS.NETWORTH_HISTORY` | v2      | Array of historical month snapshots for trend analysis.  |
| `ledger_schema_version`   | `STORAGE_KEYS.SCHEMA_VERSION`   | v2      | Integer (`2`) tracking active schema migration version.  |

---

## 2. Entity Schemas

### 2.1 Transaction

Transactions capture income, expenses, and inter-account transfers.

```typescript
interface Transaction {
  id: string; // UUID string generated via crypto.randomUUID()
  type: 'expense' | 'income' | 'transfer';
  merchant: string; // Primary merchant or description (e.g. "Apple Store")
  description: string; // Compatibility alias matching merchant
  category: string; // Category name from CATEGORIES list ("Other" for transfers)
  amount: number; // Positive numeric value in base units
  accountId: string; // ID of the origin account
  toAccountId?: string; // ID of destination account (transfers only)
  date: string; // ISO 8601 calendar date (YYYY-MM-DD)
  notes?: string; // Optional notes (max 500 characters)
  createdAt: string; // ISO timestamp (e.g. 2026-08-10T14:32:00.000Z)
  updatedAt?: string; // ISO timestamp of last modification
}
```

#### Transfer Mechanics

- **Income**: Increases source `accountId` balance. Included in income metrics.
- **Expense**: Decreases source `accountId` balance. Included in expense & budget metrics.
- **Transfer**: Decreases source `accountId` balance and increases destination `toAccountId` balance. **Excluded** from income and expense metrics to prevent artificial inflation of cash flow.

---

### 2.2 Account

Represents an asset account (savings, checking, cash, investment) or liability account (credit card, loan).

```typescript
interface Account {
  id: string; // UUID string (e.g. "acc_1")
  name: string; // Account title (e.g. "Chase Sapphire Preferred")
  type: 'savings' | 'current' | 'credit' | 'cash' | 'investment';
  balance: number; // Numeric balance in base units
  icon: string; // Key mapping to Lucide icon (e.g. "Landmark", "CreditCard")
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
```

#### Guarded Deletion Rule

An account **cannot be deleted** if it has associated transactions unless the user reassigns those transactions to another active account. `storage.deleteAccount(id, { reassignTo })` ensures zero orphaned records in the database.

---

### 2.3 Budget

Monthly category spending targets.

```typescript
interface Budget {
  id: string; // UUID string (e.g. "bgt_1")
  category: string; // Matches a standard transaction category
  limit: number; // Maximum planned monthly spend
  month: string; // Target month in YYYY-MM format
  createdAt: string; // ISO timestamp
}
```

---

### 2.4 Investment Holding

Portfolio positions across equities, mutual funds, Indian Fixed Deposits, and bonds.

```typescript
interface Holding {
  id: string; // UUID string (e.g. "inv_1")
  name: string; // Asset name (e.g. "HDFC Nifty 50 Index Fund")
  symbol?: string; // Ticker symbol or AMFI scheme code (e.g. "120716")
  type: 'stock' | 'mutual_fund' | 'fixed_deposit' | 'bond' | 'crypto' | 'gold' | 'other';
  units?: number; // Quantity of units held (stocks, mutual funds, bonds)
  avgPrice?: number; // Average purchase price per unit
  currentPrice?: number; // Latest estimated price per unit / live NAV
  // Fixed Deposit Specific Fields
  principal?: number; // Initial FD deposit amount in ₹
  interestRate?: number; // Annual interest percentage (e.g. 7.1)
  startDate?: string; // FD inception date (YYYY-MM-DD)
  tenureMonths?: number; // Total tenure in months (e.g. 12, 36)
  compoundingFrequency?: 'quarterly' | 'monthly' | 'annual' | 'cumulative';
  // Bond Specific Fields
  faceValue?: number; // Face value per unit (e.g. ₹1000)
  couponRatePct?: number; // Annual coupon interest percentage (e.g. 2.5)
  maturityDate?: string; // Maturity date (YYYY-MM-DD)
  notes?: string; // Optional notes
  createdAt: string; // ISO timestamp
}
```

---

### 2.5 Settings

Global user preferences, AI keys, and localization settings.

```typescript
interface Settings {
  userName: string; // User display name (defaults to "Aritra")
  email?: string; // User contact email
  currency: 'INR' | 'USD' | 'EUR'; // Selected display currency
  theme: 'light' | 'dark' | 'system'; // Visual theme preference
  defaultCategory: string; // Default category for new transactions
  geminiApiKey?: string; // User-provided Google Gemini API key
  geminiModel?: string; // Model identifier (defaults to "gemini-1.5-flash")
  schemaVersion: number; // Current schema version (2)
}
```

---

## 3. Data Integrity & Calculations

Folio relies on **derived financial computations** located in `src/utils/calculations.js`. Calculations are deterministic pure functions:

| Computation           | Formula                                                                               | Description                                 |
| :-------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------ |
| **Total Assets**      | $\sum \text{balance}(\text{savings}, \text{current}, \text{cash}, \text{investment})$ | Total value of positive wealth stores       |
| **Total Liabilities** | $\sum \text{balance}(\text{credit}, \text{loans})$                                    | Total outstanding debts and balances owed   |
| **Net Worth**         | $\text{Total Assets} - \text{Total Liabilities}$                                      | True net capital across all linked accounts |
| **Monthly Cash Flow** | $\text{Income}_{\text{month}} - \text{Expenses}_{\text{month}}$                       | Net monthly capital gain / burn             |
| **Savings Rate**      | $\frac{\text{Income} - \text{Expenses}}{\text{Income}} \times 100$                    | Percentage of monthly income preserved      |
| **Portfolio Value**   | $\sum (\text{units} \times \text{currentPrice})$                                      | Real-time estimated valuation of holdings   |

---

## 4. Backup, Export, & Import Specification

Folio exports backups as an uncompressed, versioned JSON payload:

```json
{
  "version": 2,
  "exportedAt": "2026-09-08T14:30:00.000Z",
  "data": {
    "transactions": [ ... ],
    "accounts": [ ... ],
    "budgets": [ ... ],
    "investments": [ ... ],
    "settings": { ... },
    "netWorthHistory": [ ... ]
  }
}
```

### Safety & Import Rules:

1. **Schema Validation**: `storage.validateBackup(payload)` checks for the presence of required root keys and valid array shapes before applying changes.
2. **Pre-Import Snapshot**: Before overwriting the current state with an imported file, `storage.createPreImportBackup()` triggers an automated backup download of the existing dataset.
3. **Reset to Demo vs. Erase All**:
   - `resetToDemo()` wipes current records and restores initial seed mock data (`mockData.js`).
   - `eraseAllData()` permanently wipes all records with zero re-seeding, testing true empty states.
