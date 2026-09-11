import React, { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { formatINR } from '@/utils/formatCurrency';
import useChartTheme from '@/utils/useChartTheme';

/* Donut slices use the theme-aware monochrome ramp by rank (see below). */

/**
 * Terminal tooltip: #141414 bg, #262626 border, mono figures.
 */
function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, percentage, color } = payload[0].payload;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs font-semibold text-white">{name}</span>
      </div>
      <p className="text-sm font-bold font-mono tabular-nums text-white">{formatINR(value)}</p>
      <p className="text-xs text-[#8E9192] font-mono">
        {percentage.toFixed(1)}% of portfolio
      </p>
    </div>
  );
}

/**
 * Active shape renderer for the donut.
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
 * AllocationChart — Monochrome donut of allocation by asset class.
 */
export default function AllocationChart({ holdings = [] }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const chart = useChartTheme();

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  // Group by category, then re-tone per theme so slices stay visible.
  const allocationData = useMemo(() => {
    const grouped = {};
    let total = 0;

    holdings.forEach((h) => {
      const cat = h.category || 'Other';
      const value = Number(h.currentValue) || 0;
      grouped[cat] = (grouped[cat] || 0) + value;
      total += value;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .map((d, i) => ({ ...d, color: chart.mono(i) }));
  }, [holdings, chart]);

  if (allocationData.length === 0) return null;

  const totalValue = allocationData.reduce((sum, d) => sum + d.value, 0);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Allocation chart"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Allocation</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          Portfolio distribution by asset class
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="w-[200px] h-[200px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={2}
                strokeWidth={0}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={chart.activeDotFill} strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<AllocationTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E9192] font-mono">
              Total
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-[#0A0A0A] dark:text-white">
              {formatINR(totalValue)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {allocationData.map((item, idx) => (
            <div
              key={item.name}
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
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#8E9192] w-10 text-right font-mono tabular-nums">
                  {item.percentage.toFixed(0)}%
                </span>
                <span className="text-sm font-semibold font-mono tabular-nums text-[#0A0A0A] dark:text-white w-24 text-right">
                  {formatINR(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
