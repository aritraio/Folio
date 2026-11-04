import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import useChartTheme from '@/utils/useChartTheme';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function IncomeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded px-4 py-3 space-y-1">
      <p className="text-xs font-semibold text-[var(--color-text-tertiary)] font-mono">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00b894]" />
          <span className="text-xs text-[var(--color-text-tertiary)]">{entry.name}:</span>
          <span className="text-sm font-semibold font-mono tabular-nums text-[var(--color-text-primary)]">
            {formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * MonthlyIncomeChart — Inflow bars in #00b894.
 */
export default function MonthlyIncomeChart({ data = [] }) {
  const chart = useChartTheme();
  const chartData = data.map((d) => ({
    name: d.shortLabel || d.label,
    Income: d.income,
  }));

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Monthly income chart"
      style={{ animationDelay: '0.15s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
          Monthly Income
        </h2>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 font-mono uppercase tracking-widest">
          Income trend over recent months
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chart.grid} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chart.tick, fontFamily: 'JetBrains Mono, monospace' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chart.tick, fontFamily: 'JetBrains Mono, monospace' }}
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
            />
            <Tooltip content={<IncomeTooltip />} cursor={{ fill: chart.cursor }} />
            <Bar dataKey="Income" fill={chart.income} radius={[2, 2, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
