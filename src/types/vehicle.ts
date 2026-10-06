export interface Vehicle {
  id: string;
  number: string;
  type: '2-Wheeler' | '4-Wheeler' | 'Commercial';
  fuelType: 'Petrol' | 'Diesel' | 'CNG';
  model: string;
}
