import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react';
import { formatINR, formatPercent, formatCompact } from '@/utils/formatCurrency';

/**
 * Single metric card used inside the metrics strip.
 * Terminal: 1px dividers, mono figures, inflow/outflow pill badges.
 */
function MetricBlock({ label, icon: Icon, value, subValue, subPill }) {
  return (
    <div className="flex items-start gap-3.5 py-4 px-1 min-w-0">
      <div className="shrink-0 p-2.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E]">
        <Icon className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#404040] dark:text-[#C4C7C8] mb-1 font-mono">
          {label}
        </p>
        <p className="text-lg font-bold font-mono tabular-nums text-[#0A0A0A] dark:text-white truncate">
          {value}
        </p>
        {subValue && (
          <p className="mt-1">
            <span
              className={`inline-flex items-center text-xs font-medium font-mono tabular-nums px-2 py-0.5 rounded ${subPill || 'text-[#8E9192]'}`}
            >
              {subValue}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

const PILL_IN =
  'bg-[rgba(0,163,131,0.08)] text-[#00a383] dark:bg-[rgba(0,184,148,0.12)] dark:text-[#00b894]';
const PILL_OUT =
  'bg-[rgba(232,65,24,0.08)] text-[#e84118] dark:bg-[rgba(255,107,107,0.12)] dark:text-[#ff6b6b]';

/**
 * FinancialMetrics — Horizontal strip of 5 key financial metrics.
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
      value: formatCompact(netWorth),
      // formatPercent already carries its own sign — do not prefix another.
      subValue: `${formatPercent(netWorthChangePercent)} this month`,
      subPill: netWorthChange >= 0 ? PILL_IN : PILL_OUT,
    },
    {
      label: 'Inflow',
      icon: ArrowDownLeft,
      value: formatINR(income),
      subValue: `+${formatINR(income)} this month`,
      subPill: PILL_IN,
    },
    {
      label: 'Outflow',
      icon: ArrowUpRight,
      value: formatINR(expenses),
      subValue: `−${formatINR(expenses)} this month`,
      subPill: PILL_OUT,
    },
    {
      label: 'Savings',
      icon: PiggyBank,
      value: formatINR(savings),
      subValue: `${formatPercent(savingsRate)} rate`,
      subPill:
        savingsRate >= 20 ? PILL_IN : savingsRate >= 0 ? 'text-[#8E9192]' : PILL_OUT,
    },
    {
      label: 'Investments',
      icon: TrendingUp,
      value: formatCompact(investmentValue),
      subValue: `${formatPercent(investmentReturn)} return`,
      subPill: investmentReturn >= 0 ? PILL_IN : PILL_OUT,
    },
  ];

  return (
    <section
      className="card p-2 sm:p-4 animate-fade-in-up"
      aria-label="Financial metrics"
      style={{ animationDelay: '0.05s' }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E5] dark:divide-[#262626]">
        {metrics.map((m) => (
          <div key={m.label} className="px-3 sm:px-4 lg:px-5">
            <MetricBlock {...m} />
          </div>
        ))}
      </div>
    </section>
  );
}
