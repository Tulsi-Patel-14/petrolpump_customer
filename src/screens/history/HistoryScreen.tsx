import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../theme';
import { useTransactionStore } from '../../store/transactionStore';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatIndianCurrency } from '../../utils/format';
import { Receipt, Users, Clock, ChevronRight } from 'lucide-react-native';

const filters = ['All', 'Today', 'This Month', 'This Year'];

const getStatusBadgeStyle = (status: string) => {
  const s = (status || 'COMPLETED').toUpperCase();
  if (s === 'PENDING') {
    return {
      badge: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
      text: { color: '#B45309' },
    };
  }
  if (s === 'CANCELLED' || s === 'FAILED') {
    return {
      badge: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
      text: { color: '#B91C1C' },
    };
  }
  return {
    badge: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
    text: { color: '#047857' },
  };
};

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const { transactions, loadTransactions } = useTransactionStore();

  useEffect(() => {
    const filterMap: Record<string, string> = {
      'All': 'ALL',
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
          filteredTxns.map((txn) => {
            const statusStyle = getStatusBadgeStyle(txn.status);
            return (
              <TouchableOpacity
                key={txn.id}
                style={styles.txnCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TransactionDetails', { transactionId: txn.id })}
              >
                <View style={[styles.txnHeaderRow, { width: '100%' }]}>
                  <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                    <View style={styles.txnIdRow}>
                      <Text style={styles.txnStationName} numberOfLines={1}>{txn.displayId || txn.receiptNo || txn.transactionId || txn.id}</Text>
                    </View>
                    {txn.groupName ? (
                      <View style={styles.txnGroupRow}>
                        <Users color="#086E96" size={12} style={{ marginRight: 5 }} />
                        <Text style={styles.txnTypeLabel} numberOfLines={1}>{txn.groupName}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.txnStatusBadge, statusStyle.badge, { flexShrink: 0 }]}>
                    <Text style={[styles.txnStatusText, statusStyle.text]}>{(txn.status || 'Completed').toUpperCase()}</Text>
                  </View>
                  <ChevronRight color="#C4CDD6" size={18} style={{ marginLeft: 6 }} />
                </View>

                <View style={styles.txnDetailsBox}>
                  <View style={[styles.txnDetailCol, { flex: 1.2 }]}>
                    <Text style={styles.txnDetailLabel} numberOfLines={1}>Fuel Total</Text>
                    <Text style={styles.txnDetailValue} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(txn.fuelTotal || (txn.amount + (txn.discountAmount || 0)))}</Text>
                  </View>
                  <View style={[styles.txnDetailCol, { flex: 1.3, alignItems: 'center' }]}>
                    <Text style={styles.txnDiscountLabel} numberOfLines={1}>Discount ({txn.discountPercentage || 0}%)</Text>
                    <Text style={styles.txnDiscountValue} numberOfLines={1} adjustsFontSizeToFit>
                      {txn.discountAmount && txn.discountAmount > 0
                        ? `- ${formatIndianCurrency(txn.discountAmount)}`
                        : (txn.discountPercentage && txn.discountPercentage > 0
                          ? `- ${formatIndianCurrency(Math.round(((txn.fuelTotal || txn.amount) * txn.discountPercentage) / 100))}`
                          : '₹0')}
                    </Text>
                  </View>
                  <View style={[styles.txnDetailCol, { flex: 1.2, alignItems: 'flex-end' }]}>
                    <Text style={styles.txnFinalLabel} numberOfLines={1}>Final Paid</Text>
                    <Text style={styles.txnDetailTotal} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(txn.amount)}</Text>
                  </View>
                </View>

                <View style={styles.txnFooter}>
                  <View style={styles.txnFooterLeft}>
                    <Clock color="#94A3B8" size={12} style={{ marginRight: 5 }} />
                    <Text style={styles.txnFooterDate}>{txn.date} • {txn.time}</Text>
                  </View>
                  <Text style={styles.txnFooterStation}>{txn.stationName}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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

  txnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  txnStationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A3F5C',
    marginBottom: 2,
  },
  txnIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  txnTypeLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#086E96',
  },
  txnGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  txnStatusText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  txnDetailsBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  txnDetailCol: {
    flex: 1,
  },
  txnDetailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 4,
  },
  txnDiscountLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#086E96',
    marginBottom: 4,
  },
  txnFinalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  txnDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A3F5C',
  },
  txnDiscountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#086E96',
  },
  txnDetailTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A3F5C',
  },
  txnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F9',
  },
  txnFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnFooterDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  txnFooterStation: {
    fontSize: 13,
    fontWeight: '400',
    color: '#94A3B8',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0B96CD',
    borderColor: '#0B96CD',
  },
  filterChipText: {
    fontSize: 14,
    color: '#0A3F5C',
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
