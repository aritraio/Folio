import React, { forwardRef, useId } from 'react';

/**
 * Input — Terminal text/number/date input.
 * Surface #141414, input bg #0A0A0A, 1px #262626 border, white focus ring.
 */
const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', icon, fullWidth = true, className = '', id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-tertiary)]">
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
            text-sm font-sans text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]
            bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)]
            border rounded max-md:min-h-[44px]
            ${
              error
                ? 'border-[#ff6b6b] focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]'
                : 'border-[var(--color-border)] dark:border-[var(--color-border)] focus:ring-white/20 focus:border-[#0A0A0A] dark:focus:border-white'
            }
            placeholder:text-[var(--color-text-tertiary)]
            transition-colors duration-150
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)] dark:disabled:bg-[var(--color-bg-tertiary)]
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-xs text-[var(--color-negative)] font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
