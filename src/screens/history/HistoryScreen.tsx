import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AppHeader from '../../components/AppHeader';
import AppCard from '../../components/AppCard';
import StatusBadge from '../../components/StatusBadge';
import { theme } from '../../theme';
import { mockTransactions } from '../../mock/mockTransactions';

const filters = ['All Time', 'Today', 'Yesterday', 'This Week', 'This Month'];

const HistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All Time');

  // Basic mock filtering logic for demonstration
  const getFilteredTransactions = () => {
    if (activeFilter === 'All Time') return mockTransactions;
    if (activeFilter === 'Today') return mockTransactions.slice(0, 1);
    if (activeFilter === 'Yesterday') return mockTransactions.slice(1, 2);
    if (activeFilter === 'This Week') return mockTransactions.slice(0, 3);
    if (activeFilter === 'This Month') return mockTransactions;
    return mockTransactions;
  };

  const filteredTxns = getFilteredTransactions();

  return (
    <View style={styles.container}>
      <AppHeader title="Fuel History" />
      
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredTxns.length === 0 ? (
          <Text style={styles.emptyText}>No transactions found for {activeFilter}</Text>
        ) : (
          filteredTxns.map((txn) => (
            <AppCard key={txn.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.date}>{txn.date}</Text>
                <StatusBadge status={txn.status} type={txn.status === 'Completed' ? 'success' : 'warning'} />
              </View>
              <Text style={styles.station} numberOfLines={1}>{txn.stationName}</Text>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Fuel Type</Text>
                  <Text style={styles.detailValue}>{txn.fuelType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>{txn.quantity} L</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.amountValue}>₹{txn.amount}</Text>
                </View>
              </View>
              <View style={styles.footer}>
                <Text style={styles.footerText}>Vehicle: {txn.vehicleNumber || 'N/A'}</Text>
                <Text style={styles.footerText}>{txn.time}</Text>
              </View>
            </AppCard>
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
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  station: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    flexShrink: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  amountValue: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    ...theme.typography.caption,
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
