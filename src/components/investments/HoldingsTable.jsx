import React from 'react';
import { TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { formatINR, formatPercent } from '@/utils/formatCurrency';

/**
 * Mobile card view of a single holding — terminal.
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
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white truncate">
            {holding.name}
          </p>
          <p className="text-xs text-[#8E9192] font-mono">{holding.category}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(holding)}
            className="p-1.5 rounded text-[#8E9192] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:text-white dark:hover:bg-[#1E1E1E] transition-colors"
            aria-label={`Edit ${holding.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(holding.id)}
            className="p-1.5 rounded text-[#8E9192] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.12)] transition-colors"
            aria-label={`Delete ${holding.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#8E9192] font-mono uppercase tracking-widest">Units</span>
          <p className="font-semibold font-mono tabular-nums text-[#0A0A0A] dark:text-white">{holding.units}</p>
        </div>
        <div>
          <span className="text-[#8E9192] font-mono uppercase tracking-widest">Avg Price</span>
          <p className="font-semibold font-mono tabular-nums text-[#0A0A0A] dark:text-white">
            {formatINR(holding.avgPrice)}
          </p>
        </div>
        <div>
          <span className="text-[#8E9192] font-mono uppercase tracking-widest">Invested</span>
          <p className="font-semibold font-mono tabular-nums text-[#0A0A0A] dark:text-white">
            {formatINR(invested)}
          </p>
        </div>
        <div>
          <span className="text-[#8E9192] font-mono uppercase tracking-widest">Current</span>
          <p className="font-semibold font-mono tabular-nums text-[#0A0A0A] dark:text-white">{formatINR(current)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
        <span className="text-xs text-[#8E9192] font-mono uppercase tracking-widest">Return</span>
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-[#00b894]" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-[#ff6b6b]" />
          )}
          <span
            className={`text-sm font-bold font-mono tabular-nums ${isPositive ? 'text-[#00a383] dark:text-[#00b894]' : 'text-[#e84118] dark:text-[#ff6b6b]'}`}
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
 */
export default function HoldingsTable({ holdings = [], onEdit, onDelete }) {
  if (holdings.length === 0) return null;

  return (
    <section className="animate-fade-in-up" aria-label="Holdings table" style={{ animationDelay: '0.2s' }}>
      <div className="mb-4">
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Holdings</h2>
        <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
          {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'} in your portfolio
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#0A0A0A]">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Asset
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Units
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Avg Price
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Current Price
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Invested
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Current Value
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
                  Return
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8E9192] font-mono">
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
                    className="border-b border-[#E5E5E5]/60 dark:border-[#262626]/60 last:border-0 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#1E1E1E]/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                          {h.name}
                        </p>
                        <p className="text-xs text-[#8E9192] mt-0.5 font-mono">
                          {h.category}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#0A0A0A] dark:text-white">
                      {h.units}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#0A0A0A] dark:text-white">
                      {formatINR(h.avgPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#0A0A0A] dark:text-white">
                      {formatINR(h.currentPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#0A0A0A] dark:text-white">
                      {formatINR(invested)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-[#0A0A0A] dark:text-white">
                      {formatINR(current)}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-mono tabular-nums font-semibold ${isPositive ? 'text-[#00a383] dark:text-[#00b894]' : 'text-[#e84118] dark:text-[#ff6b6b]'}`}
                    >
                      {isPositive ? '+' : '−'}
                      {formatINR(Math.abs(returnAmt))}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-mono tabular-nums font-semibold ${isPositive ? 'text-[#00a383] dark:text-[#00b894]' : 'text-[#e84118] dark:text-[#ff6b6b]'}`}
                    >
                      {formatPercent(returnPct)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(h)}
                          className="p-1.5 rounded text-[#8E9192] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:text-white dark:hover:bg-[#1E1E1E] transition-colors"
                          aria-label={`Edit ${h.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(h.id)}
                          className="p-1.5 rounded text-[#8E9192] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.12)] transition-colors"
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
