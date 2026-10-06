import { Customer } from '../types/customer';

export const mockCustomer: Customer = {
  id: 'usr-89237492',
  name: 'Tulsi Patel',
  customerId: 'CUS-10025',
  mobile: '+91 98765 43210',
  email: 'tulsi.patel@example.com',
  address: '123, Ring Road, Ahmedabad, Gujarat',
  activeStatus: 'active',
  preferredStationId: 'demo-station-001',
  stats: {
    totalVisits: 24,
    totalFuelLiters: 450.5,
    totalSpent: 42500,
  }
};
