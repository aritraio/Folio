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
  calcFdMaturityAndInterest,
  calcBondYieldAndAccrued,
  calcSavingsVsCreditSpending,
  calcInvestmentHoldingsByType,
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

describe('fixed deposit compounding calculations', () => {
  it('calculates quarterly compounding maturity amount accurately', () => {
    // ₹100,000 at 7.0% for 12 months with quarterly compounding
    // A = 100000 * (1 + 0.07/4)^4 = 100000 * (1.0175)^4 = 107,185.90 -> 107186
    const res = calcFdMaturityAndInterest(100000, 7.0, '2026-01-01', 12, 'quarterly', new Date('2026-07-01'));
    expect(res.principal).toBe(100000);
    expect(res.maturityAmount).toBe(107186);
    expect(res.totalInterest).toBe(7186);
    expect(res.isMatured).toBe(false);
    expect(res.currentValue).toBeGreaterThan(100000);
    expect(res.currentValue).toBeLessThan(107186);
    expect(res.accruedInterest).toBeGreaterThan(0);
  });

  it('marks FD as matured when asOfDate is past maturityDate', () => {
    const res = calcFdMaturityAndInterest(50000, 6.5, '2025-01-01', 12, 'quarterly', new Date('2026-02-01'));
    expect(res.isMatured).toBe(true);
    expect(res.daysRemaining).toBe(0);
    expect(res.currentValue).toBe(res.maturityAmount);
    expect(res.progressPct).toBe(100);
  });

  it('handles zero or invalid values gracefully', () => {
    const res = calcFdMaturityAndInterest(0, 0, '2026-01-01', 12);
    expect(res.principal).toBe(0);
    expect(res.maturityAmount).toBe(0);
    expect(res.totalInterest).toBe(0);
  });
});

describe('bonds and sovereign gold bonds calculations', () => {
  it('computes annual coupon income and current yield percentage', () => {
    // 10 units of ₹1000 face value bond with 7.5% coupon bought at ₹950
    // Total face value = 10000, total investment = 9500, annual income = 750
    // Current yield = 750 / 9500 * 100 = 7.89%
    const res = calcBondYieldAndAccrued(1000, 7.5, 950, 10, '2030-12-31');
    expect(res.totalFaceValue).toBe(10000);
    expect(res.totalInvestment).toBe(9500);
    expect(res.annualCouponIncome).toBe(750);
    expect(res.currentYieldPct).toBe(7.89);
    expect(res.isMatured).toBe(false);
  });
});

describe('savings vs credit spending segregation', () => {
  const customAccounts = [
    { id: 'acc_sav', type: 'savings', name: 'HDFC Bank' },
    { id: 'acc_cc', type: 'credit', name: 'ICICI Amazon Pay' },
  ];

  const mixedTxs = [
    {
      id: 'm1',
      type: 'expense',
      amount: 3500,
      date: '2026-09-02',
      accountId: 'acc_sav',
      category: 'Groceries',
    },
    { id: 'm2', type: 'expense', amount: 1500, date: '2026-09-03', accountId: 'acc_sav', category: 'Fuel' },
    {
      id: 'm3',
      type: 'expense',
      amount: 8000,
      date: '2026-09-04',
      accountId: 'acc_cc',
      category: 'Electronics',
    },
    { id: 'm4', type: 'expense', amount: 2000, date: '2026-09-05', accountId: 'acc_cc', category: 'Dining' },
    // Transfer from savings to credit card (credit card bill payment)
    {
      id: 'm5',
      type: 'transfer',
      amount: 10000,
      date: '2026-09-15',
      accountId: 'acc_sav',
      toAccountId: 'acc_cc',
    },
  ];

  it('accurately distinguishes savings debits from credit card swipes and isolates bill payments', () => {
    const res = calcSavingsVsCreditSpending(mixedTxs, customAccounts, '2026-09');
    expect(res.savingsExpenseTotal).toBe(5000); // 3500 + 1500
    expect(res.creditExpenseTotal).toBe(10000); // 8000 + 2000
    expect(res.totalSpend).toBe(15000);
    expect(res.creditCardBillPaymentTotal).toBe(10000); // Inter-account transfer not double-counted as expense
    expect(res.savingsPct).toBe(33); // 5000 / 15000 * 100
    expect(res.creditPct).toBe(67); // 10000 / 15000 * 100
    expect(res.savingsTxCount).toBe(2);
    expect(res.creditTxCount).toBe(2);
    expect(res.billPaymentTxCount).toBe(1);
  });
});

describe('investment holdings grouping by asset type', () => {
  it('categorizes holdings into stocks, mutual funds, FDs, and bonds with aggregations', () => {
    const holdings = [
      { id: 'h1', name: 'TCS', type: 'stock', units: 10, avgPrice: 3500, currentPrice: 4000 },
      {
        id: 'h2',
        name: 'Parag Parikh Flexi Cap',
        type: 'mutual_fund',
        units: 100,
        avgPrice: 60,
        currentPrice: 75,
      },
      {
        id: 'h3',
        name: 'SBI 1-Year FD',
        type: 'fixed_deposit',
        principal: 100000,
        interestRate: 7.0,
        tenureMonths: 12,
        startDate: '2026-01-01',
      },
      {
        id: 'h4',
        name: 'Sovereign Gold Bond 2030',
        type: 'bond',
        units: 5,
        avgPrice: 6000,
        currentPrice: 7000,
      },
    ];

    const res = calcInvestmentHoldingsByType(holdings);
    expect(res.groups.stocks.count).toBe(1);
    expect(res.groups.stocks.invested).toBe(35000);
    expect(res.groups.stocks.current).toBe(40000);

    expect(res.groups.mutual_funds.count).toBe(1);
    expect(res.groups.mutual_funds.invested).toBe(6000);
    expect(res.groups.mutual_funds.current).toBe(7500);

    expect(res.groups.fixed_deposits.count).toBe(1);
    expect(res.groups.fixed_deposits.invested).toBe(100000);

    expect(res.groups.bonds.count).toBe(1);
    expect(res.groups.bonds.invested).toBe(30000);
    expect(res.groups.bonds.current).toBe(35000);

    expect(res.totalInvested).toBeGreaterThan(150000);
    expect(res.totalCurrent).toBeGreaterThan(res.totalInvested);
  });
});
