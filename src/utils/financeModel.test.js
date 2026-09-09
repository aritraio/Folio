import { describe, it, expect } from 'vitest';
import {
  calcFinancialSnapshot,
  calcUnifiedNetWorth,
  calcInvestmentTotal,
  calcLiquidAssets,
  calcLiquidity,
  calcCategoryComparison,
  calcFinancialPulse,
  detectRecurring,
  calcBudgetForecast,
  getPortfolioHighlights,
  validateFinancialModel,
} from './calculations.js';

const accounts = [
  { id: 'a1', type: 'savings', balance: 16850 },
  { id: 'a2', type: 'savings', balance: 8500 },
  { id: 'c1', type: 'credit', balance: 3850 },
  { id: 'c2', type: 'credit', balance: 1920 },
  { id: 'cash', type: 'cash', balance: 1240 },
];

const holdings = [
  { id: 'h1', name: 'Fund A', type: 'mutual_fund', units: 100, avgPrice: 60, currentPrice: 75 },
  { id: 'h2', name: 'Stock B', type: 'stock', units: 10, avgPrice: 100, currentPrice: 120 },
];

describe('unified financial model (§2)', () => {
  it('net worth = assets + investments − liabilities', () => {
    const snap = calcFinancialSnapshot(accounts, holdings);
    // assets: 16850+8500+1240=26590; investments: 7500+1200=8700; liabilities: 5770
    expect(snap.totalAssets).toBe(26590);
    expect(snap.investmentTotal).toBe(8700);
    expect(snap.totalLiabilities).toBe(5770);
    expect(snap.netWorth).toBe(26590 + 8700 - 5770);
    expect(calcUnifiedNetWorth(accounts, holdings)).toBe(snap.netWorth);
    // Investments must feed net worth — the old accounts-only value is smaller.
    expect(snap.netWorth).toBeGreaterThan(26590 - 5770);
  });

  it('investment total sums holding current values', () => {
    expect(calcInvestmentTotal(holdings)).toBe(8700);
    expect(calcInvestmentTotal([])).toBe(0);
  });

  it('liquid assets exclude credit and investment accounts', () => {
    expect(calcLiquidAssets(accounts)).toBe(26590);
    expect(calcLiquidAssets([{ type: 'credit', balance: 500 }])).toBe(0);
  });

  it('validation passes on a consistent snapshot', () => {
    const txs = [
      { type: 'income', amount: 1000, date: '2026-09-01' },
      { type: 'expense', amount: 400, date: '2026-09-02' },
    ];
    const { ok, errors, snapshot } = validateFinancialModel({
      accounts, investments: holdings, transactions: txs, monthKey: '2026-09',
    });
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
    expect(snapshot.netWorth).toBe(26590 + 8700 - 5770);
  });
});

describe('liquidity (§16)', () => {
  it('computes coverage as liquid / obligations', () => {
    const liq = calcLiquidity(accounts);
    expect(liq.liquidAssets).toBe(26590);
    expect(liq.obligations).toBe(5770);
    expect(liq.coverage).toBeCloseTo(4.6, 1);
  });
});

describe('comparisons + pulse + recurring + forecast', () => {
  const txs = [
    { type: 'expense', amount: 800, date: '2026-09-02', category: 'Food & Dining', merchant: 'Canteen' },
    { type: 'expense', amount: 200, date: '2026-09-03', category: 'Transport', merchant: 'Metro' },
    { type: 'expense', amount: 500, date: '2026-08-02', category: 'Food & Dining', merchant: 'Canteen' },
    { type: 'income', amount: 5000, date: '2026-09-01', category: 'Salary', merchant: 'Dad' },
    { type: 'expense', amount: 59, date: '2026-07-02', category: 'Entertainment', merchant: 'Spotify Student' },
    { type: 'expense', amount: 59, date: '2026-08-02', category: 'Entertainment', merchant: 'Spotify Student' },
    { type: 'expense', amount: 59, date: '2026-09-02', category: 'Entertainment', merchant: 'Spotify Student' },
  ];

  it('category comparison carries prev amount + delta', () => {
    const rows = calcCategoryComparison(txs, '2026-09', '2026-08');
    const food = rows.find((r) => r.category === 'Food & Dining');
    expect(food.prevAmount).toBe(500);
    expect(food.deltaPct).toBeCloseTo(60);
  });

  it('pulse is bounded 0–100 with explicit factors', () => {
    const pulse = calcFinancialPulse({ transactions: txs, accounts, investments: holdings, budgets: [] });
    expect(pulse.score).toBeGreaterThanOrEqual(0);
    expect(pulse.score).toBeLessThanOrEqual(100);
    expect(pulse.factors.length).toBeGreaterThanOrEqual(6);
    expect(pulse.factors.every((f) => f.detail && f.tone)).toBe(true);
  });

  it('detects recurring candidates with confidence, never auto-classifies', () => {
    const rec = detectRecurring(txs);
    const spotify = rec.find((r) => /spotify/i.test(r.merchant));
    expect(spotify).toBeTruthy();
    expect(spotify.count).toBe(3);
    expect(spotify.confidence).toBe('High confidence');
    expect(spotify.nextExpected).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('forecast prorates by elapsed days', () => {
    const f = calcBudgetForecast(500, new Date('2026-09-10'));
    expect(f.daysInMonth).toBe(30);
    expect(f.elapsed).toBe(10);
    expect(f.projected).toBe(1500);
  });

  it('portfolio highlights use real data only', () => {
    const { best, largest } = getPortfolioHighlights(holdings);
    expect(best.name).toBe('Fund A');
    expect(best.returnPct).toBeCloseTo(25);
    expect(largest.name).toBe('Fund A');
    expect(getPortfolioHighlights([])).toEqual({ best: null, largest: null });
  });
});
