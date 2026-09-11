import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ShoppingBag,
  ArrowDownRight,
  ArrowUpRight,
  Terminal,
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
 * Single insight card — terminal surface, monochrome icon chip.
 */
function InsightCard({ icon: Icon, title, description, signal }) {
  return (
    <div
      className="
      flex items-start gap-3.5
      p-3.5 rounded
      bg-[#F5F5F5] dark:bg-[#0A0A0A]
      border border-[#E5E5E5] dark:border-[#262626]
      hover:border-[#CCCCCC] dark:hover:border-[#404040]
      transition-colors duration-150
    "
    >
      <div className="shrink-0 p-2 rounded border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1E1E1E]">
        <Icon
          className={`w-4 h-4 ${
            signal === 'in'
              ? 'text-[#00a383] dark:text-[#00b894]'
              : signal === 'out'
                ? 'text-[#e84118] dark:text-[#ff6b6b]'
                : 'text-[#0A0A0A] dark:text-white'
          }`}
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#0A0A0A] dark:text-white mb-0.5">{title}</p>
        <p className="text-xs text-[#8E9192] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * FinancialInsights — Auto-generated data-driven insight cards.
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
        signal: expenseChange > 0 ? 'out' : 'in',
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
        signal: savingsRate >= 20 ? 'in' : savingsRate >= 0 ? 'neutral' : 'out',
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
          signal: 'neutral',
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
        signal: growing ? 'in' : 'out',
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
        <Terminal className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Insights</h2>
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
