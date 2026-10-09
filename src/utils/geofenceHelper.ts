import { Platform, Alert } from 'react-native';
import { useCustomerStore } from '../store/customerStore';
import { locationService } from '../services/locationService';
import { showCustomToast } from '../store/toastStore';

export const verifyGeofenceAndNavigate = async (
  navigation: any,
  onCheckingStateChange?: (isChecking: boolean) => void
): Promise<boolean> => {
  const state = useCustomerStore.getState();
  const targetStation = state.preferredStation || state.stations[0] || null;

  if (!targetStation) {
    const msg = 'Station information not available. Please try again.';
    showCustomToast(msg, 'red');
    return false;
  }

  if (onCheckingStateChange) onCheckingStateChange(true);

  try {
    const result = await locationService.checkStationGeofence(targetStation);
    if (result.isInside) {
      navigation.navigate('QRTab');
      return true;
    } else {
      const msg = ' You are not at the petrol pump premises!';
      showCustomToast(msg, 'red');
      return false;
    }
  } catch (error: any) {
    const msg =
      error.message === 'LOCATION_PERMISSION_DENIED'
        ? 'Location permission is required to verify if you are at the petrol pump.'
        : error.message || 'Unable to determine your current location.';
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    } else {
      Alert.alert('Location Error', msg);
    }
    return false;
  } finally {
    if (onCheckingStateChange) onCheckingStateChange(false);
  }
};
