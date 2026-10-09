import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ToastAndroid, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCustomerStore } from '../../store/customerStore';
import { showCustomToast } from '../../store/toastStore';
import { locationService } from '../../services/locationService';
import { qrService } from '../../services/qrService';
import { useAuthStore } from '../../store/authStore';
import AppHeader from '../../components/AppHeader';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import LoadingScreen from '../../components/LoadingScreen';
import { theme } from '../../theme';
import { TemporaryQR } from '../../types/qr';
import { fetchWithAuth } from '../../services/apiClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, XCircle, CheckCircle2, AlertTriangle, Fuel, QrCode as QrIcon } from 'lucide-react-native';
import { Station } from '../../types/station';
import { colors } from '../../theme/colors';

type LocationState = 'idle' | 'checking' | 'inside' | 'outside' | 'error' | 'denied';
type QRStatus = 'active' | 'scanned' | 'fueling' | 'completed';

const QRScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { stations, preferredStation, loadStations } = useCustomerStore();
  const insets = useSafeAreaInsets();

  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [qrData, setQrData] = useState<TemporaryQR | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [qrStatus, setQrStatus] = useState<QRStatus>('active');
  const [completedTxnId, setCompletedTxnId] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<any>(null);

  // Ensure station data is loaded
  useEffect(() => {
    if (stations.length === 0) {
      loadStations();
    }
  }, [stations.length, loadStations]);

  const activeStation = selectedStation || preferredStation || stations[0] || null;

  const handleGenerateQR = async () => {
    if (!user) return;

    const targetStation = activeStation;
    if (!targetStation) {
      setErrorMessage('Station information not available. Please try again.');
      setLocationState('idle');
      Alert.alert(
        'Station Error',
        'Station information not available. Please try again.',
        [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
      );
      navigation.navigate('HomeTab');
      return;
    }

    setSelectedStation(targetStation);
    setLocationState('checking');

    try {
      const result = await locationService.checkStationGeofence(targetStation);
      setDistance(result.distanceMeters);

      if (result.isInside) {
        try {
          const newQR = await qrService.generateQR();
          const now = Date.now();
          const expiresAt = newQR.expiresAt && newQR.expiresAt > now ? newQR.expiresAt : now + 60 * 1000;
          const initialRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

          setRemainingSeconds(initialRemaining);
          setQrData({ ...newQR, expiresAt, issuedAt: now });
          setIsExpired(false);
          setQrStatus('active');
          setCompletedTxnId(null);
          setCompletedTxn(null);
          setLocationState('inside');
        } catch (e) {
          setLocationState('idle');
          setQrData(null);
          Alert.alert(
            'QR Error',
            'Failed to generate QR from server.',
            [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
          );
          navigation.navigate('HomeTab');
        }
      } else {
        setLocationState('idle');
        setQrData(null);
        const msg = ' You are not at the petrol pump premises!';
        showCustomToast(msg, 'red');
        navigation.navigate('HomeTab');
      }
    } catch (error: any) {
      setLocationState('idle');
      setQrData(null);
      if (error.message === 'LOCATION_PERMISSION_DENIED') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to verify if you are at the petrol pump.',
          [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
        );
      } else {
        const msg = error.message || 'Unable to determine your current location.';
        setErrorMessage(msg);
        Alert.alert(
          'Location Error',
          msg,
          [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
        );
      }
      navigation.navigate('HomeTab');
    }
  };

  // Auto-trigger geofence check whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (activeStation && locationState === 'idle' && qrStatus !== 'completed') {
        handleGenerateQR();
      }
    }, [activeStation, locationState, qrStatus])
  );

  // Handle countdown and auto-refresh based on timestamp
  useEffect(() => {
    if (locationState !== 'inside' || !qrData || qrStatus !== 'active') return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((qrData.expiresAt - now) / 1000));

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        setQrData(null);
        setLocationState('idle');
        setIsExpired(true);
        setQrStatus('active');

        Alert.alert(
          'QR Expired',
          'Your QR code has expired. Please click the button on the home page to generate QR again.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('HomeTab');
              },
            },
          ]
        );
        navigation.navigate('HomeTab');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [qrData, locationState, qrStatus, navigation]);

  // Poll QR status from backend
  useEffect(() => {
    if (locationState !== 'inside' || !qrData) return;

    const interval = setInterval(async () => {
      try {
        const statusResponse = await qrService.checkQRStatus(qrData.token);
        const status = typeof statusResponse === 'string' ? statusResponse : statusResponse?.status;
        console.log('Polled QR Status:', status);

        if (status === 'scanned') {
          setQrStatus('scanned');
        } else if (status === 'fueling') {
          setQrStatus('fueling');
        } else if (status === 'completed' || status === 'COMPLETED') {
          clearInterval(interval);
          setQrStatus('completed');

          let txnId = statusResponse?.transactionId || statusResponse?.data?.transactionId || statusResponse?.transaction?.id;
          let txnData = statusResponse?.transaction || statusResponse?.data?.transaction;

          if (!txnId || !txnData) {
            try {
              const res = await fetchWithAuth('/transactions?filterType=ALL');
              const txns = Array.isArray(res.data) ? res.data : (res.data?.transactions || []);
              if (txns.length > 0) {
                txnData = txns[0];
                txnId = txnData.id || txnData._id;
              }
            } catch (err) {
              console.error('Failed to fetch latest transaction:', err);
            }
          }

          if (txnData) setCompletedTxn(txnData);
          if (txnId) setCompletedTxnId(txnId);
        }
      } catch (e: any) {
        console.error('QR Polling error:', e.message || e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [qrData, locationState]);

  // Poll QR status from backend
  useEffect(() => {
    if (locationState !== 'inside' || !qrData) return;

    const interval = setInterval(async () => {
      try {
        const statusResponse = await qrService.checkQRStatus(qrData.token);
        const status = typeof statusResponse === 'string' ? statusResponse : statusResponse?.status;
        console.log('Polled QR Status:', status);

        if (status === 'scanned') {
          setQrStatus('scanned');
        } else if (status === 'fueling') {
          setQrStatus('fueling');
        } else if (status === 'completed' || status === 'COMPLETED') {
          clearInterval(interval);
          setQrStatus('completed');
          
          let txnId = statusResponse?.transactionId || statusResponse?.data?.transactionId || statusResponse?.transaction?.id;
          let txnData = statusResponse?.transaction || statusResponse?.data?.transaction;
          
          // If the backend didn't return the transactionId, fetch the latest transaction automatically
          if (!txnId || !txnData) {
            try {
              const res = await fetchWithAuth('/transactions?filterType=ALL');
              const txns = Array.isArray(res.data) ? res.data : (res.data?.transactions || []);
              if (txns.length > 0) {
                txnData = txns[0];
                txnId = txnData.id || txnData._id;
              }
            } catch (err) {
              console.error('Failed to fetch latest transaction:', err);
            }
          }

          if (txnData) {
            setCompletedTxn(txnData);
          }
          if (txnId) {
            setCompletedTxnId(txnId);
          }
        }
      } catch (e: any) {
        console.error('QR Polling error:', e.message || e);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [qrData, locationState]);

  // Handle reset from navigation params
  useEffect(() => {
    if (route.params?.reset) {
      setQrStatus('active');
      setCompletedTxnId(null);
      setCompletedTxn(null);
      setQrData(null);
      setLocationState('idle');
      setIsExpired(false);
      setRemainingSeconds(0);
      navigation.setParams({ reset: undefined });
    }
  }, [route.params?.reset]);

  const handleRegenerate = () => {
    setQrStatus('active');
    setCompletedTxnId(null);
    setCompletedTxn(null);
    setQrData(null);
    setLocationState('idle');
    setIsExpired(false);
    setRemainingSeconds(0);
  };

  if (locationState === 'checking' || (locationState === 'idle' && qrStatus !== 'completed')) {
    return <LoadingScreen message="Verifying your location at petrol pump..." />;
  }

  const currentStationDisplay = activeStation;

  const isChecking = (locationState as string) === 'checking';

  const renderContent = () => {
    switch (locationState) {

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
                {completedTxn ? (
                  <>
                    <Text style={styles.completedAmountText}>{completedTxn.groupName || 'Fuel Transaction'}</Text>

                    {completedTxn.discountAmount > 0 && (
                      <View style={{ marginTop: theme.spacing.lg, alignItems: 'center' }}>
                        <Text style={styles.completedDetailText}>Discount</Text>
                        <Text style={styles.completedDetailValue}>₹{completedTxn.discountAmount}</Text>
                      </View>
                    )}

                    <View style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
                      <Text style={styles.completedDetailText}>Final Paid</Text>
                      <Text style={styles.completedFinalValue}>₹{(completedTxn.finalAmount || completedTxn.amount || 0).toLocaleString('en-IN')}</Text>
                    </View>

                    <AppButton
                      title="Generate New QR"
                      onPress={handleRegenerate}
                      style={{ marginTop: theme.spacing.xl, width: '100%' }}
                    />

                    <AppButton
                      title="View Transaction"
                      variant="outline"
                      onPress={() => navigation.navigate('TransactionDetails', { transactionId: completedTxnId, fromQR: true })}
                      style={{ marginTop: theme.spacing.sm, width: '100%' }}
                    />
                  </>
                ) : (
                  <LoadingScreen message="Fetching your real transaction data..." />
                )}
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
                    title="Return to Home"
                    onPress={() => navigation.navigate('HomeTab')}
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
                  <Text style={[styles.timerValue, remainingSeconds > 0 && remainingSeconds <= 10 && styles.timerWarning]}>
                    {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:{(remainingSeconds % 60).toString().padStart(2, '0')} sec
                  </Text>
                  {remainingSeconds > 0 && remainingSeconds <= 10 && (
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
          </View>
        );

      case 'outside':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.statusBannerError}>
              <MapPin color={theme.colors.error} size={24} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitleError}>Not at Petrol Pump</Text>
                <Text style={[styles.statusDescError, { color: 'red' }]}>You are not inside the petrol pump premises</Text>
              </View>
            </View>

            <AppCard style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Station Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Station</Text>
                <Text style={styles.infoValue}>{currentStationDisplay?.name || 'Nayara Fuel Station'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Your Distance</Text>
                <Text style={[styles.infoValue, { color: theme.colors.error }]}>
                  {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Required Radius</Text>
                <Text style={styles.infoValue}>
                  {currentStationDisplay?.radiusMeters ?? currentStationDisplay?.radius ?? 100} m
                </Text>
              </View>
            </AppCard>

            <AppButton
              title="GENERATE QR CODE"
              loading={isChecking}
              onPress={handleGenerateQR}
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
              title="Grant Permission & Try Again"
              loading={isChecking}
              onPress={handleGenerateQR}
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
              title="GENERATE QR CODE"
              loading={isChecking}
              onPress={handleGenerateQR}
              style={styles.actionButton}
            />
          </View>
        );

      default:
        return null;
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
