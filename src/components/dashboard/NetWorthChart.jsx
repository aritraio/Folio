import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Maximize2, Minimize2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { formatINR, formatCompact, formatChange, formatPercent } from '@/utils/formatCurrency';
import useChartTheme from '@/utils/useChartTheme';

const TIME_RANGES = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: null },
];

/** Fallback wealth benchmark when no target exists in settings. */
const DEFAULT_TARGET = 1000000;

/* Terminal tooltip: #141414 bg, #262626 border, mono figures */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const delta = row.delta;
  return (
    <div className="bg-[#141414] border border-[#262626] rounded px-4 py-3 space-y-1.5 min-w-[180px]">
      <p className="text-xs font-semibold text-[#8E9192] font-mono">{row.full}</p>
      <p className="text-base font-bold font-mono tabular-nums text-white">
        {formatINR(row.value)}
      </p>
      {delta !== null && delta !== undefined && (
        <p
          className={`text-xs font-semibold font-mono tabular-nums ${
            delta >= 0 ? 'text-[#00b894]' : 'text-[#ff6b6b]'
          }`}
        >
          {formatChange(delta)} <span className="opacity-80">vs {row.prevName || 'prior'}</span>
        </p>
      )}
    </div>
  );
}

function fullMonthLabel(monthKey, fallback) {
  try {
    if (monthKey && /^\d{4}-\d{2}$/.test(monthKey)) {
      return format(parse(`${monthKey}-01`, 'yyyy-MM-dd', new Date()), 'MMMM yyyy');
    }
  } catch {
    /* fall through */
  }
  return fallback || monthKey || '';
}

const round10k = (v, dir) => (dir === 'up' ? Math.ceil(v / 10000) * 10000 : Math.floor(v / 10000) * 10000);

/**
 * NetWorthChart — Dynamic financial visualizer.
 *
 * - Auto-zoom Y-axis (focused) with full-baseline toggle
 * - Live current-month point appended from active accounts
 * - Period High / Low / Delta chips, live per range
 * - Net-worth area + monthly delta bars + wealth target reference
 */
