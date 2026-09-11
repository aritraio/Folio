import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';
import { useData } from '../contexts/DataContext';
import { saveTransaction, updateTransaction, deleteTransaction } from '../services/storage';
import { formatMoney } from '../utils/formatCurrency';
import { isThisMonth } from '../utils/dateUtils';
import { DEFAULT_CATEGORIES } from '../constants/finance';

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const { transactions, accounts, refresh } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [page, setPage] = useState(1);

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

  // Keep search box in sync when arriving from GlobalSearch (?search=...).
  useEffect(() => {
    if (urlSearch && urlSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: urlSearch }));
    }
  }, [urlSearch]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [filters]);

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
    deleteTransaction(id);
    refresh();
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="label mb-1 font-mono">{formatMoney(spentThisMonth)} spent this month</p>
          <h1 className="heading-lg text-[#0A0A0A] dark:text-white">Transactions</h1>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
          Add Transaction
        </Button>
      </div>

      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        categories={[...DEFAULT_CATEGORIES]}
        accounts={accounts}
        months={uniqueMonths}
      />

      <TransactionTable
        transactions={pagedTransactions}
        accounts={accounts}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {filteredTransactions.length > PAGE_SIZE && (
        <nav className="flex items-center justify-between pt-2" aria-label="Transaction pages">
          <p className="text-xs text-[#8E9192] font-mono tabular-nums">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm font-medium tabular-nums font-mono text-[#0A0A0A] dark:text-white" aria-current="page">
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
    </div>
  );
}
