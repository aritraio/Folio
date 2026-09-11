import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — Terminal confirm. Monochrome chrome, red signal only for destructive icon.
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
            w-12 h-12 rounded flex items-center justify-center mb-4 border
            ${
              variant === 'destructive'
                ? 'bg-[rgba(255,107,107,0.12)] border-[#ff6b6b]/30 dark:bg-[rgba(255,107,107,0.12)]'
                : 'bg-[#F5F5F5] border-[#E5E5E5] dark:bg-[#1E1E1E] dark:border-[#262626]'
            }
          `}
        >
          <AlertTriangle
            className={`w-6 h-6 ${
              variant === 'destructive' ? 'text-[#ff6b6b]' : 'text-[#0A0A0A] dark:text-white'
            }`}
          />
        </div>

        {/* Title */}
        <h3 className="heading-sm text-[#0A0A0A] dark:text-white mb-2">{title}</h3>

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
