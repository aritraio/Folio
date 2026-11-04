import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import BudgetProgress from './BudgetProgress';
import { formatINR, formatPercent } from '../../utils/formatCurrency';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { category, limit, spent, remaining, percentage, status } = budget;

  // Derive styling from status — terminal: white neutral, red only when exceeded
  let statusClass = 'text-[var(--color-positive)] dark:text-[var(--color-positive)]';
  let StatusIcon = null;

  if (status === 'warning') {
    statusClass = 'text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]';
  } else if (status === 'exceeded') {
    statusClass = 'text-[var(--color-negative)] dark:text-[var(--color-negative)]';
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
      <div className="card p-5 group relative overflow-hidden transition-colors duration-150 hover:border-[var(--color-border)] dark:hover:border-[var(--color-border)]">
        {/* Sharp left signal for over-budget */}
        {status === 'exceeded' && <div className="absolute top-0 left-0 w-[2px] h-full bg-[#ff6b6b]" />}

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] flex items-center gap-1.5">
              {category}
              {StatusIcon && <StatusIcon className="w-4 h-4 text-[var(--color-negative)]" />}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] dark:hover:text-[var(--color-text-primary)] dark:hover:bg-[var(--color-bg-tertiary)] rounded transition-colors"
              aria-label="Edit budget"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-negative)] hover:bg-[rgba(255,107,107,0.12)] rounded transition-colors"
              aria-label="Delete budget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl font-mono tabular-nums font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                {formatINR(spent, { showSymbol: true })}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1 font-mono">
                of {formatINR(limit, { showSymbol: true })} limit
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold font-mono tabular-nums ${statusClass}`}>
                {formatPercent(percentage, 1)}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {status === 'exceeded' ? 'Over budget by ' : 'Remaining: '}
                <span className="font-mono tabular-nums font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
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
