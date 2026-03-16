import React, { createContext, useContext, useEffect, useState } from 'react';
import StorageService from '../services/StorageService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState({
    defaultGateway: null,
    preferCheapest: true,
    preferSecure: false,
    notificationsEnabled: true,
    currency: 'INR',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [txns, setts] = await Promise.all([
        StorageService.getTransactions(),
        StorageService.getSettings(),
      ]);
      setTransactions(txns);
      setSettings(setts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(transaction) {
    setTransactions((prev) => [transaction, ...prev]);
  }

  async function updateSettings(newSettings) {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await StorageService.saveSettings(updated);
  }

  async function refreshTransactions() {
    const txns = await StorageService.getTransactions();
    setTransactions(txns);
  }

  return (
    <AppContext.Provider
      value={{
        transactions,
        settings,
        loading,
        addTransaction,
        updateSettings,
        refreshTransactions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
