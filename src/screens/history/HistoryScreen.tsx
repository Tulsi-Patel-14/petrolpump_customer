import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AppHeader from '../../components/AppHeader';
import AppCard from '../../components/AppCard';
import StatusBadge from '../../components/StatusBadge';
import { theme } from '../../theme';
import { useTransactionStore } from '../../store/transactionStore';
import { Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatIndianCurrency, formatNumberCompact } from '../../utils/format';

const filters = ['All Time', 'Today', 'This Month', 'This Year'];

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All Time');
  const { transactions, loadTransactions } = useTransactionStore();

  useEffect(() => {
    const filterMap: Record<string, string> = {
      'All Time': 'ALL',
      'Today': 'TODAY',
      'This Month': 'THIS_MONTH',
      'This Year': 'THIS_YEAR',
    };
    loadTransactions(filterMap[activeFilter] || 'ALL');
  }, [activeFilter, loadTransactions]);

  const filteredTxns = transactions;

  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <AppHeader title="Fuel History" showBack onBackPress={() => navigation.navigate('HomeTab')} hideNotification={true} />


      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xl + 60 }]}>
        {filteredTxns.length === 0 ? (
          <Text style={styles.emptyText}>No transactions found for {activeFilter}</Text>
        ) : (
          filteredTxns.map((txn) => (
            <TouchableOpacity
              key={txn.id}
              style={styles.txnCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TransactionDetails', { transactionId: txn.id })}
            >
              <View style={[styles.txnHeaderRow, { width: '100%' }]}>
                <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                  <Text style={styles.txnStationName} numberOfLines={1}>{txn.stationName}</Text>
                  <Text style={styles.txnTypeLabel}>{txn.fuelType}</Text>
                </View>
                <View style={[styles.txnStatusBadge, { flexShrink: 0 }]}>
                  <Text style={styles.txnStatusText}>{txn.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.txnDetailsBox}>
                <View style={[styles.txnDetailCol, { flex: 1.2 }]}>
                  <Text style={styles.txnDetailLabel} numberOfLines={1}>Fuel Qty</Text>
                  <Text style={styles.txnDetailValue} numberOfLines={1} adjustsFontSizeToFit>{(txn.quantity || 0).toLocaleString('en-IN')} L</Text>
                </View>
                <View style={[styles.txnDetailCol, { flex: 1, alignItems: 'center' }]}>
                  <Text style={styles.txnDetailLabel} numberOfLines={1}>Discount</Text>
                  <Text style={styles.txnDetailValueHighlight} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(txn.discountAmount || 0)}</Text>
                </View>
                <View style={[styles.txnDetailCol, { flex: 1.2, alignItems: 'flex-end' }]}>
                  <Text style={styles.txnDetailLabel} numberOfLines={1}>Final Paid</Text>
                  <Text style={styles.txnDetailTotal} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(txn.amount)}</Text>
                </View>
              </View>

              <View style={styles.txnFooter}>
                <Text style={styles.txnFooterDate}>🕒 {txn.date} • {txn.time}</Text>
                <Text style={styles.txnFooterId}>{txn.id} ›</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },

  txnCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E1E8EE',
  },
  txnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  txnStationName: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: 4,
  },
  txnTypeLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.secondary,
  },
  txnStatusBadge: {
    backgroundColor: '#E6F6ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  txnStatusText: {
    color: theme.colors.success,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  txnDetailsBox: {
    backgroundColor: '#F4F7F9',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  txnDetailCol: {
    flex: 1,
  },
  txnDetailLabel: {
    ...theme.typography.captionSmall,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  txnDetailValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  txnDetailValueHighlight: {
    ...theme.typography.bodyMedium,
    color: theme.colors.secondary,
  },
  txnDetailTotal: {
    ...theme.typography.amountMedium,
    color: theme.colors.secondary,
  },
  txnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F9',
  },
  txnFooterDate: {
    ...theme.typography.captionSmall,
    color: theme.colors.textLight,
  },
  txnFooterId: {
    ...theme.typography.captionSmall,
    color: theme.colors.textLight,
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterScrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontStyle: 'italic',
  },
});

export default HistoryScreen;
