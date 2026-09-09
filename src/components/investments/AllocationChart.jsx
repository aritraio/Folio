import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { formatINR, formatPercent } from '@/utils/formatCurrency';

const ALLOCATION_COLORS = {
  'Mutual Fund': '#E87500',
  Stocks: '#0D9488',
  Gold: '#D99A00',
  'Provident Fund': '#6366F1',
  'Fixed Deposit': '#3B82F6',
  Bonds: '#8B5CF6',
  'Real Estate': '#EC4899',
  Other: '#6B7280',
};

function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, percentage, color } = payload[0].payload;
  return (
    <div className="bg-white dark:bg-surface-dark-card border border-ivory-border dark:border-surface-dark-border rounded-lg shadow-elevated dark:shadow-dark-elevated px-4 py-3">
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
 * AllocationChart — interactive donut (§18).
 * Hover/legend highlights a segment, dims others, and the centre
 * shows that slice (value + share). Idle centre: portfolio total + return.
 */
export default function AllocationChart({ holdings = [], returnPercentage = 0 }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

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
  const active = activeIndex >= 0 ? allocationData[activeIndex] : null;

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Portfolio allocation by asset class"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="mb-5">
        <p className="eyebrow mb-1">Allocation</p>
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Where the portfolio sits</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
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
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === -1 || activeIndex === index ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <Tooltip content={<AllocationTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
            {active ? (
              <>
                <span className="text-sm font-bold mono text-zinc-900 dark:text-text-dark-primary">
                  {formatINR(active.value)}
                </span>
                <span className="text-[11px] font-semibold text-text-secondary dark:text-text-dark-secondary truncate max-w-full">
                  {active.name}
                </span>
                <span className="text-[11px] mono text-text-tertiary dark:text-text-dark-tertiary">
                  {active.percentage.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold mono text-zinc-900 dark:text-text-dark-primary">
                  {formatINR(totalValue)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-dark-tertiary">
                  Portfolio
                </span>
                <span className={`text-[11px] font-semibold mono ${returnPercentage >= 0 ? 'text-brand-emerald' : 'text-brand-red'}`}>
                  {formatPercent(returnPercentage, 1)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 w-full space-y-1" role="list" aria-label="Allocation legend">
          {allocationData.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              role="listitem"
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg row-hover transition-colors duration-150 text-left ${
                activeIndex === idx ? 'bg-ivory-muted dark:bg-surface-dark-elevated' : ''
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
              onFocus={() => setActiveIndex(idx)}
              onBlur={() => setActiveIndex(-1)}
              onClick={() => setActiveIndex(idx === activeIndex ? -1 : idx)}
              aria-label={`${item.name}: ${formatINR(item.value)}, ${item.percentage.toFixed(1)} percent`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-zinc-700 dark:text-text-dark-secondary truncate">
                  {item.name}
                </span>
              </span>
              <span className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary w-10 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
                <span className="text-sm font-semibold mono text-zinc-900 dark:text-text-dark-primary w-24 text-right">
                  {formatINR(item.value)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
