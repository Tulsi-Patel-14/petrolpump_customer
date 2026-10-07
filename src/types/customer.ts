export interface Customer {
  id: string;
  name: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  customerId: string;
  mobile: string;
  mobileNumber?: string;
  phone?: string;
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
