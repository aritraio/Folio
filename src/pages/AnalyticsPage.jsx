import React, { useState, useMemo } from 'react';
import { format, subMonths } from 'date-fns';
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
import PageHeader from '@/components/ui/PageHeader';
import SegmentedControl from '@/components/ui/SegmentedControl';

// Analytics components (§89 target composition)
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import SpendingBreakdownRows from '@/components/analytics/SpendingBreakdownRows';
import MonthlyExpensesChart from '@/components/analytics/MonthlyExpensesChart';
import MonthlyIncomeChart from '@/components/analytics/MonthlyIncomeChart';
import CategoryComparisonChart from '@/components/analytics/CategoryComparisonChart';
import SavingsRateChart from '@/components/analytics/SavingsRateChart';
import NetWorthGrowthChart from '@/components/analytics/NetWorthGrowthChart';
import AiSpendingAdvisor from '@/components/analytics/AiSpendingAdvisor';
import SavingsVsCreditChart from '@/components/analytics/SavingsVsCreditChart';
import LiquidityPanel from '@/components/analytics/LiquidityPanel';

const PERIOD_OPTIONS = [
  { value: '6', label: '6M' },
  { value: '9', label: '9M' },
  { value: '12', label: '12M' },
];

/**
 * AnalyticsPage — "Explain what happened to the user's money" (§14).
 * Editorial order: performance → breakdown → trend → liquidity → insights.
 */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6');
  const { transactions, accounts, budgets, netWorthHistory: netWorthHistoryRaw } = useData();

  const nMonths = parseInt(period, 10);
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const prevMonth = format(subMonths(now, 1), 'yyyy-MM');

  const months = useMemo(() => getLastNMonths(nMonths), [nMonths]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthOptions = useMemo(() => months.map((m) => ({ value: m.monthKey, label: m.label })), [months]);
  const activeMonth = monthOptions.some((o) => o.value === selectedMonth) ? selectedMonth : currentMonth;

  const summaryMetrics = useMemo(() => {
    const income = calcMonthlyIncome(transactions, activeMonth);
    const expenses = calcMonthlyExpenses(transactions, activeMonth);
    const savingsRate = calcSavingsRate(income, expenses);
    const netCashFlow = income - expenses;
    const avgDaily = calcAverageDailySpending(transactions, activeMonth);
    const topCat = calcTopSpendingCategory(transactions, activeMonth);
    const monthEntry = months.find((m) => m.monthKey === activeMonth);
    return {
      monthlySpending: expenses,
      monthlyIncome: income,
      savingsRate,
      netCashFlow,
      avgDailySpending: avgDaily,
      topCategory: topCat,
      monthLabel: monthEntry ? monthEntry.label : activeMonth,
      prevMonth,
    };
  }, [transactions, activeMonth, months, currentMonth, prevMonth]);

  const cashFlowData = useMemo(() => calcMonthlyCashFlow(transactions, nMonths), [transactions, nMonths]);

  const netWorthHistory = useMemo(() => {
    const history = calcNetWorthHistory(netWorthHistoryRaw, transactions, accounts, nMonths);
    return history.slice(-nMonths);
  }, [netWorthHistoryRaw, transactions, accounts, nMonths]);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Financial performance at a glance — what came in, what went out, and what it means."
        actions={
          <>
            <div className="w-40">
              <Select
                aria-label="Summary month"
                options={monthOptions}
                value={activeMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder={null}
              />
            </div>
            <SegmentedControl
              ariaLabel="Trend period"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </>
        }
      />

      {!hasTransactions ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            icon={<BarChart3 className="w-7 h-7 text-brand-amber" />}
            title="No analytics data yet"
            description="Add some transactions to see spending trends, income patterns, and financial analytics here."
            actionLabel="Go to Transactions"
            onAction={() => (window.location.href = '/transactions')}
          />
        </div>
      ) : (
        <>
          <AnalyticsSummary {...summaryMetrics} />

          <SpendingBreakdownRows transactions={transactions} monthKey={activeMonth} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart data={cashFlowData} />
            <MonthlyIncomeChart data={cashFlowData} />
          </div>

          <CategoryComparisonChart transactions={transactions} months={months} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiquidityPanel accounts={accounts} />
            <SavingsVsCreditChart
              transactions={transactions}
              accounts={accounts}
              selectedMonth={activeMonth}
            />
          </div>

          <AiSpendingAdvisor transactions={transactions} accounts={accounts} budgets={budgets} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavingsRateChart transactions={transactions} months={months} />
            <NetWorthGrowthChart data={netWorthHistory} />
          </div>
        </>
      )}
    </div>
  );
}
