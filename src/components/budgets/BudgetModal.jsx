import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Transport',
  'Healthcare',
  'Travel',
  'Education',
  'Investment',
  'Other',
];

const INITIAL_STATE = {
  category: '',
  limit: '',
};

export default function BudgetModal({ isOpen, onClose, budget, onSave, existingBudgets = [] }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        setFormData({
          ...budget,
        });
      } else {
        setFormData(INITIAL_STATE);
      }
      setErrors({});
    }
  }, [isOpen, budget]);

  const categoryOptions = DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }));

  const validate = () => {
    const newErrors = {};
    if (!formData.category) {
      newErrors.category = 'Category is required';
    } else {
      // Check for duplicates if creating a new budget
      if (!budget) {
        const exists = existingBudgets.some((b) => b.category === formData.category);
        if (exists) {
          newErrors.category = 'A budget for this category already exists';
        }
      }
    }

    if (formData.limit === '' || isNaN(Number(formData.limit)) || Number(formData.limit) <= 0) {
      newErrors.limit = 'Valid monthly limit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        limit: Number(formData.limit),
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={budget ? 'Edit Budget' : 'Create Budget'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Select
          label="Category"
          options={categoryOptions}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          error={errors.category}
          disabled={!!budget} // Cannot change category when editing
          hint={budget ? 'Category cannot be changed after creation' : ''}
        />

        <Input
          label="Monthly Limit"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          icon={<span className="text-sm">₹</span>}
          value={formData.limit}
          onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
          error={errors.limit}
        />

        <div className="pt-4 flex justify-end gap-3 border-t border-[#E5E5E5] dark:border-[#262626] mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
}
