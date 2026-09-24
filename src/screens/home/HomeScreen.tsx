import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useCustomerStore } from '../../store/customerStore';
import { theme } from '../../theme';
import { mockTransactions } from '../../mock/mockTransactions';
import { useNavigation } from '@react-navigation/native';
import { User, MapPin, QrCode, ArrowRight, History, Fuel, DollarSign, Edit3 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuthStore();
  const { loadStations } = useCustomerStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  if (!user) return null;

  const recentTxn = mockTransactions[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Top Header Section */}
        <View style={styles.headerSection}>
          <SafeAreaView>
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
                  <Edit3 color={theme.colors.primary} size={10} />
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
          </SafeAreaView>
        </View>

        {/* Overlapping QR Button */}
        <View style={styles.qrButtonWrapper}>
          <TouchableOpacity 
            style={styles.qrButtonCard}
            onPress={() => navigation.navigate('QRTab')}
            activeOpacity={0.9}
          >
            <View style={styles.qrIconBox}>
              <QrCode color={theme.colors.primary} size={32} />
            </View>
            <View style={styles.qrTextContent}>
              <Text style={styles.qrButtonTitle}>GENERATE FUEL QR</Text>
              <Text style={styles.qrButtonSubtitle}>Generate dynamic QR to authorize fueling</Text>
            </View>
            <View style={styles.qrArrowCircle}>
              <ArrowRight color={theme.colors.primary} size={20} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          {/* Summary Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Summary</Text>
            <Text style={styles.sectionLink}>Overview</Text>
          </View>

          <View style={styles.statsRow}>
            {/* Stat Card 1 - Dark */}
            <View style={[styles.statCard, styles.statCardDark]}>
              <View style={styles.statIconBadgeDark}>
                <History color={theme.colors.secondary} size={16} />
              </View>
              <Text style={styles.statValueDark}>{user.stats.totalVisits}</Text>
              <Text style={styles.statLabelDark}>Visits</Text>
            </View>

            {/* Stat Card 2 - Light */}
            <View style={[styles.statCard, styles.statCardLight]}>
              <View style={styles.statIconBadgeLight}>
                <Fuel color={theme.colors.primary} size={16} />
              </View>
              <Text style={styles.statValueLight}>{user.stats.totalFuelLiters}</Text>
              <Text style={styles.statLabelLight}>Liters Fueled</Text>
            </View>

            {/* Stat Card 3 - Accent */}
            <View style={[styles.statCard, styles.statCardAccent]}>
              <View style={styles.statIconBadgeAccent}>
                <DollarSign color={theme.colors.surface} size={16} />
              </View>
              <Text style={styles.statValueAccent}>₹{(user.stats.totalSpent / 1000).toFixed(1)}k</Text>
              <Text style={styles.statLabelAccent}>Total Spent</Text>
            </View>
          </View>

          {/* Recent Redemptions */}
          <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
            <Text style={styles.sectionTitle}>Recent Fueling</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.sectionLinkHighlight}>View All History ›</Text>
            </TouchableOpacity>
          </View>

          {recentTxn ? (
            <View style={styles.txnCard}>
              <View style={[styles.txnHeaderRow, { width: '100%' }]}>
                <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                  <Text style={styles.txnStationName} numberOfLines={2}>{recentTxn.stationName}</Text>
                  <Text style={styles.txnTypeLabel}>{recentTxn.fuelType}</Text>
                </View>
                <View style={[styles.txnStatusBadge, { flexShrink: 0 }]}>
                  <Text style={styles.txnStatusText}>COMPLETED</Text>
                </View>
              </View>

              <View style={styles.txnDivider} />

              <View style={styles.txnDetailsRow}>
                <View style={styles.txnDetailCol}>
                  <Text style={styles.txnDetailLabel}>Quantity</Text>
                  <Text style={styles.txnDetailValue}>{recentTxn.quantity} L</Text>
                </View>
                <View style={styles.txnDetailCol}>
                  <Text style={styles.txnDetailLabel}>Time</Text>
                  <Text style={styles.txnDetailValueHighlight}>{recentTxn.time}</Text>
                </View>
                <View style={[styles.txnDetailCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.txnDetailLabel}>Final Paid</Text>
                  <Text style={styles.txnDetailTotal}>₹{recentTxn.amount}</Text>
                </View>
              </View>

              <View style={styles.txnFooter}>
                <Text style={styles.txnFooterDate}>🕒 {recentTxn.date}</Text>
                <Text style={styles.txnFooterId}>{recentTxn.id} ›</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No recent transactions</Text>
          )}
          
          {/* Spacer for bottom tab bar floating button */}
          <View style={{ height: 80 }} />
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
    paddingTop: theme.spacing.md, // Reduced padding to move up
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
    width: 50, // Made smaller
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.tertiary,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.surface,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    fontSize: 20, // Slightly smaller text
    marginBottom: 2,
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
    marginTop: -40, // Adjusted overlap to match the new padding
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  qrButtonCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  qrIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qrTextContent: {
    flex: 1,
  },
  qrButtonTitle: {
    ...theme.typography.h3,
    color: theme.colors.surface,
    fontWeight: '800',
    marginBottom: 4,
  },
  qrButtonSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    opacity: 0.9,
    lineHeight: 16,
  },
  qrArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 110,
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
    backgroundColor: 'rgba(0, 143, 197, 0.2)',
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
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValueDark: {
    ...theme.typography.h2,
    color: theme.colors.surface,
    marginBottom: 4,
  },
  statLabelDark: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  statValueLight: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabelLight: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  statValueAccent: {
    ...theme.typography.h2,
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  statLabelAccent: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
  txnCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: theme.spacing.md,
  },
  txnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  txnStationName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 4,
  },
  txnTypeLabel: {
    ...theme.typography.bodySmall,
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
  },
  txnDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  txnDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  txnDetailCol: {
    flex: 1,
  },
  txnDetailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  txnDetailValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  txnDetailValueHighlight: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  txnDetailTotal: {
    ...theme.typography.h3,
    color: theme.colors.text,
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
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  txnFooterId: {
    ...theme.typography.caption,
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
