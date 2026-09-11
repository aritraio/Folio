import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';

import { useData } from '@/contexts/DataContext';

// Calculations
import {
  calcMonthlyIncome,
  calcMonthlyExpenses,
  calcSavingsRate,
  calcMonthlyCashFlow,
  calcAverageDailySpending,
  calcTopSpendingCategory,
  calcNetWorthHistory,
} from '@/utils/calculations';

// Date utils
import { getLastNMonths } from '@/utils/dateUtils';

// UI
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';

// Analytics components
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import MonthlyExpensesChart from '@/components/analytics/MonthlyExpensesChart';
import MonthlyIncomeChart from '@/components/analytics/MonthlyIncomeChart';
import CategoryComparisonChart from '@/components/analytics/CategoryComparisonChart';
import SavingsRateChart from '@/components/analytics/SavingsRateChart';
import NetWorthGrowthChart from '@/components/analytics/NetWorthGrowthChart';

const PERIOD_OPTIONS = [
  { value: '6', label: 'Last 6 Months' },
  { value: '9', label: 'Last 9 Months' },
  { value: '12', label: 'Last 12 Months' },
];

/**
 * AnalyticsPage — Comprehensive spending trends and financial analytics.
 */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6');
  const { transactions, accounts, netWorthHistory: netWorthHistoryRaw } = useData();

  const nMonths = parseInt(period, 10);
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');

  const months = useMemo(() => getLastNMonths(nMonths), [nMonths]);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthOptions = useMemo(() => {
    const opts = months.map((m) => ({
      value: m.monthKey,
      label: m.label,
    }));
    return opts;
  }, [months]);

  const summaryMetrics = useMemo(() => {
    const month = monthOptions.some((o) => o.value === selectedMonth) ? selectedMonth : currentMonth;
    const income = calcMonthlyIncome(transactions, month);
    const expenses = calcMonthlyExpenses(transactions, month);
    const savingsRate = calcSavingsRate(income, expenses);
    const netCashFlow = income - expenses;
    const avgDaily = calcAverageDailySpending(transactions, month);
    const topCat = calcTopSpendingCategory(transactions, month);

    const monthEntry = months.find((m) => m.monthKey === month);
    const monthLabel = monthEntry ? monthEntry.label : month;

    return {
      monthlySpending: expenses,
      monthlyIncome: income,
      savingsRate,
      netCashFlow,
      avgDailySpending: avgDaily,
      topCategory: topCat,
      monthLabel,
    };
  }, [transactions, selectedMonth, months, monthOptions, currentMonth]);

  const cashFlowData = useMemo(() => {
    return calcMonthlyCashFlow(transactions, nMonths);
  }, [transactions, nMonths]);

  const netWorthHistory = useMemo(() => {
    const history = calcNetWorthHistory(netWorthHistoryRaw, transactions, accounts, nMonths);
    return history.slice(-nMonths);
  }, [netWorthHistoryRaw, transactions, accounts, nMonths]);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="label mb-1 font-mono">Insights</p>
          <h1 className="heading-lg text-[#0A0A0A] dark:text-white">Analytics</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              aria-label="Summary month"
              options={monthOptions}
              value={monthOptions.some((o) => o.value === selectedMonth) ? selectedMonth : currentMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              placeholder={null}
            />
          </div>
          <div className="w-40">
            <Select
              aria-label="Period"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder={null}
            />
          </div>
        </div>
      </div>

      {!hasTransactions ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            icon={<BarChart3 className="w-7 h-7 text-[#0A0A0A] dark:text-white" />}
            title="No analytics data yet"
            description="Add some transactions to see spending trends, income patterns, and financial analytics here."
            actionLabel="Go to Transactions"
            onAction={() => (window.location.href = '/transactions')}
          />
        </div>
      ) : (
        <>
          <AnalyticsSummary {...summaryMetrics} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart data={cashFlowData} />
            <MonthlyIncomeChart data={cashFlowData} />
          </div>

          <CategoryComparisonChart transactions={transactions} months={months} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavingsRateChart transactions={transactions} months={months} />
            <NetWorthGrowthChart data={netWorthHistory} />
          </div>
        </>
      )}
    </div>
  );
}
