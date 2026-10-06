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
  loadStations: () => {
    // In future, this will be an API call
    set({ stations: mockStations, preferredStation: mockStations[0] });
  },
}));
