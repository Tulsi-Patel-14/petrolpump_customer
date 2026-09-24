import { Transaction } from '../types/transaction';

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-90234',
    stationId: 'demo-station-001',
    stationName: 'Nayara Energy - Demo Station',
    date: '2026-09-23',
    time: '10:32 AM',
    fuelType: 'Petrol',
    quantity: 32.4,
    amount: 2500,
    vehicleId: 'veh-001',
    vehicleNumber: 'GJ01AB1234',
    status: 'Completed',
  },
  {
    id: 'TXN-89432',
    stationId: 'demo-station-001',
    stationName: 'Nayara Energy - Demo Station',
    date: '2026-09-15',
    time: '04:15 PM',
    fuelType: 'Petrol',
    quantity: 25.0,
    amount: 1950,
    vehicleId: 'veh-001',
    vehicleNumber: 'GJ01AB1234',
    status: 'Completed',
  },
  {
    id: 'TXN-88120',
    stationId: 'demo-station-001',
    stationName: 'Nayara Energy - Demo Station',
    date: '2026-09-02',
    time: '09:00 AM',
    fuelType: 'Petrol',
    quantity: 40.0,
    amount: 3100,
    status: 'Completed',
  }
];
