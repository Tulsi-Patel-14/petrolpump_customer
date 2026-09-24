import { create } from 'zustand';
import { Customer } from '../types/customer';
import { mockCustomer } from '../mock/mockCustomer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  login: (mobile: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (mobile, otp) => {
    // Mock login logic
    if (otp === '1234') { // Fixed OTP for NFP
      await AsyncStorage.setItem('userToken', 'mock-token-xyz');
      set({ isAuthenticated: true, user: mockCustomer });
      return true;
    }
    return false;
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    set({ isAuthenticated: false, user: null });
  },
  checkSession: async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      set({ isAuthenticated: true, user: mockCustomer });
    }
  },
}));
