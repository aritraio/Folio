import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import BudgetProgress from './BudgetProgress';
import { formatINR, formatPercent } from '../../utils/formatCurrency';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { category, limit, spent, remaining, percentage, status } = budget;

  // Derive styling from status — terminal: white neutral, red only when exceeded
  let statusClass = 'text-[#00a383] dark:text-[#00b894]';
  let StatusIcon = null;

  if (status === 'warning') {
    statusClass = 'text-[#0A0A0A] dark:text-white';
  } else if (status === 'exceeded') {
    statusClass = 'text-[#e84118] dark:text-[#ff6b6b]';
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
      <div className="card p-5 group relative overflow-hidden transition-colors duration-150 hover:border-[#CCCCCC] dark:hover:border-[#404040]">
        {/* Sharp left signal for over-budget */}
        {status === 'exceeded' && <div className="absolute top-0 left-0 w-[2px] h-full bg-[#ff6b6b]" />}

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
              {category}
              {StatusIcon && <StatusIcon className="w-4 h-4 text-[#ff6b6b]" />}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-[#8E9192] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:text-white dark:hover:bg-[#1E1E1E] rounded transition-colors"
              aria-label="Edit budget"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-[#8E9192] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.12)] rounded transition-colors"
              aria-label="Delete budget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl font-mono tabular-nums font-bold text-[#0A0A0A] dark:text-white">
                {formatINR(spent, { showSymbol: true })}
              </p>
              <p className="text-xs text-[#8E9192] mt-1 font-mono">
                of {formatINR(limit, { showSymbol: true })} limit
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold font-mono tabular-nums ${statusClass}`}>{formatPercent(percentage, 1)}</p>
              <p className="text-xs text-[#8E9192] mt-1">
                {status === 'exceeded' ? 'Over budget by ' : 'Remaining: '}
                <span className="font-mono tabular-nums font-medium text-[#0A0A0A] dark:text-white">
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
