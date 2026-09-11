import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatMoney, formatPercent, formatChange } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { useCountUp } from '@/utils/useCountUp';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * HeroSection — Terminal greeting + net-worth hero in JetBrains Mono.
 */
export default function HeroSection({ netWorth = 0, prevNetWorth = 0 }) {
  const { settings } = useData();
  const userName = settings?.userName || 'User';

  const monthChange = netWorth - prevNetWorth;
  const monthChangePercent = prevNetWorth > 0 ? (monthChange / prevNetWorth) * 100 : 0;

  const isPositive = monthChange > 0;
  const isNegative = monthChange < 0;

  const currentMonthYear = useMemo(() => {
    return format(new Date(), 'MMMM yyyy').toUpperCase();
  }, []);

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendPill = isPositive
    ? 'bg-[rgba(0,163,131,0.08)] text-[#00a383] dark:bg-[rgba(0,184,148,0.12)] dark:text-[#00b894]'
    : isNegative
      ? 'bg-[rgba(232,65,24,0.08)] text-[#e84118] dark:bg-[rgba(255,107,107,0.12)] dark:text-[#ff6b6b]'
      : 'bg-[#F5F5F5] text-[#8E9192] dark:bg-[#1E1E1E]';

  const animatedNetWorth = useCountUp(netWorth, 1200);

  return (
    <section className="animate-fade-in motion-reduce:animate-none" aria-label="Financial overview">
      <div className="flex items-center gap-2 mb-6 font-mono">
        <span className="label">Overview</span>
        <span className="text-[#8E9192] text-xs">/</span>
        <span className="label">{currentMonthYear}</span>
        <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#8E9192]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00b894] animate-pulse" />
          LIVE · LOCAL-FIRST
        </span>
      </div>

      <div className="mb-2">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#404040] dark:text-[#C4C7C8]">
          {getGreeting()}, {userName}
        </p>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8E9192] mb-8">
        Your Financial Overview
      </p>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
        <div>
          <p className="label mb-2">Net Worth</p>
          <h1 className="display-xl text-[#0A0A0A] dark:text-white tabular-nums">
            {formatMoney(animatedNetWorth)}
          </h1>
        </div>

        <div
          className={`
          inline-flex items-center gap-2 px-3.5 py-2 rounded
          border border-transparent
          ${trendPill}
          self-start sm:self-auto sm:mb-2
        `}
        >
          <TrendIcon className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-semibold font-mono tabular-nums">{formatChange(monthChange)}</span>
          <span className="text-xs font-medium font-mono tabular-nums opacity-80">
            {formatPercent(monthChangePercent)}
          </span>
          <span className="text-xs text-[#8E9192]">this month</span>
        </div>
      </div>
    </section>
  );
}
