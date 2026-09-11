import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPercent } from '@/utils/formatCurrency';
import { calcMonthlyIncome, calcMonthlyExpenses, calcSavingsRate } from '@/utils/calculations';
import useChartTheme from '@/utils/useChartTheme';

/**
 * Terminal tooltip: #141414 bg, #262626 border. Value keeps inflow/outflow signal.
 */
function SavingsRateTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3">
      <p className="text-xs font-semibold text-[#8E9192] mb-1 font-mono">{label}</p>
      <p
        className={`text-base font-bold font-mono tabular-nums ${value >= 0 ? 'text-[#00b894]' : 'text-[#ff6b6b]'}`}
      >
        {formatPercent(value)}
      </p>
    </div>
  );
}

/**
 * SavingsRateChart — Monochrome theme-aware trend line for savings rate.
 */
export default function SavingsRateChart({ transactions = [], months = [] }) {
  const chart = useChartTheme();
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
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Savings Rate</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          Percentage of income saved each month
        </p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
              tickFormatter={(v) => `${v}%`}
              dx={-4}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<SavingsRateTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={chart.line}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chart.line, fill: chart.activeDotFill }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
