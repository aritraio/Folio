import React from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { formatINR, formatPercent, formatChange } from '@/utils/formatCurrency';

/**
 * Single stat card within the portfolio summary — terminal monochrome chip.
 */
function StatCard({ icon: Icon, label, value, valueClass }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] font-mono">
          {label}
        </p>
        <p
          className={`text-lg font-bold font-mono tabular-nums ${valueClass || 'text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]'}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * PortfolioSummary — Top-level portfolio metrics.
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
      <div className="mb-6 pb-6 border-b border-[var(--color-border)] dark:border-[var(--color-border)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1 font-mono">
          Total Investments
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="display-xl text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] tabular-nums">
            {formatINR(totalCurrent)}
          </span>
          <span
            className={`text-sm font-semibold font-mono tabular-nums ${isPositiveReturn ? 'text-[var(--color-positive)] dark:text-[var(--color-positive)]' : 'text-[var(--color-negative)] dark:text-[var(--color-negative)]'}`}
          >
            {formatChange(totalReturn)} ({formatPercent(returnPercentage)})
          </span>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Wallet} label="Invested" value={formatINR(totalInvested)} />
        <StatCard icon={BarChart3} label="Current Value" value={formatINR(totalCurrent)} />
        <StatCard
          icon={isPositiveReturn ? TrendingUp : TrendingDown}
          label="Total Return"
          value={formatChange(totalReturn)}
          valueClass={
            isPositiveReturn
              ? 'text-[var(--color-positive)] dark:text-[var(--color-positive)]'
              : 'text-[var(--color-negative)] dark:text-[var(--color-negative)]'
          }
        />
        <StatCard
          icon={isPositiveToday ? TrendingUp : TrendingDown}
          label="Today"
          value={formatChange(todayChange)}
          valueClass={
            isPositiveToday
              ? 'text-[var(--color-positive)] dark:text-[var(--color-positive)]'
              : 'text-[var(--color-negative)] dark:text-[var(--color-negative)]'
          }
        />
      </div>
    </section>
  );
}
