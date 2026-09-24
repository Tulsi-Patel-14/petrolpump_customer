export interface Customer {
  id: string;
  name: string;
  customerId: string;
  mobile: string;
  email?: string;
  address?: string;
  profilePhoto?: string;
  activeStatus: 'active' | 'inactive';
  preferredStationId?: string;
  stats: {
    totalVisits: number;
    totalFuelLiters: number;
    totalSpent: number;
  };
}
