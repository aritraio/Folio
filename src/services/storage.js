import { DEMO_PROFILES, INITIAL_SETTINGS } from '../data/mockData.js';
import {
  STORAGE_KEYS as KEYS,
  SCHEMA_VERSION,
  DATA_UPDATED_EVENT,
  SETTINGS_UPDATED_EVENT,
  TRANSACTION_TYPES,
  ACCOUNT_TYPES,
} from '../constants/finance.js';

export { KEYS, SCHEMA_VERSION };

/* ── IDs ─────────────────────────────────────────────── */

export function generateId(prefix = 'id') {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
  } catch {
    /* fall through */
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ── Events ──────────────────────────────────────────── */

export function notifyDataUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DATA_UPDATED_EVENT));
  }
}

function notifySettingsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
    window.dispatchEvent(new Event(DATA_UPDATED_EVENT));
  }
}

/**
 * Subscribe to data changes (cross-tab `storage` + in-tab custom event).
 * @param {() => void} listener
 * @returns {() => void} unsubscribe
 */
export function subscribeToData(listener) {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e) => {
    if (!e.key || e.key.startsWith('ledger_')) listener();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(DATA_UPDATED_EVENT, listener);
  window.addEventListener(SETTINGS_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(DATA_UPDATED_EVENT, listener);
    window.removeEventListener(SETTINGS_UPDATED_EVENT, listener);
  };
}

/* ── Low-level IO ────────────────────────────────────── */

function getItem(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    if (data == null) return fallback;
    return JSON.parse(data);
  } catch (err) {
    // Corrupt JSON: do NOT silently return seed data (would duplicate).

    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      const quotaError = new Error(
        'Storage is full. Export a backup, then delete old transactions to free space.'
      );
      quotaError.code = 'STORAGE_QUOTA_EXCEEDED';
      throw quotaError;
    }
    throw err;
  }
}

/* ── Init + migrations ───────────────────────────────── */

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function getSchemaVersion() {
  try {
    const v = localStorage.getItem(KEYS.SCHEMA_VERSION);
    return v ? Number(v) : 1;
  } catch {
    return 1;
  }
}

/**
 * Get active demo profile ID ('sagnik' | 'sourav' | 'ankita').
 */
export function getActiveProfileId() {
  try {
    const active = localStorage.getItem(KEYS.ACTIVE_PROFILE);
    if (active && DEMO_PROFILES[active]) return active;
  } catch {
    /* fall through */
  }
  return 'sagnik';
}

/**
 * Get list of available demo student profiles with metadata.
 */
export function getDemoProfilesList() {
  return Object.values(DEMO_PROFILES).map((p) => p.metadata);
}

/**
 * Get active demo student profile metadata.
 */
export function getActiveProfileMetadata() {
  const id = getActiveProfileId();
  return DEMO_PROFILES[id]?.metadata || DEMO_PROFILES.sagnik.metadata;
}

/**
 * Initialize storage with default mock data if not initialized yet.
 * Versioned so future migrations can run exactly once.
 */
export function initStorage() {
  try {
    const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
    const schemaVersion = getSchemaVersion();
    const settings = getItem(KEYS.SETTINGS, null);
    const validStudentProfiles = ['sagnik', 'sourav', 'ankita'];
    const activeProfileId = getActiveProfileId();

    // Re-seed if uninitialized, outdated schema, or if demo user is not one of our student profiles
    const isStudentProfile =
      settings &&
      validStudentProfiles.some((p) => DEMO_PROFILES[p]?.settings?.userName === settings.userName);

    if (!isInitialized || schemaVersion < SCHEMA_VERSION || !settings || !isStudentProfile) {
      const profileData = DEMO_PROFILES[activeProfileId] || DEMO_PROFILES.sagnik;
      setItem(KEYS.ACCOUNTS, profileData.accounts);
      setItem(KEYS.BUDGETS, profileData.budgets);
      setItem(KEYS.INVESTMENTS, profileData.investments);
      setItem(KEYS.NETWORTH_HISTORY, profileData.netWorthHistory);
      setItem(KEYS.SETTINGS, profileData.settings);
      setItem(KEYS.TRANSACTIONS, profileData.transactions);
      localStorage.setItem(KEYS.ACTIVE_PROFILE, profileData.metadata.id);
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
    }

    // Backfill schema version + any missing keys (forward-compat).
    if (!localStorage.getItem(KEYS.SCHEMA_VERSION)) {
      localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
    }
    if (!localStorage.getItem(KEYS.ACTIVE_PROFILE)) {
      localStorage.setItem(KEYS.ACTIVE_PROFILE, 'sagnik');
    }
    if (localStorage.getItem(KEYS.TRANSACTIONS) == null) setItem(KEYS.TRANSACTIONS, []);
    if (localStorage.getItem(KEYS.ACCOUNTS) == null) setItem(KEYS.ACCOUNTS, []);
    if (localStorage.getItem(KEYS.BUDGETS) == null) setItem(KEYS.BUDGETS, []);
    if (localStorage.getItem(KEYS.INVESTMENTS) == null) setItem(KEYS.INVESTMENTS, []);
    if (localStorage.getItem(KEYS.NETWORTH_HISTORY) == null) setItem(KEYS.NETWORTH_HISTORY, []);
    if (localStorage.getItem(KEYS.SETTINGS) == null) setItem(KEYS.SETTINGS, INITIAL_SETTINGS);
  } catch (err) {
    console.error('Storage initialization failed:', err);
  }
}

