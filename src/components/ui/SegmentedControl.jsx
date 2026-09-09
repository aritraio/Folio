import React from 'react';

/**
 * SegmentedControl — compact period/filter pills (§10, §42).
 * Pills reserved for filters + segmented controls only.
 */
export default function SegmentedControl({ options = [], value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            data-active={active}
            onClick={() => onChange?.(v)}
            className="press-feedback"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
