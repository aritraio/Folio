import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetModal from '../components/budgets/BudgetModal';
import { useData } from '../contexts/DataContext';
import { saveBudget, updateBudget, deleteBudget } from '../services/storage';
import { calcBudgetUtilization } from '../utils/calculations';
import { formatMoney } from '../utils/formatCurrency';
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

    return {
      totalBudget: budgetTotal,
      totalSpent: spentTotal,
      totalRemaining: budgetTotal - spentTotal,
    };
  }, [budgetData]);

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="label mb-1 text-zinc-500">Planning</p>
          <div className="flex items-center gap-4 mb-6">
            <h1 className="heading-lg text-zinc-900 dark:text-text-dark-primary">Budgets</h1>
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
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-medium tracking-wide">
                TOTAL BUDGET
              </p>
              <p className="text-2xl font-mono text-zinc-900 dark:text-text-dark-primary">
                {formatMoney(totalBudget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-medium tracking-wide">SPENT</p>
              <p className="text-2xl font-mono text-zinc-900 dark:text-text-dark-primary">
                {formatMoney(totalSpent)}
              </p>
            </div>
            <div className="pl-6 border-l border-ivory-border dark:border-surface-dark-border">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-medium tracking-wide">
                REMAINING
              </p>
              <p
                className={`text-2xl font-mono ${totalRemaining < 0 ? 'text-brand-red dark:text-rose-400' : 'text-brand-emerald dark:text-emerald-400'}`}
              >
                {formatMoney(totalRemaining)}
              </p>
            </div>
          </div>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
          Create Budget
        </Button>
      </div>

      {budgetData.length === 0 ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            title="No budgets created yet"
            description="Set monthly spending limits for categories to track your finances better."
            actionLabel="Create Budget"
            onAction={handleAddClick}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetData.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
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
