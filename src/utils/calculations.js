import { format, getDaysInMonth } from 'date-fns';
import { getLastNMonths, toDate } from './dateUtils.js';
import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR } from '../constants/finance.js';

export { filterTransactionsByMonth };

/**
 * Filter transactions by month key (e.g. '2026-08' or Date/Date string).
 * If targetMonthKey is null or undefined, returns all transactions.
 */
function filterTransactionsByMonth(transactions = [], targetMonthKey = null) {
  if (!targetMonthKey) return transactions;

  let monthStr = targetMonthKey;
  if (targetMonthKey instanceof Date) {
    monthStr = format(targetMonthKey, 'yyyy-MM');
  } else if (typeof targetMonthKey === 'string' && targetMonthKey.length > 7) {
    monthStr = format(toDate(targetMonthKey), 'yyyy-MM');
  }

  return transactions.filter((tx) => {
    if (!tx.date) return false;
    const txMonthStr = typeof tx.date === 'string' ? tx.date.slice(0, 7) : format(toDate(tx.date), 'yyyy-MM');
    return txMonthStr === monthStr;
  });
}

/**
 * Calculate total assets across all accounts.
 * @param {Array} accounts
 * @returns {number}
 */
export function calcTotalAssets(accounts = []) {
  return accounts.reduce((total, acc) => {
    const bal = Number(acc.balance) || 0;
    if (acc.type !== 'credit' && bal > 0) {
      return total + bal;
    }
    return total;
  }, 0);
}

/**
 * Calculate total liabilities across all accounts.
 * @param {Array} accounts
 * @returns {number}
 */
export function calcTotalLiabilities(accounts = []) {
  return accounts.reduce((total, acc) => {
    const bal = Number(acc.balance) || 0;
    if (acc.type === 'credit') {
      return total + Math.abs(bal);
    }
    if (bal < 0) {
      return total + Math.abs(bal);
    }
    return total;
  }, 0);
}

/**
 * Calculate net worth from accounts.
 * Net Worth = Total Assets - Total Liabilities
 * @param {Array} accounts
 * @returns {number}
 */
export function calcNetWorth(accounts = []) {
  return calcTotalAssets(accounts) - calcTotalLiabilities(accounts);
}

/**
 * Calculate total income for a given month.
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {number}
 */
export function calcMonthlyIncome(transactions = [], targetMonthKey = null) {
  const filtered = filterTransactionsByMonth(transactions, targetMonthKey);
  return filtered.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
}

/**
 * Calculate total expenses for a given month.
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {number}
 */
export function calcMonthlyExpenses(transactions = [], targetMonthKey = null) {
  const filtered = filterTransactionsByMonth(transactions, targetMonthKey);
  return filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0);
}

/**
 * Calculate net monthly savings.
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {number}
 */
export function calcMonthlySavings(transactions = [], targetMonthKey = null) {
  const income = calcMonthlyIncome(transactions, targetMonthKey);
  const expenses = calcMonthlyExpenses(transactions, targetMonthKey);
  return income - expenses;
}

/**
 * Calculate savings rate percentage.
 * @param {number} income
 * @param {number} expenses
 * @returns {number}
 */
export function calcSavingsRate(income = 0, expenses = 0) {
  const inc = Number(income) || 0;
  const exp = Number(expenses) || 0;
  if (inc <= 0) return 0;
  const savings = inc - exp;
  return (savings / inc) * 100;
}

/**
 * Calculate expense category breakdown with percentages and hex colors.
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {Array<{ category: string, amount: number, percentage: number, color: string }>}
 */
