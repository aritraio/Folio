import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { formatINR } from '@/utils/formatCurrency';

const ALLOCATION_COLORS = {
  'Mutual Fund': '#D97706',
  Stocks: '#0D9488',
  Gold: '#F59E0B',
  'Provident Fund': '#6366F1',
  'Fixed Deposit': '#3B82F6',
  Bonds: '#8B5CF6',
  'Real Estate': '#EC4899',
  Other: '#6B7280',
};

/**
 * Custom tooltip for the allocation donut.
 */
function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, percentage, color } = payload[0].payload;
  return (
    <div
      className="
      bg-white dark:bg-surface-dark-card
      border border-ivory-border dark:border-surface-dark-border
      rounded-lg shadow-elevated dark:shadow-dark-elevated
      px-4 py-3
    "
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs font-semibold text-zinc-900 dark:text-text-dark-primary">{name}</span>
      </div>
      <p className="text-sm font-bold mono text-zinc-900 dark:text-text-dark-primary">{formatINR(value)}</p>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
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
 * AllocationChart — Donut chart showing investment allocation by category.
 *
 * @param {{ holdings: Array }} props
 */
export default function AllocationChart({ holdings = [] }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  // Group by category
  const allocationData = (() => {
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
        color: ALLOCATION_COLORS[name] || '#6B7280',
      }))
      .sort((a, b) => b.value - a.value);
  })();

  if (allocationData.length === 0) return null;

  const totalValue = allocationData.reduce((sum, d) => sum + d.value, 0);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Allocation chart"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="mb-5">
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Allocation</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<AllocationTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-dark-tertiary">
              Total
            </span>
            <span className="text-sm font-bold mono text-zinc-900 dark:text-text-dark-primary">
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
                flex items-center justify-between py-1.5 px-2 rounded-lg
                transition-colors duration-150
                ${activeIndex === idx ? 'bg-ivory-muted dark:bg-surface-dark-elevated' : ''}
              `}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-zinc-700 dark:text-text-dark-secondary truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary w-10 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
                <span className="text-sm font-semibold mono text-zinc-900 dark:text-text-dark-primary w-24 text-right">
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
