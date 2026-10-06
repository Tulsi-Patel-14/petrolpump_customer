import { create } from 'zustand';
import { Station } from '../types/station';
import { mockStations } from '../mock/mockStations';

interface CustomerState {
  stations: Station[];
  preferredStation: Station | null;
  loadStations: () => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  stations: [],
  preferredStation: null,
  loadStations: async () => {
    try {
      // Get token from authStore if needed, or assume interceptor handles it
      const response = await fetch('http://192.168.1.24:5000/api/v1/customer/stations', {
        // Headers handled by api client in real app, assuming simple fetch here for demo
      });
      const data = await response.json();
      if (data.success) {
        set({ stations: data.data, preferredStation: data.data[0] || null });
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
