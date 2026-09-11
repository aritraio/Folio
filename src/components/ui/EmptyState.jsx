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
          bg-[#F5F5F5] dark:bg-[#1E1E1E]
          border border-[#E5E5E5] dark:border-[#262626]
          flex items-center justify-center
          mb-5
        "
      >
        {icon || <Inbox className="w-7 h-7 text-[#8E9192]" />}
      </div>

      {/* Title */}
      <h3 className="heading-sm text-[#0A0A0A] dark:text-white mb-2">{title}</h3>

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
