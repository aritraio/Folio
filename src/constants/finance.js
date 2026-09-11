/**
 * Ledger — Shared domain constants.
 * Single source of truth for categories, account types, transaction types,
 * chart colors and currency config. Import from here instead of hardcoding.
 */

export const TRANSACTION_TYPES = Object.freeze(['expense', 'income', 'transfer']);

export const ACCOUNT_TYPES = Object.freeze(['savings', 'current', 'credit', 'cash', 'investment']);

export const DEFAULT_CATEGORIES = Object.freeze([
  'Food & Dining',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Transport',
  'Healthcare',
  'Travel',
  'Education',
  'Investment',
  'Salary',
  'Freelance',
  'Other',
]);

export const BUDGET_STATUSES = Object.freeze({
  NORMAL: 'normal',
  WARNING: 'warning',
  EXCEEDED: 'exceeded',
});

export const CATEGORY_COLORS = Object.freeze({
  'Food & Dining': '#FFFFFF',
  Shopping: '#E4E4E7',
  'Bills & Utilities': '#A1A1AA',
  Entertainment: '#71717A',
  Transport: '#52525B',
  Healthcare: '#3F3F46',
  Travel: '#27272A',
  Education: '#E4E4E7',
  Investment: '#A1A1AA',
  Salary: '#FFFFFF',
  Freelance: '#E4E4E7',
  Other: '#71717A',
});

export const FALLBACK_CATEGORY_COLOR = '#71717A';

/* ── Terminal chart theme: single source of truth for Recharts ── */
export const TERMINAL_CHART = Object.freeze({
  grid: '#262626',
  line: '#FFFFFF',
  areaFillTop: 'rgba(255, 255, 255, 0.05)',
  areaFillBottom: 'rgba(255, 255, 255, 0)',
  income: '#00b894',
  expense: '#ff6b6b',
  tooltipBg: '#141414',
  tooltipBorder: '#262626',
  monoGradient: ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A'],
});

export const CURRENCIES = Object.freeze({
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee (₹)' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', locale: 'en-IE', label: 'Euro (€)' },
});

export const SUPPORTED_CURRENCIES = Object.freeze(Object.keys(CURRENCIES));

export const SCHEMA_VERSION = 2;

export const STORAGE_KEYS = Object.freeze({
  INITIALIZED: 'ledger_initialized',
  SCHEMA_VERSION: 'ledger_schema_version',
  TRANSACTIONS: 'ledger_transactions',
  ACCOUNTS: 'ledger_accounts',
  BUDGETS: 'ledger_budgets',
  INVESTMENTS: 'ledger_investments',
  SETTINGS: 'ledger_settings',
  NETWORTH_HISTORY: 'ledger_networth_history',
});

export const DATA_UPDATED_EVENT = 'ledger_data_updated';
export const SETTINGS_UPDATED_EVENT = 'ledger_settings_updated';
