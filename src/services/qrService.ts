import { TemporaryQR } from '../types/qr';

class QRService {
  generateTemporaryQR(customerId: string): TemporaryQR {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 60 * 1000; // 60 seconds
    const randomToken = Math.random().toString(36).substring(2, 15);
    const token = `${customerId}-${randomToken}`;
    
    return {
      token,
      qrValue: `fuel://customer/${token}`,
      issuedAt,
      expiresAt,
    };
  }
}

export const qrService = new QRService();
