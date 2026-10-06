import { create } from 'zustand';
import { Customer } from '../types/customer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockUser: Customer = {
  id: 'c-001',
  name: 'Tulsi Patel',
  customerId: 'CUST-8392-TL',
  mobile: '9876543210',
  email: 'tulsi.patel@example.com',
  activeStatus: 'active',
  stats: {
    totalVisits: 24,
    totalFuelLiters: 480.5,
    totalSpent: 45600,
  }
};

interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  login: (mobile: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateUser: (updates: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: mockUser,
  login: async (mobile, otp) => {
    try {
      const response = await fetch('http://192.168.1.24:5000/api/v1/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('userToken', data.data.token);
        set({ isAuthenticated: true, user: data.data.customer });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login API failed, falling back to mock user', e);
      await AsyncStorage.setItem('userToken', 'mock-token-123');
      set({ isAuthenticated: true, user: mockUser });
      return true;
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    set({ isAuthenticated: false, user: null });
  },
  checkSession: async () => {
    // Forcefully set the mock user, completely bypassing API and old tokens for the NFP
    await AsyncStorage.setItem('userToken', 'mock-token-123');
    set({ isAuthenticated: true, user: mockUser });
  },
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },
}));
