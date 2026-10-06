import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCustomerStore } from '../../store/customerStore';
import { theme } from '../../theme';
import { mockTransactions } from '../../mock/mockTransactions';
import { useNavigation } from '@react-navigation/native';
import { User, MapPin, QrCode, ArrowRight, History, Fuel, IndianRupee, Edit } from 'lucide-react-native';
import { formatIndianCurrency, formatNumberCompact } from '../../utils/format';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuthStore();
  const { loadStations } = useCustomerStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const [activeFilter, setActiveFilter] = useState<'Today' | 'This Month' | 'This Year'>('This Month');

  const currentDay = new Date().toDateString();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let totalVisits = 0;
  let totalFuelLiters = 0;
  let totalDiscount = 0;

  mockTransactions.forEach((txn) => {
    const txnDate = new Date(txn.date);
    let include = false;

    if (activeFilter === 'Today') {
      include = txnDate.toDateString() === currentDay;
    } else if (activeFilter === 'This Month') {
      include = txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
    } else if (activeFilter === 'This Year') {
      include = txnDate.getFullYear() === currentYear;
    }

    if (include) {
      totalVisits += 1;
      totalFuelLiters += txn.quantity;
      totalDiscount += (txn.discountAmount || 0);
    }
  });

  // Round liters to 1 decimal
  totalFuelLiters = Math.round(totalFuelLiters * 10) / 10;

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} 
        bounces={false}
      >
        {/* Top Header Section */}
        <View style={[styles.headerSection, { paddingTop: insets.top + theme.spacing.md }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.profileAvatarContainer} onPress={() => navigation.navigate('ProfileTab')}>
                <View style={styles.avatar}>
                  {user.profilePhoto ? (
                    <Image source={{ uri: user.profilePhoto }} style={styles.profileImageSmall} />
                  ) : (
                    <User color={theme.colors.surface} size={28} />
                  )}
                </View>
                <View style={styles.editBadge}>
                  <Edit color={theme.colors.primary} size={10} />
                </View>
              </TouchableOpacity>

              <View style={styles.headerInfo}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusText}>ACTIVE CUSTOMER</Text>
                  <View style={styles.statusDot} />
                </View>
                <Text style={styles.nameText} numberOfLines={1}>{user.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin color={theme.colors.textLight} size={14} />
                  <Text style={styles.idText}>ID: {user.customerId}</Text>
                </View>
              </View>
            </View>
        </View>

        {/* Overlapping QR Button */}
        <View style={styles.qrButtonWrapper}>
          <TouchableOpacity
            style={styles.qrButtonCard}
            onPress={() => navigation.navigate('QRTab')}
            activeOpacity={0.9}
          >
            <View style={styles.qrIconBox}>
              <QrCode color="#0A2744" size={28} />
            </View>
            <View style={styles.qrTextContent}>
              <Text style={styles.qrButtonTitle}>GENERATE QR</Text>
              <Text style={styles.qrButtonSubtitle}>Generate dynamic QR to authorize fueling</Text>
            </View>
            <View style={styles.qrArrowCircle}>
              <ArrowRight color="#0A2744" size={20} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          {/* Summary Section - Segmented Control */}
          <View style={styles.filterContainer}>
            {['Today', 'This Month', 'This Year'].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, isActive && styles.filterButtonActive]}
                  onPress={() => setActiveFilter(filter as any)}
                >
                  <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statsRow}>
            {/* Stat Card 1 - Dark */}
            <TouchableOpacity
              style={[styles.statCard, styles.statCardDark]}
              onPress={() => navigation.navigate('HistoryTab')}
              activeOpacity={0.8}
            >
              <View style={styles.statIconBadgeDark}>
                <History color={theme.colors.secondary} size={14} />
              </View>
              <Text style={styles.statValueDark} numberOfLines={1} adjustsFontSizeToFit>{formatNumberCompact(totalVisits)}</Text>
              <Text style={styles.statLabelDark} numberOfLines={1}>Visits</Text>
            </TouchableOpacity>

            {/* Stat Card 2 - Light */}
            <TouchableOpacity
              style={[styles.statCard, styles.statCardLight]}
              onPress={() => navigation.navigate('HistoryTab')}
              activeOpacity={0.8}
            >
              <View style={styles.statIconBadgeLight}>
                <Fuel color={theme.colors.primary} size={14} />
              </View>
              <Text style={styles.statValueLight} numberOfLines={1} adjustsFontSizeToFit>{formatNumberCompact(totalFuelLiters)} L</Text>
              <Text style={styles.statLabelLight} numberOfLines={1}>Liters Fueled</Text>
            </TouchableOpacity>

            {/* Stat Card 3 - Accent */}
            <TouchableOpacity
              style={[styles.statCard, styles.statCardAccent]}
              onPress={() => navigation.navigate('HistoryTab')}
              activeOpacity={0.8}
            >
              <View style={styles.statIconBadgeAccent}>
                <IndianRupee color={theme.colors.primary} size={14} />
              </View>
              <Text style={styles.statValueAccent} numberOfLines={1} adjustsFontSizeToFit>{formatIndianCurrency(totalDiscount)}</Text>
              <Text style={styles.statLabelAccent} numberOfLines={1}>Total Discount</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Redemptions */}
          <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
            <Text style={styles.sectionTitle}>Recent Fueling</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.sectionLinkHighlight}>View All History ›</Text>
            </TouchableOpacity>
          </View>

          {mockTransactions.length > 0 ? (
            mockTransactions.slice(0, 3).map((txn) => (
              <TouchableOpacity 
                key={txn.id} 
                style={styles.txnCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TransactionDetails', { transactionId: txn.id })}
              >
                <View style={[styles.txnHeaderRow, { width: '100%' }]}>
                  <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                    <Text style={styles.txnStationName} numberOfLines={1}>{txn.stationName}</Text>
                    <Text style={styles.txnTypeLabel}>{txn.status.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.txnStatusBadge, { flexShrink: 0 }]}>
                    <Text style={styles.txnStatusText}>{txn.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.txnDetailsBox}>
                  <View style={[styles.txnDetailCol, { flex: 1.2 }]}>
                    <Text style={styles.txnDetailLabel} numberOfLines={1}>Fuel Qty</Text>
                    <Text style={styles.txnDetailValue} numberOfLines={1} adjustsFontSizeToFit>{txn.quantity.toLocaleString('en-IN')} L</Text>
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
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 60, // Reduced bottom padding
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0, // Removed top margin to move up
  },
  profileAvatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.tertiary,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
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
    ...theme.typography.caption,
    color: theme.colors.secondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 6,
    fontSize: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  nameText: {
    ...theme.typography.h1,
    color: theme.colors.surface,
    fontSize: 22,
    marginBottom: 4,
    fontWeight: '800',
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
    marginTop: -35, // Slightly adjusted overlap
    paddingHorizontal: 12, // Reduced from lg to make it wider
    zIndex: 10,
  },
  qrButtonCard: {
    backgroundColor: '#149AEB', // Bright vibrant blue from image
    borderRadius: 16, // Slightly reduced radius for slimmer look
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14, // Reduced from 16, and removed paddingVertical: 20 to reduce height
    shadowColor: '#149AEB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  qrIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  qrTextContent: {
    flex: 1,
  },
  qrButtonTitle: {
    ...theme.typography.h2,
    color: '#0A2744', // Dark blue text
    fontWeight: '800',
    marginBottom: 4,
  },
  qrButtonSubtitle: {
    ...theme.typography.caption,
    color: '#0A2744',
    opacity: 0.75, // Slightly faded dark blue
    lineHeight: 16,
    paddingRight: 10,
  },
  qrArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Slightly lighter translucent circle
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
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
    backgroundColor: '#F0F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: theme.colors.primary,
  },
  statCardLight: {
    backgroundColor: theme.colors.surface,
  },
  statCardAccent: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  statIconBadgeDark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconBadgeLight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconBadgeAccent: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF6FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValueDark: {
    ...theme.typography.amountLarge,
    color: theme.colors.surface,
    marginBottom: 4,
    textAlign: 'left',
  },
  statLabelDark: {
    ...theme.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  statValueLight: {
    ...theme.typography.amountLarge,
    color: theme.colors.primary,
    marginBottom: 4,
    textAlign: 'left',
  },
  statLabelLight: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'left',
  },
  statValueAccent: {
    ...theme.typography.amountLarge,
    color: theme.colors.primary,
    marginBottom: 4,
    textAlign: 'left',
  },
  statLabelAccent: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    textAlign: 'left',
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
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default HomeScreen;
