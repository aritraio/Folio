import { describe, it, expect } from 'vitest';
import {
  calcTotalAssets,
  calcTotalLiabilities,
  calcNetWorth,
  calcMonthlyIncome,
  calcMonthlyExpenses,
  calcSavingsRate,
  calcCategoryBreakdown,
  calcBudgetUtilization,
  calcMonthlyCashFlow,
  calcInvestmentReturn,
  calcAverageDailySpending,
  calcTopSpendingCategory,
  calcNetWorthHistory,
} from '../utils/calculations.js';

const accounts = [
  { id: 'a1', type: 'savings', balance: 100000 },
  { id: 'a2', type: 'cash', balance: 5000 },
  { id: 'c1', type: 'credit', balance: 20000 },
];

const txs = [
  { id: 't1', type: 'income', amount: 50000, date: '2026-09-01', category: 'Salary', accountId: 'a1' },
  {
    id: 't2',
    type: 'expense',
    amount: 10000,
    date: '2026-09-05',
    category: 'Food & Dining',
    accountId: 'a1',
  },
  { id: 't3', type: 'expense', amount: 5000, date: '2026-09-06', category: 'Shopping', accountId: 'a1' },
  {
    id: 't4',
    type: 'transfer',
    amount: 20000,
    date: '2026-09-07',
    category: 'Other',
    accountId: 'a1',
    toAccountId: 'a2',
  },
  { id: 't5', type: 'income', amount: 30000, date: '2026-08-01', category: 'Freelance', accountId: 'a1' },
];

describe('assets / liabilities / net worth', () => {
  it('sums assets excluding credit', () => {
    expect(calcTotalAssets(accounts)).toBe(105000);
  });
  it('sums liabilities from credit + negatives', () => {
    expect(calcTotalLiabilities(accounts)).toBe(20000);
    expect(calcTotalLiabilities([{ type: 'savings', balance: -500 }])).toBe(500);
  });
  it('net worth = assets - liabilities', () => {
    expect(calcNetWorth(accounts)).toBe(85000);
  });
  it('handles empty input', () => {
    expect(calcNetWorth([])).toBe(0);
    expect(calcTotalAssets()).toBe(0);
  });
});

describe('monthly income / expenses', () => {
  it('filters by month and excludes transfers', () => {
    expect(calcMonthlyIncome(txs, '2026-09')).toBe(50000);
    expect(calcMonthlyExpenses(txs, '2026-09')).toBe(15000);
  });
  it('returns 0 for empty month', () => {
    expect(calcMonthlyIncome(txs, '2025-01')).toBe(0);
    expect(calcMonthlyExpenses([], '2026-09')).toBe(0);
  });
});

describe('savings rate', () => {
  it('computes (income-expenses)/income*100', () => {
    expect(calcSavingsRate(50000, 15000)).toBeCloseTo(70);
  });
  it('returns 0 when income <= 0', () => {
    expect(calcSavingsRate(0, 100)).toBe(0);
    expect(calcSavingsRate(-5, 10)).toBe(0);
  });
});

describe('category breakdown', () => {
  it('groups + sorts + percentages sum to 100', () => {
    const out = calcCategoryBreakdown(txs, '2026-09');
    expect(out[0].category).toBe('Food & Dining');
    const total = out.reduce((s, c) => s + c.percentage, 0);
    expect(total).toBeCloseTo(100);
    expect(out.every((c) => c.color && c.amount > 0)).toBe(true);
  });
  it('returns [] with no expenses', () => {
    expect(calcCategoryBreakdown([], '2026-09')).toEqual([]);
  });
});

describe('budget utilization', () => {
  it('flags warning >=80 and exceeded >=100', () => {
    const budgets = [
      { id: 'b1', category: 'Food & Dining', limit: 10000 },
      { id: 'b2', category: 'Shopping', limit: 4000 },
    ];
    const out = calcBudgetUtilization(budgets, txs, '2026-09');
    expect(out.find((b) => b.category === 'Food & Dining').status).toBe('exceeded');
    expect(out.find((b) => b.category === 'Shopping').status).toBe('exceeded');
  });
  it('normal when under 80%', () => {
    const out = calcBudgetUtilization([{ id: 'b1', category: 'Shopping', limit: 50000 }], txs, '2026-09');
    expect(out[0].status).toBe('normal');
    expect(out[0].remaining).toBe(45000);
  });
});

describe('cash flow + investments', () => {
  it('cash flow returns requested months with savings', () => {
    const out = calcMonthlyCashFlow(txs, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toHaveProperty('income');
    expect(out[0]).toHaveProperty('savings');
  });
  it('investment return math', () => {
    const r = calcInvestmentReturn([{ units: 10, avgPrice: 100, currentPrice: 120 }]);
    expect(r.totalInvested).toBe(1000);
    expect(r.totalCurrent).toBe(1200);
    expect(r.totalReturn).toBe(200);
    expect(r.returnPercentage).toBeCloseTo(20);
  });
  it('investment return handles empty', () => {
    expect(calcInvestmentReturn([]).returnPercentage).toBe(0);
  });
});

describe('daily spending + top category', () => {
  it('past month uses days-in-month (no hardcoded 30)', () => {
    // Feb 2026 has 28 days: 2800 / 28 = 100
    const feb = [{ type: 'expense', amount: 2800, date: '2026-02-10' }];
    expect(calcAverageDailySpending(feb, '2026-02')).toBeCloseTo(100);
  });
  it('returns 0 with no expenses', () => {
    expect(calcAverageDailySpending([], '2026-02')).toBe(0);
  });
  it('top category picks max', () => {
    expect(calcTopSpendingCategory(txs, '2026-09').category).toBe('Food & Dining');
    expect(calcTopSpendingCategory([], '2026-09')).toBeNull();
  });
});

describe('net worth history', () => {
  it('returns stored history sorted', () => {
    const stored = [
      { monthKey: '2026-09', netWorth: 2 },
      { monthKey: '2026-08', netWorth: 1 },
    ];
    expect(calcNetWorthHistory(stored, [], []).map((h) => h.monthKey)).toEqual(['2026-08', '2026-09']);
  });
  it('derives without fabricating growth factors and ends at current NW', () => {
    const out = calcNetWorthHistory([], txs, accounts, 3);
    expect(out).toHaveLength(3);
    expect(out[out.length - 1].netWorth).toBe(calcNetWorth(accounts));
  });
  it('returns [] with no basis', () => {
    expect(calcNetWorthHistory([], [], [], 3)).toEqual([]);
  });
});
