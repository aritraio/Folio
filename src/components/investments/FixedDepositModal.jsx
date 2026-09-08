import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { calcFdMaturityAndInterest } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { Landmark } from 'lucide-react';

const COMPOUNDING_OPTIONS = [
  { value: 'quarterly', label: 'Quarterly (Indian Standard)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'cumulative', label: 'Cumulative at Maturity' },
];

const INITIAL_FD_STATE = {
  name: '',
  principal: '',
  interestRate: '7.1',
  startDate: new Date().toISOString().split('T')[0],
  tenureMonths: '12',
  compoundingFrequency: 'quarterly',
  notes: '',
};

/**
 * FixedDepositModal — Specialized modal for Indian Fixed Deposits with live compounding engine.
 */
export default function FixedDepositModal({ isOpen, onClose, holding, onSave }) {
  const [formData, setFormData] = useState(INITIAL_FD_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (holding) {
        setFormData({
          name: holding.name || '',
          principal: String(holding.principal || holding.avgPrice || ''),
          interestRate: String(holding.interestRate || '7.1'),
          startDate: holding.startDate || new Date().toISOString().split('T')[0],
          tenureMonths: String(holding.tenureMonths || '12'),
          compoundingFrequency: holding.compoundingFrequency || 'quarterly',
          notes: holding.notes || '',
        });
      } else {
        setFormData(INITIAL_FD_STATE);
      }
      setErrors({});
    }
  }, [isOpen, holding]);

  const preview = calcFdMaturityAndInterest(
    Number(formData.principal) || 0,
    Number(formData.interestRate) || 0,
    formData.startDate,
    Number(formData.tenureMonths) || 12,
    formData.compoundingFrequency
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Bank or institution name is required';
    if (!formData.principal || Number(formData.principal) <= 0)
      newErrors.principal = 'Valid principal amount is required';
    if (!formData.interestRate || Number(formData.interestRate) <= 0)
      newErrors.interestRate = 'Valid interest rate is required';
    if (!formData.tenureMonths || Number(formData.tenureMonths) <= 0)
      newErrors.tenureMonths = 'Tenure is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const holdingPayload = {
      ...(holding || {}),
      name: formData.name.trim(),
      type: 'fixed_deposit',
      category: 'Fixed Deposit',
      principal: Number(formData.principal),
      avgPrice: Number(formData.principal), // for legacy calculations
      currentPrice: preview.currentValue,
      units: 1,
      interestRate: Number(formData.interestRate),
      startDate: formData.startDate,
      tenureMonths: Number(formData.tenureMonths),
      compoundingFrequency: formData.compoundingFrequency,
      maturityAmount: preview.maturityAmount,
      maturityDate: preview.maturityDate,
      notes: formData.notes.trim(),
    };

    onSave(holdingPayload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={holding ? 'Edit Fixed Deposit (FD)' : 'Add Fixed Deposit (FD)'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <Input
          label="Bank / Institution Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. HDFC Bank, SBI, Bajaj Finance"
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Deposit Amount (₹)"
            name="principal"
            type="number"
            min="1"
            value={formData.principal}
            onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
            placeholder="e.g. 100000"
            error={errors.principal}
            required
          />

          <Input
            label="Interest Rate (% p.a.)"
            name="interestRate"
            type="number"
            step="0.05"
            min="0.1"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            placeholder="e.g. 7.1"
            error={errors.interestRate}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />

          <Input
            label="Tenure (Months)"
            name="tenureMonths"
            type="number"
            min="1"
            value={formData.tenureMonths}
            onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
            placeholder="e.g. 12, 36"
            error={errors.tenureMonths}
            required
          />
        </div>

        <Select
          label="Compounding Frequency"
          name="compoundingFrequency"
          value={formData.compoundingFrequency}
          onChange={(e) => setFormData({ ...formData, compoundingFrequency: e.target.value })}
          options={COMPOUNDING_OPTIONS}
        />

        {/* Live Calculation Preview Card */}
        <div className="p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-900 dark:text-text-dark-primary font-semibold">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-brand-amber" />
              Calculated Returns & Maturity
            </span>
            <span className="mono font-bold text-sm text-brand-amber">
              {formatINR(preview.maturityAmount)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/40 dark:border-amber-900/30 text-[11px]">
            <div>
              <span className="text-text-tertiary">Total Interest</span>
              <p className="font-semibold mono text-brand-emerald">+{formatINR(preview.totalInterest)}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Current Value</span>
              <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">
                {formatINR(preview.currentValue)}
              </p>
            </div>
            <div>
              <span className="text-text-tertiary">Maturity Date</span>
              <p className="font-semibold text-zinc-900 dark:text-text-dark-primary">
                {preview.maturityDate}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {holding ? 'Update FD' : 'Add FD to Portfolio'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