/**
 * Switch active demo profile to target profile ID ('sagnik' | 'sourav' | 'ankita').
 * Automatically snapshots current working dataset under its profile key and
 * restores the target profile dataset.
 */
export function switchDemoProfile(targetId) {
  if (!DEMO_PROFILES[targetId]) {
    console.error(`Invalid profile ID: ${targetId}`);
    return false;
  }
  try {
    const currentId = getActiveProfileId();

    // 1. Snapshot current working state into current profile slot
    const currentSnapshot = {
      accounts: getItem(KEYS.ACCOUNTS, []),
      budgets: getItem(KEYS.BUDGETS, []),
      investments: getItem(KEYS.INVESTMENTS, []),
      netWorthHistory: getItem(KEYS.NETWORTH_HISTORY, []),
      settings: getItem(KEYS.SETTINGS, null),
      transactions: getItem(KEYS.TRANSACTIONS, []),
    };
    localStorage.setItem(`ledger_profile_${currentId}`, JSON.stringify(currentSnapshot));

    // 2. Load target profile data: either previously modified snapshot or fresh seed
    let targetData = null;
    try {
      const saved = localStorage.getItem(`ledger_profile_${targetId}`);
      if (saved) targetData = JSON.parse(saved);
    } catch {
      targetData = null;
    }

    const profileSeed = DEMO_PROFILES[targetId];
    setItem(KEYS.ACCOUNTS, targetData?.accounts || profileSeed.accounts);
    setItem(KEYS.BUDGETS, targetData?.budgets || profileSeed.budgets);
    setItem(KEYS.INVESTMENTS, targetData?.investments || profileSeed.investments);
    setItem(KEYS.NETWORTH_HISTORY, targetData?.netWorthHistory || profileSeed.netWorthHistory);
    setItem(KEYS.SETTINGS, targetData?.settings || profileSeed.settings);
    setItem(KEYS.TRANSACTIONS, targetData?.transactions || profileSeed.transactions);

    localStorage.setItem(KEYS.ACTIVE_PROFILE, targetId);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));

    notifyDataUpdated();
    notifySettingsUpdated();
    return true;
  } catch (err) {
    console.error('Failed to switch demo profile:', err);
    return false;
  }
}

/**
 * Reset a demo profile back to its clean student seed dataset.
 */
export function resetDemoProfile(profileId) {
  const id = profileId || getActiveProfileId();
  if (!DEMO_PROFILES[id]) return false;
  try {
    localStorage.removeItem(`ledger_profile_${id}`);
    const target = DEMO_PROFILES[id];
    if (id === getActiveProfileId()) {
      setItem(KEYS.ACCOUNTS, target.accounts);
      setItem(KEYS.BUDGETS, target.budgets);
      setItem(KEYS.INVESTMENTS, target.investments);
      setItem(KEYS.NETWORTH_HISTORY, target.netWorthHistory);
      setItem(KEYS.SETTINGS, target.settings);
      setItem(KEYS.TRANSACTIONS, target.transactions);
      notifyDataUpdated();
      notifySettingsUpdated();
    }
    return true;
  } catch (err) {
    console.error('Failed to reset profile:', err);
    return false;
  }
}

// Ensure init is run when module is imported (browser only).
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  initStorage();
}

/* ── Validation (import path is strict; save path is permissive) ── */

