import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { formatINR } from '@/utils/formatCurrency';

/**
 * Custom tooltip for the donut chart.
 */
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, amount, percentage, color } = payload[0].payload;
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
        <span className="text-xs font-semibold text-zinc-900 dark:text-text-dark-primary">{category}</span>
      </div>
      <p className="text-sm font-bold mono text-zinc-900 dark:text-text-dark-primary">{formatINR(amount)}</p>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
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
 * SpendingBreakdown — Donut chart + category legend for current month spending.
 *
 * @param {{ data: Array<{ category: string, amount: number, percentage: number, color: string }>, totalExpenses: number }} props
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
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary mb-2">Spending Breakdown</h2>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
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
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Spending Breakdown</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-dark-tertiary">
              Total
            </span>
            <span className="text-sm font-bold mono text-zinc-900 dark:text-text-dark-primary">
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
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary w-10 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
                <span className="text-sm font-semibold mono text-zinc-900 dark:text-text-dark-primary w-20 text-right">
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
