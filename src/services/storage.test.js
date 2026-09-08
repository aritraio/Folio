import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  saveAccount,
  deleteAccount,
  getAccountUsage,
  reassignTransactions,
  importData,
  exportAllData,
  validateBackup,
  eraseAllData,
} from '../services/storage.js';

beforeEach(() => {
  localStorage.clear();
  eraseAllData();
});

describe('transactions + balances', () => {
  it('expense reduces asset balance (no clamp to zero)', () => {
    const acc = saveAccount({ name: 'Test Savings', type: 'savings', balance: 1000 });
    saveTransaction({
      type: 'expense',
      amount: 1500,
      accountId: acc.id,
      date: '2026-09-01',
      category: 'Other',
    });
    const updated = getAccounts().find((a) => a.id === acc.id);
    expect(updated.balance).toBe(-500); // truthful overdraft, not clamped
  });

  it('credit expense increases outstanding', () => {
    const acc = saveAccount({ name: 'Card', type: 'credit', balance: 1000 });
    saveTransaction({
      type: 'expense',
      amount: 500,
      accountId: acc.id,
      date: '2026-09-01',
      category: 'Other',
    });
    expect(getAccounts().find((a) => a.id === acc.id).balance).toBe(1500);
  });

  it('transfer moves between accounts and is balance-neutral overall', () => {
    const from = saveAccount({ name: 'From', type: 'savings', balance: 5000 });
    const to = saveAccount({ name: 'To', type: 'savings', balance: 1000 });
    saveTransaction({
      type: 'transfer',
      amount: 2000,
      accountId: from.id,
      toAccountId: to.id,
      date: '2026-09-01',
    });
    const accounts = getAccounts();
    expect(accounts.find((a) => a.id === from.id).balance).toBe(3000);
    expect(accounts.find((a) => a.id === to.id).balance).toBe(3000);
  });

  it('update is atomic when moving accounts', () => {
    const a = saveAccount({ name: 'A', type: 'savings', balance: 10000 });
    const b = saveAccount({ name: 'B', type: 'savings', balance: 10000 });
    const tx = saveTransaction({
      type: 'expense',
      amount: 1000,
      accountId: a.id,
      date: '2026-09-01',
      category: 'Other',
    });
    updateTransaction({ ...tx, accountId: b.id });
    const accounts = getAccounts();
    expect(accounts.find((x) => x.id === a.id).balance).toBe(10000);
    expect(accounts.find((x) => x.id === b.id).balance).toBe(9000);
  });

  it('delete reverts balance', () => {
    const acc = saveAccount({ name: 'A', type: 'savings', balance: 5000 });
    const tx = saveTransaction({
      type: 'income',
      amount: 2000,
      accountId: acc.id,
      date: '2026-09-01',
      category: 'Salary',
    });
    deleteTransaction(tx.id);
    expect(getAccounts().find((a) => a.id === acc.id).balance).toBe(5000);
  });

  it('generates unique ids', () => {
    const a = saveTransaction({ type: 'expense', amount: 1, accountId: 'x', date: '2026-09-01' });
    const b = saveTransaction({ type: 'expense', amount: 1, accountId: 'x', date: '2026-09-01' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('account guards', () => {
  it('blocks delete when transactions exist', () => {
    const acc = saveAccount({ name: 'A', type: 'savings', balance: 1000 });
    saveTransaction({ type: 'expense', amount: 10, accountId: acc.id, date: '2026-09-01' });
    expect(getAccountUsage(acc.id).hasTransactions).toBe(true);
    expect(() => deleteAccount(acc.id)).toThrow(/used by 1 transaction/);
  });

  it('reassign moves transactions then deletes', () => {
    const a = saveAccount({ name: 'A', type: 'savings', balance: 0 });
    const b = saveAccount({ name: 'B', type: 'savings', balance: 0 });
    saveTransaction({ type: 'expense', amount: 10, accountId: a.id, date: '2026-09-01' });
    expect(reassignTransactions(a.id, b.id)).toBe(1);
    expect(getTransactions()[0].accountId).toBe(b.id);
    expect(() => deleteAccount(a.id)).not.toThrow();
  });
});

describe('backup validation', () => {
  it('rejects non-object and bad arrays', () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup({ transactions: 'nope' }).ok).toBe(false);
  });
  it('rejects negative/invalid amounts', () => {
    const bad = { transactions: [{ id: 'x', type: 'expense', amount: -5 }] };
    const res = validateBackup(bad);
    expect(res.ok).toBe(false);
    expect(() => importData(JSON.stringify(bad))).toThrow(/Invalid backup/);
  });
  it('round-trips export/import', () => {
    const acc = saveAccount({ name: 'A', type: 'savings', balance: 100 });
    saveTransaction({
      type: 'income',
      amount: 50,
      accountId: acc.id,
      date: '2026-09-01',
      category: 'Salary',
    });
    const json = exportAllData();
    eraseAllData();
    expect(getTransactions()).toHaveLength(0);
    expect(importData(json)).toBe(true);
    expect(getTransactions()).toHaveLength(1);
  });
});
