import { TemporaryQR } from '../types/qr';
import { fetchWithAuth } from './apiClient';

export interface QRData {
  token: string;
  qrValue: string;
  expiresAt: number;
}

export const qrService = {
  generateQR: async (stationId?: string, latitude?: number, longitude?: number): Promise<QRData> => {
    const payload: Record<string, any> = {};
    if (stationId) payload.stationId = stationId;
    if (latitude !== undefined) {
      payload.latitude = latitude;
      payload.lat = latitude;
    }
    if (longitude !== undefined) {
      payload.longitude = longitude;
      payload.lng = longitude;
    }

    const data = await fetchWithAuth('/qr/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data.data;
  },
  
  checkQRStatus: async (token: string): Promise<any> => {
    const data = await fetchWithAuth(`/qr/status/${token}`);
    return data.data?.status || data.status || data.data || data;
  },

  generateTemporaryQR: (customerId: string): TemporaryQR => {
    const now = Date.now();
    return {
      token: `temp-token-${now}`,
      qrValue: JSON.stringify({ customerId, timestamp: now }),
      issuedAt: now,
      expiresAt: now + (60 * 1000) // 60 seconds expiration
    };
  }
};
