import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';

/**
 * Custom tooltip for the expenses bar chart.
 */
function ExpensesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="
      bg-white dark:bg-surface-dark-card
      border border-ivory-border dark:border-surface-dark-border
      rounded-lg shadow-elevated dark:shadow-dark-elevated
      px-4 py-3 space-y-1
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
 * MonthlyExpensesChart — Bar chart showing monthly expenses over time.
 *
 * @param {{ data: Array<{ shortLabel: string, label: string, expenses: number }> }} props
 */
export default function MonthlyExpensesChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.shortLabel || d.label,
    Expenses: d.expenses,
  }));

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Monthly expenses chart"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Monthly Expenses</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          Expense trend over recent months
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
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
            <Tooltip content={<ExpensesTooltip />} />
            <Bar dataKey="Expenses" fill="#E11D48" radius={[4, 4, 0, 0]} maxBarSize={36} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
