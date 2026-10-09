import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, StatusBar, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCustomerStore } from '../../store/customerStore';
import { useTransactionStore } from '../../store/transactionStore';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { User, MapPin, QrCode, ArrowRight, History, IndianRupee, Edit, Users, Receipt, Clock, ChevronRight, Fuel } from 'lucide-react-native';
import { formatIndianCurrency, formatNumberCompact } from '../../utils/format';
import { verifyGeofenceAndNavigate } from '../../utils/geofenceHelper';

const { width } = Dimensions.get('window');

const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.trim().split(/\s+/);
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
};

const HomeScreen = () => {
  const { user } = useAuthStore();
  const { loadStations } = useCustomerStore();
  const { dashboardSummary, loadDashboard } = useTransactionStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<'Today' | 'This Month' | 'This Year'>('This Month');
  const [isCheckingGeofence, setIsCheckingGeofence] = useState<boolean>(false);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  useEffect(() => {
    const periodMap: Record<string, string> = {
      'Today': 'today',
      'This Month': 'month',
      'This Year': 'year',
    };
    loadDashboard(periodMap[activeFilter] || 'month');
  }, [activeFilter, loadDashboard]);


  const totalVisits = dashboardSummary?.totalVisits || 0;
  const totalDiscount = dashboardSummary?.totalDiscount || 0;
  const totalSpent = dashboardSummary?.totalSpent || 0;
  const recentTransactions = dashboardSummary?.recentTransactions || [];


  if (!user) return null;

  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <StatusBar barStyle="light-content" backgroundColor="#052333" translucent={false} />
      <View style={{ backgroundColor: '#052333', height: insets.top, width: '100%' }} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        bounces={false}
      >
        {/* Top Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.profileAvatarContainer} onPress={() => navigation.navigate('ProfileTab')}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{getInitials(user?.fullName || user?.name || user?.firstName || 'C')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>ACTIVE MEMBER</Text>
                <View style={styles.statusDot} />
              </View>
              <Text style={styles.nameText} numberOfLines={1}>{user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : null) || user?.fullName || 'Customer User'}</Text>
            </View>
          </View>
        </View>

        {/* Overlapping QR Button */}
        <View style={styles.qrButtonWrapper}>
          <TouchableOpacity
            style={styles.qrButtonCard}
            onPress={() => verifyGeofenceAndNavigate(navigation, setIsCheckingGeofence)}
            activeOpacity={0.9}
            disabled={isCheckingGeofence}
          >
            <View style={styles.qrIconBox}>
              {isCheckingGeofence ? (
                <ActivityIndicator size="small" color="#052333" />
              ) : (
                <QrCode color="#052333" size={32} />
              )}
            </View>
            <View style={styles.qrTextContent}>
              <Text style={styles.qrButtonTitle}>GENERATE QR CODE</Text>
              <Text style={styles.qrButtonSubtitle}>
                {isCheckingGeofence ? 'Checking location...' : 'Generate dynamic QR to authorize fueling'}
              </Text>
            </View>
            <View style={styles.qrArrowCircle}>
              {isCheckingGeofence ? (
                <ActivityIndicator size="small" color="#052333" />
              ) : (
                <ArrowRight color="#052333" size={20} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          {/* Summary Section - Segmented Control */}
          <View style={styles.filterContainer}>
            {(['Today', 'This Month', 'This Year'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, isActive && styles.filterButtonActive]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statsRow}>
            {/* Stat Card 1 - Scan Count (Primary Navy) */}
            <View style={[styles.statCard, styles.statCardDark]}>
              <View style={styles.statIconBadgeDark}>
                <History color="#0B96CD" size={16} />
              </View>
              <Text style={styles.statValueDark} numberOfLines={1} adjustsFontSizeToFit>{formatNumberCompact(totalVisits)}</Text>
              <Text style={styles.statLabelDark} numberOfLines={1}>Scan Count</Text>
            </View>

            {/* Stat Card 2 - Fuel Dispensed (Crisp White Card) */}
            <View style={[styles.statCard, styles.statCardLight]}>
              <View style={styles.statIconBadgeLight}>
                <Fuel color="#0A3F5C" size={16} />
              </View>
              <Text style={styles.statValueLight} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(totalSpent)}</Text>
              <Text style={styles.statLabelLight} numberOfLines={1}>Total Spent</Text>
            </View>

            {/* Stat Card 3 - Discounts Given (Cyan / Accent Card) */}
            <View style={[styles.statCard, styles.statCardAccent]}>
              <View style={styles.statIconBadgeAccent}>
                <IndianRupee color="#086E96" size={16} />
              </View>
              <Text style={styles.statValueAccent} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(totalDiscount)}</Text>
              <Text style={styles.statLabelAccent} numberOfLines={1}>Discount</Text>
            </View>
          </View>

          {/* Recent Redemptions */}
          <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
            <Text style={styles.sectionTitle}>Recent Fueling</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.sectionLinkHighlight}>View All History ›</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.slice(0, 3).map((txn) => (
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
                  <View style={[styles.txnStatusBadge, { flexShrink: 0 }]}>
                    <Text style={styles.txnStatusText}>{(txn.status || 'Completed').toUpperCase()}</Text>
                  </View>
                  <ChevronRight color="#C4CDD6" size={18} style={{ marginLeft: 6 }} />
                </View>

                <View style={styles.txnDetailsBox}>
                  <View style={[styles.txnDetailCol, { flex: 1.2 }]}>
                    <Text style={styles.txnDetailLabel} numberOfLines={1}>Fuel Total</Text>
                    <Text style={styles.txnDetailValue} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(txn.fuelTotal || (txn.amount + (txn.discountAmount || 0)))}</Text>
                  </View>
                  <View style={[styles.txnDetailCol, { flex: 1.3, alignItems: 'center' }]}>
                    <Text style={styles.txnDetailLabel} numberOfLines={1}>Discount ({txn.discountPercentage || 0}%)</Text>
                    <Text style={styles.txnDetailValueHighlight} numberOfLines={1} adjustsFontSizeToFit>
                      {txn.discountAmount && txn.discountAmount > 0
                        ? `- ${formatIndianCurrency(txn.discountAmount)}`
                        : (txn.discountPercentage && txn.discountPercentage > 0
                          ? `- ${formatIndianCurrency(Math.round(((txn.fuelTotal || txn.amount) * txn.discountPercentage) / 100))}`
                          : '₹0')}
                    </Text>
                  </View>
                  <View style={[styles.txnDetailCol, { flex: 1.2, alignItems: 'flex-end' }]}>
                    <Text style={styles.txnDetailLabel} numberOfLines={1}>Final Paid</Text>
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
            ))
          ) : (
            <Text style={styles.emptyText}>No recent transactions</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA', // Light background
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#052333',
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A3F5C',
    borderWidth: 2,
    borderColor: '#0B96CD',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    color: '#0B96CD',
    fontWeight: '800',
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
    color: '#0B96CD',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
    marginLeft: 4,
    fontSize: 12,
  },
  qrButtonWrapper: {
    marginTop: -20,
    paddingHorizontal: 16,
    marginBottom: 16,
    zIndex: 10,
  },
  qrButtonCard: {
    backgroundColor: '#0B96CD',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0B96CD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  qrIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  qrTextContent: {
    flex: 1,
  },
  qrButtonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#052333',
    marginBottom: 2,
  },
  qrButtonSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0E5A84',
    lineHeight: 16,
  },
  qrArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '400',
  },
  sectionLink: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  sectionLinkHighlight: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    fontSize: 13,
    fontWeight: '800',
    color: '#052333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: '#0A3F5C',
  },
  statCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardAccent: {
    backgroundColor: '#E6F4FA',
    borderWidth: 1,
    borderColor: '#0B96CD',
  },
  statIconBadgeDark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0E5A84',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconBadgeLight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconBadgeAccent: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#42B1DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValueDark: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  statLabelDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 2,
    textAlign: 'left',
  },
  statValueLight: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A3F5C',
    textAlign: 'left',
  },
  statLabelLight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'left',
  },
  statValueAccent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#086E96',
    textAlign: 'left',
  },
  statLabelAccent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#086E96',
    marginTop: 2,
    textAlign: 'left',
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
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  txnStatusText: {
    color: '#047857',
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
  txnDetailValueHighlight: {
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
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default HomeScreen;
