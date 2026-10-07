import { create } from 'zustand';
import { Transaction } from '../types/transaction';
import { fetchWithAuth } from '../services/apiClient';

interface DashboardSummary {
  totalVisits: number;
  totalFuelLiters: number;
  totalDiscount: number;
  recentTransactions: Transaction[];
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  dashboardSummary: DashboardSummary | null;
  loadTransactions: (filterType?: string) => Promise<void>;
  loadDashboard: (period?: string) => Promise<void>;
  getTransactionDetails: (id: string) => Promise<Transaction | null>;
}

const mapTransaction = (t: any): Transaction => {
  const dateObj = t.createdAt ? new Date(t.createdAt) : new Date();
  return {
    ...t,
    stationName: t.station?.name || t.stationName || 'Unknown Station',
    quantity: t.litres || t.quantity || 0,
    amount: t.finalAmount || t.amount || 0,
    fuelTotal: t.amount || t.fuelTotal || 0,
    date: t.date || dateObj.toLocaleDateString('en-GB'),
    time: t.time || dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  dashboardSummary: null,
  loadTransactions: async (filterType = 'ALL') => {
    set({ isLoading: true });
    try {
      const data = await fetchWithAuth(`/transactions?filterType=${filterType}`);
      if (data.success) {
        const txnsArray = Array.isArray(data.data) ? data.data : (data.data?.transactions || []);
        set({ transactions: txnsArray.map(mapTransaction), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to load transactions from API:', e);
      set({ isLoading: false });
    }
  },
  loadDashboard: async (period = 'month') => {
    set({ isLoading: true });
    try {
      const data = await fetchWithAuth(`/dashboard?period=${period}`);
      if (data.success) {
        const rawSummary = data.data?.summary || {};
        const mappedDashboard = {
          totalVisits: rawSummary.transactionCount || 0,
          totalFuelLiters: rawSummary.totalLitres || 0,
          totalDiscount: rawSummary.totalDiscountAmount || 0,
          recentTransactions: (data.data?.transactions || []).map(mapTransaction),
        };
        set({ dashboardSummary: mappedDashboard as any, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to load dashboard from API:', e);
      set({ isLoading: false });
    }
  },
  getTransactionDetails: async (id: string) => {
    try {
      const data = await fetchWithAuth(`/transactions/${id}`);
      if (data.success) {
        return mapTransaction(data.data);
      }
      return null;
    } catch (e) {
      console.error('Failed to load transaction details from API:', e);
      return null;
    }
  }
}));
