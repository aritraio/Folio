import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import { calcCategoryBreakdown } from '@/utils/calculations';

/**
 * Custom tooltip for grouped category comparison chart.
 */
function CategoryComparisonTooltip({ active, payload, label }) {
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

const CATEGORY_COLORS = [
  '#D97706', // amber
  '#0D9488', // teal
  '#7C3AED', // violet
  '#E11D48', // rose
  '#0EA5E9', // sky
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
];

/**
 * CategoryComparisonChart — Stacked bar chart comparing category spending
 * across the last N months. Shows top categories only.
 *
 * @param {{ transactions: Array, months: Array<{ monthKey: string, shortLabel: string }> }} props
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
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Category Comparison</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          Spending by category across months
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
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
            <Tooltip content={<CategoryComparisonTooltip />} />
            {categories.map((cat, idx) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="categories"
                fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 pt-3 border-t border-ivory-border dark:border-surface-dark-border">
        {categories.map((cat, idx) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
            />
            <span className="text-xs text-text-secondary dark:text-text-dark-secondary">{cat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
