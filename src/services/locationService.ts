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
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  async checkStationGeofence(station: Station): Promise<GeofenceResult> {
    // TODO: Re-enable real geofence validation when backend/location requirements are finalized.
    // Bypassing geofence for NFP as requested.
    return {
      isInside: true,
      distanceMeters: 0,
    };
  }
}

export const locationService = new LocationService();
