import React from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { formatINR, formatPercent, formatChange } from '@/utils/formatCurrency';

/**
 * Single stat card within the portfolio summary.
 */
function StatCard({ icon: Icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
          {label}
        </p>
        <p className={`text-lg font-bold mono ${valueColor || 'text-zinc-900 dark:text-text-dark-primary'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * PortfolioSummary — Top-level portfolio metrics.
 *
 * @param {{ totalInvested: number, totalCurrent: number, totalReturn: number, returnPercentage: number, todayChange: number }} props
 */
export default function PortfolioSummary({
  totalInvested = 0,
  totalCurrent = 0,
  totalReturn = 0,
  returnPercentage = 0,
  todayChange = 0,
}) {
  const isPositiveReturn = totalReturn >= 0;
  const isPositiveToday = todayChange >= 0;

  return (
    <section className="card p-6 animate-fade-in-up" aria-label="Portfolio summary">
      {/* Big headline number */}
      <div className="mb-6 pb-6 border-b border-ivory-border dark:border-surface-dark-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
          Total Investments
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="display-xl text-zinc-900 dark:text-text-dark-primary">
            {formatINR(totalCurrent)}
          </span>
          <span
            className={`text-sm font-semibold mono ${isPositiveReturn ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
          >
            {formatChange(totalReturn)} ({formatPercent(returnPercentage)})
          </span>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Wallet}
          iconBg="bg-amber-50 dark:bg-amber-500/10 text-brand-amber dark:text-amber-400"
          label="Invested"
          value={formatINR(totalInvested)}
        />
        <StatCard
          icon={BarChart3}
          iconBg="bg-teal-50 dark:bg-teal-500/10 text-brand-teal dark:text-teal-400"
          label="Current Value"
          value={formatINR(totalCurrent)}
        />
        <StatCard
          icon={isPositiveReturn ? TrendingUp : TrendingDown}
          iconBg={`${isPositiveReturn ? 'bg-emerald-50 dark:bg-emerald-500/10 text-brand-emerald dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-brand-red dark:text-rose-400'}`}
          label="Total Return"
          value={formatChange(totalReturn)}
          valueColor={
            isPositiveReturn
              ? 'text-brand-emerald dark:text-emerald-400'
              : 'text-brand-red dark:text-rose-400'
          }
        />
        <StatCard
          icon={isPositiveToday ? TrendingUp : TrendingDown}
          iconBg={`${isPositiveToday ? 'bg-emerald-50 dark:bg-emerald-500/10 text-brand-emerald dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-brand-red dark:text-rose-400'}`}
          label="Today"
          value={formatChange(todayChange)}
          valueColor={
            isPositiveToday ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'
          }
        />
      </div>
    </section>
  );
}
