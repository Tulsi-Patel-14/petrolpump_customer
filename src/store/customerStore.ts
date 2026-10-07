import { create } from 'zustand';
import { Station } from '../types/station';
import { fetchWithAuth } from '../services/apiClient';

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
      const data = await fetchWithAuth('/stations');
      if (data.success) {
        set({ stations: data.data, preferredStation: data.data[0] || null });
      }
    } catch (e) {
      console.error('Failed to load stations from API:', e);
    }
  },
}));
