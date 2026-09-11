import React, { forwardRef } from 'react';
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
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[#404040] dark:text-[#C4C7C8] mb-1.5"
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
            text-sm font-sans text-[#0A0A0A] dark:text-white
            bg-white dark:bg-[#0A0A0A]
            border rounded max-md:min-h-[44px]
            appearance-none cursor-pointer
            ${
              error
                ? 'border-[#ff6b6b] focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]'
                : 'border-[#E5E5E5] dark:border-[#262626] focus:ring-white/20 focus:border-[#0A0A0A] dark:focus:border-white'
            }
            transition-colors duration-150
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F5F5F5] dark:disabled:bg-[#1E1E1E]
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
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8E9192]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-[#ff6b6b] font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-[#8E9192]">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Select;
