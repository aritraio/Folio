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

  const handleCardClick = () => {
    // Navigate to transactions page with this account pre-selected
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
        className="card p-5 group cursor-pointer hover:border-[#CCCCCC] dark:hover:border-[#404040] transition-colors duration-150 relative overflow-hidden"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                {account.name}
              </h3>
              <p className="text-xs text-[#8E9192] capitalize font-mono">
                {account.type} {account.accountNumber ? `• ${account.accountNumber.slice(-4)}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-[#8E9192] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:text-white dark:hover:bg-[#1E1E1E] rounded transition-colors"
              aria-label="Edit account"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-[#8E9192] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.12)] rounded transition-colors"
              aria-label="Delete account"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-[#8E9192] mb-0.5 font-mono uppercase tracking-[0.15em]">
              {isCredit ? 'Current Outstanding' : 'Available Balance'}
            </p>
            <p
              className={`text-xl font-mono tabular-nums font-bold ${
                isCredit
                  ? 'text-[#e84118] dark:text-[#ff6b6b]'
                  : 'text-[#0A0A0A] dark:text-white'
              }`}
            >
              {isCredit ? '−' : ''}
              {formatINR(account.balance, { showSymbol: true })}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E9192] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors transform group-hover:translate-x-1" />
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
