import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function ExpensesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3 space-y-1">
      <p className="text-xs font-semibold text-[#8E9192] font-mono">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff6b6b]" />
          <span className="text-xs text-[#8E9192]">{entry.name}:</span>
          <span className="text-sm font-semibold font-mono tabular-nums text-white">
            {formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * MonthlyExpensesChart — Outflow bars in #ff6b6b.
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
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Monthly Expenses</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          Expense trend over recent months
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#8E9192', fontFamily: 'JetBrains Mono, monospace' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#8E9192', fontFamily: 'JetBrains Mono, monospace' }}
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
            />
            <Tooltip content={<ExpensesTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="Expenses" fill="#ff6b6b" radius={[2, 2, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
