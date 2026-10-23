import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, initializeDatabase, loadSampleData, clearSampleData } from './db';
import { calculateAllBalances, getMonthlyStats, getBudgetStatus, getDebtSummary, generateAlerts, getCategoryBudgets } from './calculations';
import { getCurrentMonth } from './utils';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [balances, setBalances] = useState({});
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({ totalIncome: 0, totalExpenses: 0, netCashFlow: 0 });
  const [budgetStatus, setBudgetStatus] = useState({ budget: 0, spent: 0, remaining: 0, percentage: 0 });
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [debtSummary, setDebtSummary] = useState({ totalLentOutstanding: 0, totalBorrowedOutstanding: 0, activeDebts: [], settledDebts: [] });
  const [alerts, setAlerts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [settings, setSettings] = useState({});
  const [hideBalances, setHideBalances] = useState(false);
  const [hasSampleData, setHasSampleData] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [prof, accs, acts, settingsArr, flag] = await Promise.all([
        db.profile.toCollection().first(),
        db.accounts.where('archived').notEqual(1).toArray(),
        db.activities.toArray(),
        db.settings.toArray(),
        db.sampleFlag.get('loaded')
      ]);

      setProfile(prof);
      setAccounts(accs);
      setActivities(acts.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setHasSampleData(!!flag);

      const settingsMap = {};
      settingsArr.forEach(s => { settingsMap[s.key] = s.value; });
      setSettings(settingsMap);
      setHideBalances(settingsMap.hideBalances === true);

      const [bals, stats, budget, debts, alertsList, catBudgets] = await Promise.all([
        calculateAllBalances(),
        getMonthlyStats(),
        getBudgetStatus(),
        getDebtSummary(),
        generateAlerts(),
        getCategoryBudgets()
      ]);

      setBalances(bals);
      setTotalBalance(Object.values(bals).reduce((s, v) => s + v, 0));
      setMonthlyStats(stats);
      setBudgetStatus(budget);
      setDebtSummary(debts);
      setAlerts(alertsList);
      setCategoryBudgets(catBudgets);

      // Recent transactions
      const txns = await db.transactions.orderBy('date').reverse().limit(10).toArray();
      setRecentTransactions(txns);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      // Check if first time
      const flag = await db.sampleFlag.get('loaded');
      const txnCount = await db.transactions.count();
      if (!flag && txnCount === 0) {
        await loadSampleData();
      }
      await refreshData();
      setReady(true);
    })();
  }, [refreshData]);

  const updateProfile = useCallback(async (updates) => {
    if (profile) {
      await db.profile.update(profile.id, updates);
      await refreshData();
      showToast('Profile updated');
    }
  }, [profile, refreshData, showToast]);

  const updateSetting = useCallback(async (key, value) => {
    await db.settings.put({ key, value });
    if (key === 'hideBalances') setHideBalances(value);
    await refreshData();
  }, [refreshData]);

  const handleClearSampleData = useCallback(async () => {
    await clearSampleData();
    await refreshData();
    showToast('Sample data cleared');
  }, [refreshData, showToast]);

  const value = {
    ready,
    profile,
    accounts,
    activities,
    balances,
    totalBalance,
    monthlyStats,
    budgetStatus,
    categoryBudgets,
    debtSummary,
    alerts,
    recentTransactions,
    settings,
    hideBalances,
    hasSampleData,
    toastMessage,
    refreshData,
    updateProfile,
    updateSetting,
    clearSampleData: handleClearSampleData,
    showToast,
    setHideBalances: (val) => {
      setHideBalances(val);
      db.settings.put({ key: 'hideBalances', value: val });
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
