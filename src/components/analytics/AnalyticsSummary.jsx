import React from 'react';
import { TrendingDown, TrendingUp, Percent, ArrowUpDown, CalendarDays, Tag } from 'lucide-react';
import { formatINR, formatPercent, formatChange } from '@/utils/formatCurrency';

/**
 * Single metric card inside the analytics summary.
 */
function MetricCard({ icon: Icon, iconColor, label, value, subtext, subtextColor }) {
  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold mono text-zinc-900 dark:text-text-dark-primary">{value}</p>
        {subtext && (
          <p
            className={`text-xs mt-1 font-medium ${subtextColor || 'text-text-secondary dark:text-text-dark-secondary'}`}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * AnalyticsSummary — Six key metrics displayed in a responsive grid.
 *
 * @param {{ monthlySpending: number, monthlyIncome: number, savingsRate: number, netCashFlow: number, avgDailySpending: number, topCategory: { category: string, amount: number } | null, monthLabel: string }} props
 */
export default function AnalyticsSummary({
  monthlySpending = 0,
  monthlyIncome = 0,
  savingsRate = 0,
  netCashFlow = 0,
  avgDailySpending = 0,
  topCategory = null,
  monthLabel = '',
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        icon={TrendingDown}
        iconColor="bg-rose-50 dark:bg-rose-500/10 text-brand-red dark:text-rose-400"
        label="Spending"
        value={formatINR(monthlySpending)}
        subtext={monthLabel}
      />
      <MetricCard
        icon={TrendingUp}
        iconColor="bg-amber-50 dark:bg-amber-500/10 text-brand-amber dark:text-amber-400"
        label="Income"
        value={formatINR(monthlyIncome)}
        subtext={monthLabel}
      />
      <MetricCard
        icon={Percent}
        iconColor="bg-emerald-50 dark:bg-emerald-500/10 text-brand-emerald dark:text-emerald-400"
        label="Savings Rate"
        value={formatPercent(savingsRate)}
        subtext={savingsRate >= 20 ? 'Healthy' : savingsRate > 0 ? 'Could improve' : 'No savings'}
        subtextColor={
          savingsRate >= 20 ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'
        }
      />
      <MetricCard
        icon={ArrowUpDown}
        iconColor={`${netCashFlow >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-brand-emerald dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-brand-red dark:text-rose-400'}`}
        label="Net Cash Flow"
        value={formatChange(netCashFlow)}
        subtext={netCashFlow >= 0 ? 'Positive' : 'Negative'}
        subtextColor={
          netCashFlow >= 0 ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'
        }
      />
      <MetricCard
        icon={CalendarDays}
        iconColor="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
        label="Avg. Daily"
        value={formatINR(Math.round(avgDailySpending))}
        subtext="Per day spending"
      />
      <MetricCard
        icon={Tag}
        iconColor="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
        label="Top Category"
        value={topCategory ? topCategory.category : '—'}
        subtext={topCategory ? formatINR(topCategory.amount) : 'No data'}
      />
    </div>
  );
}
