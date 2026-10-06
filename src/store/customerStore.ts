import { create } from 'zustand';
import { Station } from '../types/station';
import { mockStations } from '../mock/mockStations';

interface CustomerState {
  stations: Station[];
  preferredStation: Station | null;
  loadStations: () => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  stations: mockStations,
  preferredStation: mockStations[0],
  loadStations: async () => {
    try {
      // Get token from authStore if needed, or assume interceptor handles it
      const response = await fetch('http://192.168.1.24:5000/api/v1/customer/stations', {
        // Headers handled by api client in real app, assuming simple fetch here for demo
      });
      const data = await response.json();
      if (data.success) {
        set({ stations: data.data, preferredStation: data.data[0] || mockStations[0] });
      }
    } catch (e) {
      console.error('Failed to load stations from API, falling back to mock data:', e);
      set({ stations: mockStations, preferredStation: mockStations[0] });
    }
  },
}));
