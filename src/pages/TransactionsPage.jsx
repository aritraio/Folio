import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Sparkles, ReceiptText } from 'lucide-react';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';
import StatementUploadModal from '../components/statements/StatementUploadModal';
import { useData } from '../contexts/DataContext';
import { saveTransaction, updateTransaction, deleteTransaction } from '../services/storage';
import { formatMoney } from '../utils/formatCurrency';
import { isThisMonth } from '../utils/dateUtils';
import { DEFAULT_CATEGORIES } from '../constants/finance';

const PAGE_SIZE = 15;

/**
 * TransactionsPage — rows, not cards (§21).
 * Search + type/category/account/month filters with URL persistence,
 * easy clear, pagination, detail modal (no forced page nav), undo on delete (§53),
 * and honest empty states (§28).
 */
export default function TransactionsPage() {
  const { transactions, accounts, refresh } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [page, setPage] = useState(1);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const initialAccountId = location.state?.accountId || 'all';

  const [filters, setFilters] = useState({
    search: urlSearch,
    month: 'all',
    type: 'all',
    category: 'all',
    accountId: initialAccountId,
  });

  useEffect(() => {
    if (urlSearch && urlSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: urlSearch }));
    }
  }, [urlSearch]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Command palette deep-links (§35): open Add / Import directly.
  useEffect(() => {
    if (location.state?.openAdd) {
      setEditingTransaction(null);
      setIsModalOpen(true);
      window.history.replaceState({}, '');
    }
    if (location.state?.openImport) {
      setIsUploadModalOpen(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesMerchant = (tx.merchant || tx.description || '').toLowerCase().includes(searchLower);
        const matchesCategory = (tx.category || '').toLowerCase().includes(searchLower);
        const matchesNotes = (tx.notes || '').toLowerCase().includes(searchLower);
        if (!matchesMerchant && !matchesCategory && !matchesNotes) return false;
      }
      if (filters.month !== 'all') {
        const txMonth = tx.date ? String(tx.date).substring(0, 7) : '';
        if (txMonth !== filters.month) return false;
      }
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      if (filters.accountId !== 'all' && tx.accountId !== filters.accountId) return false;
      return true;
    });
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTransactions = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, safePage]);

  const spentThisMonth = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date && isThisMonth(tx.date))
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }, [transactions]);

  const uniqueMonths = useMemo(() => {
    const monthMap = new Map();
    transactions.forEach((tx) => {
      if (tx.date) {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) {
          const key = String(tx.date).substring(0, 7);
          const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          if (!monthMap.has(key)) monthMap.set(key, label);
        }
      }
    });
    return Array.from(monthMap.entries())
      .map(([key, label]) => ({ monthKey: key, label }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [transactions]);

  const hasActiveFilters =
    filters.search || filters.month !== 'all' || filters.type !== 'all' || filters.category !== 'all' || filters.accountId !== 'all';

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'search') {
      if (value) setSearchParams({ search: value }, { replace: true });
      else setSearchParams({}, { replace: true });
    }
  };

  const handleClearFilters = () => {
    setFilters({ search: '', month: 'all', type: 'all', category: 'all', accountId: 'all' });
    setSearchParams({}, { replace: true });
  };

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    const victim = transactions.find((t) => t.id === id);
    deleteTransaction(id);
    refresh();
    if (victim) {
      clearTimeout(undoTimer.current);
      setUndo(victim);
      undoTimer.current = setTimeout(() => setUndo(null), 8000);
    }
  };

  const handleUndo = () => {
    if (!undo) return;
    const { id: _drop, ...rest } = undo;
    void _drop;
    saveTransaction(rest);
    refresh();
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const handleSaveTransaction = (data) => {
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
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow={`${formatMoney(spentThisMonth)} spent this month`}
        title="Transactions"
        description="Every move, searchable. Transfers never count as spend — select a row to inspect."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Sparkles className="w-4 h-4 text-brand-amber" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Import Statement
            </Button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
              Add Transaction
            </Button>
          </>
        }
      />

      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        categories={[...DEFAULT_CATEGORIES]}
        accounts={accounts}
        months={uniqueMonths}
      />

      {undo && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-ivory-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-sm"
          role="status"
          aria-live="polite"
        >
          <span>
            Transaction deleted{undo.merchant ? <> — <strong>{undo.merchant}</strong></> : null}.
          </span>
          <button
            onClick={handleUndo}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-amber hover:text-brand-amber-hover press-feedback"
          >
            Undo
          </button>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            icon={<ReceiptText className="w-7 h-7 text-brand-amber" />}
            title="No transactions yet"
            description="Add your first transaction manually, or import a bank statement — Ledger will categorise, detect duplicates and update balances."
            actionLabel="Add Transaction"
            onAction={handleAddClick}
          />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            title="No matches for these filters"
            description={`Nothing matches${filters.search ? ` “${filters.search}”` : ''}. Try widening the month or clearing filters.`}
            actionLabel="Clear filters"
            onAction={handleClearFilters}
          />
        </div>
      ) : (
        <>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary" role="status">
            {filteredTransactions.length} result{filteredTransactions.length === 1 ? '' : 's'}
            {hasActiveFilters ? ' · filters active' : ''}
          </p>
          <TransactionTable
            transactions={pagedTransactions}
            accounts={accounts}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </>
      )}

      {filteredTransactions.length > PAGE_SIZE && (
        <nav className="flex items-center justify-between pt-2" aria-label="Transaction pages">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length}
          </p>
          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm font-medium tabular-nums" aria-current="page">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingTransaction}
        onSave={handleSaveTransaction}
        categories={[...DEFAULT_CATEGORIES]}
        accounts={accounts}
      />

      <StatementUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}
