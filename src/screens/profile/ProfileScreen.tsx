import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import AppHeader from '../../components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { User, LogOut, ChevronRight, Award, Phone, Mail, Building2, CheckCircle2 } from 'lucide-react-native';

const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  if (!user) return null;
  const insets = useSafeAreaInsets();


  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <AppHeader title="Profile" hideNavActions showBack />
      <View style={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xl, flex: 1 }]}>

        {/* Header Profile Card */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarLargeContainer}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 color="#fff" fill={theme.colors.success} size={24} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details & Identification</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Award color="#0A344D" size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>CUSTOMER ID</Text>
              <Text style={styles.infoValue}>{user.customerId}</Text>
            </View>
          </View>


          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Phone color="#0A344D" size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
              <Text style={styles.infoValue}>{user.mobile}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.infoIconBox}>
              <Mail color="#0A344D" size={20} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.infoValue}>{user.email || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Card */}
        <View style={styles.card}>

          <TouchableOpacity style={styles.menuRow} onPress={logout}>
            <View style={[styles.menuIconBox, { backgroundColor: '#FFEBEB' }]}>
              <LogOut color="#FF4B4B" size={20} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuRowTitle}>Sign Out</Text>
              <Text style={styles.menuRowSubtitle}>Disconnect session safely</Text>
            </View>
          </TouchableOpacity>
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
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: theme.spacing.md,
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
    paddingVertical: 16,
  },
  avatarLargeContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0A344D', // Dark blue background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    color: '#32BBE7', // Cyan/bright blue text
    fontSize: 42,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  name: {
    ...theme.typography.h2,
    color: '#0A344D',
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 22,
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
    color: '#0A344D',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
    color: '#9DA8B5',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#0A344D',
    fontSize: 15,
    fontWeight: '500',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#FF4B4B', // Red
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuRowSubtitle: {
    color: '#9DA8B5',
    fontSize: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});

export default ProfileScreen;
