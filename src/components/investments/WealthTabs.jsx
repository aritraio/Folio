import React from 'react';
import { Layers, TrendingUp, PieChart, Landmark, Shield } from 'lucide-react';

export const WEALTH_TABS = [
  { id: 'all', label: 'All Portfolio', icon: Layers },
  { id: 'stocks', label: 'Indian Stocks', icon: TrendingUp },
  { id: 'mutual_funds', label: 'Mutual Funds', icon: PieChart },
  { id: 'fixed_deposits', label: 'Fixed Deposits (FDs)', icon: Landmark },
  { id: 'bonds', label: 'Bonds & SGBs', icon: Shield },
];

/**
 * WealthTabs — Category navigation for Indian investments and savings assets.
 */
export default function WealthTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {WEALTH_TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        const count = counts[id];
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
              ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-surface-dark-card text-text-secondary hover:text-zinc-900 dark:hover:text-white border border-ivory-border dark:border-surface-dark-border'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {count != null && (
              <span
                className={`
                  text-[10px] px-1.5 py-0.2 rounded-full font-mono
                  ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                      : 'bg-ivory-tertiary dark:bg-surface-dark-hover text-text-tertiary'
                  }
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
