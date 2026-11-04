import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select — Terminal dropdown. Dark input bg, 1px border, white focus ring.
 */
const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    placeholder = 'Select…',
    options = [],
    fullWidth = true,
    className = '',
    id,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3.5 py-2.5 pr-10
            text-sm font-sans text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]
            bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)]
            border rounded max-md:min-h-[44px]
            appearance-none cursor-pointer
            ${
              error
                ? 'border-[#ff6b6b] focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]'
                : 'border-[var(--color-border)] dark:border-[var(--color-border)] focus:ring-white/20 focus:border-[#0A0A0A] dark:focus:border-white'
            }
            transition-colors duration-150
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)] dark:disabled:bg-[var(--color-bg-tertiary)]
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-text-tertiary)]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-xs text-[var(--color-negative)] font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Select;
