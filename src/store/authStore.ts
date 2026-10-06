import { create } from 'zustand';
import { Customer } from '../types/customer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  login: (mobile: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateUser: (updates: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
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
      console.error(e);
      return false;
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    set({ isAuthenticated: false, user: null });
  },
  checkSession: async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      try {
        const response = await fetch('http://192.168.1.24:5000/api/v1/customer/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          set({ isAuthenticated: true, user: data.data });
        } else {
          set({ isAuthenticated: false, user: null });
        }
      } catch {
        set({ isAuthenticated: false, user: null });
      }
    }
  },
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },
}));
