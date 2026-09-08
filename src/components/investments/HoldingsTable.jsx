import React from 'react';
import { TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { formatINR, formatPercent } from '@/utils/formatCurrency';

/**
 * Mobile card view of a single holding.
 */
function HoldingCard({ holding, onEdit, onDelete }) {
  const invested = Number(holding.investedValue) || 0;
  const current = Number(holding.currentValue) || 0;
  const returnAmt = current - invested;
  const returnPct = invested > 0 ? (returnAmt / invested) * 100 : 0;
  const isPositive = returnAmt >= 0;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary truncate">
            {holding.name}
          </p>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">{holding.category}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(holding)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-ivory-muted dark:hover:text-zinc-300 dark:hover:bg-surface-dark-elevated transition-colors"
            aria-label={`Edit ${holding.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(holding.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-red hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
            aria-label={`Delete ${holding.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-text-tertiary dark:text-text-dark-tertiary">Units</span>
          <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">{holding.units}</p>
        </div>
        <div>
          <span className="text-text-tertiary dark:text-text-dark-tertiary">Avg Price</span>
          <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(holding.avgPrice)}
          </p>
        </div>
        <div>
          <span className="text-text-tertiary dark:text-text-dark-tertiary">Invested</span>
          <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(invested)}
          </p>
        </div>
        <div>
          <span className="text-text-tertiary dark:text-text-dark-tertiary">Current</span>
          <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">{formatINR(current)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ivory-border dark:border-surface-dark-border">
        <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">Return</span>
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-brand-emerald dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-brand-red dark:text-rose-400" />
          )}
          <span
            className={`text-sm font-bold mono ${isPositive ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
          >
            {isPositive ? '+' : '−'}
            {formatINR(Math.abs(returnAmt))} ({formatPercent(returnPct)})
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * HoldingsTable — Desktop table + mobile card layout for investment holdings.
 *
 * @param {{ holdings: Array, onEdit: (holding) => void, onDelete: (id: string) => void }} props
 */
export default function HoldingsTable({ holdings = [], onEdit, onDelete }) {
  if (holdings.length === 0) return null;

  return (
    <section className="animate-fade-in-up" aria-label="Holdings table" style={{ animationDelay: '0.2s' }}>
      <div className="mb-4">
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Holdings</h2>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'} in your portfolio
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ivory-border dark:border-surface-dark-border">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Asset
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Units
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Avg Price
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Current Price
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Invested
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Current Value
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Return
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  Return %
                </th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const invested = Number(h.investedValue) || 0;
                const current = Number(h.currentValue) || 0;
                const returnAmt = current - invested;
                const returnPct = invested > 0 ? (returnAmt / invested) * 100 : 0;
                const isPositive = returnAmt >= 0;

                return (
                  <tr
                    key={h.id}
                    className="border-b border-ivory-border/60 dark:border-surface-dark-border/60 last:border-0 hover:bg-ivory-muted/50 dark:hover:bg-surface-dark-elevated/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-text-dark-primary truncate max-w-[200px]">
                          {h.name}
                        </p>
                        <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-0.5">
                          {h.category}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right mono text-zinc-900 dark:text-text-dark-primary">
                      {h.units}
                    </td>
                    <td className="px-4 py-3.5 text-right mono text-zinc-900 dark:text-text-dark-primary">
                      {formatINR(h.avgPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right mono text-zinc-900 dark:text-text-dark-primary">
                      {formatINR(h.currentPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right mono text-zinc-900 dark:text-text-dark-primary">
                      {formatINR(invested)}
                    </td>
                    <td className="px-4 py-3.5 text-right mono font-semibold text-zinc-900 dark:text-text-dark-primary">
                      {formatINR(current)}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right mono font-semibold ${isPositive ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
                    >
                      {isPositive ? '+' : '−'}
                      {formatINR(Math.abs(returnAmt))}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right mono font-semibold ${isPositive ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
                    >
                      {formatPercent(returnPct)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(h)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-ivory-muted dark:hover:text-zinc-300 dark:hover:bg-surface-dark-elevated transition-colors"
                          aria-label={`Edit ${h.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(h.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-red hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                          aria-label={`Delete ${h.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {holdings.map((h) => (
          <HoldingCard key={h.id} holding={h} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
