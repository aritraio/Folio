import React, { useState } from 'react';
import { Landmark, Building2, CreditCard, Wallet, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  Landmark: Landmark,
  Building2: Building2,
  CreditCard: CreditCard,
  Wallet: Wallet,
};

export default function AccountCard({ account, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const IconComponent = ICON_MAP[account.icon] || Landmark;

  const isCredit = account.type === 'credit';
  const balanceColor = isCredit
    ? 'text-zinc-900 dark:text-text-dark-primary' // or muted red if we want
    : 'text-zinc-900 dark:text-text-dark-primary';

  const handleCardClick = () => {
    // Navigate to transactions page with this account pre-selected
    // Assuming transactions page reads state or we can use a query param
    // The requirement says click to view account detail / transaction history
    navigate('/transactions', { state: { accountId: account.id } });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(account);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  return (
    <>
      <div
        className="card p-5 group cursor-pointer hover:border-brand-amber/50 hover:shadow-md transition-all duration-200 relative overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Decorative top border based on account color if provided */}
        {account.color && (
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: account.color }} />
        )}

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-surface-dark-elevated flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary">
                {account.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                {account.type} {account.accountNumber ? `• ${account.accountNumber.slice(-4)}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-surface-dark-elevated rounded-md transition-colors"
              aria-label="Edit account"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-zinc-400 hover:text-brand-red hover:bg-brand-red-light rounded-md transition-colors"
              aria-label="Delete account"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
              {isCredit ? 'Current Outstanding' : 'Available Balance'}
            </p>
            <p className={`text-xl font-mono font-medium ${balanceColor}`}>
              {formatINR(account.balance, { showSymbol: true })}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-brand-amber transition-colors transform group-hover:translate-x-1" />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? This will also remove all associated transactions."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          onDelete(account.id);
          setShowConfirmDelete(false);
        }}
        onCancel={() => setShowConfirmDelete(false)}
        variant="destructive"
      />
    </>
  );
}
