import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const TYPE_OPTIONS = [
  { value: 'Mutual Fund', label: 'Mutual Fund' },
  { value: 'Stocks', label: 'Stocks' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Provident Fund', label: 'Provident Fund' },
  { value: 'Fixed Deposit', label: 'Fixed Deposit' },
  { value: 'Bonds', label: 'Bonds' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Other', label: 'Other' },
];

const INITIAL_STATE = {
  name: '',
  category: '',
  units: '',
  avgPrice: '',
  currentPrice: '',
};

/**
 * HoldingModal — Add/Edit investment holding modal.
 *
 * @param {{ isOpen: boolean, onClose: () => void, holding: object|null, onSave: (data) => void }} props
 */
export default function HoldingModal({ isOpen, onClose, holding, onSave }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (holding) {
        setFormData({
          ...holding,
          units: String(holding.units || ''),
          avgPrice: String(holding.avgPrice || ''),
          currentPrice: String(holding.currentPrice || ''),
        });
      } else {
        setFormData(INITIAL_STATE);
      }
      setErrors({});
    }
  }, [isOpen, holding]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Type is required';
    }
    if (formData.units === '' || isNaN(Number(formData.units)) || Number(formData.units) <= 0) {
      newErrors.units = 'Valid number of units is required';
    }
    if (formData.avgPrice === '' || isNaN(Number(formData.avgPrice)) || Number(formData.avgPrice) <= 0) {
      newErrors.avgPrice = 'Valid average price is required';
    }
    if (
      formData.currentPrice === '' ||
      isNaN(Number(formData.currentPrice)) ||
      Number(formData.currentPrice) <= 0
    ) {
      newErrors.currentPrice = 'Valid current price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const units = Number(formData.units);
      const avgPrice = Number(formData.avgPrice);
      const currentPrice = Number(formData.currentPrice);

      onSave({
        ...formData,
        units,
        avgPrice,
        currentPrice,
        investedValue: units * avgPrice,
        currentValue: units * currentPrice,
      });
      onClose();
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={holding ? 'Edit Holding' : 'Add Holding'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Input
          label="Asset Name"
          placeholder="e.g. HDFC Bank Ltd, Nifty 50 Index Fund"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
        />

        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={formData.category}
          onChange={handleChange('category')}
          error={errors.category}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Units"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={formData.units}
            onChange={handleChange('units')}
            error={errors.units}
          />
          <Input
            label="Average Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            icon={<span className="text-sm">₹</span>}
            value={formData.avgPrice}
            onChange={handleChange('avgPrice')}
            error={errors.avgPrice}
          />
          <Input
            label="Current Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            icon={<span className="text-sm">₹</span>}
            value={formData.currentPrice}
            onChange={handleChange('currentPrice')}
            error={errors.currentPrice}
          />
        </div>

        {/* Preview computed values */}
        {formData.units && formData.avgPrice && formData.currentPrice && (
          <div className="bg-ivory-muted dark:bg-surface-dark-elevated rounded-lg p-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
              Preview
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary dark:text-text-dark-secondary">Invested Value</span>
              <span className="mono font-semibold text-zinc-900 dark:text-text-dark-primary">
                ₹{(Number(formData.units) * Number(formData.avgPrice)).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary dark:text-text-dark-secondary">Current Value</span>
              <span className="mono font-semibold text-zinc-900 dark:text-text-dark-primary">
                ₹{(Number(formData.units) * Number(formData.currentPrice)).toLocaleString('en-IN')}
              </span>
            </div>
            {(() => {
              const inv = Number(formData.units) * Number(formData.avgPrice);
              const cur = Number(formData.units) * Number(formData.currentPrice);
              const ret = cur - inv;
              const isPos = ret >= 0;
              return (
                <div className="flex justify-between text-sm pt-1 border-t border-ivory-border dark:border-surface-dark-border">
                  <span className="text-text-secondary dark:text-text-dark-secondary">P&L</span>
                  <span
                    className={`mono font-bold ${isPos ? 'text-brand-emerald dark:text-emerald-400' : 'text-brand-red dark:text-rose-400'}`}
                  >
                    {isPos ? '+' : '−'}₹{Math.abs(ret).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-ivory-border dark:border-surface-dark-border mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {holding ? 'Update Holding' : 'Add Holding'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
