import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, CreditCard, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import { calcSavingsVsCreditSpending } from '../../utils/calculations';
import { getLastNMonths } from '../../utils/dateUtils';

/**
 * Custom tooltip for Savings vs Credit Card spending.
 */
function DualSpendingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-dark-card border border-ivory-border dark:border-surface-dark-border rounded-lg shadow-elevated px-4 py-3 space-y-1.5 text-xs">
      <p className="font-semibold text-text-secondary dark:text-text-dark-secondary">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-secondary dark:text-text-dark-secondary">{entry.name}:</span>
          </div>
          <span className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * SavingsVsCreditChart — Segregated analysis of Liquid Bank Account Debits (UPI/cash)
 * vs. Credit Card swiped expenses, highlighting bill payments as non-expense transfers.
 */
export default function SavingsVsCreditChart({ transactions = [], accounts = [], selectedMonth = null }) {
  const [timeRange, setTimeRange] = useState(6); // 6 months trend
  const currentMonthMetrics = calcSavingsVsCreditSpending(transactions, accounts, selectedMonth);

  // Generate historical monthly trend for the chart
  const months = getLastNMonths(timeRange);
  const trendData = months.map((m) => {
    const data = calcSavingsVsCreditSpending(transactions, accounts, m.monthKey);
    return {
      month: m.shortLabel,
      savings: data.savingsExpenseTotal,
      credit: data.creditExpenseTotal,
      billPayments: data.creditCardBillPaymentTotal,
    };
  });

  return (
    <div className="card p-5 space-y-5 animate-fade-in-up">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-serif-display font-bold text-zinc-900 dark:text-text-dark-primary flex items-center gap-2">
            Liquid Savings vs. Credit Card Outflows
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            Compare cash flow from liquid bank accounts (UPI/Debits) against credit card revolving spending
          </p>
        </div>

        <div className="flex items-center gap-1 bg-ivory-tertiary dark:bg-surface-dark-hover p-1 rounded-lg self-start sm:self-auto">
          {[3, 6, 12].map((n) => (
            <button
              key={n}
              onClick={() => setTimeRange(n)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === n
                  ? 'bg-white dark:bg-surface-dark shadow-sm text-zinc-900 dark:text-text-dark-primary'
                  : 'text-text-secondary hover:text-zinc-900 dark:hover:text-text-dark-primary'
              }`}
            >
              {n}M
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg border border-ivory-border dark:border-surface-dark-border bg-ivory-warm/30 dark:bg-surface-dark-card/40">
          <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Wallet className="w-4 h-4 text-brand-amber" />
              Liquid Savings Spend
            </span>
            <span className="font-semibold">{currentMonthMetrics.savingsPct}%</span>
          </div>
          <div className="text-lg font-bold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(currentMonthMetrics.savingsExpenseTotal)}
          </div>
          <div className="text-[11px] text-text-tertiary mt-0.5">
            {currentMonthMetrics.savingsTxCount} transactions via UPI & debit
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-ivory-border dark:border-surface-dark-border bg-ivory-warm/30 dark:bg-surface-dark-card/40">
          <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <CreditCard className="w-4 h-4 text-blue-500" />
              Credit Card Spend
            </span>
            <span className="font-semibold">{currentMonthMetrics.creditPct}%</span>
          </div>
          <div className="text-lg font-bold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(currentMonthMetrics.creditExpenseTotal)}
          </div>
          <div className="text-[11px] text-text-tertiary mt-0.5">
            {currentMonthMetrics.creditTxCount} purchases on cards
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-ivory-border dark:border-surface-dark-border bg-ivory-warm/30 dark:bg-surface-dark-card/40">
          <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowRightLeft className="w-4 h-4 text-brand-emerald" />
              Card Bill Payments
            </span>
            <span className="text-[10px] text-brand-emerald font-semibold uppercase tracking-wider">
              Transfer
            </span>
          </div>
          <div className="text-lg font-bold mono text-zinc-900 dark:text-text-dark-primary">
            {formatINR(currentMonthMetrics.creditCardBillPaymentTotal)}
          </div>
          <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-emerald" />
            Excluded from spend (no double-counting)
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<DualSpendingTooltip />} />
            <Bar
              dataKey="savings"
              name="Liquid Savings (UPI/Debit)"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="credit"
              name="Credit Card Spends"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
