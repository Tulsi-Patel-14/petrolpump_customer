import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import { checkGeofence } from '../utils/geofence';
import { Station } from '../types/station';

export interface LocationResult {
  latitude: number;
  longitude: number;
}

export interface GeofenceResult {
  isInside: boolean;
  distanceMeters: number;
}

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Your location is required to verify that you are at an authorized fuel station before generating your temporary Fuel QR.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // iOS permissions are handled via info.plist and auto-prompted by the OS when getCurrentPosition is called,
    // but best practice is to request via react-native-permissions. For this NFP, we'll rely on Geolocation's requestAuthorization
    Geolocation.requestAuthorization();
    return true;
  }

  getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      // 1. Try low accuracy (network / cellular / wifi / cached location) first - fast & reliable
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (firstError) => {
          console.warn('Low accuracy location request failed, trying high accuracy GPS fallback:', firstError);
          // 2. Fallback to high accuracy GPS
          Geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (secondError) => {
              console.warn('High accuracy location request failed:', secondError);
              if (secondError.code === 3 || secondError.message?.includes('timed out')) {
                reject(new Error('Location request timed out. Please ensure GPS/Location service is enabled on your device.'));
              } else {
                reject(secondError);
              }
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  async checkStationGeofence(station: Station): Promise<GeofenceResult> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('LOCATION_PERMISSION_DENIED');
    }

    const location = await this.getCurrentLocation();

    const stationLat = Number(station.latitude ?? station.lat ?? 0);
    const stationLon = Number(station.longitude ?? station.lng ?? 0);
    const radiusMeters = Number(station.radiusMeters ?? station.radius ?? station.meterRadius ?? station.geofenceRadius ?? 100);

    const result = checkGeofence(
      location.latitude,
      location.longitude,
      stationLat,
      stationLon,
      radiusMeters
    );

    return result;
  }
}

export const locationService = new LocationService();
