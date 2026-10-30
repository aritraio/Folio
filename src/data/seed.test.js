import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEMO_PROFILES,
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_INVESTMENTS,
  INITIAL_NETWORTH_HISTORY,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from './mockData.js';
import { calcNetWorth, calcTotalAssets, calcTotalLiabilities } from '../utils/calculations.js';
import { DEFAULT_CATEGORIES, ACCOUNT_TYPES, TRANSACTION_TYPES } from '../constants/finance.js';
import {
  getActiveProfileId,
  getActiveProfileMetadata,
  getDemoProfilesList,
  switchDemoProfile,
  resetDemoProfile,
  initStorage,
  getAccounts,
  getSettings,
  getTransactions,
} from '../services/storage.js';

describe('Demo Seed Data Integrity (Indian Student Profiles: Sagnik, Sourav, Ankita)', () => {
  describe('Default Student Profile (Sagnik)', () => {
    it('contains valid, recognized account types', () => {
      expect(INITIAL_ACCOUNTS.length).toBeGreaterThanOrEqual(4);
      INITIAL_ACCOUNTS.forEach((acc) => {
        expect(ACCOUNT_TYPES).toContain(acc.type);
        expect(typeof acc.balance).toBe('number');
        expect(acc.name).toBeTruthy();
      });
    });

    it('calculates a realistic Indian student net worth in ₹10,000–₹15,000 range', () => {
      const netWorth = calcNetWorth(INITIAL_ACCOUNTS);
      const totalAssets = calcTotalAssets(INITIAL_ACCOUNTS);
      const totalLiabilities = calcTotalLiabilities(INITIAL_ACCOUNTS);

      expect(totalAssets).toBeGreaterThan(10000);
      expect(totalAssets).toBeLessThan(16000);
      expect(totalLiabilities).toBeGreaterThanOrEqual(0);
      expect(netWorth).toBeGreaterThanOrEqual(10000);
      expect(netWorth).toBeLessThanOrEqual(15000);
    });

    it('has exactly one primary account', () => {
      const primaryAccounts = INITIAL_ACCOUNTS.filter((a) => a.isPrimary);
      expect(primaryAccounts.length).toBe(1);
    });

    it('has a total monthly budget aligned with settings budget cap', () => {
      const totalBudget = INITIAL_BUDGETS.reduce((sum, b) => sum + b.limit, 0);
      expect(totalBudget).toBeLessThanOrEqual(INITIAL_SETTINGS.monthlyBudgetCap);
    });

    it('contains student micro-investments with valid pricing', () => {
      expect(INITIAL_INVESTMENTS.length).toBeGreaterThan(0);
      INITIAL_INVESTMENTS.forEach((inv) => {
        expect(inv.investedValue).toBeGreaterThan(0);
        expect(inv.currentValue).toBeGreaterThan(0);
      });
    });

    it('net worth history satisfies assets - liabilities === netWorth for every snapshot', () => {
      INITIAL_NETWORTH_HISTORY.forEach((snapshot) => {
        expect(snapshot.assets - snapshot.liabilities).toBe(snapshot.netWorth);
      });
      expect(INITIAL_NETWORTH_HISTORY.length).toBe(13);
    });

    it('transactions reference valid accounts and conform to schemas', () => {
      const accountIds = new Set(INITIAL_ACCOUNTS.map((a) => a.id));
      expect(INITIAL_TRANSACTIONS.length).toBeGreaterThan(30);

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

  describe('Multi-Profile Suite: Sagnik, Sourav, Ankita', () => {
    const profileKeys = ['sagnik', 'sourav', 'ankita'];

    it('provides all three student demo profiles', () => {
      expect(Object.keys(DEMO_PROFILES)).toEqual(profileKeys);
      profileKeys.forEach((key) => {
        const profile = DEMO_PROFILES[key];
        expect(profile.metadata.name).toBeDefined();
        expect(profile.accounts.length).toBeGreaterThanOrEqual(4);
        expect(profile.budgets.length).toBeGreaterThanOrEqual(5);
        expect(profile.transactions.length).toBeGreaterThanOrEqual(30);
      });
    });

    it('every profile keeps total net worth within student range (₹10,000–₹15,000)', () => {
      profileKeys.forEach((key) => {
        const profile = DEMO_PROFILES[key];
        const netWorth = calcNetWorth(profile.accounts);
        expect(netWorth).toBeGreaterThanOrEqual(10000);
        expect(netWorth).toBeLessThanOrEqual(15000);
      });
    });

    it('includes authentic Indian student spending patterns (samosas, chai, Zepto, Zomato/Swiggy)', () => {
      profileKeys.forEach((key) => {
        const profile = DEMO_PROFILES[key];
        const merchantsAndNotes = profile.transactions
          .map((t) => `${t.merchant} ${t.notes || ''}`.toLowerCase())
          .join(' ');

        expect(merchantsAndNotes).toMatch(/samosa/i);
        expect(merchantsAndNotes).toMatch(/chai|tea/i);
        expect(merchantsAndNotes).toMatch(/zepto/i);
        expect(merchantsAndNotes).toMatch(/zomato|swiggy/i);
      });
    });
  });

  describe('Profile Switching & Management', () => {
    beforeEach(() => {
      localStorage.clear();
      initStorage();
    });

    it('returns default active profile as sagnik', () => {
      expect(getActiveProfileId()).toBe('sagnik');
      const meta = getActiveProfileMetadata();
      expect(meta.name).toBe('Sagnik');
    });

    it('lists all 3 demo profiles with student metadata', () => {
      const list = getDemoProfilesList();
      expect(list.length).toBe(3);
      expect(list.map((p) => p.name)).toEqual(['Sagnik', 'Sourav', 'Ankita']);
    });

    it('switches to Sourav cleanly and updates active profile ID and dataset', () => {
      const result = switchDemoProfile('sourav');
      expect(result).toBe(true);
      expect(getActiveProfileId()).toBe('sourav');
      const meta = getActiveProfileMetadata();
      expect(meta.name).toBe('Sourav');
      expect(getSettings().userName).toBe('Sourav');
      const primaryAcc = getAccounts().find((a) => a.isPrimary);
      expect(primaryAcc.name).toContain('PNB Student Account');
      expect(getTransactions().length).toBeGreaterThanOrEqual(30);
    });

    it('switches to Ankita cleanly and updates active profile ID and dataset', () => {
      const result = switchDemoProfile('ankita');
      expect(result).toBe(true);
      expect(getActiveProfileId()).toBe('ankita');
      const meta = getActiveProfileMetadata();
      expect(meta.name).toBe('Ankita');
      expect(getSettings().userName).toBe('Ankita');
      const primaryAcc = getAccounts().find((a) => a.isPrimary);
      expect(primaryAcc.name).toContain('Canara Bank');
      expect(getTransactions().length).toBeGreaterThanOrEqual(30);
    });

    it('switches back to Sagnik cleanly and restores Sagnik dataset', () => {
      switchDemoProfile('ankita');
      const result = switchDemoProfile('sagnik');
      expect(result).toBe(true);
      expect(getActiveProfileId()).toBe('sagnik');
      expect(getSettings().userName).toBe('Sagnik');
      const primaryAcc = getAccounts().find((a) => a.isPrimary);
      expect(primaryAcc.name).toContain('SBI Student Savings');
    });

    it('resets a demo profile to its seed values', () => {
      expect(resetDemoProfile('sagnik')).toBe(true);
      expect(resetDemoProfile('sourav')).toBe(true);
      expect(resetDemoProfile('ankita')).toBe(true);
    });
  });
});