export function calcCategoryBreakdown(transactions = [], targetMonthKey = null) {
  const filtered = filterTransactionsByMonth(transactions, targetMonthKey);
  const expenseTxs = filtered.filter((t) => t.type === 'expense');

  const totalsByCategory = {};
  let totalExpenses = 0;

  expenseTxs.forEach((tx) => {
    const cat = tx.category || 'Other';
    const amount = Math.abs(Number(tx.amount) || 0);
    totalsByCategory[cat] = (totalsByCategory[cat] || 0) + amount;
    totalExpenses += amount;
  });

  const categoryColors = CATEGORY_COLORS;

  return Object.entries(totalsByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: categoryColors[category] || FALLBACK_CATEGORY_COLOR,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate utilization for each budget category.
 * @param {Array} budgets
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {Array}
 */
export function calcBudgetUtilization(budgets = [], transactions = [], targetMonthKey = null) {
  const filtered = filterTransactionsByMonth(transactions, targetMonthKey);
  const expenses = filtered.filter((t) => t.type === 'expense');

  const spentByCategory = {};
  expenses.forEach((tx) => {
    const cat = tx.category || 'Other';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(Number(tx.amount) || 0);
  });

  return budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    const limit = Number(b.limit) || 0;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = Math.max(0, limit - spent);

    let status = 'normal';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 80) status = 'warning';

    return {
      ...b,
      spent,
      remaining,
      percentage,
      status,
    };
  });
}

/**
 * Calculate month-by-month cash flow history for last N months.
 * @param {Array} transactions
 * @param {number} nMonths
 * @returns {Array}
 */
export function calcMonthlyCashFlow(transactions = [], nMonths = 6) {
  const months = getLastNMonths(nMonths);
  return months.map(({ monthKey, label, shortLabel }) => {
    const income = calcMonthlyIncome(transactions, monthKey);
    const expenses = calcMonthlyExpenses(transactions, monthKey);
    const savings = income - expenses;
    return {
      monthKey,
      label,
      shortLabel,
      income,
      expenses,
      savings,
    };
  });
}

/**
 * Calculate total investment returns across holdings.
 * @param {Array} holdings
 * @returns {{ totalInvested: number, totalCurrent: number, totalReturn: number, returnPercentage: number }}
 */
export function calcInvestmentReturn(holdings = []) {
  let totalInvested = 0;
  let totalCurrent = 0;

  holdings.forEach((h) => {
    const invested = Number(h.investedValue) || (Number(h.units) || 0) * (Number(h.avgPrice) || 0);
    const current = Number(h.currentValue) || (Number(h.units) || 0) * (Number(h.currentPrice) || 0);
    totalInvested += invested;
    totalCurrent += current;
  });

  const totalReturn = totalCurrent - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrent,
    totalReturn,
    returnPercentage,
  };
}

/**
 * Calculate average daily spending for a given month.
 * Past months use days-in-month; the current month uses elapsed days;
 * null/undefined means "current month to date".
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {number}
 */
export function calcAverageDailySpending(transactions = [], targetMonthKey = null) {
  const expenses = calcMonthlyExpenses(transactions, targetMonthKey);
  if (!Number.isFinite(expenses) || expenses <= 0) return 0;
  const now = new Date();
  const currentMonthStr = format(now, 'yyyy-MM');

  let monthDate;
  if (!targetMonthKey) {
    monthDate = now;
  } else if (targetMonthKey instanceof Date) {
    monthDate = targetMonthKey;
  } else if (typeof targetMonthKey === 'string' && targetMonthKey.length >= 7) {
    monthDate = toDate(`${targetMonthKey.slice(0, 7)}-01`);
  } else {
    monthDate = now;
  }

  const key = format(monthDate, 'yyyy-MM');
  let days;
  if (key === currentMonthStr) {
    days = Math.max(1, now.getDate());
  } else {
    try {
      days = getDaysInMonth(monthDate);
    } catch {
      days = 30;
    }
  }

  return expenses / Math.max(1, days);
}

/**
 * Find the top spending category for a given month.
 * @param {Array} transactions
 * @param {string|Date|null} targetMonthKey
 * @returns {{ category: string, amount: number }|null}
 */
