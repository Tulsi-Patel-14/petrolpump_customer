export interface Transaction {
  id: string;
  stationId: string;
  stationName: string;
  date: string; // ISO format or formatted string
  time: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG';
  quantity: number; // in Liters/Kg
  amount: number; // in local currency
  vehicleId?: string;
  vehicleNumber?: string;
  workerId?: string;
  status: 'Completed' | 'Pending' | 'Failed';
}
