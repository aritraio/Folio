import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { formatINR, formatCompact, formatChange, formatPercent } from '@/utils/formatCurrency';
import SegmentedControl from '@/components/ui/SegmentedControl';

const TIME_RANGES = [
  { label: '3M', value: '3M', months: 3 },
  { label: '6M', value: '6M', months: 6 },
  { label: '1Y', value: '1Y', months: 12 },
  { label: 'All', value: 'ALL', months: null },
];

/**
 * Tooltip with current value + delta vs previous point (§10).
 */
function ChartTooltip({ active, payload, label, deltas }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const delta = deltas?.[label];
  return (
    <div className="bg-white dark:bg-surface-dark-card border border-ivory-border dark:border-surface-dark-border rounded-lg shadow-elevated dark:shadow-dark-elevated px-4 py-3 min-w-[180px]">
      <p className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary mb-1">{label}</p>
      <p className="text-base font-bold mono text-zinc-900 dark:text-text-dark-primary">{formatINR(value)}</p>
      {delta != null && (
        <p className={`text-xs font-medium mt-0.5 ${delta >= 0 ? 'text-brand-emerald' : 'text-brand-red'}`}>
          {formatChange(delta)} vs prior month
        </p>
      )}
      <p className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary mt-1">Net worth · actual</p>
    </div>
  );
}

/**
 * NetWorthChart — hero trend (§10, §88).
 * Minimal gridlines, current-value marker, compact period control,
 * accessible text summary. Actual = solid; any projected tail = dashed
 * (entries may carry { projected: true }).
 */
export default function NetWorthChart({ data = [] }) {
  const [activeRange, setActiveRange] = useState('6M');

  const filteredData = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === activeRange);
    if (!range?.months) return data;
    return data.slice(-range.months);
  }, [data, activeRange]);

  const { chartData, deltas, lastPoint } = useMemo(() => {
    const rows = filteredData.map((d) => ({
      name: d.label || d.shortLabel,
      value: d.netWorth,
      projected: Boolean(d.projected),
    }));
    const deltasMap = {};
    rows.forEach((r, i) => {
      deltasMap[r.name] = i === 0 ? 0 : r.value - rows[i - 1].value;
    });
    return { chartData: rows, deltas: deltasMap, lastPoint: rows[rows.length - 1] };
  }, [filteredData]);

  const summary = useMemo(() => {
    if (chartData.length < 2)
      return chartData.length === 1
        ? `Net worth is ${formatINR(chartData[0].value)}.`
        : 'No net-worth history yet.';
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const ch = last.value - first.value;
    const pct = first.value !== 0 ? (ch / Math.abs(first.value)) * 100 : 0;
    return `Net worth moved from ${formatINR(first.value)} in ${first.name} to ${formatINR(last.value)} in ${last.name} (${formatPercent(pct, 1)}).`;
  }, [chartData]);

  const hasProjected = chartData.some((d) => d.projected);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Net worth trend"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Net worth trend</h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            {activeRange === 'ALL' ? 'All time · actual' : `Last ${activeRange.toLowerCase()} · actual`}
            {hasProjected ? ' · dashed = projected' : ''}
          </p>
        </div>
        <SegmentedControl
          ariaLabel="Net worth period"
          options={TIME_RANGES}
          value={activeRange}
          onChange={setActiveRange}
        />
      </div>

      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E87500" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#E87500" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              dy={8}
              minTickGap={24}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
              width={56}
            />
            <Tooltip content={<ChartTooltip deltas={deltas} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#E87500"
              strokeWidth={2.5}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#E87500', fill: 'var(--color-bg-secondary)' }}
            />
            {lastPoint && (
              <ReferenceDot
                x={lastPoint.name}
                y={lastPoint.value}
                r={5}
                fill="#E87500"
                stroke="var(--color-bg-secondary)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="sr-only">{summary}</p>
      <p className="mt-3 text-xs text-text-secondary dark:text-text-dark-secondary" aria-hidden="true">
        {summary}
      </p>
      {hasProjected && (
        <div className="mt-2 flex items-center gap-4 text-[11px] text-text-secondary dark:text-text-dark-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-6 h-0 border-t-2 border-solid border-[#E87500]" /> Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-6 h-0 border-t-2 border-dashed border-[#E87500]" /> Projected
          </span>
        </div>
      )}
    </section>
  );
}
