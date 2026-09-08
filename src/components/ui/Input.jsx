import React, { forwardRef } from 'react';

/**
 * Input — Text, number, date inputs; labels, error states.
 *
 * @param {string} label
 * @param {string} error — error message string
 * @param {string} hint — helper text below input
 * @param {'text'|'number'|'date'|'email'|'password'|'search'} type
 * @param {React.ReactNode} icon — optional leading icon
 * @param {boolean} fullWidth
 */
const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', icon, fullWidth = true, className = '', id, ...props },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-700 dark:text-text-dark-secondary mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full px-3.5 py-2.5
            ${icon ? 'pl-10' : ''}
            text-sm font-sans text-zinc-900 dark:text-text-dark-primary
            bg-white dark:bg-surface-dark-elevated
            border rounded-lg max-md:min-h-[44px]
            ${
              error
                ? 'border-brand-red focus:ring-brand-red/20 focus:border-brand-red'
                : 'border-ivory-border dark:border-surface-dark-border focus:ring-brand-amber/20 focus:border-brand-amber'
            }
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            transition-all duration-150
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-ivory-muted
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-brand-red font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
