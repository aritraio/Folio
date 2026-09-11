import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/utils/formatCurrency';
import { getLastNMonths } from '@/utils/dateUtils';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function PortfolioTooltip({ active, payload, label }) {
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
 * PortfolioValueChart — Monochrome area: white stroke, white gradient.
 * NOTE: historical prices are not stored in v1, so this is an illustrative
 * projection from current value (clearly labelled as estimated).
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
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Portfolio Value</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
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
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<PortfolioTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#FFFFFF', fill: '#0A0A0A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
