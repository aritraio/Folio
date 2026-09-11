import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import useChartTheme from '@/utils/useChartTheme';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function NetWorthTooltip({ active, payload, label }) {
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

/**
 * NetWorthGrowthChart — Monochrome theme-aware area chart.
 */
export default function NetWorthGrowthChart({ data = [] }) {
  const chart = useChartTheme();
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
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Net Worth Growth</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          Portfolio value trajectory
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsNWGradient" x1="0" y1="0" x2="0" y2="1">
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
            <Tooltip content={<NetWorthTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chart.line}
              strokeWidth={2}
              fill="url(#analyticsNWGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chart.line, fill: chart.activeDotFill }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
