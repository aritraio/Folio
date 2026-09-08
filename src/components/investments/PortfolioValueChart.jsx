import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import { getLastNMonths } from '@/utils/dateUtils';

/**
 * Custom tooltip for the portfolio value chart.
 */
function PortfolioTooltip({ active, payload, label }) {
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
 * PortfolioValueChart — Area chart showing estimated portfolio value trend.
 * NOTE: historical prices are not stored in v1, so this is an illustrative
 * projection from current value (clearly labelled as estimated).
 * Replace with real snapshots once price history is persisted.
 *
 * @param {{ totalCurrent: number }} props
 */
export default function PortfolioValueChart({ totalCurrent = 0 }) {
  const chartData = useMemo(() => {
    const months = getLastNMonths(12);
    // Simulate a realistic growth curve from ~75% of current value to current
    return months.map((m, idx) => {
      const progress = idx / (months.length - 1);
      // Simulate with some variance — not a straight line
      const baseGrowth = 0.75 + progress * 0.25;
      const variance = 1 + Math.sin(idx * 1.3) * 0.02; // tiny oscillation
      const value = Math.round(totalCurrent * baseGrowth * variance);
      return {
        name: m.shortLabel,
        value,
      };
    });
  }, [totalCurrent]);

  return (
    <section
      className="card p-6 animate-fade-in-up motion-reduce:animate-none"
      aria-label="Portfolio value chart (estimated)"
      style={{ animationDelay: '0.15s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Portfolio Value</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          Estimated trend — illustrative projection from current value, not market history
        </p>
      </div>

      <div
        className="h-[260px]"
        role="img"
        aria-label={`Estimated portfolio trend ending at ${formatINR(totalCurrent)}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
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
            <Tooltip content={<PortfolioTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#7C3AED"
              strokeWidth={2.5}
              fill="url(#portfolioGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: '#7C3AED',
                fill: 'var(--color-bg-secondary)',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