function isValidISODate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

function validateTransaction(tx, { strict = false } = {}) {
  const errors = [];
  if (!isPlainObject(tx)) return ['Transaction must be an object'];
  if (tx.id != null && typeof tx.id !== 'string') errors.push('Transaction.id must be a string');
  if (!TRANSACTION_TYPES.includes(tx.type))
    errors.push(`Transaction.type must be one of ${TRANSACTION_TYPES.join(', ')}`);
  if (typeof tx.amount !== 'number' || !Number.isFinite(tx.amount) || tx.amount < 0) {
    errors.push('Transaction.amount must be a finite number >= 0');
  }
  if (strict) {
    if (!tx.date || !isValidISODate(String(tx.date)))
      errors.push('Transaction.date must be an ISO date string');
    if (tx.type === 'transfer' && !tx.toAccountId) errors.push('Transfer requires toAccountId');
  }
  return errors;
}

function validateAccount(acc) {
  const errors = [];
  if (!isPlainObject(acc)) return ['Account must be an object'];
  if (acc.id != null && typeof acc.id !== 'string') errors.push('Account.id must be a string');
  if (!acc.name || typeof acc.name !== 'string') errors.push('Account.name is required');
  if (acc.type && !ACCOUNT_TYPES.includes(acc.type) && acc.type !== 'credit') {
    errors.push(`Account.type must be one of ${[...ACCOUNT_TYPES, 'credit'].join(', ')}`);
  }
  if (acc.balance != null && (typeof acc.balance !== 'number' || !Number.isFinite(acc.balance))) {
    errors.push('Account.balance must be a finite number');
  }
  return errors;
}

function validateBudget(b) {
  const errors = [];
  if (!isPlainObject(b)) return ['Budget must be an object'];
  if (!b.category || typeof b.category !== 'string') errors.push('Budget.category is required');
  if (typeof b.limit !== 'number' || !Number.isFinite(b.limit) || b.limit < 0) {
    errors.push('Budget.limit must be a finite number >= 0');
  }
  return errors;
}

function validateInvestment(inv) {
  const errors = [];
  if (!isPlainObject(inv)) return ['Investment must be an object'];
  if (!inv.name || typeof inv.name !== 'string') errors.push('Investment.name is required');
  for (const k of ['units', 'avgPrice', 'currentPrice']) {
    if (inv[k] != null && (typeof inv[k] !== 'number' || !Number.isFinite(inv[k]) || inv[k] < 0)) {
      errors.push(`Investment.${k} must be a finite number >= 0`);
    }
  }
  return errors;
}

/**
 * Validate a full backup payload before overwriting anything.
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateBackup(data) {
  const errors = [];
  if (!isPlainObject(data)) return { ok: false, errors: ['Backup must be a JSON object'] };
  const checkArray = (key, validator) => {
    if (data[key] === undefined) return; // optional — import merges only present keys
    if (!Array.isArray(data[key])) {
      errors.push(`${key} must be an array`);
      return;
    }
    data[key].forEach((item, i) => {
      const itemErrors = validator(item, { strict: false });
      itemErrors.forEach((e) => errors.push(`${key}[${i}]: ${e}`));
    });
  };
  checkArray('transactions', validateTransaction);
  checkArray('accounts', validateAccount);
  checkArray('budgets', validateBudget);
  checkArray('investments', validateInvestment);
  if (data.netWorthHistory !== undefined && !Array.isArray(data.netWorthHistory)) {
    errors.push('netWorthHistory must be an array');
  }
  if (data.settings !== undefined && !isPlainObject(data.settings)) {
    errors.push('settings must be an object');
  }
  return { ok: errors.length === 0, errors };
}

// ==========================================
// TRANSACTIONS
// ==========================================

export function getTransactions() {
  return getItem(KEYS.TRANSACTIONS, []);
}

function normalizeTransaction(input) {
  return {
    ...input,
    id: input.id || generateId('tx'),
    amount: Number(input.amount) || 0,
    date: input.date || new Date().toISOString().split('T')[0],
  };
}

export function saveTransaction(transaction) {
  const newTx = normalizeTransaction(transaction);
  const transactions = getTransactions();
  const updated = [newTx, ...transactions];
  setItem(KEYS.TRANSACTIONS, updated);

  applyTransactionToAccounts(newTx, 'add');
  notifyDataUpdated();
  return newTx;
}

/**
 * Update a transaction. Supports both signatures:
 *   updateTransaction(updatedTx)        (current callers)
 *   updateTransaction(id, patch)        (documented API)
 */
