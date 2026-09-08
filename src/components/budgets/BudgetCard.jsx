import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import BudgetProgress from './BudgetProgress';
import { formatINR, formatPercent } from '../../utils/formatCurrency';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { category, limit, spent, remaining, percentage, status } = budget;

  // Derive styling from status
  let statusColor = 'text-brand-emerald dark:text-emerald-400';
  let StatusIcon = null;

  if (status === 'warning') {
    statusColor = 'text-brand-amber dark:text-amber-400';
  } else if (status === 'exceeded') {
    statusColor = 'text-brand-red dark:text-rose-400';
    StatusIcon = AlertCircle;
  }

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(budget);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  return (
    <>
      <div className="card p-5 group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600">
        {/* Decorative left border for over-budget */}
        {status === 'exceeded' && <div className="absolute top-0 left-0 w-1 h-full bg-brand-red" />}

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary flex items-center gap-1.5">
              {category}
              {StatusIcon && <StatusIcon className="w-4 h-4 text-brand-red" />}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-surface-dark-elevated rounded-md transition-colors"
              aria-label="Edit budget"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-zinc-400 hover:text-brand-red hover:bg-brand-red-light rounded-md transition-colors"
              aria-label="Delete budget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl font-mono font-medium text-zinc-900 dark:text-text-dark-primary">
                {formatINR(spent, { showSymbol: true })}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                of {formatINR(limit, { showSymbol: true })} limit
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold ${statusColor}`}>{formatPercent(percentage, 1)}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {status === 'exceeded' ? 'Over budget by ' : 'Remaining: '}
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-300">
                  {formatINR(status === 'exceeded' ? Math.abs(remaining) : remaining, { showSymbol: true })}
                </span>
              </p>
            </div>
          </div>

          <BudgetProgress percentage={percentage} status={status} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for ${category}? This will not delete any transactions.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          onDelete(budget.id);
          setShowConfirmDelete(false);
        }}
        onCancel={() => setShowConfirmDelete(false)}
        variant="destructive"
      />
    </>
  );
}
