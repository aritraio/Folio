import React from 'react';

/**
 * Badge — Terminal status pill. Sharp 4px geometry.
 * success/danger map to the ONLY chromatic signals (inflow/outflow).
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  dotColor,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center gap-1.5 font-sans font-medium rounded whitespace-nowrap';

  const variants = {
    default:
      'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] dark:bg-[var(--color-bg-tertiary)] dark:text-[var(--color-text-secondary)]',
    success:
      'bg-[rgba(0,163,131,0.08)] text-[var(--color-positive)] dark:bg-[rgba(0,184,148,0.12)] dark:text-[var(--color-positive)]',
    warning:
      'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] dark:bg-[var(--color-bg-tertiary)] dark:text-[var(--color-text-primary)]',
    danger:
      'bg-[rgba(232,65,24,0.08)] text-[var(--color-negative)] dark:bg-[rgba(255,107,107,0.12)] dark:text-[var(--color-negative)]',
    info: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)]',
    outline:
      'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={dotColor ? { backgroundColor: dotColor } : undefined}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
