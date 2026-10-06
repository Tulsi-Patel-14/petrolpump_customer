import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import AppHeader from '../../components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { User, LogOut, Edit, Lock, ChevronRight, Award, Phone, Mail, Building2, CheckCircle2 } from 'lucide-react-native';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  if (!user) return null;
  const insets = useSafeAreaInsets();


  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <AppHeader title="Profile" hideNavActions showBack />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xl }]} bounces={false}>

        {/* Header Profile Card */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarLargeContainer}>
              <View style={styles.avatarLarge}>
                {user.profilePhoto ? (
                  <Image source={{ uri: user.profilePhoto }} style={styles.profileImage} />
                ) : (
                  <User color={theme.colors.surface} size={40} />
                )}
              </View>
              <View style={styles.avatarEditBadge}>
                <CheckCircle2 color={theme.colors.success} size={20} fill={theme.colors.surface} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.badgeDark}>
                <Text style={styles.badgeDarkText}>CUSTOMER</Text>
              </View>
              <View style={styles.badgeOutline}>
                <Text style={styles.badgeOutlineText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details & Identification</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Award color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>CUSTOMER ID</Text>
              <Text style={styles.infoValue}>{user.customerId}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Building2 color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>PREFERRED STATION</Text>
              <Text style={styles.infoValue}>{user.preferredStationId === 'demo-station-001' ? 'Nayara Energy - Demo Station' : user.preferredStationId}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Phone color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
              <Text style={styles.infoValue}>{user.mobile}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.infoIconBox}>
              <Mail color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.infoValue}>{user.email || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.menuIconBox}>
              <Edit color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuRowTitle}>Edit Profile</Text>
              <Text style={styles.menuRowSubtitle}>Update contact information & photo</Text>
            </View>
            <ChevronRight color={theme.colors.textLight} size={20} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.menuIconBox}>
              <Lock color={theme.colors.secondary} size={20} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuRowTitle}>Change Password</Text>
              <Text style={styles.menuRowSubtitle}>Update your security credentials</Text>
            </View>
            <ChevronRight color={theme.colors.textLight} size={20} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={logout}>
            <View style={[styles.menuIconBox, { backgroundColor: `${theme.colors.error}15` }]}>
              <LogOut color={theme.colors.error} size={20} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: theme.colors.error }]}>Sign Out</Text>
              <Text style={styles.menuRowSubtitle}>Disconnect session safely</Text>
            </View>
            <ChevronRight color={theme.colors.textLight} size={20} />
          </TouchableOpacity>
        </View>
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
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  avatarLargeContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1D9E6',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: theme.colors.surface,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeDark: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeDarkText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeOutline: {
    backgroundColor: '#E6F6ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  badgeOutlineText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuRowTitle: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuRowSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});

export default ProfileScreen;
