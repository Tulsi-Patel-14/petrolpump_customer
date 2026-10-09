import { create } from 'zustand';
import { Transaction } from '../types/transaction';
import { fetchWithAuth } from '../services/apiClient';

interface DashboardSummary {
  totalVisits: number;
  totalFuelLiters: number;
  totalDiscount: number;
  totalSpent: number;
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
  const dateObj = t.createdAt ? new Date(t.createdAt) : (t.updatedAt ? new Date(t.updatedAt) : new Date());
  const amount = Number(t.finalAmount ?? t.amount ?? t.paidAmount ?? 0);
  let discountAmount = Number(t.discountAmount ?? t.discount ?? t.discountValue ?? 0);
  const fuelTotal = Number(t.totalAmount ?? t.fuelTotal ?? t.originalAmount ?? (amount + discountAmount));

  let discountPercentage = t.discountPercentage ?? t.discountPercent;
  if (discountPercentage === undefined || discountPercentage === null) {
    discountPercentage = (fuelTotal > 0 && discountAmount > 0)
      ? Math.round((discountAmount / fuelTotal) * 100)
      : 0;
  }

  if (discountAmount === 0 && discountPercentage > 0 && fuelTotal > 0) {
    discountAmount = Math.round((fuelTotal * discountPercentage) / 100);
  }

  const groupName = t.groupName || t.group?.name || t.customerGroup?.name || t.customerGroup || t.customer?.groupName || t.customer?.group?.name || t.groupType || '';
  const workerName = t.workerName || t.worker?.name || t.attendantName || t.worker?.fullName || (t.worker?.firstName ? `${t.worker?.firstName} ${t.worker?.lastName || ''}`.trim() : '');

  // Extract human-readable Worker ID
  let workerId = t.workerId || t.worker?.customId || t.worker?.displayId || t.worker?.workerId || t.worker?.workerCode || t.workerCode || t.worker?.customWorkerId || t.worker?.code || t.worker?.employeeId || t.attendantId || '';
  if (!workerId || (workerId.length >= 24 && /^[0-9a-fA-F-]{24,36}$/.test(workerId))) {
    workerId = t.worker?.customId || t.worker?.displayId || t.worker?.workerId || t.worker?.workerCode || 'Nayra001';
  }

  // Extract human-readable Customer ID
  let customerId = t.customer?.customerId || t.customer?.customerCode || t.customerCode || t.customerId || t.customer?.customId || t.customer?.code || t.customer?.id || '';
  if (customerId && customerId.length === 24 && /^[0-9a-fA-F]{24}$/.test(customerId)) {
    customerId = t.customer?.customerId || t.customer?.customerCode || t.customerCode || t.customer?.code || (t.customer?.mobile ? t.customer.mobile : `CUST-${customerId.slice(-4).toUpperCase()}`);
  }

  const customerName = t.customerName || t.customer?.name || t.customer?.fullName || (t.customer?.firstName ? `${t.customer?.firstName} ${t.customer?.lastName || ''}`.trim() : '');

  let displayId = t.transactionId || t.customTransactionId || t.receiptNo || t.receiptId || t.customId || t.billNo || t.txnNo || t.txnId || t.id || t._id || '';
  if (displayId && displayId.length === 24 && /^[0-9a-fA-F]{24}$/.test(displayId)) {
    displayId = t.transactionId || t.customTransactionId || t.receiptNo || t.receiptId || t.customId || `TXN-${displayId.slice(-6).toUpperCase()}`;
  }

  return {
    ...t,
    id: t.id || t._id || t.transactionId || t.receiptNo || '',
    displayId,
    receiptNo: t.receiptNo || t.receiptId || displayId,
    stationName: t.station?.name || t.stationName || t.pumpName || 'Station',
    groupName,
    workerName,
    workerId,
    customerId,
    customerName,
    fuelType: t.fuelType || t.fuelCategory || t.type || 'Fuel',
    quantity: Number(t.litres ?? t.quantity ?? t.liters ?? 0),
    amount,
    fuelTotal,
    discountAmount,
    discountPercentage: Number(discountPercentage),
    date: t.date || dateObj.toLocaleDateString('en-GB'),
    time: t.time || dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: t.status || 'Completed',
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
        const rawSummary = data.data?.summary || data.summary || {};
        const rawTxns = data.data?.transactions || data.transactions || [];
        const recentTxns = rawTxns.map(mapTransaction);
        const mappedDashboard: DashboardSummary = {
          totalVisits: Number(rawSummary.transactionCount ?? rawSummary.totalVisits ?? rawSummary.visitsCount ?? recentTxns.length),
          totalFuelLiters: Number(rawSummary.totalLitres ?? rawSummary.totalFuelLiters ?? rawSummary.totalQuantity ?? 0),
          totalDiscount: Number(rawSummary.totalDiscountAmount ?? rawSummary.totalDiscount ?? rawSummary.discountTotal ?? 0),
          totalSpent: Number(rawSummary.totalFinalAmount ?? rawSummary.totalAmount ?? rawSummary.totalSpent ?? rawSummary.totalSpentAmount ?? rawSummary.totalPaidAmount ?? recentTxns.reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0)),
          recentTransactions: recentTxns,
        };
        set({ dashboardSummary: mappedDashboard, isLoading: false });
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
