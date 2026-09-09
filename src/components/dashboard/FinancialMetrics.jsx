import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react';
import { formatINR, formatPercent, formatCompact } from '@/utils/formatCurrency';

/**
 * Compact financial strip (§11) — Income / Spending / Savings / Investments.
 * No equal-weight KPI cards; semantic drill-down links (Dashboard → detail).
 */
function MetricCell({ label, icon: Icon, iconColor, value, subValue, subColor, to, first }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} aria-hidden="true" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold mono tracking-tight text-zinc-900 dark:text-text-dark-primary">
        {value}
      </p>
      {subValue && (
        <p
          className={`text-xs font-medium mt-1 ${subColor || 'text-text-tertiary dark:text-text-dark-tertiary'}`}
        >
          {subValue}
        </p>
      )}
    </>
  );

  const cls = `block py-4 px-1 min-w-0 rounded-lg row-hover ${first ? '' : ''}`;
  return to ? (
    <Link
      to={to}
      className={`${cls} hover:opacity-90 focus-visible:rounded-lg`}
      aria-label={`${label}: ${value}, ${subValue || ''}`}
    >
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function FinancialMetrics({
  income = 0,
  expenses = 0,
  savings = 0,
  savingsRate = 0,
  investmentValue = 0,
  investmentReturn = 0,
}) {
  return (
    <section
      className="animate-fade-in-up section-divider pt-6"
      aria-label="This month: income, spending, savings, investments"
      style={{ animationDelay: '0.05s' }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
        <MetricCell
          first
          label="Income"
          icon={ArrowDownLeft}
          iconColor="text-brand-emerald"
          value={formatINR(income)}
          subValue="This month"
          to="/analytics"
        />
        <MetricCell
          label="Spending"
          icon={ArrowUpRight}
          iconColor="text-brand-red"
          value={formatINR(expenses)}
          subValue="This month"
          to="/transactions"
        />
        <MetricCell
          label="Savings"
          icon={PiggyBank}
          iconColor="text-cash"
          value={formatINR(savings)}
          subValue={`${formatPercent(savingsRate, 1)} rate`}
          subColor={
            savingsRate >= 20
              ? 'text-brand-emerald'
              : savingsRate >= 0
                ? 'text-brand-amber'
                : 'text-brand-red'
          }
          to="/analytics"
        />
        <MetricCell
          label="Investments"
          icon={TrendingUp}
          iconColor="text-investment"
          value={formatCompact(investmentValue)}
          subValue={`${formatPercent(investmentReturn, 1)} total return`}
          subColor={investmentReturn >= 0 ? 'text-brand-emerald' : 'text-brand-red'}
          to="/investments"
        />
      </div>
    </section>
  );
}
