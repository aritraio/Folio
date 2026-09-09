import React, { useState, useMemo } from 'react';
import { Plus, CalendarClock } from 'lucide-react';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetModal from '../components/budgets/BudgetModal';
import { useData } from '../contexts/DataContext';
import { saveBudget, updateBudget, deleteBudget } from '../services/storage';
import { calcBudgetUtilization, detectRecurring } from '../utils/calculations';
import { formatMoney, formatINR } from '../utils/formatCurrency';
import { format } from 'date-fns';

export default function BudgetsPage() {
  const { budgets, transactions, refresh } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const monthOptions = useMemo(() => {
    const monthMap = new Map();
    const currentKey = format(new Date(), 'yyyy-MM');
    const currentLabel = format(new Date(), 'MMM yyyy');
    monthMap.set(currentKey, currentLabel);

    transactions.forEach((tx) => {
      if (tx.date) {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) {
          const key = String(tx.date).substring(0, 7);
          const label = format(d, 'MMM yyyy');
          if (!monthMap.has(key)) monthMap.set(key, label);
        }
      }
    });
    return Array.from(monthMap.entries())
      .map(([key, label]) => ({ value: key, label }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [transactions]);

  const budgetData = useMemo(() => {
    return calcBudgetUtilization(budgets, transactions, selectedMonth);
  }, [budgets, transactions, selectedMonth]);

  const { totalBudget, totalSpent, totalRemaining } = useMemo(() => {
    let budgetTotal = 0;
    let spentTotal = 0;
    budgetData.forEach((b) => {
      budgetTotal += b.limit;
      spentTotal += b.spent;
    });
    return { totalBudget: budgetTotal, totalSpent: spentTotal, totalRemaining: budgetTotal - spentTotal };
  }, [budgetData]);

  const recurring = useMemo(() => detectRecurring(transactions).slice(0, 3), [transactions]);

  const handleAddClick = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    deleteBudget(id);
    refresh();
  };

  const handleSaveBudget = (data) => {
    if (editingBudget) {
      updateBudget({ ...data, id: editingBudget.id });
    } else {
      saveBudget(data);
    }
    refresh();
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Planning"
        title="Budgets"
        description="Actionable limits with month-end forecasts — healthy, watch, or over."
        actions={
          <>
            {monthOptions.length > 0 && (
              <div className="w-40">
                <Select
                  aria-label="Budget month"
                  options={monthOptions}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  placeholder={null}
                />
              </div>
            )}
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
              Create Budget
            </Button>
          </>
        }
      />

      <dl className="grid grid-cols-3 gap-x-8 section-divider pt-5">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
            Total budget
          </dt>
          <dd className="text-2xl font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatMoney(totalBudget)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
            Spent
          </dt>
          <dd className="text-2xl font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatMoney(totalSpent)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary mb-1">
            Remaining
          </dt>
          <dd className={`text-2xl font-semibold mono ${totalRemaining < 0 ? 'text-brand-red' : 'text-brand-emerald'}`}>
            {formatMoney(totalRemaining)}
          </dd>
        </div>
      </dl>

      {budgetData.length === 0 ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            title="No budgets yet"
            description="Set a monthly limit for a category — for example Food & Dining ₹1,500 — and Ledger will track pace and forecast the month-end."
            actionLabel="Create Budget"
            onAction={handleAddClick}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetData.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      {recurring.length > 0 && (
        <section aria-label="Possible recurring payments" className="section-divider pt-6">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-brand-amber" aria-hidden="true" />
            <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Recurring candidates</h2>
          </div>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-4">
            Detected from repeated merchants — confirm before treating as subscriptions. Never auto-classified.
          </p>
          <ul className="divide-y divide-ivory-border dark:divide-surface-dark-border">
            {recurring.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary truncate">
                    {r.merchant}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {r.category} · {r.count} charges · next expected {r.nextExpected}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold mono">{formatINR(r.amount)}<span className="text-xs font-normal text-text-secondary">/mo</span></p>
                  <p className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary">{r.confidence}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budget={editingBudget}
        onSave={handleSaveBudget}
        existingBudgets={budgets}
      />
    </div>
  );
}
