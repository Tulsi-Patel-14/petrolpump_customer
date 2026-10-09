export interface Customer {
  id: string;
  name: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  customerId: string;
  customerCode?: string;
  customCustomerId?: string;
  customId?: string;
  displayId?: string;
  code?: string;
  mobile: string;
  mobileNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  profilePhoto?: string;
  activeStatus: 'active' | 'inactive';
  preferredStationId?: string;
  groupName?: string;
  stats: {
    totalVisits: number;
    totalFuelLiters: number;
    totalSpent: number;
  };
}
