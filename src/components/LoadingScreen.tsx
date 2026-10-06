import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Fuel } from 'lucide-react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Initializing secure terminal...' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoContainer}>
          <Fuel color={theme.colors.secondary} size={48} />
        </View>
        <Text style={styles.brandTitle}>PETROLPUMP</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WORKER PORTAL</Text>
        </View>
        <Text style={styles.subtitle}>Secure Discount & Fuel Redemption{'\n'}System</Text>
      </View>
      <View style={styles.bottomContent}>
        <ActivityIndicator size="large" color={theme.colors.secondary} style={styles.spinner} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#E8F4FA',
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  brandTitle: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 10,
  },
  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
  },
});

export default LoadingScreen;
