import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: '@vbmpay_transactions',
  SETTINGS: '@vbmpay_settings',
  REPORTS: '@vbmpay_reports',
};

class StorageService {
  // --- Transactions ---
  async getTransactions() {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading transactions:', error);
      return [];
    }
  }

  async saveTransaction(transaction) {
    try {
      const transactions = await this.getTransactions();
      transactions.unshift(transaction);
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return transaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate, endDate) {
    const transactions = await this.getTransactions();
    return transactions.filter((t) => {
      const date = new Date(t.timestamp);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }

  async getTransactionsByGateway(gatewayId) {
    const transactions = await this.getTransactions();
    return transactions.filter((t) => t.gatewayId === gatewayId);
  }

  async getTransactionsByMethod(method) {
    const transactions = await this.getTransactions();
    return transactions.filter((t) => t.method === method);
  }

  async clearTransactions() {
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }

  // --- Settings ---
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        defaultGateway: null,
        preferCheapest: true,
        preferSecure: false,
        notificationsEnabled: true,
        currency: 'INR',
      };
    } catch (error) {
      console.error('Error reading settings:', error);
      return {};
    }
  }

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // --- Reports ---
  async getReports() {
    try {
      const data = await AsyncStorage.getItem(KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading reports:', error);
      return [];
    }
  }

  async saveReport(report) {
    try {
      const reports = await this.getReports();
      reports.unshift(report);
      await AsyncStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
      return report;
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }
}

export default new StorageService();
