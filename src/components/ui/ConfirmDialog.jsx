import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — "Are you sure?" modal for destructive actions.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 * @param {string} title
 * @param {string} message — description text
 * @param {string} confirmLabel — button text (default "Delete")
 * @param {string} cancelLabel — button text (default "Cancel")
 * @param {'destructive'|'primary'} variant — confirm button variant
 * @param {boolean} loading
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
  children,
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-4
            ${
              variant === 'destructive'
                ? 'bg-brand-red-light dark:bg-[rgba(251,113,133,0.15)]'
                : 'bg-brand-amber-light dark:bg-[rgba(245,158,11,0.15)]'
            }
          `}
        >
          <AlertTriangle
            className={`w-6 h-6 ${
              variant === 'destructive'
                ? 'text-brand-red dark:text-rose-400'
                : 'text-brand-amber dark:text-amber-400'
            }`}
          />
        </div>

        {/* Title */}
        <h3 className="heading-sm text-zinc-900 dark:text-text-dark-primary mb-2">{title}</h3>

        {/* Message */}
        <p className="body-sm max-w-xs mb-6">{message}</p>

        {children}

        {/* Actions */}
        <div className="flex items-center gap-3 w-full mt-6">
          <Button variant="secondary" size="md" fullWidth onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="md" fullWidth onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
