import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const INITIAL_STATE = {
  name: '',
  bank: '',
  type: 'savings',
  accountNumber: '',
  balance: '',
};

export default function AccountModal({ isOpen, onClose, account, onSave }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData({
          ...account,
          accountNumber: account.accountNumber === 'N/A' ? '' : account.accountNumber || '',
        });
      } else {
        setFormData(INITIAL_STATE);
      }
      setErrors({});
    }
  }, [isOpen, account]);

  const typeOptions = [
    { value: 'savings', label: 'Savings Account' },
    { value: 'current', label: 'Current Account' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'cash', label: 'Cash' },
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }
    if (formData.balance === '' || isNaN(Number(formData.balance))) {
      newErrors.balance = 'Valid opening balance is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Determine default icon and color based on type if not provided
      let icon = formData.icon;
      let color = formData.color;

      if (!icon) {
        if (formData.type === 'savings' || formData.type === 'current') icon = 'Landmark';
        else if (formData.type === 'credit') icon = 'CreditCard';
        else if (formData.type === 'cash') icon = 'Wallet';
        else icon = 'Building2';
      }

      onSave({
        ...formData,
        balance: Number(formData.balance),
        accountNumber: formData.accountNumber || 'N/A',
        icon,
        color,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add Account'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Name"
          placeholder="e.g. HDFC Salary Account"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Account Type"
            options={typeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            error={errors.type}
          />
          <Input
            label="Bank Name (Optional)"
            placeholder="e.g. HDFC"
            value={formData.bank}
            onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Account Number (Optional)"
            placeholder="e.g. 4821"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            hint="Last 4 digits"
          />
          <Input
            label={formData.type === 'credit' ? 'Current Outstanding' : 'Opening Balance'}
            type="number"
            min="0"
            step="0.01"
            icon={<span className="text-sm">₹</span>}
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            error={errors.balance}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-ivory-border dark:border-surface-dark-border mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
