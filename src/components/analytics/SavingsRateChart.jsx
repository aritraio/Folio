import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPercent } from '@/utils/formatCurrency';
import { calcMonthlyIncome, calcMonthlyExpenses, calcSavingsRate } from '@/utils/calculations';

/**
 * Custom tooltip for savings rate chart.
 */
function SavingsRateTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div
      className="
      bg-white dark:bg-surface-dark-card
      border border-ivory-border dark:border-surface-dark-border
      rounded-lg shadow-elevated dark:shadow-dark-elevated
      px-4 py-3
    "
    >
      <p className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary mb-1">{label}</p>
      <p
        className={`text-base font-bold mono ${value >= 0 ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
      >
        {formatPercent(value)}
      </p>
    </div>
  );
}

/**
 * SavingsRateChart — Line chart showing savings rate trend over time.
 *
 * @param {{ transactions: Array, months: Array<{ monthKey: string, shortLabel: string, label: string }> }} props
 */
export default function SavingsRateChart({ transactions = [], months = [] }) {
  const chartData = useMemo(() => {
    return months.map((m) => {
      const income = calcMonthlyIncome(transactions, m.monthKey);
      const expenses = calcMonthlyExpenses(transactions, m.monthKey);
      const rate = calcSavingsRate(income, expenses);
      return {
        name: m.shortLabel || m.label,
        rate: Math.round(rate * 100) / 100,
      };
    });
  }, [transactions, months]);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Savings rate chart"
      style={{ animationDelay: '0.25s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Savings Rate</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          Percentage of income saved each month
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${v}%`}
              dx={-4}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<SavingsRateTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: '#059669',
                fill: 'var(--color-bg-secondary)',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
