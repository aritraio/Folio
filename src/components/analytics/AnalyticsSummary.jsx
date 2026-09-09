import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR, formatPercent } from '@/utils/formatCurrency';

/**
 * AnalyticsSummary — editorial performance strip (§14, §89).
 * "Explain what happened to the user's money": Income / Spending / Savings / Rate
 * as inline statistics with drill-down, not six equal cards.
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
  const savings = monthlyIncome - monthlySpending;
  const cells = [
    { label: 'Income', value: formatINR(monthlyIncome), to: '/transactions', tone: 'text-brand-emerald' },
    { label: 'Spending', value: formatINR(monthlySpending), to: '/transactions', tone: 'text-brand-red' },
    {
      label: 'Savings',
      value: formatINR(savings),
      to: '/transactions',
      tone: savings >= 0 ? 'text-brand-emerald' : 'text-brand-red',
    },
    {
      label: 'Savings rate',
      value: formatPercent(savingsRate, 1),
      tone: savingsRate >= 20 ? 'text-brand-emerald' : 'text-brand-amber',
    },
  ];

  return (
    <section aria-label={`Financial performance for ${monthLabel}`} className="animate-fade-in-up">
      <p className="eyebrow mb-1">{monthLabel || 'Selected month'}</p>
      <h2 className="font-serif-display text-2xl font-medium tracking-tight text-zinc-900 dark:text-text-dark-primary mb-4">
        Financial performance at a glance
      </h2>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 section-divider pt-5">
        {cells.map((c) => (
          <div key={c.label}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
              {c.label}
            </dt>
            <dd className={`text-2xl font-semibold mono tracking-tight ${c.tone}`}>
              {c.to ? (
                <Link to={c.to} className="hover:underline underline-offset-4 decoration-1">
                  {c.value}
                </Link>
              ) : (
                c.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-text-secondary dark:text-text-dark-secondary">
        Net flow {formatINR(netCashFlow)} · averaging {formatINR(Math.round(avgDailySpending))} per day
        {topCategory ? (
          <>
            {' '}
            · top category{' '}
            <span className="font-semibold text-zinc-800 dark:text-text-dark-primary">
              {topCategory.category}
            </span>{' '}
            at {formatINR(topCategory.amount)}
          </>
        ) : null}
        .
      </p>
      <p className="sr-only">
        In {monthLabel}: income {formatINR(monthlyIncome)}, spending {formatINR(monthlySpending)}, savings{' '}
        {formatINR(savings)}, a savings rate of {formatPercent(savingsRate, 1)}.
      </p>
    </section>
  );
}
