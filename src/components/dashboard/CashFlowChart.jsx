import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact, formatChange } from '@/utils/formatCurrency';

/**
 * Custom tooltip for cash flow chart.
 */
function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="
      bg-white dark:bg-surface-dark-card
      border border-ivory-border dark:border-surface-dark-border
      rounded-lg shadow-elevated dark:shadow-dark-elevated
      px-4 py-3 space-y-1.5
    "
    >
      <p className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-text-secondary dark:text-text-dark-secondary">{entry.name}:</span>
          <span className="text-sm font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Small summary card inside the cash flow section.
 */
function SummaryCard({ label, value, color }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
        {label}
      </p>
      <p className={`text-base sm:text-lg font-bold mono ${color}`}>{value}</p>
    </div>
  );
}

/**
 * CashFlowChart — Bar chart of income vs expenses, with summary cards.
 *
 * @param {{ data: Array<{ shortLabel: string, income: number, expenses: number, savings: number }> }} props
 */
export default function CashFlowChart({ data = [] }) {
  // Calculate current month totals (last entry)
  const current = data.length > 0 ? data[data.length - 1] : { income: 0, expenses: 0, savings: 0 };

  const chartData = data.map((d) => ({
    name: d.shortLabel || d.label,
    Income: d.income,
    Expenses: d.expenses,
  }));

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Cash flow chart"
      style={{ animationDelay: '0.15s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="eyebrow mb-1">Money flow</p>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Cash flow</h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            Income vs spending · transfers excluded
          </p>
        </div>
        <Link
          to="/analytics"
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-amber hover:text-brand-amber-hover transition-colors"
        >
          Details
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-5 border-b border-ivory-border dark:border-surface-dark-border">
        <SummaryCard label="Income" value={formatINR(current.income)} color="text-brand-emerald" />
        <SummaryCard label="Spending" value={formatINR(current.expenses)} color="text-brand-red" />
        <SummaryCard
          label="Net flow"
          value={formatChange(current.savings)}
          color={current.savings >= 0 ? 'text-brand-emerald' : 'text-brand-red'}
        />
      </div>

      {/* Chart */}
      <div
        className="h-[220px]"
        role="img"
        aria-label={`Cash flow: income ${formatINR(current.income)}, spending ${formatINR(current.expenses)}, net ${formatChange(current.savings)} this month`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
            />
            <Tooltip content={<CashFlowTooltip />} />
            <Bar dataKey="Income" fill="#1F9D68" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Expenses" fill="#D64545" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-amber" />
          <span className="text-xs text-text-secondary dark:text-text-dark-secondary">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400 dark:bg-zinc-500" />
          <span className="text-xs text-text-secondary dark:text-text-dark-secondary">Expenses</span>
        </div>
      </div>
    </section>
  );
}
