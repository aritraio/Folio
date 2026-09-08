import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react';
import { formatINR, formatPercent, formatCompact } from '@/utils/formatCurrency';

/**
 * Single metric card used inside the metrics strip.
 */
function MetricBlock({ label, icon: Icon, iconBg, iconColor, value, subValue, subColor }) {
  return (
    <div className="flex items-start gap-3.5 py-4 px-1 min-w-0">
      <div
        className={`
        shrink-0 p-2.5 rounded-xl
        ${iconBg}
      `}
      >
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold mono text-zinc-900 dark:text-text-dark-primary truncate">
          {value}
        </p>
        {subValue && (
          <p
            className={`text-xs font-medium mt-0.5 ${subColor || 'text-text-tertiary dark:text-text-dark-tertiary'}`}
          >
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * FinancialMetrics — Horizontal strip of 5 key financial metrics.
 *
 * @param {{
 *   netWorth: number,
 *   netWorthChange: number,
 *   income: number,
 *   expenses: number,
 *   savings: number,
 *   savingsRate: number,
 *   investmentValue: number,
 *   investmentReturn: number
 * }} props
 */
export default function FinancialMetrics({
  netWorth = 0,
  netWorthChange = 0,
  income = 0,
  expenses = 0,
  savings = 0,
  savingsRate = 0,
  investmentValue = 0,
  investmentReturn = 0,
}) {
  const netWorthChangePercent =
    netWorth - netWorthChange > 0 ? (netWorthChange / (netWorth - netWorthChange)) * 100 : 0;

  const metrics = [
    {
      label: 'Net Worth',
      icon: Wallet,
      iconBg: 'bg-amber-50 dark:bg-[rgba(245,158,11,0.12)]',
      iconColor: 'text-brand-amber',
      value: formatCompact(netWorth),
      subValue: `${formatPercent(netWorthChangePercent)} this month`,
      subColor: netWorthChange >= 0 ? 'text-brand-emerald' : 'text-brand-red',
    },
    {
      label: 'Income',
      icon: ArrowDownLeft,
      iconBg: 'bg-brand-emerald-light dark:bg-[rgba(52,211,153,0.12)]',
      iconColor: 'text-brand-emerald',
      value: formatINR(income),
      subValue: 'This month',
      subColor: 'text-text-tertiary dark:text-text-dark-tertiary',
    },
    {
      label: 'Expenses',
      icon: ArrowUpRight,
      iconBg: 'bg-brand-red-light dark:bg-[rgba(251,113,133,0.12)]',
      iconColor: 'text-brand-red',
      value: formatINR(expenses),
      subValue: 'This month',
      subColor: 'text-text-tertiary dark:text-text-dark-tertiary',
    },
    {
      label: 'Savings',
      icon: PiggyBank,
      iconBg: 'bg-blue-50 dark:bg-[rgba(59,130,246,0.12)]',
      iconColor: 'text-blue-500',
      value: formatINR(savings),
      subValue: `${formatPercent(savingsRate)} rate`,
      subColor:
        savingsRate >= 20 ? 'text-brand-emerald' : savingsRate >= 0 ? 'text-brand-amber' : 'text-brand-red',
    },
    {
      label: 'Investments',
      icon: TrendingUp,
      iconBg: 'bg-purple-50 dark:bg-[rgba(139,92,246,0.12)]',
      iconColor: 'text-purple-500',
      value: formatCompact(investmentValue),
      subValue: `${formatPercent(investmentReturn)} return`,
      subColor: investmentReturn >= 0 ? 'text-brand-emerald' : 'text-brand-red',
    },
  ];

  return (
    <section
      className="card p-2 sm:p-4 animate-fade-in-up"
      aria-label="Financial metrics"
      style={{ animationDelay: '0.05s' }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-ivory-border dark:divide-surface-dark-border">
        {metrics.map((m) => (
          <div key={m.label} className="px-3 sm:px-4 lg:px-5">
            <MetricBlock {...m} />
          </div>
        ))}
      </div>
    </section>
  );
}
