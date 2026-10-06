export interface QRData {
  token: string;
  qrValue: string;
  expiresAt: number;
}

export const qrService = {
  generateQR: async (): Promise<QRData> => {
    const response = await fetch('http://192.168.1.24:5000/api/v1/customer/qr/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stationId: 's-01', lat: 0, lng: 0 })
    });
    const data = await response.json();
    return data.data;
  },
  
  checkQRStatus: async (token: string): Promise<string> => {
    const response = await fetch(`http://192.168.1.24:5000/api/v1/customer/qr/status/${token}`);
    const data = await response.json();
    return data.data.status;
  }
};
