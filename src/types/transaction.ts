export interface Transaction {
  id: string;
  stationId: string;
  stationName: string;
  date: string; // ISO format or formatted string
  time: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG';
  quantity: number; // in Liters/Kg
  fuelTotal?: number; // total before discount
  discountAmount?: number; // discount applied
  amount: number; // final amount paid
  vehicleId?: string;
  vehicleNumber?: string;
  workerId?: string;
  status: 'Completed' | 'Pending' | 'Failed';
}
