import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';

/**
 * Map category names to dot colors.
 */
const CATEGORY_COLORS = {
  'Food & Dining': '#F59E0B',
  Shopping: '#3B82F6',
  'Bills & Utilities': '#10B981',
  Entertainment: '#8B5CF6',
  Transport: '#EC4899',
  Healthcare: '#EF4444',
  Travel: '#06B6D4',
  Education: '#6366F1',
  Investment: '#10B981',
  Salary: '#059669',
  Freelance: '#D97706',
  Other: '#6B7280',
};

/**
 * Single transaction row.
 */
function TransactionRow({ tx, accounts }) {
  const isIncome = tx.type === 'income';
  const account = accounts?.find((a) => a.id === tx.accountId);
  const dotColor = CATEGORY_COLORS[tx.category] || '#6B7280';

  return (
    <div
      className="
      flex items-center justify-between gap-3
      py-3.5 px-2 -mx-2
      rounded-lg
      hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
      transition-colors duration-150
      group
    "
    >
      {/* Left: dot + merchant + meta */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-text-dark-primary truncate">
            {tx.merchant}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary">{tx.category}</span>
            <span className="text-text-tertiary dark:text-text-dark-tertiary text-[9px]">•</span>
            <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
              {formatDate(tx.date, 'MMM d')}
            </span>
            {account && (
              <>
                <span className="text-text-tertiary dark:text-text-dark-tertiary text-[9px]">•</span>
                <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary truncate">
                  {account.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: amount */}
      <span
        className={`
        text-sm font-semibold mono shrink-0
        ${isIncome ? 'text-brand-emerald' : 'text-zinc-700 dark:text-text-dark-secondary'}
      `}
      >
        {isIncome ? '+' : '−'}
        {formatINR(Math.abs(tx.amount))}
      </span>
    </div>
  );
}

/**
 * RecentTransactions — List of latest 8 transactions with a "View All" link.
 *
 * @param {{ transactions: Array, accounts: Array }} props
 */
export default function RecentTransactions({ transactions = [], accounts = [] }) {
  // Sort by date descending and take first 8
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Recent transactions"
      style={{ animationDelay: '0.25s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Recent Transactions</h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">Latest activity</p>
        </div>
      </div>

      {/* Transaction List */}
      {recent.length > 0 ? (
        <div className="divide-y divide-ivory-border dark:divide-surface-dark-border">
          {recent.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} accounts={accounts} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary py-8 text-center">
          No transactions yet.
        </p>
      )}

      {/* View All link */}
      <div className="mt-4 pt-4 border-t border-ivory-border dark:border-surface-dark-border">
        <Link
          to="/transactions"
          className="
            inline-flex items-center gap-2
            text-[11px] font-semibold uppercase tracking-[0.15em]
            text-brand-amber hover:text-brand-amber-hover
            transition-colors duration-150
            group
          "
        >
          View All Transactions
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
