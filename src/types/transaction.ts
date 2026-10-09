export interface Transaction {
  id: string;
  displayId?: string;
  receiptNo?: string;
  transactionId?: string;
  stationId: string;
  stationName: string;
  groupName?: string;
  workerName?: string;
  workerId?: string;
  customerId?: string;
  customerName?: string;
  date: string; // ISO format or formatted string
  time: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG';
  quantity: number; // in Liters/Kg
  fuelTotal?: number; // total before discount
  discountAmount?: number; // discount applied
  discountPercentage?: number; // discount percentage
  amount: number; // final amount paid
  vehicleId?: string;
  vehicleNumber?: string;
  status: 'Completed' | 'Pending' | 'Failed';
}
