import React, { useState } from 'react';
import { formatMoney } from '../../utils/formatCurrency';
import ConfirmDialog from '../ui/ConfirmDialog';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import TransactionRow from './TransactionRow';
import EmptyState from '../ui/EmptyState';

export default function TransactionTable({ transactions, onEdit, onDelete, accounts }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Account lookup helper for row
  const getAccountName = (accountId) => {
    const acc = accounts.find((a) => a.id === accountId);
    return acc ? acc.name : accountId;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'amount') {
      const amountA = Math.abs(a.amount);
      const amountB = Math.abs(b.amount);
      return sortConfig.direction === 'asc' ? amountA - amountB : amountB - amountA;
    }
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ArrowUpDown className="w-3 h-3 text-[var(--color-text-tertiary)]" />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]" />
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="card p-8 md:p-12">
        <EmptyState
          title="No transactions found"
          description="We couldn't find any transactions matching your filters."
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="v-mobile-transactions">
        {sortedTransactions.map((tx) => (
          <div className="v-transaction-mobile" key={tx.id}>
            <div className="v-row">
              <strong className="text-sm">{tx.merchant || tx.description}</strong>
              <b>
                {tx.type === 'expense' ? '−' : tx.type === 'income' ? '+' : ''}
                {formatMoney(tx.amount)}
              </b>
            </div>
            <p className="v-caption">
              {tx.date} · {tx.type === 'transfer' ? 'Transfer' : tx.category} · {getAccountName(tx.accountId)}
              {tx.person ? ` · ${tx.person}` : ''}
            </p>
            <div className="v-actions mt-3">
              <button className="v-text-link" onClick={() => onEdit(tx)}>
                Edit
              </button>
              <button className="v-text-link" onClick={() => setPendingDelete(tx.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          onDelete(pendingDelete);
          setPendingDelete(null);
        }}
        title="Delete transaction?"
        message="This removes the transaction and reverses its balance impact, if any."
      />
      <div className="w-full overflow-x-auto v-desktop-transactions">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] dark:border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider font-mono">
              <th
                className="py-3 pl-4 pr-3 cursor-pointer hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-primary)] transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1.5">
                  Date
                  <SortIcon columnKey="date" />
                </div>
              </th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Account</th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-primary)] transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  Amount
                  <SortIcon columnKey="amount" />
                </div>
              </th>
              <th className="py-3 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onEdit={onEdit}
                onDelete={onDelete}
                accountName={getAccountName(tx.accountId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
