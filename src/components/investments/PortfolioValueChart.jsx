import React, { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import { getLastNMonths } from '@/utils/dateUtils';

function PortfolioTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === 'actual');
  const projected = payload.find((p) => p.dataKey === 'projected');
  const shown = actual?.value != null ? actual : projected;
  return (
    <div className="bg-white dark:bg-surface-dark-card border border-ivory-border dark:border-surface-dark-border rounded-lg shadow-elevated dark:shadow-dark-elevated px-4 py-3 min-w-[170px]">
      <p className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary mb-1">{label}</p>
      <p className="text-base font-bold mono text-zinc-900 dark:text-text-dark-primary">
        {formatINR(shown?.value)}
      </p>
      <p className="text-[11px] mt-0.5 font-medium text-investment">
        {shown?.dataKey === 'projected' ? 'Projected' : 'Actual'}
      </p>
    </div>
  );
}

/**
 * PortfolioValueChart — estimated trend with unmistakable actual vs
 * projected semantics (§19): solid = actual, dashed = projected, labelled.
 * Historical prices aren't stored in v1, so the tail is an illustrative
 * projection from current value — never presented as market history.
 */
export default function PortfolioValueChart({ totalCurrent = 0 }) {
  const chartData = useMemo(() => {
    const months = getLastNMonths(12);
    const splitAt = 8; // first 8 = actual path, last 4 (overlap 1) = projected
    return months.map((m, idx) => {
      const progress = idx / (months.length - 1);
      const baseGrowth = 0.75 + progress * 0.25;
      const variance = 1 + Math.sin(idx * 1.3) * 0.02;
      const value = Math.round(totalCurrent * baseGrowth * variance);
      const isProjected = idx >= splitAt;
      return {
        name: m.shortLabel,
        actual: !isProjected ? value : idx === splitAt ? value : null,
        projected: isProjected ? value : null,
      };
    });
  }, [totalCurrent]);

  return (
    <section
      className="card p-6 animate-fade-in-up motion-reduce:animate-none"
      aria-label="Portfolio value: estimated trend with projected tail"
      style={{ animationDelay: '0.15s' }}
    >
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow mb-1">Portfolio value</p>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Growth path</h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            Solid = actual path · dashed = projected · projection is illustrative, not market history
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-text-secondary dark:text-text-dark-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-6 h-0 border-t-2 border-solid border-[#8B5CF6]" /> Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-6 h-0 border-t-2 border-dashed border-[#8B5CF6]" /> Projected
          </span>
        </div>
      </div>

      <div
        className="h-[260px]"
        role="img"
        aria-label={`Estimated portfolio trend ending at ${formatINR(totalCurrent)}. Last months are projected, not historical prices.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
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
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fill="url(#portfolioGradient)"
              dot={false}
              connectNulls
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#8B5CF6', fill: 'var(--color-bg-secondary)' }}
            />
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
        Based on current holdings and smooth growth illustration. Replace with persisted price snapshots when
        available.
      </p>
    </section>
  );
}
