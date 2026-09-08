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
