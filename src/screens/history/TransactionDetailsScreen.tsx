import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { useRoute, useNavigation } from '@react-navigation/native';
import { mockTransactions } from '../../mock/mockTransactions';
import { theme } from '../../theme';
import { Fuel, IndianRupee, MapPin, Download, Clock } from 'lucide-react-native';
import { formatIndianCurrency, formatNumberCompact } from '../../utils/format';
import AppButton from '../../components/AppButton';

const TransactionDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isDownloading, setIsDownloading] = useState(false);
  const { transactionId } = route.params || {};

  const transaction = mockTransactions.find(t => t.id === transactionId);

  if (!transaction) {
    return (
      <View style={styles.container}>
        <AppHeader title="Transaction Details" showBack={true} hideNavActions={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction not found.</Text>
        </View>
      </View>
    );
  }

  const fuelRate = transaction.fuelTotal && transaction.quantity 
    ? (transaction.fuelTotal / transaction.quantity).toFixed(2) 
    : null;

  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <AppHeader title="Transaction Details" showBack={true} hideNavActions={true} />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        
        {/* Header section with ID and Status */}
        <View style={styles.headerCard}>
          <View style={styles.receiptIdRow}>
            <View>
              <Text style={styles.receiptLabel}>RECEIPT ID</Text>
              <Text style={styles.idText}>{transaction.id}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: transaction.status === 'Completed' ? theme.colors.success : theme.colors.secondary }]}>
              <Text style={[styles.statusText, { color: transaction.status === 'Completed' ? theme.colors.success : theme.colors.secondary }]}>
                {transaction.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.clockRow}>
            <Clock color={theme.colors.textLight} size={14} />
            <Text style={styles.clockText}>Recorded on {transaction.date}, {transaction.time}</Text>
          </View>
        </View>

        {/* Fuel Information */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Fuel Information</Text>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Type</Text>
              <Text style={styles.infoValue}>{transaction.fuelType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Quantity</Text>
              <Text style={styles.infoValue}>{transaction.quantity.toLocaleString('en-IN')} L</Text>
            </View>
            {fuelRate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fuel Rate</Text>
                <Text style={styles.infoValue}>₹{fuelRate}/L</Text>
              </View>
            )}
          </View>
        </View>

        {/* Discount Details */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Discount Details</Text>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Total</Text>
              <Text style={styles.infoValue}>{formatIndianCurrency(transaction.fuelTotal || transaction.amount)}</Text>
            </View>
            {transaction.discountAmount !== undefined && transaction.discountAmount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Discount</Text>
                <Text style={styles.discountValue}>- {formatIndianCurrency(transaction.discountAmount)}</Text>
              </View>
            )}
            <View style={[styles.divider, styles.thickDivider]} />
            <View style={styles.finalRow}>
              <View style={styles.finalLeft}>
                <Text style={styles.finalLabel}>FINAL AMOUNT PAID</Text>
                <Text style={styles.finalSubText}>Verified & Settled</Text>
              </View>
              <Text style={styles.finalValue}>{formatIndianCurrency(transaction.amount)}</Text>
            </View>
          </View>
        </View>

        {/* Download Button */}
        <View style={styles.buttonContainer}>
          <AppButton 
            title="Download Receipt" 
            loading={isDownloading}
            onPress={() => {
              setIsDownloading(true);
              // Simulating a real download delay
              setTimeout(() => {
                setIsDownloading(false);
                Alert.alert('Download Complete', `Receipt for ${transaction.id} has been saved to your device.`, [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      if (route.params?.fromQR) {
                        navigation.navigate('MainTabs', { screen: 'QRTab', params: { reset: true } });
                      }
                    }
                  }
                ]);
              }, 1500);
            }} 
            style={styles.downloadButton}
            icon={<Download color={theme.colors.surface} size={20} />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptLabel: {
    color: '#a0aebc',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
    fontSize: 11,
    fontWeight: '600',
  },
  idText: {
    color: '#003E5C',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#e3f3ec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#43b378',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#43b378',
  },
  headerDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockText: {
    color: '#a0aebc',
    marginLeft: 6,
    fontSize: 12,
  },
  section: {
    marginBottom: 12,
  },
  cardTitle: {
    color: '#154b66',
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#6e7a85',
    fontSize: 14,
    fontWeight: '400',
  },
  infoValue: {
    color: '#154b66',
    fontWeight: '500',
    fontSize: 15,
  },
  discountValue: {
    color: '#154b66',
    fontWeight: 'bold',
    fontSize: 15,
  },
  finalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  finalLeft: {
    justifyContent: 'center',
  },
  finalLabel: {
    color: '#6e7a85',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  finalSubText: {
    color: '#a0aebc',
    fontSize: 11,
  },
  finalValue: {
    color: '#002f45',
    fontSize: 28,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  thickDivider: {
    height: 2,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stationName: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  downloadButton: {
    width: '100%',
  },
});

export default TransactionDetailsScreen;