export function calcTopSpendingCategory(transactions = [], targetMonthKey = null) {
  const breakdown = calcCategoryBreakdown(transactions, targetMonthKey);
  if (!breakdown || breakdown.length === 0) return null;
  return {
    category: breakdown[0].category,
    amount: breakdown[0].amount,
  };
}

/**
 * Derive net worth history.
 * - If stored history exists, return it as-is (sorted, sliced by caller).
 * - Otherwise derive honestly from current net worth minus cumulative
 *   monthly net savings walking backwards. Never fabricate growth factors.
 * - Returns [] when there is no basis (no accounts + no history).
 * @param {Array} historyData
 * @param {Array} transactions
 * @param {Array} accounts
 * @param {number} nMonths
 * @returns {Array}
 */
export function calcNetWorthHistory(historyData = [], transactions = [], accounts = [], nMonths = 6) {
  if (historyData && historyData.length > 0) {
    return [...historyData].sort((a, b) => String(a.monthKey).localeCompare(String(b.monthKey)));
  }

  const currentNW = calcNetWorth(accounts);
  const hasAccounts = Array.isArray(accounts) && accounts.length > 0;
  const hasTx = Array.isArray(transactions) && transactions.length > 0;
  if (!hasAccounts && !hasTx) return [];

  const months = getLastNMonths(nMonths);
  // Monthly net = income - expenses (transfers excluded by construction).
  const nets = months.map(
    (m) => calcMonthlyIncome(transactions, m.monthKey) - calcMonthlyExpenses(transactions, m.monthKey)
  );

  // Walk backwards from current net worth.
  let running = currentNW;
  const out = [];
  for (let i = months.length - 1; i >= 0; i--) {
    out.unshift({
      monthKey: months[i].monthKey,
      label: months[i].shortLabel,
      shortLabel: months[i].shortLabel,
      netWorth: Math.round(running),
    });
    running -= nets[i] || 0;
  }
  return out;
}

/**
 * Calculate Fixed Deposit (FD) maturity, interest, and real-time accrued value.
 * Standard Indian banking uses quarterly compounding (n = 4).
 *
 * @param {number} principal - Initial deposit in ₹
 * @param {number} annualRatePct - Annual interest rate in percent (e.g. 7.1)
 * @param {string|Date} startDate - Start date (YYYY-MM-DD)
 * @param {number} tenureMonths - Total tenure in months (e.g. 12, 36)
 * @param {string} compoundingFrequency - 'quarterly' | 'monthly' | 'annual' | 'cumulative'
 * @param {Date} [asOfDate=new Date()] - As-of date for calculating accrued value
 */
export function calcFdMaturityAndInterest(
  principal = 0,
  annualRatePct = 0,
  startDate,
  tenureMonths = 12,
  compoundingFrequency = 'quarterly',
  asOfDate = new Date()
) {
  const p = Math.max(0, Number(principal) || 0);
  const r = (Number(annualRatePct) || 0) / 100;
  const tYears = Math.max(0, Number(tenureMonths) || 0) / 12;

  let n = 4; // default quarterly compounding (Indian standard)
  if (compoundingFrequency === 'monthly') n = 12;
  else if (compoundingFrequency === 'annual') n = 1;

  // Maturity Amount: A = P * (1 + r/n)^(n * t)
  const maturityAmount = p > 0 && r > 0 ? p * Math.pow(1 + r / n, n * tYears) : p;
  const totalInterest = Math.max(0, maturityAmount - p);

  // Compute maturity date and accrued progress
  const start = toDate(startDate || new Date());
  const maturityDate = new Date(start);
  maturityDate.setMonth(maturityDate.getMonth() + (Number(tenureMonths) || 12));

  const asOf = toDate(asOfDate);
  const totalDurationMs = Math.max(1, maturityDate.getTime() - start.getTime());
  const elapsedMs = Math.max(0, asOf.getTime() - start.getTime());

  const progressPct = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
  const isMatured = asOf >= maturityDate;

  // Accrued interest to date: compound over elapsed years
  const elapsedYears = Math.min(tYears, elapsedMs / (365.25 * 24 * 60 * 60 * 1000));
  const currentValue = isMatured
    ? maturityAmount
    : p > 0 && r > 0
      ? p * Math.pow(1 + r / n, n * elapsedYears)
      : p;
  const accruedInterest = Math.max(0, currentValue - p);
  const daysRemaining = isMatured
    ? 0
    : Math.ceil((maturityDate.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));

  return {
    principal: Math.round(p),
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(totalInterest),
    currentValue: Math.round(currentValue),
    accruedInterest: Math.round(accruedInterest),
    maturityDate: format(maturityDate, 'yyyy-MM-dd'),
    startDate: format(start, 'yyyy-MM-dd'),
    tenureMonths,
    annualRatePct,
    daysRemaining,
    progressPct: Math.round(progressPct),
    isMatured,
  };
}

