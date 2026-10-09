export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  lat?: number;
  lng?: number;
  radius?: number;
  meterRadius?: number;
  geofenceRadius?: number;
}
