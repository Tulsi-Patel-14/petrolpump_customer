import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AppHeader from '../../components/AppHeader';
import { useRoute, useNavigation } from '@react-navigation/native';
import { mockTransactions } from '../../mock/mockTransactions';
import { theme } from '../../theme';
import { Fuel, IndianRupee, MapPin } from 'lucide-react-native';

const TransactionDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { transactionId } = route.params || {};

  const transaction = mockTransactions.find(t => t.id === transactionId);

  if (!transaction) {
    return (
      <View style={styles.container}>
        <AppHeader title="Transaction Details" showBack={true} />
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
    <View style={styles.container}>
      <AppHeader title="Transaction Details" showBack={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header section with ID and Status */}
        <View style={styles.headerCard}>
          <Text style={styles.idText}>{transaction.id}</Text>
          <View style={[styles.statusBadge, { borderColor: transaction.status === 'Completed' ? theme.colors.success : theme.colors.secondary }]}>
            <Text style={[styles.statusText, { color: transaction.status === 'Completed' ? theme.colors.success : theme.colors.secondary }]}>
              {transaction.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateText}>Recorded on</Text>
          <Text style={styles.dateTimeText}>{transaction.date} • {transaction.time}</Text>
        </View>

        {/* Fuel Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuel Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Type</Text>
              <Text style={styles.infoValue}>{transaction.fuelType}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Quantity</Text>
              <Text style={styles.infoValue}>{transaction.quantity} L</Text>
            </View>
            {fuelRate && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fuel Rate</Text>
                  <Text style={styles.infoValue}>₹{fuelRate}/L</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Discount Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Total</Text>
              <Text style={styles.infoValue}>₹{transaction.fuelTotal || transaction.amount}</Text>
            </View>
            {transaction.discountAmount !== undefined && transaction.discountAmount > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Discount</Text>
                  <Text style={styles.discountValue}>- ₹{transaction.discountAmount}</Text>
                </View>
              </>
            )}
            <View style={[styles.divider, styles.thickDivider]} />
            <View style={styles.infoRow}>
              <Text style={styles.finalLabel}>FINAL AMOUNT PAID</Text>
              <Text style={styles.finalValue}>₹{transaction.amount}</Text>
            </View>
          </View>
        </View>

        {/* Station Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.stationHeader}>
              <MapPin color={theme.colors.primary} size={20} />
              <Text style={styles.stationName}>{transaction.stationName}</Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
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
    padding: theme.spacing.lg,
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
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  idText: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#E6F6ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dateText: {
    ...theme.typography.captionSmall,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  dateTimeText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textLight,
    marginBottom: 12,
    marginLeft: 4,
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
    paddingVertical: 8,
  },
  infoLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textLight,
  },
  infoValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: '600',
  },
  discountValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.success,
    fontWeight: '600',
  },
  finalLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  finalValue: {
    ...theme.typography.amountMedium,
    color: theme.colors.primary,
    fontSize: 20,
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
});

export default TransactionDetailsScreen;
