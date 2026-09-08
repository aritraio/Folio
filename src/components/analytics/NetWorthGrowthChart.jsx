import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';

/**
 * Custom tooltip for net worth growth chart.
 */
function NetWorthTooltip({ active, payload, label }) {
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
 * NetWorthGrowthChart — Area chart showing net worth growth over time.
 * Styled consistently with the dashboard NetWorthChart but for analytics context.
 *
 * @param {{ data: Array<{ label: string, shortLabel: string, netWorth: number }> }} props
 */
export default function NetWorthGrowthChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.label || d.shortLabel,
    value: d.netWorth,
  }));

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Net worth growth chart"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Net Worth Growth</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          Portfolio value trajectory
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsNWGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
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
            <Tooltip content={<NetWorthTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0D9488"
              strokeWidth={2.5}
              fill="url(#analyticsNWGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: '#0D9488',
                fill: 'var(--color-bg-secondary)',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
