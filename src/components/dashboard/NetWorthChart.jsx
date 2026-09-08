import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';

const TIME_RANGES = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: null },
];

/**
 * Custom tooltip for the net worth chart.
 */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
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
      <p className="text-base font-bold mono text-zinc-900 dark:text-text-dark-primary">
        {formatINR(payload[0].value)}
      </p>
    </div>
  );
}

/**
 * NetWorthChart — Smooth area chart showing net worth over time.
 *
 * @param {{ data: Array<{ monthKey: string, label: string, shortLabel: string, netWorth: number }> }} props
 */
export default function NetWorthChart({ data = [] }) {
  const [activeRange, setActiveRange] = useState('6M');

  const filteredData = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.label === activeRange);
    if (!range?.months) return data;
    return data.slice(-range.months);
  }, [data, activeRange]);

  const chartData = filteredData.map((d) => ({
    name: d.label || d.shortLabel,
    value: d.netWorth,
  }));

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Net worth chart"
      style={{ animationDelay: '0.1s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Net Worth</h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            {activeRange === 'ALL' ? 'All time' : `Last ${activeRange.toLowerCase()}`}
          </p>
        </div>

        {/* Time range toggles */}
        <div className="flex items-center gap-1 bg-ivory-muted dark:bg-surface-dark-elevated rounded-lg p-1">
          {TIME_RANGES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveRange(label)}
              className={`
                px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider
                transition-all duration-150
                ${
                  activeRange === label
                    ? 'bg-white dark:bg-surface-dark-card text-zinc-900 dark:text-text-dark-primary shadow-sm'
                    : 'text-text-secondary dark:text-text-dark-secondary hover:text-zinc-900 dark:hover:text-text-dark-primary'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
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
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#D97706"
              strokeWidth={2.5}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: '#D97706',
                fill: 'var(--color-bg-secondary)',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
