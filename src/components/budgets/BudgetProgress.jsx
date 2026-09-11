import React from 'react';

/**
 * BudgetProgress — Terminal utilization bar.
 * Track #262626, fill: white neutral → red when exceeded.
 * Warning state uses neutral white (amber retired from terminal).
 */
export default function BudgetProgress({ percentage, status }) {
  // Cap percentage for the bar width at 100% so it doesn't overflow visually
  const widthPercent = Math.min(percentage, 100);

  let barColor = 'bg-[#0A0A0A] dark:bg-white';
  if (status === 'warning') barColor = 'bg-[#0A0A0A] dark:bg-white';
  if (status === 'exceeded') barColor = 'bg-[#ff6b6b]';

  return (
    <div className="w-full h-2 bg-[#E5E5E5] dark:bg-[#262626] rounded-sm overflow-hidden">
      <div
        className={`h-full ${barColor} transition-all duration-500 ease-out-expo`}
        style={{ width: `${widthPercent}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
}
