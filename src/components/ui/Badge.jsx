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
    default: 'bg-[#F5F5F5] text-[#404040] dark:bg-[#1E1E1E] dark:text-[#C4C7C8]',
    success:
      'bg-[rgba(0,163,131,0.08)] text-[#00a383] dark:bg-[rgba(0,184,148,0.12)] dark:text-[#00b894]',
    warning: 'bg-[#F5F5F5] text-[#0A0A0A] dark:bg-[#1E1E1E] dark:text-white',
    danger:
      'bg-[rgba(232,65,24,0.08)] text-[#e84118] dark:bg-[rgba(255,107,107,0.12)] dark:text-[#ff6b6b]',
    info: 'bg-transparent border border-[#E5E5E5] text-[#404040] dark:border-[#262626] dark:text-[#C4C7C8]',
    outline:
      'bg-transparent border border-[#E5E5E5] text-[#404040] dark:border-[#262626] dark:text-[#C4C7C8]',
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
