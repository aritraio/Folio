import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Select from '../components/ui/Select';
import AccountCard from '../components/accounts/AccountCard';
import AccountModal from '../components/accounts/AccountModal';
import { useData } from '../contexts/DataContext';
import { saveAccount, updateAccount, deleteAccount, getAccountUsage } from '../services/storage';
import { calcTotalAssets, calcTotalLiabilities, calcNetWorth } from '../utils/calculations';
import { formatMoney } from '../utils/formatCurrency';

export default function AccountsPage() {
  const { accounts, refresh } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, account: null, usage: 0, reassignTo: '' });
  const [deleteError, setDeleteError] = useState('');

  const totalAssets = calcTotalAssets(accounts);
  const totalLiabilities = calcTotalLiabilities(accounts);
  const netWorth = calcNetWorth(accounts);

  const assetsAccounts = accounts.filter((a) => a.type !== 'credit');
  const liabilitiesAccounts = accounts.filter((a) => a.type === 'credit');

  const handleAddClick = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (accountOrId) => {
    const account =
      typeof accountOrId === 'string' ? accounts.find((a) => a.id === accountOrId) : accountOrId;
    if (!account) return;
    const usage = getAccountUsage(account.id);
    if (usage.hasTransactions) {
      const fallback = accounts.find((a) => a.id !== account.id);
      setDeleteState({ open: true, account, usage: usage.count, reassignTo: fallback ? fallback.id : '' });
      setDeleteError('');
    } else {
      try {
        deleteAccount(account.id);
        refresh();
      } catch (err) {
        setDeleteError(err.message);
      }
    }
  };

  const confirmDelete = () => {
    if (!deleteState.account) return;
    try {
      if (deleteState.usage > 0 && !deleteState.reassignTo) {
        setDeleteError('Choose an account to move the transactions to, or cancel.');
        return;
      }
      deleteAccount(
        deleteState.account.id,
        deleteState.usage > 0 ? { reassignTo: deleteState.reassignTo } : undefined
      );
      setDeleteState({ open: false, account: null, usage: 0, reassignTo: '' });
      setDeleteError('');
      refresh();
    } catch (err) {
      setDeleteError(err.message || 'Could not delete account.');
    }
  };

  const handleSaveAccount = (data) => {
    if (editingAccount) {
      updateAccount({ ...data, id: editingAccount.id });
    } else {
      saveAccount(data);
    }
    refresh();
  };

  const otherAccounts = accounts.filter((a) => deleteState.account && a.id !== deleteState.account.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="label mb-1 font-mono">Finance</p>
          <h1 className="heading-lg text-[#0A0A0A] dark:text-white mb-6">Accounts</h1>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-[#8E9192] mb-1 font-medium tracking-wide font-mono uppercase">
                TOTAL ASSETS
              </p>
              <p className="text-2xl font-mono tabular-nums font-bold text-[#0A0A0A] dark:text-white">
                {formatMoney(totalAssets)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8E9192] mb-1 font-medium tracking-wide font-mono uppercase">
                TOTAL LIABILITIES
              </p>
              <p className="text-2xl font-mono tabular-nums font-bold text-[#0A0A0A] dark:text-white">
                {formatMoney(totalLiabilities)}
              </p>
            </div>
            <div className="pl-6 border-l border-[#E5E5E5] dark:border-[#262626]">
              <p className="text-xs text-[#8E9192] mb-1 font-medium tracking-wide font-mono uppercase">
                NET WORTH
              </p>
              <p className="text-2xl font-mono tabular-nums font-bold text-[#00a383] dark:text-[#00b894]">
                {formatMoney(netWorth)}
              </p>
            </div>
          </div>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
          Add Account
        </Button>
      </div>

      {deleteError && !deleteState.open && (
        <div className="p-3 rounded text-sm bg-[rgba(255,107,107,0.12)] text-[#ff6b6b]" role="alert">
          {deleteError}
        </div>
      )}

      <div>
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white mb-4 flex items-center gap-2">
          Assets
          <span className="text-xs font-normal font-mono text-[#8E9192] bg-[#F5F5F5] dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#262626] px-2 py-0.5 rounded">
            {assetsAccounts.length}
          </span>
        </h2>
        {assetsAccounts.length === 0 ? (
          <p className="text-sm text-[#8E9192]">No asset accounts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetsAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEditClick}
                onDelete={() => handleDeleteClick(account)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white mb-4 flex items-center gap-2">
          Liabilities
          <span className="text-xs font-normal font-mono text-[#8E9192] bg-[#F5F5F5] dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#262626] px-2 py-0.5 rounded">
            {liabilitiesAccounts.length}
          </span>
        </h2>
        {liabilitiesAccounts.length === 0 ? (
          <p className="text-sm text-[#8E9192]">No liability accounts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liabilitiesAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEditClick}
                onDelete={() => handleDeleteClick(account)}
              />
            ))}
          </div>
        )}
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={editingAccount}
        onSave={handleSaveAccount}
      />

      <ConfirmDialog
        isOpen={deleteState.open}
        onClose={() => setDeleteState({ open: false, account: null, usage: 0, reassignTo: '' })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteState.account?.name || 'account'}?`}
        message={`This account is used by ${deleteState.usage} transaction(s). Choose where to move them — transactions are never silently orphaned.`}
        confirmLabel="Move & Delete"
      >
        {otherAccounts.length > 0 && (
          <div className="mt-4 text-left">
            <Select
              label="Move transactions to"
              value={deleteState.reassignTo}
              onChange={(e) => setDeleteState((s) => ({ ...s, reassignTo: e.target.value }))}
              options={otherAccounts.map((a) => ({ value: a.id, label: a.name }))}
            />
            {deleteError && (
              <p className="mt-2 text-sm text-[#ff6b6b]" role="alert">
                {deleteError}
              </p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
