import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { useCustomerStore } from '../../store/customerStore';
import { locationService } from '../../services/locationService';
import { qrService } from '../../services/qrService';
import { useAuthStore } from '../../store/authStore';
import AppHeader from '../../components/AppHeader';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import LoadingScreen from '../../components/LoadingScreen';
import { theme } from '../../theme';
import { TemporaryQR } from '../../types/qr';
import { MapPin, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react-native';

type LocationState = 'checking' | 'inside' | 'outside' | 'error' | 'denied';

const QRScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { preferredStation } = useCustomerStore();
  
  const [locationState, setLocationState] = useState<LocationState>('checking');
  const [distance, setDistance] = useState<number>(0);
  const [qrData, setQrData] = useState<TemporaryQR | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyLocationAndGenerateQR = useCallback(async () => {
    if (!preferredStation || !user) return;
    
    setLocationState('checking');
    
    try {
      const result = await locationService.checkStationGeofence(preferredStation);
      setDistance(result.distanceMeters);
      
      if (result.isInside) {
        setLocationState('inside');
        const newQR = qrService.generateTemporaryQR(user.customerId);
        setQrData(newQR);
      } else {
        setLocationState('outside');
        setQrData(null);
      }
    } catch (error: any) {
      if (error.message === 'LOCATION_PERMISSION_DENIED') {
        setLocationState('denied');
      } else {
        setLocationState('error');
        setErrorMessage(error.message || 'Unable to determine your current location.');
      }
      setQrData(null);
    }
  }, [preferredStation, user]);

  // Initial check when tab is focused
  useEffect(() => {
    verifyLocationAndGenerateQR();
  }, [verifyLocationAndGenerateQR]);

  // Handle countdown and auto-refresh based on timestamp
  useEffect(() => {
    if (locationState !== 'inside' || !qrData) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((qrData.expiresAt - now) / 1000));
      
      setRemainingSeconds(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        // QR expired, re-validate location before generating new one
        verifyLocationAndGenerateQR();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData, locationState, verifyLocationAndGenerateQR]);

  if (!preferredStation) {
    return <LoadingScreen message="Loading station data..." />;
  }

  if (locationState === 'checking') {
    return <LoadingScreen message="Checking your location..." />;
  }

  const renderContent = () => {
    switch (locationState) {
      case 'inside':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.statusBannerSuccess}>
              <CheckCircle2 color={theme.colors.success} size={24} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>You're at the station</Text>
                <Text style={styles.statusDesc}>{preferredStation.name} • {distance}m</Text>
              </View>
            </View>

            <AppCard style={styles.qrCard}>
              <Text style={styles.qrTitle}>Your Fuel QR</Text>
              
              <View style={styles.qrWrapper}>
                {qrData ? (
                  <QRCode
                    value={qrData.qrValue}
                    size={220}
                    color={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                  />
                ) : (
                  <View style={[styles.qrWrapper, { width: 220, height: 220, backgroundColor: '#eee' }]} />
                )}
              </View>

              <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>Expires in:</Text>
                <Text style={[styles.timerValue, remainingSeconds <= 10 && styles.timerWarning]}>
                  00:{remainingSeconds.toString().padStart(2, '0')}
                </Text>
              </View>
            </AppCard>
            
            <Text style={styles.instructionText}>
              Show this QR code to the station attendant to authorize your fueling.
            </Text>

            {/* NFP Simulation Button */}
            <AppButton
              title="Simulate Attendant Scan"
              onPress={() => navigation.navigate('MockScanner')}
              style={{ marginTop: theme.spacing.xl, width: '100%', backgroundColor: theme.colors.secondary }}
            />
          </View>
        );

      case 'outside':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.statusBannerError}>
              <MapPin color={theme.colors.error} size={24} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitleError}>QR Unavailable</Text>
                <Text style={styles.statusDescError}>You are outside the authorized area.</Text>
              </View>
            </View>

            <AppCard style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Station Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Station</Text>
                <Text style={styles.infoValue}>{preferredStation.name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Your Distance</Text>
                <Text style={[styles.infoValue, { color: theme.colors.error }]}>
                  {distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${distance} m`}
                </Text>
              </View>
              
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Required Radius</Text>
                <Text style={styles.infoValue}>{preferredStation.radiusMeters} m</Text>
              </View>
            </AppCard>

            <AppButton 
              title="Check Location Again" 
              onPress={verifyLocationAndGenerateQR} 
              style={styles.actionButton}
            />
          </View>
        );

      case 'denied':
        return (
          <View style={styles.centerContainer}>
            <AlertTriangle color={theme.colors.warning} size={64} style={styles.iconMargin} />
            <Text style={styles.errorTitle}>Location Permission Required</Text>
            <Text style={styles.errorDesc}>
              We need your location to verify that you are at the fuel station before generating your temporary Fuel QR.
            </Text>
            <AppButton 
              title="Try Again" 
              onPress={verifyLocationAndGenerateQR} 
              style={styles.actionButton}
            />
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContainer}>
            <XCircle color={theme.colors.error} size={64} style={styles.iconMargin} />
            <Text style={styles.errorTitle}>Location Error</Text>
            <Text style={styles.errorDesc}>{errorMessage}</Text>
            <AppButton 
              title="Try Again" 
              onPress={verifyLocationAndGenerateQR} 
              style={styles.actionButton}
            />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Fuel QR" />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: theme.spacing.md,
  },
  statusBannerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}15`,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  statusBannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.error}15`,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  statusTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  statusTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.success,
  },
  statusDesc: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 2,
  },
  statusTitleError: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.error,
  },
  statusDescError: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 2,
  },
  qrCard: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: theme.spacing.xl * 1.5,
  },
  qrTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  qrWrapper: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  timerContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  timerLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
  },
  timerValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: theme.colors.error,
  },
  instructionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  infoCard: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  infoCardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionButton: {
    width: '100%',
  },
  iconMargin: {
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorDesc: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
});

export default QRScreen;
