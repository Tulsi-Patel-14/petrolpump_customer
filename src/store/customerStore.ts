import { create } from 'zustand';
import { Station } from '../types/station';
import { fetchWithAuth } from '../services/apiClient';

interface CustomerState {
  stations: Station[];
  preferredStation: Station | null;
  loadStations: () => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  stations: [],
  preferredStation: null,
  loadStations: async () => {
    try {
      const data = await fetchWithAuth('/stations');
      if (data.success && data.data) {
        const stationList = Array.isArray(data.data) ? data.data : [data.data];
        const normalizedStations: Station[] = stationList.map((s: any) => ({
          id: s.id || s._id || 'station-1',
          name: s.name || s.stationName || 'Nayara Fuel Station',
          latitude: Number(s.latitude ?? s.lat ?? 21.1702),
          longitude: Number(s.longitude ?? s.lng ?? 72.8311),
          radiusMeters: Number(s.radiusMeters ?? s.radius ?? s.meterRadius ?? s.geofenceRadius ?? 100),
          ...s,
        }));
        set({
          stations: normalizedStations,
          preferredStation: normalizedStations[0] || null,
        });
      }
    } catch (e) {
      console.error('Failed to load stations from API:', e);
    }
  },
}));
