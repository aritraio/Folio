import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Landmark, CreditCard, Wallet, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import AccountCard from '../components/accounts/AccountCard';
import AccountModal from '../components/accounts/AccountModal';
import { useData } from '../contexts/DataContext';
import { saveAccount, updateAccount, deleteAccount, getAccountUsage } from '../services/storage';
import { calcFinancialSnapshot, calcInvestmentTotal } from '../utils/calculations';
import { formatMoney } from '../utils/formatCurrency';

/**
 * AccountsPage — a financial map (§23), not database records.
 * Total liquid cash hero → bank accounts → investments → credit cards,
 * all reconciling with the dashboard's unified snapshot.
 */
export default function AccountsPage() {
  const { accounts, investments, refresh } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, account: null, usage: 0, reassignTo: '' });
  const [deleteError, setDeleteError] = useState('');

  const snapshot = useMemo(() => calcFinancialSnapshot(accounts, investments), [accounts, investments]);
  const investmentTotal = useMemo(() => Math.round(calcInvestmentTotal(investments)), [investments]);

  const bankAccounts = accounts.filter((a) => a.type === 'savings' || a.type === 'current');
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const otherAccounts = accounts.filter((a) => !['savings', 'current', 'cash', 'credit'].includes(a.type));

  const Group = ({ icon: Icon, eyebrow, total, children, emptyText }) => (
    <section aria-label={eyebrow}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-text-dark-primary">
          <Icon className="w-4 h-4 text-text-secondary dark:text-text-dark-secondary" aria-hidden="true" />
          {eyebrow}
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-surface-dark-elevated px-2 py-0.5 rounded-full">
            {children?.length ?? 0}
          </span>
        </h2>
        {total != null && <span className="text-sm font-semibold mono">{formatMoney(total)}</span>}
      </div>
      {children?.length === 0 ? (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary py-2">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
      )}
    </section>
  );

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

  const reassignOptions = accounts.filter((a) => deleteState.account && a.id !== deleteState.account.id);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Finance"
        title="Accounts"
        description={`Assets ${formatMoney(snapshot.totalAssets)} · investments ${formatMoney(snapshot.investmentTotal)} · liabilities ${formatMoney(snapshot.totalLiabilities)} · net ${formatMoney(snapshot.netWorth)}.`}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
            Add Account
          </Button>
        }
      />

      {/* Liquid cash hero */}
      <section aria-label="Total liquid cash" className="section-divider pt-5">
        <p className="eyebrow mb-1">Total liquid cash</p>
        <p className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-text-dark-primary tabular-nums">
          {formatMoney(snapshot.liquidAssets)}
        </p>
        <p className="mt-1.5 text-xs text-text-secondary dark:text-text-dark-secondary">
          Cash & bank balances available now · {bankAccounts.length + cashAccounts.length} account
          {bankAccounts.length + cashAccounts.length === 1 ? '' : 's'} ·{' '}
          <Link to="/analytics" className="underline underline-offset-2 hover:text-brand-amber">
            coverage in Analytics
          </Link>
        </p>
      </section>

      {deleteError && !deleteState.open && (
        <div className="p-3 rounded-lg text-sm bg-brand-red/10 text-brand-red" role="alert">
          {deleteError}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            title="No accounts yet"
            description="Add a bank account, wallet, or credit card to map your money. Balances flow into net worth automatically."
            actionLabel="Add Account"
            onAction={handleAddClick}
          />
        </div>
      ) : (
        <>
          <Group icon={Landmark} eyebrow="Bank accounts" total={formatMoney(snapshot.totalAssets)} emptyText="No bank accounts.">
            {bankAccounts.map((account) => (
              <AccountCard key={account.id} account={account} onEdit={handleEditClick} onDelete={() => handleDeleteClick(account)} />
            ))}
          </Group>

          {cashAccounts.length > 0 && (
            <Group icon={Wallet} eyebrow="Cash & wallets" emptyText="No cash accounts.">
              {cashAccounts.map((account) => (
                <AccountCard key={account.id} account={account} onEdit={handleEditClick} onDelete={() => handleDeleteClick(account)} />
              ))}
            </Group>
          )}

          {investmentTotal > 0 && (
            <section aria-label="Investments held elsewhere">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-text-dark-primary">
                  <Wallet className="w-4 h-4 text-investment" aria-hidden="true" />
                  Investments
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 bg-investment/10 px-2 py-0.5 rounded-full">
                    {investments.length}
                  </span>
                </h2>
                <Link to="/investments" className="inline-flex items-center gap-1 text-sm font-semibold mono text-investment hover:underline">
                  {formatMoney(investmentTotal)} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                Tracked on the Investments page and included in net worth.
              </p>
            </section>
          )}

          {otherAccounts.length > 0 && (
            <Group icon={Wallet} eyebrow="Other assets" emptyText="No other assets.">
              {otherAccounts.map((account) => (
                <AccountCard key={account.id} account={account} onEdit={handleEditClick} onDelete={() => handleDeleteClick(account)} />
              ))}
            </Group>
          )}

          <Group icon={CreditCard} eyebrow="Credit cards · outstanding" total={formatMoney(snapshot.totalLiabilities)} emptyText="No credit cards tracked.">
            {creditAccounts.map((account) => (
              <AccountCard key={account.id} account={account} onEdit={handleEditClick} onDelete={() => handleDeleteClick(account)} />
            ))}
          </Group>
        </>
      )}

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
        {reassignOptions.length > 0 && (
          <div className="mt-4 text-left">
            <Select
              label="Move transactions to"
              value={deleteState.reassignTo}
              onChange={(e) => setDeleteState((s) => ({ ...s, reassignTo: e.target.value }))}
              options={reassignOptions.map((a) => ({ value: a.id, label: a.name }))}
            />
            {deleteError && (
              <p className="mt-2 text-sm text-brand-red" role="alert">
                {deleteError}
              </p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
