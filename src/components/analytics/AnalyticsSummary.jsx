import React from 'react';
import { TrendingDown, TrendingUp, Percent, ArrowUpDown, CalendarDays, Tag } from 'lucide-react';
import { formatINR, formatPercent, formatChange } from '@/utils/formatCurrency';

/**
 * Single metric card inside the analytics summary — terminal monochrome chip.
 */
function MetricCard({ icon: Icon, label, value, subtext, subtextClass }) {
  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
          {label}
        </span>
        <div className="w-8 h-8 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold font-mono tabular-nums text-[#0A0A0A] dark:text-white">{value}</p>
        {subtext && (
          <p
            className={`text-xs mt-1 font-medium font-mono ${subtextClass || 'text-[#8E9192]'}`}
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
        label="Spending"
        value={formatINR(monthlySpending)}
        subtext={monthLabel}
      />
      <MetricCard
        icon={TrendingUp}
        label="Income"
        value={formatINR(monthlyIncome)}
        subtext={monthLabel}
      />
      <MetricCard
        icon={Percent}
        label="Savings Rate"
        value={formatPercent(savingsRate)}
        subtext={savingsRate >= 20 ? 'Healthy' : savingsRate > 0 ? 'Could improve' : 'No savings'}
        subtextClass={
          savingsRate >= 20 ? 'text-[#00a383] dark:text-[#00b894]' : 'text-[#e84118] dark:text-[#ff6b6b]'
        }
      />
      <MetricCard
        icon={ArrowUpDown}
        label="Net Cash Flow"
        value={formatChange(netCashFlow)}
        subtext={netCashFlow >= 0 ? 'Positive' : 'Negative'}
        subtextClass={
          netCashFlow >= 0 ? 'text-[#00a383] dark:text-[#00b894]' : 'text-[#e84118] dark:text-[#ff6b6b]'
        }
      />
      <MetricCard
        icon={CalendarDays}
        label="Avg. Daily"
        value={formatINR(Math.round(avgDailySpending))}
        subtext="Per day spending"
      />
      <MetricCard
        icon={Tag}
        label="Top Category"
        value={topCategory ? topCategory.category : '—'}
        subtext={topCategory ? formatINR(topCategory.amount) : 'No data'}
      />
    </div>
  );
}
