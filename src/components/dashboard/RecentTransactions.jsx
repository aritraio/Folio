import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight, Repeat } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';
import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR } from '@/constants/finance';

/**
 * Compact transaction row (§21, §73) — rows, not cards.
 * Merchant · category · time · account · amount, with transfer/recurring flags.
 */
function TransactionRow({ tx, accounts }) {
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';
  const account = accounts?.find((a) => a.id === tx.accountId);
  const dotColor = CATEGORY_COLORS[tx.category] || FALLBACK_CATEGORY_COLOR;

  return (
    <Link
      to={`/transactions?search=${encodeURIComponent(tx.merchant || tx.description || tx.category || '')}`}
      className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-lg row-hover hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated transition-colors duration-150 group press-feedback"
      aria-label={`${tx.merchant}, ${tx.category}, ${isIncome ? '+' : isTransfer ? '' : '−'}${formatINR(Math.abs(tx.amount))}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary truncate flex items-center gap-1.5">
            {tx.merchant}
            {isTransfer && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-dark-tertiary">
                <ArrowLeftRight className="w-3 h-3" aria-label="Transfer" /> Transfer
              </span>
            )}
            {tx.recurring && (
              <Repeat className="w-3 h-3 text-text-tertiary dark:text-text-dark-tertiary" aria-label="Recurring" />
            )}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
            <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary truncate">{tx.category}</span>
            <span className="text-text-tertiary dark:text-text-dark-tertiary text-[9px]" aria-hidden="true">•</span>
            <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary shrink-0">
              {formatDate(tx.date, 'MMM d')}
            </span>
            {account && (
              <>
                <span className="text-text-tertiary dark:text-text-dark-tertiary text-[9px]" aria-hidden="true">•</span>
                <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary truncate">
                  {account.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <span
        className={`text-sm font-semibold mono shrink-0 ${
          isIncome ? 'text-brand-emerald' : isTransfer ? 'text-text-tertiary dark:text-text-dark-tertiary' : 'text-zinc-700 dark:text-text-dark-secondary'
        }`}
      >
        {isIncome ? '+' : isTransfer ? '⇄ ' : '−'}
        {formatINR(Math.abs(tx.amount))}
      </span>
    </Link>
  );
}

/**
 * RecentActivity — compact recent list (§73). Card-free section with divider.
 */
export default function RecentTransactions({ transactions = [], accounts = [] }) {
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <section
      className="animate-fade-in-up section-divider pt-6"
      aria-label="Recent activity"
      style={{ animationDelay: '0.25s' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="eyebrow mb-1">Recent activity</p>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Latest moves</h2>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-amber hover:text-brand-amber-hover transition-colors group"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {recent.length > 0 ? (
        <div className="divide-y divide-ivory-border dark:divide-surface-dark-border">
          {recent.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} accounts={accounts} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="eyebrow mb-2">No transactions yet</p>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
            Add your first transaction to bring the dashboard to life.
          </p>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-amber hover:underline"
          >
            Go to Transactions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
