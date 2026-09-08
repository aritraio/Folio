import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState — Illustration placeholder + message + CTA.
 *
 * @param {React.ReactNode} icon — optional custom icon (defaults to Inbox)
 * @param {string} title — heading text
 * @param {string} description — subtitle/description
 * @param {string} actionLabel — CTA button label
 * @param {() => void} onAction — CTA click handler
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
          w-16 h-16 rounded-2xl
          bg-ivory-muted dark:bg-surface-dark-elevated
          flex items-center justify-center
          mb-5
        "
      >
        {icon || <Inbox className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />}
      </div>

      {/* Title */}
      <h3 className="heading-sm text-zinc-800 dark:text-text-dark-primary mb-2">{title}</h3>

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
