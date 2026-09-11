import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact, formatChange } from '@/utils/formatCurrency';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3 space-y-1.5">
      <p className="text-xs font-semibold text-[#8E9192] font-mono">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
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
 * Small summary card inside the cash flow section.
 */
function SummaryCard({ label, value, valueClass }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] mb-1 font-mono">
        {label}
      </p>
      <p className={`text-base sm:text-lg font-bold font-mono tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

/**
 * CashFlowChart — Dual bars: #00b894 income / #ff6b6b expenses.
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
          <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Cash Flow</h2>
          <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
            Income vs Expenses
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-5 border-b border-[#E5E5E5] dark:border-[#262626]">
        <SummaryCard
          label="Income"
          value={`+${formatINR(current.income)}`}
          valueClass="text-[#00a383] dark:text-[#00b894]"
        />
        <SummaryCard
          label="Expenses"
          value={`−${formatINR(current.expenses)}`}
          valueClass="text-[#e84118] dark:text-[#ff6b6b]"
        />
        <SummaryCard
          label="Net Cash Flow"
          value={formatChange(current.savings)}
          valueClass={current.savings >= 0 ? 'text-[#00a383] dark:text-[#00b894]' : 'text-[#e84118] dark:text-[#ff6b6b]'}
        />
      </div>

      {/* Chart */}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
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
            <Tooltip content={<CashFlowTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="Income" fill="#00b894" radius={[2, 2, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Expenses" fill="#ff6b6b" radius={[2, 2, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#00b894]" />
          <span className="text-xs text-[#8E9192]">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ff6b6b]" />
          <span className="text-xs text-[#8E9192]">Expenses</span>
        </div>
      </div>
    </section>
  );
}
