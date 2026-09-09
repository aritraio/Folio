import React from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart3, CalendarClock } from 'lucide-react';
import { formatINR, formatPercent, formatChange } from '@/utils/formatCurrency';
import { useCountUp } from '@/utils/useCountUp';

function StatCard({ icon: Icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`} aria-hidden="true">
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
 * PortfolioSummary — hero with count-up (§17, §31) + composition details (§20).
 * Best performer / largest position render only from real holdings data.
 */
export default function PortfolioSummary({
  totalInvested = 0,
  totalCurrent = 0,
  totalReturn = 0,
  returnPercentage = 0,
  todayChange = 0,
  best = null,
  largest = null,
}) {
  const animated = useCountUp(totalCurrent, 900);
  const isPositiveReturn = totalReturn >= 0;
  const isPositiveToday = todayChange >= 0;

  return (
    <section className="card p-6 animate-fade-in-up" aria-label="Portfolio summary">
      <div className="mb-6 pb-6 border-b border-ivory-border dark:border-surface-dark-border">
        <p className="eyebrow mb-1">Total investments</p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="display-xl text-zinc-900 dark:text-text-dark-primary" aria-live="polite">
            {formatINR(animated)}
          </span>
          <span
            className={`text-sm font-semibold mono ${isPositiveReturn ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
          >
            {formatChange(totalReturn)} ({formatPercent(returnPercentage, 1)})
          </span>
        </div>
        <p className="mt-2 text-xs text-text-secondary dark:text-text-dark-secondary">
          Current value across all holdings · return = current − invested
        </p>
      </div>

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
          label="Current value"
          value={formatINR(totalCurrent)}
        />
        <StatCard
          icon={isPositiveReturn ? TrendingUp : TrendingDown}
          iconBg={`${isPositiveReturn ? 'bg-emerald-50 dark:bg-emerald-500/10 text-brand-emerald dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-brand-red dark:text-rose-400'}`}
          label="Total return"
          value={formatChange(totalReturn)}
          valueColor={isPositiveReturn ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}
        />
        <StatCard
          icon={isPositiveToday ? TrendingUp : TrendingDown}
          iconBg={`${isPositiveToday ? 'bg-emerald-50 dark:bg-emerald-500/10 text-brand-emerald dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-brand-red dark:text-rose-400'}`}
          label="Today (est.)"
          value={formatChange(todayChange)}
          valueColor={isPositiveToday ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}
        />
      </div>

      {(best || largest) && (
        <dl className="mt-6 pt-5 border-t border-ivory-border dark:border-surface-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
          {best && (
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-brand-emerald shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Best performer
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary truncate">
                  {best.name}{' '}
                  <span className="mono font-semibold text-brand-emerald">
                    {formatPercent(best.returnPct, 1)}
                  </span>
                </dd>
              </div>
            </div>
          )}
          {largest && (
            <div className="flex items-center gap-3">
              <CalendarClock className="w-4 h-4 text-investment shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Largest position
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary truncate">
                  {largest.name} <span className="mono font-semibold">{formatINR(largest.current)}</span>
                </dd>
              </div>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}
