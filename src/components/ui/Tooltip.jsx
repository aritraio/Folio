import React, { useState, useRef, useEffect } from 'react';

/**
 * Tooltip — Lightweight tooltip for chart hover, icon explanations, etc.
 *
 * @param {string} content — tooltip text
 * @param {'top'|'bottom'|'left'|'right'} position
 * @param {number} delay — show delay in ms (default 200)
 */
export default function Tooltip({ children, content, position = 'top', delay = 200, className = '' }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 dark:border-t-zinc-200 border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 dark:border-b-zinc-200 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 dark:border-l-zinc-200 border-t-transparent border-b-transparent border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 dark:border-r-zinc-200 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (!content) return children;

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <div
          className={`
            absolute z-50 ${positionClasses[position]}
            pointer-events-none
            animate-fade-in
          `}
          role="tooltip"
        >
          <div
            className="
              px-2.5 py-1.5 rounded-md
              bg-zinc-800 dark:bg-zinc-200
              text-white dark:text-zinc-900
              text-xs font-medium leading-tight
              whitespace-nowrap
              shadow-elevated
            "
          >
            {content}
          </div>
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
