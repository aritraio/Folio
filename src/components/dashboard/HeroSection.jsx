import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatMoney, formatPercent, formatChange } from '@/utils/formatCurrency';
import { calcMonthlySavings, calcSavingsRate, calcMonthlyIncome, calcMonthlyExpenses } from '@/utils/calculations';
import { format } from 'date-fns';
import { useCountUp } from '@/utils/useCountUp';
import HowCalculated from '@/components/ui/HowCalculated';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * HeroSection — editorial hero (§9, §67, §88).
 * Compact greeting → NET WORTH hero number → month delta → This Month panel.
 * Values always come from the unified financial model (props), never hardcoded.
 */
export default function HeroSection({
  netWorth = 0,
  prevNetWorth = 0,
  snapshot = null,
  currentMonthKey = null,
  transactions = [],
}) {
  const { settings } = useData();
  const userName = settings?.userName || 'User';

  const monthChange = netWorth - prevNetWorth;
  const monthChangePercent = prevNetWorth > 0 ? (monthChange / prevNetWorth) * 100 : 0;

  const isPositive = monthChange > 0;
  const isNegative = monthChange < 0;

  const currentMonthYear = useMemo(() => {
    return format(new Date(), 'MMMM yyyy').toUpperCase();
  }, []);

  const monthStats = useMemo(() => {
    if (!currentMonthKey) return null;
    const income = calcMonthlyIncome(transactions, currentMonthKey);
    const expenses = calcMonthlyExpenses(transactions, currentMonthKey);
    const savings = calcMonthlySavings(transactions, currentMonthKey);
    const rate = calcSavingsRate(income, expenses);
    return { income, expenses, savings, rate };
  }, [transactions, currentMonthKey]);

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive
    ? 'text-brand-emerald'
    : isNegative
      ? 'text-brand-red'
      : 'text-text-secondary dark:text-text-dark-secondary';
  const trendBg = isPositive
    ? 'bg-brand-emerald-light dark:bg-[rgba(52,211,153,0.12)]'
    : isNegative
      ? 'bg-brand-red-light dark:bg-[rgba(251,113,133,0.12)]'
      : 'bg-ivory-muted dark:bg-surface-dark-elevated';

  const animatedNetWorth = useCountUp(netWorth, 900);

  return (
    <section className="animate-fade-in motion-reduce:animate-none" aria-label="Financial overview">
      <div className="flex items-center gap-2 mb-4">
        <span className="eyebrow">Overview</span>
        <span className="text-text-tertiary dark:text-text-dark-tertiary text-xs" aria-hidden="true">/</span>
        <span className="eyebrow">{currentMonthYear}</span>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-amber mb-6">
        {getGreeting()}, {userName} — your financial overview
      </p>

      {/* Asymmetric editorial composition (§7): hero + month panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-end">
        <div>
          <p className="eyebrow mb-2">Net worth</p>
          <h1 className="display-xl text-zinc-900 dark:text-text-dark-primary" aria-live="polite">
            {formatMoney(animatedNetWorth)}
          </h1>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl ${trendBg}`}
              aria-label={`Changed ${formatChange(monthChange)}, ${formatPercent(monthChangePercent)} this month`}
            >
              <TrendIcon className={`w-4 h-4 ${trendColor}`} aria-hidden="true" />
              <span className={`text-sm font-semibold mono ${trendColor}`}>{formatChange(monthChange)}</span>
              <span className={`text-xs font-medium ${trendColor} opacity-80`}>
                {formatPercent(monthChangePercent)}
              </span>
              <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">this month</span>
            </span>
            <HowCalculated metricKey="netWorth" snapshot={snapshot} />
          </div>
          <p className="sr-only">
            Net worth {formatMoney(netWorth)}, {monthChange >= 0 ? 'up' : 'down'}{' '}
            {formatMoney(Math.abs(monthChange))} versus last month.
          </p>
        </div>

        {monthStats && (
          <aside
            className="editorial-callout p-5"
            aria-label="This month's money flow"
          >
            <p className="eyebrow mb-3">This month</p>
            <dl className="space-y-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs text-text-secondary dark:text-text-dark-secondary">Saved</dt>
                <dd className="text-lg font-semibold mono text-brand-emerald">
                  {formatChange(monthStats.savings)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs text-text-secondary dark:text-text-dark-secondary">Savings rate</dt>
                <dd className="text-sm font-semibold mono text-zinc-900 dark:text-text-dark-primary">
                  {formatPercent(monthStats.rate, 1)}
                </dd>
              </div>
              <div className="pt-2 mt-1 border-t border-ivory-border dark:border-surface-dark-border flex items-baseline justify-between gap-3">
                <dt className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  In {formatMoney(monthStats.income)} · Out {formatMoney(monthStats.expenses)}
                </dt>
              </div>
            </dl>
          </aside>
        )}
      </div>
    </section>
  );
}
