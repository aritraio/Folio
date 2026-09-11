import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import TransactionRow from './TransactionRow';
import EmptyState from '../ui/EmptyState';

export default function TransactionTable({ transactions, onEdit, onDelete, accounts }) {
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
      return <ArrowUpDown className="w-3 h-3 text-[#8E9192]" />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#0A0A0A] dark:text-white" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0A0A0A] dark:text-white" />
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
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="hidden md:table-row bg-[#F5F5F5] dark:bg-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#262626] text-xs font-semibold text-[#8E9192] uppercase tracking-wider font-mono">
              <th
                className="py-3 pl-4 pr-3 cursor-pointer hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
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
                className="py-3 px-3 text-right cursor-pointer hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
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
