import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import { calcCategoryBreakdown } from '@/utils/calculations';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function CategoryComparisonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3 space-y-1.5">
      <p className="text-xs font-semibold text-[#8E9192] font-mono">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.fill || entry.color }} />
          <span className="text-xs text-[#8E9192]">{entry.name}:</span>
          <span className="text-sm font-semibold font-mono tabular-nums text-white">
            {formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* High-contrast monochromatic tonal gradient — no rainbow */
const MONO_STACK = ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A', '#52525B', '#3F3F46'];

/**
 * CategoryComparisonChart — Stacked bars in monochrome tones.
 */
export default function CategoryComparisonChart({ transactions = [], months = [] }) {
  const { chartData, categories } = useMemo(() => {
    // Get all category breakdowns per month
    const allCategories = new Set();
    const monthlyData = months.map((m) => {
      const breakdown = calcCategoryBreakdown(transactions, m.monthKey);
      const row = { name: m.shortLabel || m.label };
      breakdown.forEach((item) => {
        allCategories.add(item.category);
        row[item.category] = item.amount;
      });
      return row;
    });

    // Sort categories by total spend and take top 6
    const categoryTotals = {};
    monthlyData.forEach((row) => {
      allCategories.forEach((cat) => {
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (row[cat] || 0);
      });
    });

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat]) => cat);

    return {
      chartData: monthlyData,
      categories: topCategories,
    };
  }, [transactions, months]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Category spending comparison"
      style={{ animationDelay: '0.2s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Category Comparison</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          Spending by category across months
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
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
            <Tooltip content={<CategoryComparisonTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            {categories.map((cat, idx) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="categories"
                fill={MONO_STACK[idx % MONO_STACK.length]}
                radius={idx === categories.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
        {categories.map((cat, idx) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: MONO_STACK[idx % MONO_STACK.length] }}
            />
            <span className="text-xs text-[#8E9192]">{cat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
