import React, { useMemo, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';

// Reactive store (localStorage + cross-tab sync)
import { useData } from '@/contexts/DataContext';

// Unified financial model (§2) — single source of truth
import {
  calcFinancialSnapshot,
  calcMonthlyIncome,
  calcMonthlyExpenses,
  calcMonthlySavings,
  calcSavingsRate,
  calcCategoryBreakdown,
  calcMonthlyCashFlow,
  calcInvestmentReturn,
  calcInvestmentTotal,
  calcNetWorthHistory,
  validateFinancialModel,
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
import FinancialPulse from '@/components/dashboard/FinancialPulse';

/**
 * DashboardPage — §9 / §88 target composition:
 * Greeting → Net worth hero → trend → Income/Spending/Savings strip →
 * Ledger Insights → Recent activity → Pulse + Accounts.
 * All numbers come from calcFinancialSnapshot (assets + investments − liabilities).
 */
export default function DashboardPage() {
  const { transactions, accounts, investments, budgets, netWorthHistory: netWorthHistoryRaw } = useData();

  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const lastMonth = format(subMonths(now, 1), 'yyyy-MM');

  const computed = useMemo(() => {
    const snapshot = calcFinancialSnapshot(accounts, investments);
    const income = calcMonthlyIncome(transactions, currentMonth);
    const expenses = calcMonthlyExpenses(transactions, currentMonth);
    const savings = calcMonthlySavings(transactions, currentMonth);
    const savingsRate = calcSavingsRate(income, expenses);
    const categoryBreakdown = calcCategoryBreakdown(transactions, currentMonth);
    const cashFlow = calcMonthlyCashFlow(transactions, 6);
    const investmentReturns = calcInvestmentReturn(investments);
    const investmentTotal = Math.round(calcInvestmentTotal(investments));
    const netWorthHistory = calcNetWorthHistory(netWorthHistoryRaw, transactions, accounts, 12);

    const prevEntry = netWorthHistory.length >= 2 ? netWorthHistory[netWorthHistory.length - 2] : null;
    const prevNetWorth = prevEntry?.netWorth ?? snapshot.netWorth - (income - expenses);
    const netWorthChange = snapshot.netWorth - prevNetWorth;

    return {
      snapshot,
      netWorth: snapshot.netWorth,
      prevNetWorth,
      netWorthChange,
      income,
      expenses,
      savings,
      savingsRate,
      categoryBreakdown,
      cashFlow,
      investmentReturns,
      investmentTotal,
      netWorthHistory,
    };
  }, [transactions, accounts, investments, netWorthHistoryRaw, currentMonth]);

  // Dev-time reconciliation (§2): warn when the model drifts.
  useEffect(() => {
    validateFinancialModel({ accounts, investments, transactions, monthKey: currentMonth });
  }, [accounts, investments, transactions, currentMonth]);

  void lastMonth;

  return (
    <div className="space-y-8 pb-12">
      <HeroSection
        netWorth={computed.netWorth}
        prevNetWorth={computed.prevNetWorth}
        snapshot={computed.snapshot}
        currentMonthKey={currentMonth}
        transactions={transactions}
      />

      {/* Hero trend dominates first screen (§9) */}
      <NetWorthChart data={computed.netWorthHistory} />

      <FinancialMetrics
        income={computed.income}
        expenses={computed.expenses}
        savings={computed.savings}
        savingsRate={computed.savingsRate}
        investmentValue={computed.investmentTotal}
        investmentReturn={computed.investmentReturns.returnPercentage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={computed.cashFlow} />
        <SpendingBreakdown data={computed.categoryBreakdown} totalExpenses={computed.expenses} />
      </div>

      {/* Insights as editorial divider section, not cards (§13) */}
      <FinancialInsights transactions={transactions} accounts={accounts} netWorth={computed.netWorth} />

      <RecentTransactions transactions={transactions} accounts={accounts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AccountOverview
            accounts={accounts}
            investmentTotal={computed.investmentTotal}
            snapshot={computed.snapshot}
          />
        </div>
        <div>
          <FinancialPulse
            transactions={transactions}
            accounts={accounts}
            investments={investments}
            budgets={budgets}
            monthKey={currentMonth}
          />
        </div>
      </div>

      <p className="text-center text-[11px] text-text-tertiary dark:text-text-dark-tertiary pt-2">
        Figures reconcile: assets + investments − liabilities ·{' '}
        <Link to="/analytics" className="underline underline-offset-2 hover:text-brand-amber">
          verify in Analytics
        </Link>
      </p>
    </div>
  );
}