export default function NetWorthChart({ data = [], currentNetWorth = null }) {
  const [activeRange, setActiveRange] = useState('6M');
  const [isZoomed, setIsZoomed] = useState(true);
  const chart = useChartTheme();
  const { settings } = useData();

  const target =
    settings && Number(settings.netWorthTarget) > 0 ? Number(settings.netWorthTarget) : DEFAULT_TARGET;

  // Full series, sorted, with the live current-month balance as final point.
  const fullSeries = useMemo(() => {
    const base = [...data].sort((a, b) => String(a.monthKey).localeCompare(String(b.monthKey)));
    const now = new Date();
    const curKey = format(now, 'yyyy-MM');
    if (currentNetWorth !== null && currentNetWorth !== undefined) {
      const live = Math.round(Number(currentNetWorth) || 0);
      const last = base[base.length - 1];
      const livePoint = {
        monthKey: curKey,
        label: format(now, 'MMM yy'),
        shortLabel: format(now, 'MMM'),
        netWorth: live,
      };
      if (!last) return [livePoint];
      if (last.monthKey !== curKey) return [...base, livePoint];
      if (last.netWorth !== live) return [...base.slice(0, -1), { ...last, netWorth: live }];
    }
    return base;
  }, [data, currentNetWorth]);

  // Rows with display labels + month-over-month deltas.
  const allRows = useMemo(
    () =>
      fullSeries.map((d, i) => ({
        monthKey: d.monthKey,
        name: d.shortLabel || d.label || d.monthKey,
        full: fullMonthLabel(d.monthKey, d.label),
        value: Number(d.netWorth) || 0,
        prevName: i > 0 ? fullSeries[i - 1].shortLabel || fullSeries[i - 1].label : null,
        delta: i === 0 ? null : (Number(d.netWorth) || 0) - (Number(fullSeries[i - 1].netWorth) || 0),
      })),
    [fullSeries]
  );

  const rows = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.label === activeRange);
    if (!range?.months) return allRows;
    return allRows.slice(-range.months);
  }, [allRows, activeRange]);

  // Period stats over the visible range.
  const stats = useMemo(() => {
    if (rows.length === 0) return null;
    let hi = rows[0];
    let lo = rows[0];
    rows.forEach((r) => {
      if (r.value > hi.value) hi = r;
      if (r.value < lo.value) lo = r;
    });
    const first = rows[0].value;
    const last = rows[rows.length - 1].value;
    const delta = last - first;
    const pct = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
    return { hi, lo, delta, pct };
  }, [rows]);

  // Dynamic Y domain (auto-zoom) with the target kept in view.
  const yDomain = useMemo(() => {
    if (rows.length === 0) return [0, 'auto'];
    const values = rows.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = (maxVal - minVal) * 0.15 || maxVal * 0.05;
    const top = round10k(Math.max(maxVal + padding, target * 1.02), 'up');
    if (!isZoomed) return [0, top];
    return [Math.max(0, round10k(minVal - padding, 'down')), top];
  }, [rows, isZoomed, target]);

  // Hidden delta axis — always includes the zero baseline.
  const deltaDomain = useMemo(() => {
    const deltas = rows.map((r) => r.delta).filter((v) => v !== null && v !== undefined);
    if (deltas.length === 0) return [0, 1];
    const lo = Math.min(0, ...deltas);
    const hi = Math.max(0, ...deltas);
    const span = hi - lo || Math.abs(hi) || 1;
    return [lo - (lo < 0 ? span * 0.1 : 0), hi + (hi > 0 ? span * 0.1 : 0)];
  }, [rows]);

  const achieved = useMemo(() => {
    if (!rows.length || !(target > 0)) return 0;
    return (rows[rows.length - 1].value / target) * 100;
  }, [rows, target]);

  if (rows.length === 0) {
    return (
      <section className="card p-6 animate-fade-in-up" aria-label="Net worth chart">
        <h2 className="heading-sm text-[#0A0A0A] dark:text-white mb-2">Net Worth</h2>
        <p className="text-sm text-[#8E9192]">No net worth data yet.</p>
      </section>
    );
  }

  const deltaUp = stats && stats.delta >= 0;

  return (
    <section
      className="card p-6 animate-fade-in-up"
      aria-label="Net worth chart"
      style={{ animationDelay: '0.1s' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Net Worth</h2>
          <p className="text-xs text-[#8E9192] mt-0.5 font-mono uppercase tracking-widest">
            {activeRange === 'ALL' ? 'All time' : `Last ${activeRange.toLowerCase()}`} ·{' '}
            {isZoomed ? 'Focused' : 'Full baseline'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom toggle */}
          <button
            onClick={() => setIsZoomed((v) => !v)}
            className="
              p-2 rounded
              border border-[#E5E5E5] dark:border-[#262626]
              text-[#8E9192] hover:text-[#0A0A0A] dark:hover:text-white
              hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
              transition-all duration-150 ease-out
              active:scale-[0.97]
            "
            aria-label={isZoomed ? 'Show full baseline from zero' : 'Zoom into balance range'}
            aria-pressed={isZoomed}
            title={isZoomed ? 'Full baseline (anchor at ₹0)' : 'Focused view (auto-zoom)'}
          >
            <span key={isZoomed ? 'in' : 'out'} className="icon-flip motion-reduce:animate-none">
              {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </span>
          </button>

          {/* Time range toggles */}
          <div className="flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded p-1">
            {TIME_RANGES.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveRange(label)}
                className={`
                  px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider font-mono
                  transition-all duration-150 ease-out
                  active:scale-[0.97]
                  ${
                    activeRange === label
                      ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                      : 'text-[#8E9192] hover:text-[#0A0A0A] dark:hover:text-white'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Period stat chips */}
      {stats && (
        <div className="flex flex-wrap items-center gap-2 mb-5" aria-label="Period statistics">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums px-2.5 py-1 rounded border border-[#E5E5E5] dark:border-[#262626] text-[#404040] dark:text-[#C4C7C8]">
            <span className="text-[#8E9192]">HIGH</span> {formatCompact(stats.hi.value)} · {stats.hi.name}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums px-2.5 py-1 rounded border border-[#E5E5E5] dark:border-[#262626] text-[#404040] dark:text-[#C4C7C8]">
            <span className="text-[#8E9192]">LOW</span> {formatCompact(stats.lo.value)} · {stats.lo.name}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums px-2.5 py-1 rounded ${
              deltaUp
                ? 'bg-[rgba(0,163,131,0.08)] text-[#00a383] dark:bg-[rgba(0,184,148,0.12)] dark:text-[#00b894]'
                : 'bg-[rgba(232,65,24,0.08)] text-[#e84118] dark:bg-[rgba(255,107,107,0.12)] dark:text-[#ff6b6b]'
            }`}
          >
            <span className="opacity-70">Δ</span> {formatChange(stats.delta)} ({formatPercent(stats.pct)})
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="30%">
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chart.line} stopOpacity={0.08} />
                <stop offset="100%" stopColor={chart.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chart.grid} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chart.tick, fontFamily: 'JetBrains Mono, monospace' }}
              dy={8}
              minTickGap={24}
            />
            <YAxis
              yAxisId="nw"
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chart.tick, fontFamily: 'JetBrains Mono, monospace' }}
              tickFormatter={(v) => formatCompact(v)}
              dx={-4}
            />
            <YAxis yAxisId="delta" hide domain={deltaDomain} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: chart.cursor }} />
            {target > 0 && (
              <ReferenceLine
                y={target}
                yAxisId="nw"
                stroke="#8E9192"
                strokeDasharray="4 4"
                label={{
                  value: `Target: ${formatCompact(target)} (${achieved.toFixed(1)}% achieved)`,
                  position: 'insideTopRight',
                  fill: '#8E9192',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
            )}
            <Bar yAxisId="delta" dataKey="delta" maxBarSize={10} radius={2}>
              {rows.map((r, i) => (
                <Cell
                  key={`delta-${i}`}
                  fill={r.delta === null ? 'transparent' : r.delta >= 0 ? chart.income : chart.expense}
                />
              ))}
            </Bar>
            <Area
              yAxisId="nw"
              type="monotone"
              dataKey="value"
              stroke={chart.line}
              strokeWidth={2}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chart.line, fill: chart.activeDotFill }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 pt-3 font-mono">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm border border-[#8E9192]"
            style={{ background: chart.line }}
          />
          <span className="text-xs text-[#8E9192]">Net Worth</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#00b894]" />
          <span className="text-xs text-[#8E9192]">Monthly gain</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ff6b6b]" />
          <span className="text-xs text-[#8E9192]">Monthly burn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 border-t-2 border-dashed border-[#8E9192]" />
          <span className="text-xs text-[#8E9192]">Target</span>
        </div>
      </div>
    </section>
  );
}
