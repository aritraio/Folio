import React from 'react';
import { Search, X } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function TransactionFilters({
  filters,
  onFilterChange,
  onClear,
  categories = [],
  accounts = [],
  months = [],
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
    { value: 'transfer', label: 'Transfer' },
  ];

  const monthOptions = [
    { value: 'all', label: 'All Time' },
    ...months.map((m) => ({ value: m.monthKey, label: m.label })),
  ];

  return (
    <div className="card p-4 md:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-3">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search merchants or notes..."
            aria-label="Search transactions"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            fullWidth
          />
        </div>

        {/* Month */}
        <div className="md:col-span-2">
          <Select
            aria-label="Filter by month"
            options={monthOptions}
            value={filters.month}
            onChange={(e) => onFilterChange('month', e.target.value)}
            fullWidth
            placeholder={null} // Don't show generic placeholder
          />
        </div>

        {/* Type */}
        <div className="md:col-span-2">
          <Select
            aria-label="Filter by type"
            options={typeOptions}
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            fullWidth
            placeholder={null}
          />
        </div>

        {/* Category */}
        <div className="md:col-span-2">
          <Select
            aria-label="Filter by category"
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            fullWidth
            placeholder={null}
          />
        </div>

        {/* Account */}
        <div className="md:col-span-2">
          <Select
            aria-label="Filter by account"
            options={accountOptions}
            value={filters.accountId}
            onChange={(e) => onFilterChange('accountId', e.target.value)}
            fullWidth
            placeholder={null}
          />
        </div>

        {/* Clear Filters (Desktop right-aligned) */}
        <div className="md:col-span-1 flex justify-end">
          <Button variant="ghost" onClick={onClear} fullWidth icon={<X className="w-4 h-4" />}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
