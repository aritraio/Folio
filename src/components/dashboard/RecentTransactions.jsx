import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pencil, Trash2, Plus } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';
import { useData } from '@/contexts/DataContext';
import { saveTransaction, updateTransaction, deleteTransaction } from '@/services/storage';
import { DEFAULT_CATEGORIES } from '@/constants/finance';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TransactionModal from '@/components/transactions/TransactionModal';

/**
 * Single transaction row — terminal: mono amounts, green inflow / red outflow, edit/delete actions.
 */
function TransactionRow({ tx, accounts, onEdit, onDelete }) {
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';
  const account = accounts?.find((a) => a.id === tx.accountId);

  return (
    <div
      className="
      flex items-center justify-between gap-3
      py-3.5 px-2 -mx-2
      rounded
      hover:bg-[var(--color-bg-tertiary)] dark:hover:bg-[var(--color-bg-tertiary)]
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
          <p className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] truncate">
            {tx.merchant}
          </p>
          <div className="flex items-center gap-2 mt-0.5 font-mono">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{tx.category}</span>
            <span className="text-[var(--color-text-tertiary)] text-[9px]">•</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {formatDate(tx.date, 'MMM d')}
            </span>
            {account && (
              <>
                <span className="text-[var(--color-text-tertiary)] text-[9px]">•</span>
                <span className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                  {account.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: amount + action buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`
          text-sm font-semibold font-mono tabular-nums
          ${
            isIncome
              ? 'text-[var(--color-positive)] dark:text-[var(--color-positive)]'
              : isTransfer
                ? 'text-[var(--color-text-tertiary)]'
                : 'text-[var(--color-negative)] dark:text-[var(--color-negative)]'
          }
        `}
        >
          {isIncome ? '+' : isTransfer ? '' : '−'}
          {formatINR(Math.abs(tx.amount))}
        </span>
        <div className="flex items-center gap-1 opacity-100 md:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(tx)}
            className="p-1.5 rounded hover:bg-[#E5E5E5] dark:hover:bg-[#262626] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-primary)] transition-colors"
            title="Edit transaction"
            aria-label="Edit transaction"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(tx.id)}
            className="p-1.5 rounded hover:bg-[rgba(255,107,107,0.15)] text-[var(--color-negative)] transition-colors"
            title="Delete transaction"
            aria-label="Delete transaction"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * RecentTransactions — List of latest 8 transactions with quick Add/Edit/Delete actions.
 */
export default function RecentTransactions({ transactions = [], accounts = [] }) {
  const { refresh } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTxId, setDeletingTxId] = useState(null);

  // Sort by date descending and take first 8
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingTxId(id);
  };

  const confirmDelete = () => {
    if (deletingTxId) {
      deleteTransaction(deletingTxId);
      setDeletingTxId(null);
      refresh();
    }
  };

  const handleSave = (data) => {
    try {
      if (editingTransaction) {
        updateTransaction({ ...data, id: editingTransaction.id });
      } else {
        saveTransaction(data);
      }
      refresh();
    } catch {
      refresh();
    }
  };

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Recent transactions"
      style={{ animationDelay: '0.25s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="heading-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
            Recent Transactions
          </h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 font-mono uppercase tracking-widest">
            Latest activity
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAdd}
          className="text-xs font-mono"
        >
          Add Transaction
        </Button>
      </div>

      {/* Transaction List */}
      {recent.length > 0 ? (
        <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
          {recent.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-tertiary)] py-8 text-center font-mono">
          No transactions yet.
        </p>
      )}

      {/* View All link */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
        <Link
          to="/transactions"
          className="
            inline-flex items-center gap-2
            text-[11px] font-semibold uppercase tracking-[0.15em] font-mono
            text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] hover:opacity-60
            transition-opacity duration-150
            group
          "
        >
          View All Transactions
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingTransaction}
        onSave={handleSave}
        categories={[...DEFAULT_CATEGORIES]}
        accounts={accounts}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTxId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action will adjust your account balance."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onClose={() => setDeletingTxId(null)}
        variant="destructive"
      />
    </section>
  );
}