export function updateTransaction(idOrTx, patch) {
  let updatedTx;
  if (typeof idOrTx === 'string') {
    updatedTx = { ...(patch || {}), id: idOrTx };
  } else {
    updatedTx = idOrTx;
  }
  if (!updatedTx || !updatedTx.id) throw new Error('updateTransaction requires an id');

  const transactions = getTransactions();
  const existingIndex = transactions.findIndex((t) => t.id === updatedTx.id);

  if (existingIndex === -1) {
    return saveTransaction(updatedTx);
  }

  const oldTx = transactions[existingIndex];
  const merged = {
    ...oldTx,
    ...updatedTx,
    amount: Number(updatedTx.amount ?? oldTx.amount) || 0,
  };

  // Atomic balance fix: revert old, apply new, single accounts write.
  revertAndApplyTransactionBalance(oldTx, merged);

  transactions[existingIndex] = merged;
  setItem(KEYS.TRANSACTIONS, transactions);
  notifyDataUpdated();
  return merged;
}

export function deleteTransaction(id) {
  const transactions = getTransactions();
  const txToDelete = transactions.find((t) => t.id === id);

  const updated = transactions.filter((t) => t.id !== id);
  setItem(KEYS.TRANSACTIONS, updated);

  if (txToDelete) {
    applyTransactionToAccounts(txToDelete, 'revert');
  }
  notifyDataUpdated();
  return true;
}

/**
 * Compute the balance delta for a transaction on a given account.
 * Transfers move money between accounts and are excluded from
 * income/expense totals elsewhere.
 */
function deltaForAccount(tx, accountId) {
  const amount = Number(tx.amount) || 0;
  const acc = getAccounts().find((a) => a.id === accountId);
  // Fallback if account missing: assume asset semantics.
  const accType = acc ? acc.type : 'savings';

  if (tx.type === 'expense') {
    return accType === 'credit' ? amount : -amount;
  }
  if (tx.type === 'income') {
    return accType === 'credit' ? -amount : amount;
  }
  if (tx.type === 'transfer') {
    if (tx.accountId === accountId) return -amount;
    if (tx.toAccountId === accountId) return accType === 'credit' ? -amount : amount;
    return 0;
  }
  return 0;
}

function writeAccounts(accounts) {
  setItem(KEYS.ACCOUNTS, accounts);
}

function applyTransactionToAccounts(tx, mode = 'add') {
  const sign = mode === 'revert' ? -1 : 1;
  const accounts = getAccounts();
  let touched = false;

  const applyDelta = (accountId, delta) => {
    if (!accountId || !delta) return;
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx === -1) return;
    const acc = accounts[idx];
    // NOTE: no Math.max(0, ...) clamp — overdrafts/credit must stay truthful.
    accounts[idx] = { ...acc, balance: Number(acc.balance || 0) + sign * delta };
    touched = true;
  };

  if (tx.type === 'transfer') {
    applyDelta(tx.accountId, deltaForAccount(tx, tx.accountId));
    applyDelta(tx.toAccountId, deltaForAccount(tx, tx.toAccountId));
  } else if (tx.accountId) {
    applyDelta(tx.accountId, deltaForAccount(tx, tx.accountId));
  }

  if (touched) writeAccounts(accounts);
}