/**
 * Calculate Bond / Sovereign Gold Bond yield and coupon distribution.
 *
 * @param {number} faceValue - Face value per unit (e.g. ₹1000 or gold grams)
 * @param {number} couponRatePct - Annual coupon interest rate (e.g. 2.5% for SGBs, 7.5% for corporate)
 * @param {number} purchasePrice - Actual purchase price paid per unit
 * @param {number} units - Quantity of bonds held
 * @param {string|Date} maturityDate - Maturity date
 */
export function calcBondYieldAndAccrued(
  faceValue = 1000,
  couponRatePct = 0,
  purchasePrice = 1000,
  units = 1,
  maturityDate
) {
  const fv = Math.max(0, Number(faceValue) || 0);
  const rate = (Number(couponRatePct) || 0) / 100;
  const pp = Math.max(0, Number(purchasePrice) || fv);
  const qty = Math.max(0, Number(units) || 1);

  const totalFaceValue = fv * qty;
  const totalInvestment = pp * qty;
  const annualCouponIncome = totalFaceValue * rate;
  const currentYieldPct = totalInvestment > 0 ? (annualCouponIncome / totalInvestment) * 100 : 0;

  let isMatured = false;
  let daysRemaining = null;
  if (maturityDate) {
    const mat = toDate(maturityDate);
    const now = new Date();
    isMatured = now >= mat;
    daysRemaining = isMatured ? 0 : Math.ceil((mat.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    totalFaceValue: Math.round(totalFaceValue),
    totalInvestment: Math.round(totalInvestment),
    annualCouponIncome: Math.round(annualCouponIncome),
    currentYieldPct: Number(currentYieldPct.toFixed(2)),
    isMatured,
    daysRemaining,
  };
}

/**
 * Segregate spending into Liquid Savings Account Outflows vs. Credit Card Outflows.
 * Correctly identifies and separates credit card bill payments (transfers from savings to credit card)
 * to ensure that expenses are not double-counted.
 *
 * @param {Array} transactions
 * @param {Array} accounts
 * @param {string|Date} targetMonthKey - Optional month key (YYYY-MM)
 */
export function calcSavingsVsCreditSpending(transactions = [], accounts = [], targetMonthKey = null) {
  const monthTx = filterTransactionsByMonth(transactions, targetMonthKey);

  // Map account types for rapid lookup
  const accountMap = new Map();
  (accounts || []).forEach((acc) => {
    accountMap.set(acc.id, acc);
  });

  let savingsExpenseTotal = 0;
  let creditExpenseTotal = 0;
  let creditCardBillPaymentTotal = 0;
  const savingsTransactions = [];
  const creditTransactions = [];
  const billPaymentTransactions = [];

  monthTx.forEach((tx) => {
    const fromAcc = accountMap.get(tx.accountId);
    const toAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
    const amount = Math.abs(Number(tx.amount) || 0);

    // Case 1: Inter-account Transfer (e.g. paying credit card bill from savings account)
    if (tx.type === 'transfer') {
      const isPayingCreditCard = toAcc && toAcc.type === 'credit';
      if (isPayingCreditCard) {
        creditCardBillPaymentTotal += amount;
        billPaymentTransactions.push(tx);
      }
      return; // Transfers never count directly as expenses
    }

    // Case 2: Only expenses are analyzed
    if (tx.type !== 'expense') return;

    // Check if charged to a credit card
    const isCredit = fromAcc && fromAcc.type === 'credit';
    if (isCredit) {
      creditExpenseTotal += amount;
      creditTransactions.push(tx);
    } else {
      // Savings, current, cash, or wallet
      savingsExpenseTotal += amount;
      savingsTransactions.push(tx);
    }
  });

  const totalSpend = savingsExpenseTotal + creditExpenseTotal;
  const savingsPct = totalSpend > 0 ? (savingsExpenseTotal / totalSpend) * 100 : 0;
  const creditPct = totalSpend > 0 ? (creditExpenseTotal / totalSpend) * 100 : 0;

  return {
    totalSpend: Math.round(totalSpend),
    savingsExpenseTotal: Math.round(savingsExpenseTotal),
    creditExpenseTotal: Math.round(creditExpenseTotal),
    creditCardBillPaymentTotal: Math.round(creditCardBillPaymentTotal),
    savingsPct: Math.round(savingsPct),
    creditPct: Math.round(creditPct),
    savingsTxCount: savingsTransactions.length,
    creditTxCount: creditTransactions.length,
    billPaymentTxCount: billPaymentTransactions.length,
  };
}

/**
 * Group investment holdings by asset type (stocks, mutual funds, fixed deposits, bonds).
 * Computes portfolio distribution and valuation metrics per category.
 *
 * @param {Array} holdings
 * @returns {Object}
 */
export function calcInvestmentHoldingsByType(holdings = []) {
  const groups = {
    stocks: { items: [], invested: 0, current: 0, count: 0 },
    mutual_funds: { items: [], invested: 0, current: 0, count: 0 },
    fixed_deposits: { items: [], invested: 0, current: 0, count: 0 },
    bonds: { items: [], invested: 0, current: 0, count: 0 },
    other: { items: [], invested: 0, current: 0, count: 0 },
  };

  (holdings || []).forEach((h) => {
    const type = (h.type || '').toLowerCase();
    let target = groups.other;
    if (type === 'stock' || type === 'equity') target = groups.stocks;
    else if (type === 'mutual_fund' || type === 'mf') target = groups.mutual_funds;
    else if (type === 'fixed_deposit' || type === 'fd') target = groups.fixed_deposits;
    else if (type === 'bond' || type === 'sgb') target = groups.bonds;

    let invested = 0;
    let current = 0;

    if (type === 'fixed_deposit' || type === 'fd') {
      const fdCalc = calcFdMaturityAndInterest(
        h.principal || h.investedAmount || h.avgPrice,
        h.interestRate || h.annualRatePct,
        h.startDate || h.createdAt,
        h.tenureMonths,
        h.compoundingFrequency
      );
      invested = fdCalc.principal;
      current = fdCalc.currentValue;
      target.items.push({ ...h, fdCalc });
    } else {
      const units = Number(h.units) || 1;
      const avg = Number(h.avgPrice) || 0;
      const cur = Number(h.currentPrice) || avg;
      invested = units * avg;
      current = units * cur;
      target.items.push(h);
    }

    target.invested += invested;
    target.current += current;
    target.count += 1;
  });

  const totalInvested = Object.values(groups).reduce((sum, g) => sum + g.invested, 0);
  const totalCurrent = Object.values(groups).reduce((sum, g) => sum + g.current, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    groups,
    totalInvested: Math.round(totalInvested),
    totalCurrent: Math.round(totalCurrent),
    totalGain: Math.round(totalGain),
    totalGainPct: Number(totalGainPct.toFixed(2)),
  };
}
