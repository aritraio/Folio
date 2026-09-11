import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import useChartTheme from '@/utils/useChartTheme';

/* Terminal tooltip: #141414 bg, #262626 border, mono figures */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3">
      <p className="text-xs font-semibold text-[#8E9192] mb-1 font-mono">{label}</p>
      <p className="text-base font-bold font-mono tabular-nums text-white">
        {formatINR(payload[0].value)}
      </p>
    </div>
  );
}

const TIME_RANGES = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: null },
];

/**
 * NetWorthChart — Monochrome area chart, theme-aware linework.
 */
export default function NetWorthChart({ data = [] }) {
  const [activeRange, setActiveRange] = useState('6M');
  const chart = useChartTheme();

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
          <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Net Worth</h2>
          <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
            {activeRange === 'ALL' ? 'All time' : `Last ${activeRange.toLowerCase()}`}
          </p>
        </div>

        {/* Time range toggles */}
        <div className="flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded p-1">
          {TIME_RANGES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveRange(label)}
              className={`
                px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider font-mono
                transition-colors duration-150
                ${
                  activeRange === label
                    ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                    : 'text-[#8E9192] hover:text-[#0A0A0A] dark:hover:text-white'
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
                <stop offset="0%" stopColor={chart.line} stopOpacity={0.05} />
                <stop offset="100%" stopColor={chart.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chart.grid} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chart.tick, fontFamily: 'JetBrains Mono, monospace' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chart.tick, fontFamily: 'JetBrains Mono, monospace' }}
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chart.line}
              strokeWidth={2}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chart.line, fill: chart.activeDotFill }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
