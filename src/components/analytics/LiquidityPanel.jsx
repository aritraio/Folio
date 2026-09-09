import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { calcLiquidity } from '@/utils/calculations';

/**
 * LiquidityPanel — proper liquidity visualization (§16).
 * Liquid assets vs obligations with coverage ratio and plain-language proof.
 * Avoids "safe" unless defined: states the multiple, lets the number speak.
 */
export default function LiquidityPanel({ accounts = [] }) {
  const liq = useMemo(() => calcLiquidity(accounts), [accounts]);
  const pct = liq.liquidAssets > 0 ? Math.min(100, (liq.obligations / liq.liquidAssets) * 100) : 0;

  return (
    <section
      aria-label={`Liquidity: ${formatINR(liq.liquidAssets)} liquid assets, ${formatINR(liq.obligations)} obligations, ${liq.coverage} times coverage`}
      className="card p-6 animate-fade-in-up"
    >
      <p className="eyebrow mb-1">Liquidity</p>
      <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Can you cover what you owe?</h2>

      <dl className="mt-5 grid grid-cols-3 gap-4">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
            Liquid assets
          </dt>
          <dd className="text-xl font-semibold mono text-cash">{formatINR(liq.liquidAssets)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
            Obligations
          </dt>
          <dd className="text-xl font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(liq.obligations)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
            Coverage
          </dt>
          <dd className="text-xl font-semibold mono text-brand-emerald">{liq.coverage}×</dd>
        </div>
      </dl>

      <div
        className="mt-4 h-2 rounded-full bg-ivory-muted dark:bg-surface-dark-elevated overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Obligations as share of liquid assets"
      >
        <div
          className="h-full rounded-full bg-cash transition-all duration-500"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
        <span>{formatINR(liq.obligations)} obligations</span>
        <span>{formatINR(liq.liquidAssets)} liquid assets</span>
      </div>

      <p className="mt-4 text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-brand-emerald" aria-hidden="true" />
        Your current liquid assets cover listed obligations by {liq.coverage}×.
      </p>

      <div className="mt-4 pt-4 border-t border-ivory-border dark:border-surface-dark-border">
        <Link
          to="/accounts"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-amber hover:text-brand-amber-hover transition-colors"
        >
          Review accounts
        </Link>
      </div>
    </section>
  );
}