function revertAndApplyTransactionBalance(oldTx, newTx) {
  const accounts = getAccounts();
  let touched = false;
  const adjust = (accountId, delta) => {
    if (!accountId || !delta) return;
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx === -1) return;
    accounts[idx] = { ...accounts[idx], balance: Number(accounts[idx].balance || 0) + delta };
    touched = true;
  };

  const collect = (tx, sign) => {
    if (tx.type === 'transfer') {
      // sign=+1 means "apply", -1 means "revert"
      if (tx.accountId) adjust(tx.accountId, sign * deltaForAccount(tx, tx.accountId));
      if (tx.toAccountId) adjust(tx.toAccountId, sign * deltaForAccount(tx, tx.toAccountId));
    } else if (tx.accountId) {
      adjust(tx.accountId, sign * deltaForAccount(tx, tx.accountId));
    }
  };

  // deltaForAccount reads accounts from storage; compute deltas BEFORE mutating.
  const oldDeltas = [];
  const newDeltas = [];
  const snapshotDelta = (tx, arr) => {
    if (tx.type === 'transfer') {
      if (tx.accountId) arr.push([tx.accountId, deltaForAccount(tx, tx.accountId)]);
      if (tx.toAccountId) arr.push([tx.toAccountId, deltaForAccount(tx, tx.toAccountId)]);
    } else if (tx.accountId) {
      arr.push([tx.accountId, deltaForAccount(tx, tx.accountId)]);
    }
  };
  snapshotDelta(oldTx, oldDeltas);
  snapshotDelta(newTx, newDeltas);

  // Revert old, apply new — directly on the in-memory copy.
  oldDeltas.forEach(([id, d]) => {
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], balance: Number(accounts[idx].balance || 0) - d };
      touched = true;
    }
  });
  newDeltas.forEach(([id, d]) => {
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], balance: Number(accounts[idx].balance || 0) + d };
      touched = true;
    }
  });

  // Keep helper referenced for future direct use (avoids dead-code drift).
  void collect;

  if (touched) writeAccounts(accounts);
}

// Backward-compat alias (previous internal name).
function updateAccountBalanceForTx(tx, mode = 'add') {
  applyTransactionToAccounts(tx, mode);
}
export { updateAccountBalanceForTx };

// ==========================================
// ACCOUNTS
// ==========================================

export function getAccounts() {
  return getItem(KEYS.ACCOUNTS, []);
}

export function saveAccount(account) {
  const accounts = getAccounts();
  const newAcc = {
    ...account,
    id: account.id || generateId('acc'),
    balance: Number(account.balance) || 0,
  };

  const updated = [...accounts, newAcc];
  setItem(KEYS.ACCOUNTS, updated);
  notifyDataUpdated();
  return newAcc;
}

export function updateAccount(idOrAcc, patch) {
  const updatedAccount = typeof idOrAcc === 'string' ? { ...(patch || {}), id: idOrAcc } : idOrAcc;
  const accounts = getAccounts();
  const index = accounts.findIndex((a) => a.id === updatedAccount.id);

  if (index === -1) return saveAccount(updatedAccount);

  accounts[index] = {
    ...accounts[index],
    ...updatedAccount,
    balance: Number(updatedAccount.balance ?? accounts[index].balance) || 0,
  };

  setItem(KEYS.ACCOUNTS, accounts);
  notifyDataUpdated();
  return accounts[index];
}

/** How many transactions reference an account (as source or transfer target). */
export function getAccountUsage(accountId) {
  const txs = getTransactions();
  const count = txs.filter((t) => t.accountId === accountId || t.toAccountId === accountId).length;
  return { count, hasTransactions: count > 0 };
}

/** Reassign all transactions from one account to another. Returns moved count. */
export function reassignTransactions(fromAccountId, toAccountId) {
  if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) return 0;
  const txs = getTransactions();
  let moved = 0;
  const updated = txs.map((t) => {
    let changed = false;
    const next = { ...t };
    if (t.accountId === fromAccountId) {
      next.accountId = toAccountId;
      changed = true;
    }
    if (t.toAccountId === fromAccountId) {
      next.toAccountId = toAccountId;
      changed = true;
    }
    if (changed) moved += 1;
    return next;
  });
  if (moved > 0) {
    setItem(KEYS.TRANSACTIONS, updated);
    notifyDataUpdated();
  }
  return moved;
}

export function deleteAccount(id, options = {}) {
  const { reassignTo = null } = options;
  const usage = getAccountUsage(id);
  if (usage.hasTransactions && !reassignTo) {
    const err = new Error(
      `Account is used by ${usage.count} transaction(s). Reassign or delete those transactions first.`
    );
    err.code = 'ACCOUNT_IN_USE';
    err.count = usage.count;
    throw err;
  }
  if (reassignTo) {
    reassignTransactions(id, reassignTo);
  }
  const accounts = getAccounts();
  const updated = accounts.filter((a) => a.id !== id);
  setItem(KEYS.ACCOUNTS, updated);
  notifyDataUpdated();
  return true;
}

// ==========================================
// BUDGETS
// ==========================================

export function getBudgets() {
  return getItem(KEYS.BUDGETS, []);
}

export function saveBudget(budget) {
  const budgets = getBudgets();
  const newBudget = {
    ...budget,
    id: budget.id || generateId('bud'),
    limit: Number(budget.limit) || 0,
  };

  const updated = [...budgets, newBudget];
  setItem(KEYS.BUDGETS, updated);
  notifyDataUpdated();
  return newBudget;
}

