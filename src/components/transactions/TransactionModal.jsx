import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { toDate } from '../../utils/dateUtils';
import { getCurrencySymbol } from '../../utils/formatCurrency';
import { format } from 'date-fns';

const INITIAL_STATE = {
  type: 'expense',
  amount: '',
  description: '',
  category: '',
  accountId: '',
  toAccountId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
};

const MAX_AMOUNT = 100000000;
const TODAY_STR = () => format(new Date(), 'yyyy-MM-dd');

export default function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onSave,
  categories = [],
  accounts = [],
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          type: transaction.type || 'expense',
          amount: transaction.amount ?? '',
          description: transaction.merchant || transaction.description || '',
          category: transaction.type === 'transfer' ? 'Other' : transaction.category || '',
          accountId: transaction.accountId || '',
          toAccountId: transaction.toAccountId || '',
          date: transaction.date ? format(toDate(transaction.date), 'yyyy-MM-dd') : TODAY_STR(),
          notes: transaction.notes || '',
        });
      } else {
        setFormData({ ...INITIAL_STATE, date: TODAY_STR() });
      }
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, transaction]);

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  const validate = () => {
    const newErrors = {};
    const amt = Number(formData.amount);
    if (!formData.amount || Number.isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Enter an amount greater than 0';
    } else if (amt > MAX_AMOUNT) {
      newErrors.amount = 'Amount looks too large — please check';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description/Merchant is required';
    } else if (formData.description.trim().length > 80) {
      newErrors.description = 'Keep description under 80 characters';
    }
    if (formData.type !== 'transfer' && !formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.accountId) {
      newErrors.accountId =
        formData.type === 'transfer' ? 'Source account is required' : 'Account is required';
    }
    if (formData.type === 'transfer') {
      if (!formData.toAccountId) newErrors.toAccountId = 'Destination account is required';
      else if (formData.toAccountId === formData.accountId)
        newErrors.toAccountId = 'Pick a different account';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Keep notes under 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (validate()) {
      setIsSaving(true);
      try {
        const payload =
          formData.type === 'transfer'
            ? {
                type: 'transfer',
                amount: Number(formData.amount),
                merchant: formData.description.trim(),
                description: formData.description.trim(),
                category: 'Other',
                accountId: formData.accountId,
                toAccountId: formData.toAccountId,
                date: formData.date,
                notes: formData.notes.trim(),
              }
            : {
                type: formData.type,
                amount: Number(formData.amount),
                merchant: formData.description.trim(),
                description: formData.description.trim(),
                category: formData.category,
                accountId: formData.accountId,
                date: formData.date,
                notes: formData.notes.trim(),
              };
        onSave(payload);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const isFuture = formData.date && formData.date > TODAY_STR();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div
          className="flex bg-zinc-100 dark:bg-surface-dark-elevated p-1 rounded-lg"
          role="tablist"
          aria-label="Transaction type"
        >
          {['expense', 'income', 'transfer'].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={formData.type === t}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                formData.type === t
                  ? 'bg-white dark:bg-surface-dark-card text-zinc-900 dark:text-text-dark-primary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              onClick={() => setFormData({ ...formData, type: t })}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            min="0"
            max={MAX_AMOUNT}
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            icon={<span className="text-sm">{getCurrencySymbol()}</span>}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            error={errors.amount}
          />
          <div>
            <Input
              label="Date"
              type="date"
              max={TODAY_STR()}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={errors.date}
            />
            {isFuture && !errors.date && (
              <p className="mt-1 text-xs text-brand-amber">
                Future date — scheduled transactions aren&apos;t tracked separately yet.
              </p>
            )}
          </div>
        </div>

        <Input
          label="Merchant / Description"
          placeholder="e.g. Amazon, Salary, Groceries..."
          value={formData.description}
          maxLength={80}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-4">
          {formData.type === 'transfer' ? (
            <>
              <Select
                label="From Account"
                options={accountOptions}
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                error={errors.accountId}
              />
              <Select
                label="To Account"
                options={accountOptions}
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                error={errors.toAccountId}
              />
            </>
          ) : (
            <>
              <Select
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                error={errors.category}
              />
              <Select
                label="Account"
                options={accountOptions}
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                error={errors.accountId}
              />
            </>
          )}
        </div>

        {formData.type === 'transfer' && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-2">
            Transfers move money between your accounts and are excluded from income/expense totals.
          </p>
        )}

        <div>
          <label
            htmlFor="tx-notes"
            className="block text-sm font-medium text-zinc-700 dark:text-text-dark-secondary mb-1.5"
          >
            Notes (Optional)
          </label>
          <textarea
            id="tx-notes"
            className="w-full px-3.5 py-2.5 text-sm font-sans text-zinc-900 dark:text-text-dark-primary bg-white dark:bg-surface-dark-elevated border border-ivory-border dark:border-surface-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all duration-150 resize-none"
            rows={3}
            maxLength={500}
            placeholder="Add details about this transaction..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            aria-describedby={errors.notes ? 'tx-notes-error' : undefined}
          />
          {errors.notes && (
            <p id="tx-notes-error" className="mt-1 text-xs text-brand-red" role="alert">
              {errors.notes}
            </p>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-ivory-border dark:border-surface-dark-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
