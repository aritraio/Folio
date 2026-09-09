import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { subMonths, format } from 'date-fns';
import { formatINR, formatPercent } from '@/utils/formatCurrency';
import { calcCategoryComparison } from '@/utils/calculations';

/**
 * SpendingBreakdownRows — category rows with proportional bars (§14) plus
 * comparative context (§15): "+18% vs last month". Bars scale consistently
 * to the top category; every row drills down to filtered transactions (§72).
 */
export default function SpendingBreakdownRows({ transactions = [], monthKey }) {
  const rows = useMemo(() => {
    if (!monthKey) return [];
    const d = new Date(`${monthKey}-01`);
    const prev = format(subMonths(d, 1), 'yyyy-MM');
    return calcCategoryComparison(transactions, monthKey, prev);
  }, [transactions, monthKey]);

  const max = Math.max(1, ...rows.map((r) => r.amount));

  if (rows.length === 0) {
    return (
      <section aria-label="Spending breakdown" className="section-divider pt-6">
        <p className="eyebrow mb-1">Spending breakdown</p>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          No spending this month — nothing to break down yet.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Spending breakdown by category" className="section-divider pt-6">
      <p className="eyebrow mb-1">Spending breakdown</p>
      <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary mb-4">Where spending concentrates</h2>
      <ul className="space-y-1">
        {rows.map((r) => {
          const up = r.deltaPct > 0;
          const flat = Math.abs(r.deltaPct) < 0.5;
          return (
            <li key={r.category}>
              <Link
                to={`/transactions?search=${encodeURIComponent(r.category)}`}
                className="group grid grid-cols-[1fr_auto] sm:grid-cols-[180px_1fr_auto] items-center gap-x-4 gap-y-1 py-2.5 px-2 -mx-2 rounded-lg row-hover hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated transition-colors"
                aria-label={`${r.category}: ${formatINR(r.amount)}, ${flat ? 'flat' : `${formatPercent(r.deltaPct, 0)}`} versus last month. View transactions.`}
              >
                <span className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} aria-hidden="true" />
                  {r.category}
                </span>
                <span
                  className="hidden sm:block h-1.5 rounded-full bg-ivory-muted dark:bg-surface-dark-elevated overflow-hidden"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(4, (r.amount / max) * 100)}%`, background: r.color }}
                  />
                </span>
                <span className="text-right shrink-0">
                  <span className="block text-sm font-semibold mono text-zinc-900 dark:text-text-dark-primary">
                    {formatINR(r.amount)}
                  </span>
                  <span className={`block text-[11px] font-medium ${flat ? 'text-text-tertiary dark:text-text-dark-tertiary' : up ? 'text-brand-red' : 'text-brand-emerald'}`}>
                    {flat ? '— flat vs last mo' : `${formatPercent(r.deltaPct, 0)} vs last mo`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
