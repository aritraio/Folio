import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ShoppingBag,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
} from 'lucide-react';
import { formatINR, formatPercent, formatCompact } from '@/utils/formatCurrency';
import {
  calcMonthlyExpenses,
  calcMonthlyIncome,
  calcSavingsRate,
  calcTopSpendingCategory,
  calcCategoryBreakdown,
} from '@/utils/calculations';
import { format, subMonths } from 'date-fns';

/**
 * Single insight card.
 */
function InsightCard({ icon: Icon, iconBg, iconColor, title, description }) {
  return (
    <div
      className="
      flex items-start gap-3.5
      p-3.5 rounded-xl
      bg-ivory-muted/50 dark:bg-surface-dark-elevated/50
      hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
      transition-colors duration-150
    "
    >
      <div
        className={`
        shrink-0 p-2 rounded-lg
        ${iconBg}
      `}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary mb-0.5">{title}</p>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * FinancialInsights — Auto-generated data-driven insight cards.
 *
 * @param {{
 *   transactions: Array,
 *   netWorth: number,
 *   prevNetWorth: number,
 * }} props
 */
export default function FinancialInsights({ transactions = [], netWorth = 0, prevNetWorth = 0 }) {
  const insights = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const lastMonth = format(subMonths(now, 1), 'yyyy-MM');

    const currentExpenses = calcMonthlyExpenses(transactions, currentMonth);
    const lastExpenses = calcMonthlyExpenses(transactions, lastMonth);
    const currentIncome = calcMonthlyIncome(transactions, currentMonth);
    const savingsRate = calcSavingsRate(currentIncome, currentExpenses);
    const topCategory = calcTopSpendingCategory(transactions, currentMonth);

    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    const netWorthChange = netWorth - prevNetWorth;

    const result = [];

    // 1. Month-over-month spending
    if (lastExpenses > 0) {
      const direction = expenseChange > 0 ? 'increased' : 'decreased';
      const absChange = Math.abs(expenseChange);
      result.push({
        icon: expenseChange > 0 ? ArrowUpRight : ArrowDownRight,
        iconBg:
          expenseChange > 0
            ? 'bg-brand-red-light dark:bg-[rgba(251,113,133,0.12)]'
            : 'bg-brand-emerald-light dark:bg-[rgba(52,211,153,0.12)]',
        iconColor: expenseChange > 0 ? 'text-brand-red' : 'text-brand-emerald',
        title: `Spending ${direction} ${absChange.toFixed(1)}%`,
        description: `Your expenses ${direction} from ${formatINR(lastExpenses)} last month to ${formatINR(currentExpenses)} this month.`,
      });
    }

    // 2. Savings rate
    if (currentIncome > 0) {
      const rateLabel =
        savingsRate >= 30 ? 'Excellent' : savingsRate >= 20 ? 'Good' : savingsRate >= 10 ? 'Fair' : 'Low';
      result.push({
        icon: PiggyBank,
        iconBg:
          savingsRate >= 20
            ? 'bg-brand-emerald-light dark:bg-[rgba(52,211,153,0.12)]'
            : 'bg-amber-50 dark:bg-[rgba(245,158,11,0.12)]',
        iconColor: savingsRate >= 20 ? 'text-brand-emerald' : 'text-brand-amber',
        title: `${rateLabel} savings rate: ${formatPercent(savingsRate)}`,
        description: `You saved ${formatINR(currentIncome - currentExpenses)} of ${formatINR(currentIncome)} income this month.`,
      });
    }

    // 3. Top spending category
    if (topCategory) {
      const breakdown = calcCategoryBreakdown(transactions, currentMonth);
      const topItem = breakdown[0];
      if (topItem) {
        result.push({
          icon: ShoppingBag,
          iconBg: 'bg-blue-50 dark:bg-[rgba(59,130,246,0.12)]',
          iconColor: 'text-blue-500',
          title: `Top category: ${topItem.category}`,
          description: `${topItem.category} accounts for ${topItem.percentage.toFixed(0)}% of spending at ${formatINR(topItem.amount)}.`,
        });
      }
    }

    // 4. Net worth trajectory
    if (prevNetWorth > 0) {
      const nwPercent = (netWorthChange / prevNetWorth) * 100;
      const growing = netWorthChange > 0;
      result.push({
        icon: growing ? TrendingUp : TrendingDown,
        iconBg: growing
          ? 'bg-brand-emerald-light dark:bg-[rgba(52,211,153,0.12)]'
          : 'bg-brand-red-light dark:bg-[rgba(251,113,133,0.12)]',
        iconColor: growing ? 'text-brand-emerald' : 'text-brand-red',
        title: `Net worth ${growing ? 'grew' : 'declined'} ${formatPercent(Math.abs(nwPercent))}`,
        description: `Your net worth changed by ${formatINR(Math.abs(netWorthChange))} compared to last month, now at ${formatCompact(netWorth)}.`,
      });
    }

    return result;
  }, [transactions, netWorth, prevNetWorth]);

  if (insights.length === 0) return null;

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Financial insights"
      style={{ animationDelay: '0.35s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb className="w-4 h-4 text-brand-amber" />
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Insights</h2>
      </div>

      {/* Insight cards */}
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} {...insight} />
        ))}
      </div>
    </section>
  );
}
