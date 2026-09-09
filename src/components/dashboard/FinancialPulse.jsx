import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { calcFinancialPulse } from '@/utils/calculations';

/**
 * FinancialPulse — signature Ledger component (§12).
 * Rule-based 0–100 score with explicit reasons. Never a gimmick:
 * every factor shows its underlying numbers.
 */
export default function FinancialPulse({
  transactions = [],
  accounts = [],
  investments = [],
  budgets = [],
  monthKey,
}) {
  const pulse = useMemo(
    () => calcFinancialPulse({ transactions, accounts, investments, budgets, monthKey }),
    [transactions, accounts, investments, budgets, monthKey]
  );

  const toneColor = (tone) =>
    tone === 'excellent'
      ? 'text-brand-emerald'
      : tone === 'good' || tone === 'fair'
        ? 'text-brand-amber'
        : 'text-brand-red';

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label={`Financial pulse: ${pulse.score} out of 100, ${pulse.band}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-4 h-4 text-brand-amber" aria-hidden="true" />
        <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Financial Pulse</h2>
      </div>

      <div className="flex items-end gap-3 mb-1">
        <span className="font-serif-display text-5xl font-semibold tracking-tight text-zinc-900 dark:text-text-dark-primary tabular-nums">
          {pulse.score}
        </span>
        <span className="text-sm text-text-secondary dark:text-text-dark-secondary mb-1.5">/ 100</span>
        <span className="ml-auto text-xs font-semibold uppercase tracking-[0.12em] text-brand-amber mb-2">
          {pulse.band}
        </span>
      </div>

      {/* Score bar */}
      <div
        className="h-1.5 rounded-full bg-ivory-muted dark:bg-surface-dark-elevated overflow-hidden mb-5"
        role="progressbar"
        aria-valuenow={pulse.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Financial health score"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-amber to-brand-emerald transition-all duration-500"
          style={{ width: `${pulse.score}%` }}
        />
      </div>

      <dl className="divide-y divide-ivory-border dark:divide-surface-dark-border">
        {pulse.factors.map((f) => (
          <div key={f.key} className="flex items-center justify-between gap-3 py-2">
            <dt className="text-sm text-zinc-700 dark:text-text-dark-secondary capitalize">{f.label}</dt>
            <dd className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">{f.detail}</span>
              <span className={`text-xs font-semibold capitalize ${toneColor(f.tone)}`}>{f.tone}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="sr-only">
        Score {pulse.score} of 100, {pulse.band}.{' '}
        {pulse.factors.map((f) => `${f.label}: ${f.detail}, rated ${f.tone}.`).join(' ')}
      </p>

      <div className="mt-4 pt-4 border-t border-ivory-border dark:border-surface-dark-border">
        <Link
          to="/analytics"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-amber hover:text-brand-amber-hover transition-colors group"
        >
          How this is scored
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
