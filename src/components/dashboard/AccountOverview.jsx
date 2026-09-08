import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, Building2, CreditCard, Wallet, Banknote } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { calcTotalAssets, calcTotalLiabilities, calcNetWorth } from '@/utils/calculations';

/**
 * Map account icon strings to Lucide components.
 */
const ICON_MAP = {
  Landmark,
  Building2,
  CreditCard,
  Wallet,
  Banknote,
};

/**
 * Single account row.
 */
function AccountRow({ account }) {
  const IconComp = ICON_MAP[account.icon] || Wallet;
  const isLiability = account.type === 'credit';

  return (
    <div
      className="
      flex items-center justify-between gap-3
      py-3 px-2 -mx-2 rounded-lg
      hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
      transition-colors duration-150
    "
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${account.color}15` }}
        >
          <IconComp className="w-4 h-4" style={{ color: account.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary truncate">
            {account.name}
          </p>
          <p className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
            {account.accountNumber}
          </p>
        </div>
      </div>
      <span
        className={`
        text-sm font-semibold mono shrink-0
        ${isLiability ? 'text-brand-red' : 'text-zinc-900 dark:text-text-dark-primary'}
      `}
      >
        {isLiability ? '−' : ''}
        {formatINR(account.balance)}
      </span>
    </div>
  );
}

/**
 * AccountOverview — Assets / Liabilities breakdown with net worth summary.
 *
 * @param {{ accounts: Array }} props
 */
export default function AccountOverview({ accounts = [] }) {
  const assets = accounts.filter((a) => a.type !== 'credit');
  const liabilities = accounts.filter((a) => a.type === 'credit');
  const totalAssets = calcTotalAssets(accounts);
  const totalLiabilities = calcTotalLiabilities(accounts);
  const netWorth = calcNetWorth(accounts);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Account overview"
      style={{ animationDelay: '0.3s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Accounts</h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            Assets & Liabilities
          </p>
        </div>
      </div>

      {/* Assets */}
      {assets.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-emerald">
              Assets
            </span>
            <span className="text-xs font-semibold mono text-brand-emerald">{formatINR(totalAssets)}</span>
          </div>
          <div className="divide-y divide-ivory-border dark:divide-surface-dark-border">
            {assets.map((acc) => (
              <AccountRow key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      )}

      {/* Liabilities */}
      {liabilities.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
              Liabilities
            </span>
            <span className="text-xs font-semibold mono text-brand-red">{formatINR(totalLiabilities)}</span>
          </div>
          <div className="divide-y divide-ivory-border dark:divide-surface-dark-border">
            {liabilities.map((acc) => (
              <AccountRow key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      )}

      {/* Net Worth Summary */}
      <div
        className="
        flex items-center justify-between
        pt-4 mt-1
        border-t-2 border-ivory-border dark:border-surface-dark-border
      "
      >
        <span className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary">Net Worth</span>
        <span className="text-base font-bold mono text-zinc-900 dark:text-text-dark-primary">
          {formatINR(netWorth)}
        </span>
      </div>

      {/* View All link */}
      <div className="mt-4 pt-3 border-t border-ivory-border dark:border-surface-dark-border">
        <Link
          to="/accounts"
          className="
            inline-flex items-center gap-2
            text-[11px] font-semibold uppercase tracking-[0.15em]
            text-brand-amber hover:text-brand-amber-hover
            transition-colors duration-150
            group
          "
        >
          View All Accounts
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
