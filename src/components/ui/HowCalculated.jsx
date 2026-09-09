import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { FINANCIAL_DEFINITIONS } from '@/utils/calculations';
import { formatMoney } from '@/utils/formatCurrency';

/**
 * HowCalculated — auditability popover (§71).
 * "Net Worth ₹68,793 ⓘ How is this calculated? → Assets ₹26,590 + Investments ₹47,973 − Liabilities ₹5,770"
 */
export default function HowCalculated({ metricKey = 'netWorth', snapshot }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const def = FINANCIAL_DEFINITIONS[metricKey];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!def) return null;

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`How is ${def.label} calculated?`}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary dark:text-text-dark-secondary hover:text-zinc-900 dark:hover:text-text-dark-primary transition-colors press-feedback"
      >
        <Info className="w-3.5 h-3.5" aria-hidden="true" />
        How is this calculated?
      </button>
      {open && (
        <span className="absolute left-0 top-full mt-2 z-30 w-72 p-4 rounded-xl border border-ivory-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card shadow-elevated dark:shadow-dark-elevated text-left animate-fade-in-scale">
          <span className="block text-xs font-semibold text-zinc-900 dark:text-text-dark-primary">
            {def.label}
          </span>
          <span className="block text-xs mono mt-1 text-brand-amber">{def.formula}</span>
          <span className="block text-xs mt-1.5 leading-relaxed text-text-secondary dark:text-text-dark-secondary">
            {def.description}
          </span>
          {snapshot && metricKey === 'netWorth' && (
            <span className="block mt-2.5 pt-2.5 border-t border-ivory-border dark:border-surface-dark-border text-xs mono space-y-1">
              <span className="flex justify-between">
                <span className="text-text-secondary dark:text-text-dark-secondary">Assets</span>
                <span className="font-semibold">{formatMoney(snapshot.totalAssets)}</span>
              </span>
              <span className="flex justify-between">
                <span className="text-text-secondary dark:text-text-dark-secondary">Investments</span>
                <span className="font-semibold">{formatMoney(snapshot.investmentTotal)}</span>
              </span>
              <span className="flex justify-between">
                <span className="text-text-secondary dark:text-text-dark-secondary">Liabilities</span>
                <span className="font-semibold">{formatMoney(snapshot.totalLiabilities)}</span>
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}
