import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ScrollToTop from '@/components/layout/ScrollToTop';
import DashboardPage from '@/pages/DashboardPage';
import TransactionsPage from '@/pages/TransactionsPage';
import AccountsPage from '@/pages/AccountsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import BudgetsPage from '@/pages/BudgetsPage';
import InvestmentsPage from '@/pages/InvestmentsPage';
import SettingsPage from '@/pages/SettingsPage';
import PlanPage from '@/pages/PlanPage';
import MorePage from '@/pages/MorePage';
import LearnPage from '@/pages/LearnPage';
import AssistantPage from '@/pages/AssistantPage';
import ImportPage from '@/pages/ImportPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { useCapacitor } from '@/utils/useCapacitor';

export default function App() {
  useCapacitor();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/imports/new" element={<ImportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