export function updateBudget(idOrBudget, patch) {
  const updatedBudget = typeof idOrBudget === 'string' ? { ...(patch || {}), id: idOrBudget } : idOrBudget;
  const budgets = getBudgets();
  const index = budgets.findIndex((b) => b.id === updatedBudget.id);

  if (index === -1) return saveBudget(updatedBudget);

  budgets[index] = {
    ...budgets[index],
    ...updatedBudget,
    limit: Number(updatedBudget.limit ?? budgets[index].limit) || 0,
  };

  setItem(KEYS.BUDGETS, budgets);
  notifyDataUpdated();
  return budgets[index];
}

export function deleteBudget(id) {
  const budgets = getBudgets();
  const updated = budgets.filter((b) => b.id !== id);
  setItem(KEYS.BUDGETS, updated);
  notifyDataUpdated();
  return true;
}

// ==========================================
// INVESTMENTS
// ==========================================

export function getInvestments() {
  return getItem(KEYS.INVESTMENTS, []);
}

export function saveInvestment(investment) {
  const investments = getInvestments();
  const units = Number(investment.units) || 0;
  const avgPrice = Number(investment.avgPrice) || 0;
  const currentPrice = Number(investment.currentPrice) || avgPrice;

  const newInv = {
    ...investment,
    id: investment.id || generateId('inv'),
    units,
    avgPrice,
    currentPrice,
    investedValue: units * avgPrice,
    currentValue: units * currentPrice,
  };

  const updated = [...investments, newInv];
  setItem(KEYS.INVESTMENTS, updated);
  notifyDataUpdated();
  return newInv;
}

export function updateInvestment(idOrInv, patch) {
  const updatedInvestment = typeof idOrInv === 'string' ? { ...(patch || {}), id: idOrInv } : idOrInv;
  const investments = getInvestments();
  const index = investments.findIndex((i) => i.id === updatedInvestment.id);

  if (index === -1) return saveInvestment(updatedInvestment);

  const merged = { ...investments[index], ...updatedInvestment };
  const units = Number(merged.units) || 0;
  const avgPrice = Number(merged.avgPrice) || 0;
  const currentPrice = Number(merged.currentPrice) || avgPrice;

  investments[index] = {
    ...merged,
    units,
    avgPrice,
    currentPrice,
    investedValue: units * avgPrice,
    currentValue: units * currentPrice,
  };

  setItem(KEYS.INVESTMENTS, investments);
  notifyDataUpdated();
  return investments[index];
}

export function deleteInvestment(id) {
  const investments = getInvestments();
  const updated = investments.filter((i) => i.id !== id);
  setItem(KEYS.INVESTMENTS, updated);
  notifyDataUpdated();
  return true;
}

// ==========================================
// SETTINGS
// ==========================================

export function getSettings() {
  const stored = getItem(KEYS.SETTINGS, null);
  // Merge over defaults so new keys backfill safely.
  return { ...INITIAL_SETTINGS, ...(stored || {}) };
}

export function saveSettings(newSettings) {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  setItem(KEYS.SETTINGS, updated);
  notifySettingsUpdated();
  return updated;
}

// ==========================================
// NET WORTH HISTORY
// ==========================================

export function getNetWorthHistory() {
  return getItem(KEYS.NETWORTH_HISTORY, []);
}

export function saveNetWorthHistory(historyArray) {
  if (!Array.isArray(historyArray)) throw new Error('Net worth history must be an array');
  setItem(KEYS.NETWORTH_HISTORY, historyArray);
  notifyDataUpdated();
  return historyArray;
}

/** Append (or replace) the snapshot for a monthKey, e.g. '2026-09'. */
export function saveNetWorthSnapshot({ monthKey, assets, liabilities, netWorth, label } = {}) {
  if (!monthKey) throw new Error('monthKey is required');
  const history = getNetWorthHistory();
  const idx = history.findIndex((h) => h.monthKey === monthKey);
  const entry = {
    monthKey,
    label: label || monthKey,
    shortLabel: (label || monthKey).slice(0, 3),
    assets: Number(assets) || 0,
    liabilities: Number(liabilities) || 0,
    netWorth: Number(netWorth) || 0,
  };
  if (idx === -1) history.push(entry);
  else history[idx] = { ...history[idx], ...entry };
  history.sort((a, b) => String(a.monthKey).localeCompare(String(b.monthKey)));
  setItem(KEYS.NETWORTH_HISTORY, history);
  notifyDataUpdated();
  return entry;
}

