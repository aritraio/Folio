import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';

/**
 * Single transaction row — terminal: mono amounts, green inflow / red outflow.
 */
function TransactionRow({ tx, accounts }) {
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';
  const account = accounts?.find((a) => a.id === tx.accountId);

  return (
    <div
      className="
      flex items-center justify-between gap-3
      py-3.5 px-2 -mx-2
      rounded
      hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
      transition-colors duration-150
      group
    "
    >
      {/* Left: merchant + meta */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: isIncome ? '#00b894' : isTransfer ? '#8E9192' : '#ff6b6b',
          }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#0A0A0A] dark:text-white truncate">
            {tx.merchant}
          </p>
          <div className="flex items-center gap-2 mt-0.5 font-mono">
            <span className="text-[11px] text-[#8E9192]">{tx.category}</span>
            <span className="text-[#8E9192] text-[9px]">•</span>
            <span className="text-[11px] text-[#8E9192]">
              {formatDate(tx.date, 'MMM d')}
            </span>
            {account && (
              <>
                <span className="text-[#8E9192] text-[9px]">•</span>
                <span className="text-[11px] text-[#8E9192] truncate">
                  {account.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: amount in JetBrains Mono */}
      <span
        className={`
        text-sm font-semibold font-mono tabular-nums shrink-0
        ${
          isIncome
            ? 'text-[#00a383] dark:text-[#00b894]'
            : isTransfer
              ? 'text-[#8E9192]'
              : 'text-[#e84118] dark:text-[#ff6b6b]'
        }
      `}
      >
        {isIncome ? '+' : isTransfer ? '' : '−'}
        {formatINR(Math.abs(tx.amount))}
      </span>
    </div>
  );
}

/**
 * RecentTransactions — List of latest 8 transactions with a "View All" link.
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
          <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">Latest activity</p>
        </div>
      </div>

      {/* Transaction List */}
      {recent.length > 0 ? (
        <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
          {recent.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} accounts={accounts} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#8E9192] py-8 text-center">
          No transactions yet.
        </p>
      )}

      {/* View All link */}
      <div className="mt-4 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
        <Link
          to="/transactions"
          className="
            inline-flex items-center gap-2
            text-[11px] font-semibold uppercase tracking-[0.15em] font-mono
            text-[#0A0A0A] dark:text-white hover:opacity-60
            transition-opacity duration-150
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
