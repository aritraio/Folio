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
 * Single account row — terminal monochrome.
 */
function AccountRow({ account }) {
  const IconComp = ICON_MAP[account.icon] || Wallet;
  const isLiability = account.type === 'credit';

  return (
    <div
      className="
      flex items-center justify-between gap-3
      py-3 px-2 -mx-2 rounded
      hover:bg-[var(--color-bg-tertiary)] dark:hover:bg-[var(--color-bg-tertiary)]
      transition-colors duration-150
    "
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0">
          <IconComp className="w-4 h-4 text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] truncate">
            {account.name}
          </p>
          <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{account.accountNumber}</p>
        </div>
      </div>
      <span
        className={`
        text-sm font-semibold font-mono tabular-nums shrink-0
        ${isLiability ? 'text-[var(--color-negative)] dark:text-[var(--color-negative)]' : 'text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]'}
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
          <h2 className="heading-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
            Accounts
          </h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 font-mono uppercase tracking-widest">
            Assets & Liabilities
          </p>
        </div>
      </div>

      {/* Assets */}
      {assets.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-positive)] dark:text-[var(--color-positive)] font-mono">
              Assets
            </span>
            <span className="text-xs font-semibold font-mono tabular-nums text-[var(--color-positive)] dark:text-[var(--color-positive)]">
              {formatINR(totalAssets)}
            </span>
          </div>
          <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-negative)] dark:text-[var(--color-negative)] font-mono">
              Liabilities
            </span>
            <span className="text-xs font-semibold font-mono tabular-nums text-[var(--color-negative)] dark:text-[var(--color-negative)]">
              {formatINR(totalLiabilities)}
            </span>
          </div>
          <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
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
        border-t border-[var(--color-border)] dark:border-[var(--color-border)]
      "
      >
        <span className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
          Net Worth
        </span>
        <span className="text-base font-bold font-mono tabular-nums text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
          {formatINR(netWorth)}
        </span>
      </div>

      {/* View All link */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
        <Link
          to="/accounts"
          className="
            inline-flex items-center gap-2
            text-[11px] font-semibold uppercase tracking-[0.15em] font-mono
            text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] hover:opacity-60
            transition-opacity duration-150
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
