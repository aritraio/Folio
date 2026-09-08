import React from 'react';

/**
 * Badge — Small status/category pill.
 *
 * @param {'default'|'success'|'warning'|'danger'|'info'|'outline'} variant
 * @param {'sm'|'md'} size
 * @param {React.ReactNode} dot — optional leading color dot
 * @param {string} dotColor — CSS color for the dot (e.g. '#0D9488')
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
  const base = 'inline-flex items-center gap-1.5 font-sans font-medium rounded-full whitespace-nowrap';

  const variants = {
    default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    success:
      'bg-brand-emerald-light text-brand-emerald-muted dark:bg-[rgba(52,211,153,0.15)] dark:text-emerald-400',
    warning:
      'bg-brand-amber-light text-brand-amber-muted dark:bg-[rgba(245,158,11,0.15)] dark:text-amber-400',
    danger: 'bg-brand-red-light text-brand-red-muted dark:bg-[rgba(251,113,133,0.15)] dark:text-rose-400',
    info: 'bg-sky-50 text-sky-700 dark:bg-[rgba(14,165,233,0.15)] dark:text-sky-400',
    outline:
      'bg-transparent border border-ivory-border text-zinc-600 dark:border-surface-dark-border dark:text-zinc-400',
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
