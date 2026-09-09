import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, Building2, CreditCard, Wallet, Banknote, TrendingUp } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { calcTotalAssets, calcTotalLiabilities } from '@/utils/calculations';

const ICON_MAP = { Landmark, Building2, CreditCard, Wallet, Banknote };

function AccountRow({ account }) {
  const IconComp = ICON_MAP[account.icon] || Wallet;
  const isLiability = account.type === 'credit';
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-lg row-hover hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${account.color}15` }}
          aria-hidden="true"
        >
          <IconComp className="w-4 h-4" style={{ color: account.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary truncate">
            {account.name}
          </p>
          <p className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
            {account.accountNumber}
            {account.type === 'credit' && account.limit ? ` · limit ${formatINR(account.limit)}` : ''}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-semibold mono shrink-0 ${isLiability ? 'text-brand-red' : 'text-zinc-900 dark:text-text-dark-primary'}`}
      >
        {isLiability ? '−' : ''}
        {formatINR(Math.abs(Number(account.balance) || 0))}
      </span>
    </div>
  );
}

/**
 * AccountOverview — compact assets/liabilities/investments map (§23).
 * Uses the unified snapshot so the footer reconciles with the hero.
 */
export default function AccountOverview({ accounts = [], investmentTotal = 0, snapshot = null }) {
  const assets = accounts.filter((a) => a.type !== 'credit');
  const liabilities = accounts.filter((a) => a.type === 'credit');
  const totalAssets = snapshot?.totalAssets ?? calcTotalAssets(accounts);
  const totalLiabilities = snapshot?.totalLiabilities ?? calcTotalLiabilities(accounts);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Accounts: assets, investments and liabilities"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="eyebrow mb-1">Financial map</p>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Accounts</h2>
        </div>
      </div>

      {assets.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cash">
              Cash & banks
            </span>
            <span className="text-xs font-semibold mono text-cash">{formatINR(totalAssets)}</span>
          </div>
          <div className="divide-y divide-ivory-border dark:divide-surface-dark-border">
            {assets.slice(0, 4).map((acc) => (
              <AccountRow key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      )}

      {investmentTotal > 0 && (
        <div className="mb-4 flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg row-hover hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg bg-investment/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <TrendingUp className="w-4 h-4 text-investment" />
            </div>
            <span className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary">Investments</span>
          </div>
          <Link to="/investments" className="text-sm font-semibold mono text-investment hover:underline">
            {formatINR(investmentTotal)}
          </Link>
        </div>
      )}

      {liabilities.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">Owe</span>
            <span className="text-xs font-semibold mono text-brand-red">{formatINR(totalLiabilities)}</span>
          </div>
          <div className="divide-y divide-ivory-border dark:divide-surface-dark-border">
            {liabilities.map((acc) => (
              <AccountRow key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 mt-1 border-t-2 border-ivory-border dark:border-surface-dark-border">
        <span className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary">Net worth</span>
        <span className="text-base font-bold mono text-zinc-900 dark:text-text-dark-primary">
          {formatINR(snapshot?.netWorth ?? totalAssets + investmentTotal - totalLiabilities)}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-ivory-border dark:border-surface-dark-border">
        <Link
          to="/accounts"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-amber hover:text-brand-amber-hover transition-colors group"
        >
          View all accounts
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
