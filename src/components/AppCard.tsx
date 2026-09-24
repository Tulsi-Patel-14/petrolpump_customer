import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AppCard: React.FC<AppCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: theme.spacing.sm,
  },
});

export default AppCard;
