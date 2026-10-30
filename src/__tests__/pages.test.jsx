import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '../contexts/DataContext';
import { initStorage, switchDemoProfile } from '../services/storage';

import TransactionsPage from '../pages/TransactionsPage';
import AccountsPage from '../pages/AccountsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import BudgetsPage from '../pages/BudgetsPage';
import InvestmentsPage from '../pages/InvestmentsPage';
import SettingsPage from '../pages/SettingsPage';
import DashboardPage from '../pages/DashboardPage';

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <DataProvider>{ui}</DataProvider>
    </MemoryRouter>
  );
}

describe('All Pages Render for all demo profiles', () => {
  beforeEach(() => {
    localStorage.clear();
    initStorage();
  });

  const profiles = ['sagnik', 'sourav', 'ankita'];

  profiles.forEach((profileId) => {
    describe(`Profile: ${profileId}`, () => {
      beforeEach(() => {
        switchDemoProfile(profileId);
      });

      it('renders DashboardPage without throwing', () => {
        expect(() => renderWithProviders(<DashboardPage />)).not.toThrow();
      });

      it('renders TransactionsPage without throwing', () => {
        expect(() => renderWithProviders(<TransactionsPage />)).not.toThrow();
      });

      it('renders AccountsPage without throwing', () => {
        expect(() => renderWithProviders(<AccountsPage />)).not.toThrow();
      });

      it('renders AnalyticsPage without throwing', () => {
        expect(() => renderWithProviders(<AnalyticsPage />)).not.toThrow();
      });

      it('renders BudgetsPage without throwing', () => {
        expect(() => renderWithProviders(<BudgetsPage />)).not.toThrow();
      });

      it('renders InvestmentsPage without throwing', () => {
        expect(() => renderWithProviders(<InvestmentsPage />)).not.toThrow();
      });

      it('renders SettingsPage without throwing', () => {
        expect(() => renderWithProviders(<SettingsPage />)).not.toThrow();
      });
    });
  });
});
