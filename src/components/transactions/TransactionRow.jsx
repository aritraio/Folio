import React, { useState } from 'react';
import { Pencil, Trash2, Calendar, CreditCard, ArrowLeftRight } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatINR } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateUtils';
import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR } from '../../constants/finance';

/**
 * TransactionRow — Renders a single transaction row, collapses to card on mobile.
 */
export default function TransactionRow({ transaction, onEdit, onDelete, accountName }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const amountColor = isIncome
    ? 'text-brand-emerald dark:text-emerald-400'
    : isTransfer
      ? 'text-zinc-500 dark:text-zinc-400'
      : 'text-zinc-900 dark:text-text-dark-primary';
  const amountPrefix = isIncome ? '+' : isTransfer ? '⇄ ' : '−';

  const dotColor = CATEGORY_COLORS[transaction.category] || FALLBACK_CATEGORY_COLOR;

  return (
    <>
      <tr className="group border-b border-ivory-border dark:border-surface-dark-border hover:bg-zinc-50/50 dark:hover:bg-surface-dark-elevated/50 transition-colors flex flex-col md:table-row p-4 md:p-0">
        <div className="flex justify-between items-center md:hidden mb-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(transaction.date, 'MMM d, yyyy')}
          </span>
          <span className={`font-mono font-medium ${amountColor}`}>
            {amountPrefix}
            {formatINR(transaction.amount, { showSymbol: true })}
          </span>
        </div>

        <td className="hidden md:table-cell py-4 pl-4 pr-3 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          {formatDate(transaction.date, 'MMM d, yyyy')}
        </td>

        <td className="py-2 md:py-4 px-0 md:px-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary flex items-center gap-1.5">
              {isTransfer && <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" aria-label="Transfer" />}
              {transaction.merchant || transaction.description || 'Unknown'}
            </span>
            {transaction.notes && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] mt-0.5">
                {transaction.notes}
              </span>
            )}
          </div>
        </td>

        <td className="py-2 md:py-4 px-0 md:px-3 text-sm">
          <Badge dot dotColor={dotColor} variant="outline" size="sm">
            {isTransfer ? 'Transfer' : transaction.category}
          </Badge>
        </td>

        <td className="py-2 md:py-4 px-0 md:px-3 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-zinc-400" />
            {accountName || transaction.accountId}
          </div>
        </td>

        <td
          className={`hidden md:table-cell py-4 px-3 text-sm font-mono text-right font-medium ${amountColor}`}
        >
          {amountPrefix}
          {formatINR(transaction.amount, { showSymbol: true })}
        </td>

        <td className="py-3 md:py-4 pr-4 pl-0 md:pl-3 text-right">
          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => onEdit(transaction)}
              className="!px-2 !py-2"
              aria-label="Edit transaction"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4 text-brand-red" />}
              onClick={() => setShowConfirmDelete(true)}
              className="!px-2 !py-2 hover:bg-brand-red-light"
              aria-label="Delete transaction"
            />
          </div>
        </td>
      </tr>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone and will update your account balance."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          onDelete(transaction.id);
          setShowConfirmDelete(false);
        }}
        onClose={() => setShowConfirmDelete(false)}
        variant="destructive"
      />
    </>
  );
}