// ==========================================
// BACKUP / EXPORT / IMPORT / RESET
// ==========================================

export function exportAllData() {
  const backup = {
    version: String(SCHEMA_VERSION),
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    transactions: getTransactions(),
    accounts: getAccounts(),
    budgets: getBudgets(),
    investments: getInvestments(),
    settings: getSettings(),
    netWorthHistory: getNetWorthHistory(),
  };
  return JSON.stringify(backup, null, 2);
}

/** Trigger a real file download (Blob — safe for large datasets). */
export function downloadBackup(filename) {
  const dataStr = exportAllData();
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const name = filename || `ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

/** Snapshot current state so an import can be undone. Returns the backup name. */
export function createPreImportBackup() {
  try {
    return downloadBackup(`ledger_backup_pre_import_${new Date().toISOString().split('T')[0]}.json`);
  } catch {
    return null;
  }
}

export function importData(jsonString) {
  let data;
  try {
    data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch {
    const err = new Error('Invalid JSON: file could not be parsed');
    err.code = 'INVALID_JSON';
    throw err;
  }
  const { ok, errors } = validateBackup(data);
  if (!ok) {
    const err = new Error(
      `Invalid backup: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (+${errors.length - 3} more)` : ''}`
    );
    err.code = 'INVALID_BACKUP';
    err.details = errors;
    throw err;
  }

  if (Array.isArray(data.transactions)) setItem(KEYS.TRANSACTIONS, data.transactions);
  if (Array.isArray(data.accounts)) setItem(KEYS.ACCOUNTS, data.accounts);
  if (Array.isArray(data.budgets)) setItem(KEYS.BUDGETS, data.budgets);
  if (Array.isArray(data.investments)) setItem(KEYS.INVESTMENTS, data.investments);
  if (Array.isArray(data.netWorthHistory)) setItem(KEYS.NETWORTH_HISTORY, data.netWorthHistory);
  if (data.settings && typeof data.settings === 'object')
    setItem(KEYS.SETTINGS, { ...INITIAL_SETTINGS, ...data.settings });

  notifyDataUpdated();
  notifySettingsUpdated();
  return true;
}

/**
 * Reset to demo seed data (previous `clearAllData` behaviour).
 * Kept for backward compat — prefer resetToDemo() / eraseAllData() explicitly.
 */
export function clearAllData() {
  return resetToDemo();
}

/** Wipe keys then re-seed demo data. */
export function resetToDemo() {
  try {
    const activeId = getActiveProfileId();
    localStorage.removeItem(`ledger_profile_${activeId}`);
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.ACCOUNTS);
    localStorage.removeItem(KEYS.BUDGETS);
    localStorage.removeItem(KEYS.INVESTMENTS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.NETWORTH_HISTORY);
    localStorage.removeItem(KEYS.INITIALIZED);
    localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));

    initStorage();
    notifyDataUpdated();
    notifySettingsUpdated();
    return true;
  } catch (err) {
    console.error('Failed to reset data:', err);
    return false;
  }
}

/** Truly erase everything — no re-seed. App shows empty states. */
export function eraseAllData() {
  try {
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.ACCOUNTS);
    localStorage.removeItem(KEYS.BUDGETS);
    localStorage.removeItem(KEYS.INVESTMENTS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.NETWORTH_HISTORY);
    localStorage.removeItem(KEYS.INITIALIZED);
    localStorage.removeItem(KEYS.ACTIVE_PROFILE);
    Object.keys(DEMO_PROFILES).forEach((k) => localStorage.removeItem(`ledger_profile_${k}`));
    localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
    setItem(KEYS.TRANSACTIONS, []);
    setItem(KEYS.ACCOUNTS, []);
    setItem(KEYS.BUDGETS, []);
    setItem(KEYS.INVESTMENTS, []);
    setItem(KEYS.NETWORTH_HISTORY, []);
    setItem(KEYS.SETTINGS, { ...INITIAL_SETTINGS, userName: 'User', email: '' });
    notifyDataUpdated();
    notifySettingsUpdated();
    return true;
  } catch (err) {
    console.error('Failed to erase data:', err);
    return false;
  }
}
