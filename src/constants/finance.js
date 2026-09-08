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
  'Food & Dining': '#F59E0B',
  Shopping: '#3B82F6',
  'Bills & Utilities': '#10B981',
  Entertainment: '#8B5CF6',
  Transport: '#EC4899',
  Healthcare: '#EF4444',
  Travel: '#06B6D4',
  Education: '#6366F1',
  Investment: '#10B981',
  Salary: '#059669',
  Freelance: '#0D9488',
  Other: '#6B7280',
});

export const FALLBACK_CATEGORY_COLOR = '#6B7280';

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
