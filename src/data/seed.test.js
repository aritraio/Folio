import { describe, it, expect } from 'vitest';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_INVESTMENTS,
  INITIAL_NETWORTH_HISTORY,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from './mockData.js';
import { calcNetWorth, calcTotalAssets, calcTotalLiabilities } from '../utils/calculations.js';
import { DEFAULT_CATEGORIES, ACCOUNT_TYPES, TRANSACTION_TYPES } from '../constants/finance.js';

describe('Demo Seed Data Integrity (Average Indian Demographic Profile)', () => {
  describe('Accounts', () => {
    it('contains valid, recognized account types', () => {
      expect(INITIAL_ACCOUNTS.length).toBeGreaterThanOrEqual(4);
      INITIAL_ACCOUNTS.forEach((acc) => {
        expect(ACCOUNT_TYPES).toContain(acc.type);
        expect(typeof acc.balance).toBe('number');
        expect(acc.name).toBeTruthy();
      });
    });

    it('calculates a realistic middle-class Indian net worth (~₹3.5L–₹4.5L)', () => {
      const netWorth = calcNetWorth(INITIAL_ACCOUNTS);
      const totalAssets = calcTotalAssets(INITIAL_ACCOUNTS);
      const totalLiabilities = calcTotalLiabilities(INITIAL_ACCOUNTS);

      expect(totalAssets).toBeGreaterThan(350000);
      expect(totalLiabilities).toBeGreaterThan(0);
      expect(netWorth).toBeGreaterThan(350000);
      expect(netWorth).toBeLessThan(550000);
    });

    it('has exactly one primary account', () => {
      const primaryAccounts = INITIAL_ACCOUNTS.filter((a) => a.isPrimary);
      expect(primaryAccounts.length).toBe(1);
    });
  });

  describe('Budgets', () => {
    it('uses valid categories matching system defaults', () => {
      INITIAL_BUDGETS.forEach((b) => {
        expect(DEFAULT_CATEGORIES).toContain(b.category);
        expect(b.limit).toBeGreaterThan(0);
      });
    });

    it('has a total monthly budget aligned with settings budget cap', () => {
      const totalBudget = INITIAL_BUDGETS.reduce((sum, b) => sum + b.limit, 0);
      expect(totalBudget).toBeLessThanOrEqual(INITIAL_SETTINGS.monthlyBudgetCap);
    });
  });

  describe('Investments', () => {
    it('contains multi-asset Indian portfolio (Mutual Funds, EPF, Gold, Stocks)', () => {
      const categories = INITIAL_INVESTMENTS.map((i) => i.category);
      expect(categories).toContain('Mutual Fund');
      expect(categories).toContain('Provident Fund');
      expect(categories).toContain('Gold');
      expect(categories).toContain('Stocks');

      INITIAL_INVESTMENTS.forEach((inv) => {
        expect(inv.investedValue).toBeGreaterThan(0);
        expect(inv.currentValue).toBeGreaterThan(0);
      });
    });
  });

  describe('Net Worth History', () => {
    it('satisfies invariant assets - liabilities === netWorth for every monthly snapshot', () => {
      INITIAL_NETWORTH_HISTORY.forEach((snapshot) => {
        expect(snapshot.assets - snapshot.liabilities).toBe(snapshot.netWorth);
      });
    });

    it('is ordered chronologically over 13 months', () => {
      expect(INITIAL_NETWORTH_HISTORY.length).toBe(13);
      for (let i = 1; i < INITIAL_NETWORTH_HISTORY.length; i++) {
        expect(INITIAL_NETWORTH_HISTORY[i].monthKey > INITIAL_NETWORTH_HISTORY[i - 1].monthKey).toBe(true);
      }
    });
  });

  describe('Transactions', () => {
    const accountIds = new Set(INITIAL_ACCOUNTS.map((a) => a.id));

    it('all transactions reference valid accounts and conform to schemas', () => {
      expect(INITIAL_TRANSACTIONS.length).toBeGreaterThan(80);

      INITIAL_TRANSACTIONS.forEach((tx) => {
        expect(TRANSACTION_TYPES).toContain(tx.type);
        expect(tx.amount).toBeGreaterThan(0);
        expect(accountIds.has(tx.accountId)).toBe(true);
        expect(/^\d{4}-\d{2}-\d{2}$/.test(tx.date)).toBe(true);

        if (tx.type === 'transfer') {
          expect(tx.toAccountId).toBeDefined();
          expect(accountIds.has(tx.toAccountId)).toBe(true);
          expect(tx.toAccountId).not.toBe(tx.accountId);
        } else {
          expect(DEFAULT_CATEGORIES).toContain(tx.category);
        }
      });
    });
  });
});
