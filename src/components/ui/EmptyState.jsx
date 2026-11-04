import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState — Terminal placeholder + message + CTA.
 */
export default function EmptyState({
  icon,
  title = 'No data yet',
  description = 'Get started by adding your first entry.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        py-16 px-6
        ${className}
      `}
    >
      {/* Icon */}
      <div
        className="
          w-16 h-16 rounded
          bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-tertiary)]
          border border-[var(--color-border)] dark:border-[var(--color-border)]
          flex items-center justify-center
          mb-5
        "
      >
        {icon || <Inbox className="w-7 h-7 text-[var(--color-text-tertiary)]" />}
      </div>

      {/* Title */}
      <h3 className="heading-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="body-sm max-w-sm mb-6">{description}</p>

      {/* CTA */}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
