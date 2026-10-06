import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, XCircle, CheckCircle2, AlertTriangle, Building, Fuel } from 'lucide-react-native';
import { mockStations } from '../../mock/mockStations';
import { Station } from '../../types/station';
import { mockTransactions } from '../../mock/mockTransactions';
import { Transaction } from '../../types/transaction';

type LocationState = 'selecting' | 'checking' | 'inside' | 'outside' | 'error' | 'denied';
type QRStatus = 'active' | 'scanned' | 'fueling' | 'completed';

const QRScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { preferredStation } = useCustomerStore();
  const insets = useSafeAreaInsets();

  const [locationState, setLocationState] = useState<LocationState>('selecting');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [qrData, setQrData] = useState<TemporaryQR | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // New simulation states
  const [qrStatus, setQrStatus] = useState<QRStatus>('active');
  const [completedTxnId, setCompletedTxnId] = useState<string | null>(null);

  const handleSelectStation = async (station: Station) => {
    if (!user) return;

    setSelectedStation(station);
    setLocationState('checking');

    try {
      const result = await locationService.checkStationGeofence(station);
      setDistance(result.distanceMeters);

      if (result.isInside) {
        setLocationState('inside');
        const newQR = qrService.generateTemporaryQR(user.customerId);
        setQrData(newQR);
        setIsExpired(false);
        setQrStatus('active');
        setCompletedTxnId(null);
      } else {
        setLocationState('selecting');
        setQrData(null);
        Alert.alert('Out of Geofence Area', 'You are out of the geofence area so you can not generate the QR.');
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
  };

  // Handle countdown and auto-refresh based on timestamp
  useEffect(() => {
    if (locationState !== 'inside' || !qrData || qrStatus !== 'active') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((qrData.expiresAt - now) / 1000));

      setRemainingSeconds(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData, locationState, qrStatus]);

  // Handle reset from navigation params
  useEffect(() => {
    if (route.params?.reset) {
      setQrStatus('active');
      setCompletedTxnId(null);
      setQrData(null);
      setLocationState('selecting');
      setIsExpired(false);
      setRemainingSeconds(0);
      navigation.setParams({ reset: undefined });
    }
  }, [route.params?.reset]);

  // Auto-reset when leaving the screen after completing a transaction
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (qrStatus === 'completed' || qrStatus === 'scanned' || qrStatus === 'fueling') {
        setQrStatus('active');
        setCompletedTxnId(null);
        setQrData(null);
        setLocationState('selecting');
        setIsExpired(false);
        setRemainingSeconds(0);
      }
    });

    return unsubscribe;
  }, [navigation, qrStatus]);

  const handleSimulateScan = () => {
    if (isExpired || qrStatus !== 'active') return;

    setQrStatus('scanned');

    setTimeout(() => {
      setQrStatus('fueling');

      setTimeout(() => {
        // Generate mock transaction
        const now = new Date();
        const mockId = `TXN-SIM-${Math.floor(Math.random() * 10000)}`;
        const newTxn: Transaction = {
          id: mockId,
          stationId: selectedStation?.id || 'demo-station-001',
          stationName: selectedStation?.name || 'Nayara Energy',
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fuelType: 'Petrol',
          quantity: 21.9,
          amount: 2090, // Final Paid
          fuelTotal: 2190,
          discountAmount: 100,
          vehicleId: 'veh-sim',
          vehicleNumber: 'GJ01SIM000',
          status: 'Completed'
        };

        mockTransactions.unshift(newTxn);
        setCompletedTxnId(mockId);
        setQrStatus('completed');
      }, 3000);
    }, 2000);
  };

  if (!preferredStation) {
    return <LoadingScreen message="Loading station data..." />;
  }

  if (locationState === 'checking') {
    return <LoadingScreen message="Checking your location..." />;
  }

  const renderContent = () => {
    switch (locationState) {
      case 'selecting':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.qrTitle}>Select Petrol Pump</Text>
            <Text style={styles.instructionText}>Please select a station to generate your QR code.</Text>

            <ScrollView style={{ width: '100%', marginTop: theme.spacing.lg }}>
              {mockStations.map((station) => (
                <TouchableOpacity
                  key={station.id}
                  style={styles.stationSelectCard}
                  onPress={() => handleSelectStation(station)}
                >
                  <Building color={theme.colors.primary} size={24} style={{ marginRight: theme.spacing.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stationSelectName}>{station.name}</Text>
                    <Text style={styles.stationSelectDesc}>Tap to select</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'inside':
        if (qrStatus === 'completed') {
          return (
            <View style={styles.centerContainer}>
              <View style={styles.statusBannerSuccess}>
                <CheckCircle2 color={theme.colors.success} size={24} />
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>✓ Fueling Completed</Text>
                  <Text style={styles.statusDesc}>Transaction successful.</Text>
                </View>
              </View>

              <AppCard style={styles.qrCard}>
                <Text style={styles.completedAmountText}>21.9 L Petrol</Text>
                <View style={{ marginTop: theme.spacing.lg, alignItems: 'center' }}>
                  <Text style={styles.completedDetailText}>Discount</Text>
                  <Text style={styles.completedDetailValue}>₹100</Text>
                </View>
                <View style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
                  <Text style={styles.completedDetailText}>Final Paid</Text>
                  <Text style={styles.completedFinalValue}>₹2,090</Text>
                </View>

                <AppButton
                  title="View Transaction"
                  onPress={() => navigation.navigate('TransactionDetails', { transactionId: completedTxnId, fromQR: true })}
                  style={{ marginTop: theme.spacing.xl, width: '100%' }}
                />
              </AppCard>
            </View>
          );
        }

        if (qrStatus === 'fueling') {
          return (
            <View style={styles.centerContainer}>
              <View style={[styles.statusBannerSuccess, { backgroundColor: `${theme.colors.secondary}15` }]}>
                <Fuel color={theme.colors.secondary} size={24} />
                <View style={styles.statusTextContainer}>
                  <Text style={[styles.statusTitle, { color: theme.colors.secondary }]}>⛽ Fueling in Progress</Text>
                  <Text style={styles.statusDesc}>Authorization successful.</Text>
                </View>
              </View>

              <AppCard style={styles.qrCard}>
                <Text style={styles.qrTitle}>Fueling is currently in progress.</Text>
                <Text style={styles.instructionText}>Please wait...</Text>
              </AppCard>
            </View>
          );
        }

        if (qrStatus === 'scanned') {
          return (
            <View style={styles.centerContainer}>
              <View style={styles.statusBannerSuccess}>
                <CheckCircle2 color={theme.colors.success} size={24} />
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>✓ QR Scanned</Text>
                  <Text style={styles.statusDesc}>Authorization Successful</Text>
                </View>
              </View>

              <AppCard style={styles.qrCard}>
                <Text style={styles.qrTitle}>The attendant has scanned your fueling QR.</Text>
                <Text style={styles.instructionText}>Please proceed with fueling.</Text>
                <View style={styles.statusIndicator}>
                  <Text style={styles.statusIndicatorText}>● AUTHORIZED</Text>
                </View>
              </AppCard>
            </View>
          );
        }

        // Active State
        return (
          <View style={styles.centerContainer}>

            {isExpired ? (
              <AppCard style={styles.qrCard}>
                <Text style={styles.qrTitle}>QR Expired</Text>
                <Text style={styles.instructionText}>This QR code is no longer valid.</Text>
                <Text style={styles.instructionText}>Generate a new QR code to continue.</Text>
                <View style={styles.timerContainer}>
                  <AppButton
                    title="Generate New QR"
                    onPress={() => selectedStation && handleSelectStation(selectedStation)}
                  />
                </View>
              </AppCard>
            ) : (
              <AppCard style={styles.qrCard}>
                <Text style={styles.qrTitle}>Scan to Fuel</Text>

                <View style={styles.qrWrapper}>
                  {qrData && (
                    <QRCode
                      value={qrData.qrValue}
                      size={220}
                      color={theme.colors.text}
                      backgroundColor={theme.colors.surface}
                    />
                  )}
                </View>

                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>Valid for</Text>
                  <Text style={[styles.timerValue, remainingSeconds <= 10 && styles.timerWarning]}>
                    00:{remainingSeconds.toString().padStart(2, '0')} sec
                  </Text>
                  {remainingSeconds <= 10 && (
                    <Text style={[styles.instructionText, { color: theme.colors.error, marginTop: 4, paddingHorizontal: 0 }]}>
                      QR expires soon
                    </Text>
                  )}
                </View>

                <View style={[styles.statusIndicator, { backgroundColor: `${theme.colors.secondary}15` }]}>
                  <Text style={[styles.statusIndicatorText, { color: theme.colors.secondary }]}>● QR ACTIVE</Text>
                </View>
              </AppCard>
            )}


            {/* NFP Simulation Button */}
            {!isExpired && (
              <AppButton
                title="Simulate Attendant Scan (Mock)"
                onPress={handleSimulateScan}
                style={{ marginTop: theme.spacing.xl, width: '100%', backgroundColor: theme.colors.secondary }}
              />
            )}
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
                <Text style={styles.infoValue}>{selectedStation?.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Your Distance</Text>
                <Text style={[styles.infoValue, { color: theme.colors.error }]}>
                  {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Required Radius</Text>
                <Text style={styles.infoValue}>{selectedStation?.radiusMeters} m</Text>
              </View>
            </AppCard>

            <AppButton
              title="Check Location Again"
              onPress={() => setLocationState('selecting')}
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
              onPress={() => setLocationState('selecting')}
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
              onPress={() => setLocationState('selecting')}
              style={styles.actionButton}
            />
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <AppHeader title="Fuel QR" showBack onBackPress={() => navigation.navigate('HomeTab')} hideNotification={true} />
      <View style={{ flex: 1, paddingBottom: insets.bottom + theme.spacing.xl }}>
        <View style={styles.content}>
          {renderContent()}
        </View>
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
    paddingVertical: theme.spacing.xl,
  },
  qrTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
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
    marginTop: theme.spacing.md,
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
    marginTop: theme.spacing.md,
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
  stationSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stationSelectName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  stationSelectDesc: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  completedAmountText: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  completedDetailText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  completedDetailValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  completedFinalValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusIndicator: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: `${theme.colors.success}15`,
  },
  statusIndicatorText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.success,
  },
});

export default QRScreen;
