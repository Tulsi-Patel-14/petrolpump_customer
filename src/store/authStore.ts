import { create } from 'zustand';
import { Customer } from '../types/customer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  requestOtp: (mobile: string) => Promise<any>;
  login: (mobile: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateUser: (updates: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  requestOtp: async (mobile) => {
    try {
      const response = await fetchWithAuth('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile })
      });
      return response;
    } catch (e: any) {
      console.error('Request OTP API failed:', e);
      throw e;
    }
  },
  login: async (mobile, otp) => {
    try {
      const response = await fetchWithAuth('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile, otp })
      });
      if (response.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        set({ isAuthenticated: true, user: response.data.customer });
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('Login API failed:', e);
      throw e;
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    set({ isAuthenticated: false, user: null });
  },
  checkSession: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const data = await fetchWithAuth('/profile');
        if (data.success) {
          console.log('PROFILE_DATA:', JSON.stringify(data));
          set({ isAuthenticated: true, user: data.data?.customer || data.data || data.customer });
          return;
        }
      }
    } catch (e) {
      console.error('Session check API failed:', e);
      // Clear bad/expired token so it is not retried on next app open
      await AsyncStorage.removeItem('userToken');
    }
    set({ isAuthenticated: false, user: null });
  },
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },
}));