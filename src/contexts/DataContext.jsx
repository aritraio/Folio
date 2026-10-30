import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getTransactions,
  getAccounts,
  getBudgets,
  getInvestments,
  getSettings,
  getNetWorthHistory,
  getActiveProfileId,
  getActiveProfileMetadata,
  getDemoProfilesList,
  switchDemoProfile,
  subscribeToData,
} from '../services/storage.js';

const DataContext = createContext(null);

function readAll() {
  return {
    transactions: getTransactions(),
    accounts: getAccounts(),
    budgets: getBudgets(),
    investments: getInvestments(),
    settings: getSettings(),
    netWorthHistory: getNetWorthHistory(),
    activeProfileId: getActiveProfileId(),
    activeProfile: getActiveProfileMetadata(),
    demoProfiles: getDemoProfilesList(),
  };
}

/**
 * DataProvider — central reactive store over localStorage.
 * Pages consume stable arrays + refresh() instead of calling
 * storage getters in render (which caused stale UI + broken useMemo).
 */
export function DataProvider({ children }) {
  const [data, setData] = useState(() => readAll());

  const refresh = useCallback(() => {
    setData(readAll());
  }, []);

  const switchProfile = useCallback((profileId) => {
    const success = switchDemoProfile(profileId);
    if (success) {
      setData(readAll());
    }
    return success;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToData(refresh);
    return unsubscribe;
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...data,
      switchProfile,
      refresh,
    }),
    [data, switchProfile, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
}

export default DataContext;
