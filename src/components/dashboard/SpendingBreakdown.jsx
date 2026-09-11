import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { formatINR } from '@/utils/formatCurrency';

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, amount, percentage, color } = payload[0].payload;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs font-semibold text-white">{category}</span>
      </div>
      <p className="text-sm font-bold font-mono tabular-nums text-white">{formatINR(amount)}</p>
      <p className="text-xs text-[#8E9192] font-mono">
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}

/**
 * Render the active shape with subtle highlight.
 */
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.85}
      />
    </g>
  );
}

/**
 * SpendingBreakdown — Monochrome donut + category legend.
 * Colors arrive pre-mapped to the terminal tonal gradient via CATEGORY_COLORS.
 */
export default function SpendingBreakdown({ data = [], totalExpenses = 0 }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  if (data.length === 0) {
    return (
      <section className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white mb-2">Spending Breakdown</h2>
        <p className="text-sm text-[#8E9192]">
          No spending data available for this month.
        </p>
      </section>
    );
  }

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Spending breakdown"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Spending Breakdown</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          Category-wise this month
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-[180px] h-[180px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                strokeWidth={0}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0A0A0A" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E9192] font-mono">
              Total
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-[#0A0A0A] dark:text-white">
              {formatINR(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Category Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {data.map((item, idx) => (
            <div
              key={item.category}
              className={`
                flex items-center justify-between py-1.5 px-2 rounded
                transition-colors duration-150
                ${activeIndex === idx ? 'bg-[#F5F5F5] dark:bg-[#1E1E1E]' : ''}
              `}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-[#404040] dark:text-[#C4C7C8] truncate">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#8E9192] w-10 text-right font-mono tabular-nums">
                  {item.percentage.toFixed(0)}%
                </span>
                <span className="text-sm font-semibold font-mono tabular-nums text-[#0A0A0A] dark:text-white w-20 text-right">
                  {formatINR(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
