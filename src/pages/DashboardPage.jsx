import React, { useMemo } from 'react';
import { format, subMonths } from 'date-fns';

// Reactive store (localStorage + cross-tab sync)
import { useData } from '@/contexts/DataContext';

// Calculations
import {
  calcNetWorth,
  calcMonthlyIncome,
  calcMonthlyExpenses,
  calcMonthlySavings,
  calcSavingsRate,
  calcCategoryBreakdown,
  calcMonthlyCashFlow,
  calcInvestmentReturn,
  calcNetWorthHistory,
} from '@/utils/calculations';

// Dashboard components
import HeroSection from '@/components/dashboard/HeroSection';
import FinancialMetrics from '@/components/dashboard/FinancialMetrics';
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AccountOverview from '@/components/dashboard/AccountOverview';
import FinancialInsights from '@/components/dashboard/FinancialInsights';

/**
 * DashboardPage — Primary landing page.
 * Reads from DataContext (reactive) instead of localStorage in render,
 * so edits anywhere update the dashboard without reload.
 */
export default function DashboardPage() {
  const { transactions, accounts, investments, netWorthHistory: netWorthHistoryRaw } = useData();

  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const lastMonth = format(subMonths(now, 1), 'yyyy-MM');
  void lastMonth;

  const computed = useMemo(() => {
    const netWorth = calcNetWorth(accounts);
    const income = calcMonthlyIncome(transactions, currentMonth);
    const expenses = calcMonthlyExpenses(transactions, currentMonth);
    const savings = calcMonthlySavings(transactions, currentMonth);
    const savingsRate = calcSavingsRate(income, expenses);
    const categoryBreakdown = calcCategoryBreakdown(transactions, currentMonth);
    const cashFlow = calcMonthlyCashFlow(transactions, 6);
    const investmentReturns = calcInvestmentReturn(investments);
    const netWorthHistory = calcNetWorthHistory(netWorthHistoryRaw, transactions, accounts, 12);

    const prevEntry = netWorthHistory.length >= 2 ? netWorthHistory[netWorthHistory.length - 2] : null;
    const prevNetWorth = prevEntry?.netWorth ?? 0;
    const netWorthChange = netWorth - prevNetWorth;

    return {
      netWorth,
      prevNetWorth,
      netWorthChange,
      income,
      expenses,
      savings,
      savingsRate,
      categoryBreakdown,
      cashFlow,
      investmentReturns,
      netWorthHistory,
    };
  }, [transactions, accounts, investments, netWorthHistoryRaw, currentMonth]);

  return (
    <div className="space-y-8 pb-12">
      <HeroSection netWorth={computed.netWorth} prevNetWorth={computed.prevNetWorth} />

      <FinancialMetrics
        netWorth={computed.netWorth}
        netWorthChange={computed.netWorthChange}
        income={computed.income}
        expenses={computed.expenses}
        savings={computed.savings}
        savingsRate={computed.savingsRate}
        investmentValue={computed.investmentReturns.totalCurrent}
        investmentReturn={computed.investmentReturns.returnPercentage}
      />

      <NetWorthChart data={computed.netWorthHistory} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={computed.cashFlow} />
        <SpendingBreakdown data={computed.categoryBreakdown} totalExpenses={computed.expenses} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transactions} accounts={accounts} />
        </div>
        <div className="space-y-6">
          <AccountOverview accounts={accounts} />
          <FinancialInsights
            transactions={transactions}
            netWorth={computed.netWorth}
            prevNetWorth={computed.prevNetWorth}
          />
        </div>
      </div>
    </div>
  );
}
