import { TemporaryQR } from '../types/qr';
import { fetchWithAuth } from './apiClient';

export interface QRData {
  token: string;
  qrValue: string;
  expiresAt: number;
}

export const qrService = {
  generateQR: async (): Promise<QRData> => {
    const data = await fetchWithAuth('/qr/generate', {
      method: 'POST',
      body: JSON.stringify({ stationId: 's-01', lat: 0, lng: 0 })
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
