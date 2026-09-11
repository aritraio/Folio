import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ScrollToTop from '@/components/layout/ScrollToTop';
import DashboardPage from '@/pages/DashboardPage';

// Code-split heavy / less-visited routes to keep the initial bundle small.
// Dashboard stays eager (landing page); the rest lazy-load on navigation.
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const AccountsPage = lazy(() => import('@/pages/AccountsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const BudgetsPage = lazy(() => import('@/pages/BudgetsPage'));
const InvestmentsPage = lazy(() => import('@/pages/InvestmentsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageFallback() {
  return (
    <div className="space-y-4 py-8" role="status" aria-label="Loading page">
      <div className="h-8 w-48 rounded bg-[#E5E5E5]/70 dark:bg-[#1E1E1E]/70 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 rounded bg-[#E5E5E5]/60 dark:bg-[#1E1E1E]/60 animate-pulse" />
        <div className="h-28 rounded bg-[#E5E5E5]/60 dark:bg-[#1E1E1E]/60 animate-pulse" />
        <div className="h-28 rounded bg-[#E5E5E5]/60 dark:bg-[#1E1E1E]/60 animate-pulse" />
      </div>
      <div className="h-64 rounded bg-[#E5E5E5]/60 dark:bg-[#1E1E1E]/60 animate-pulse" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
