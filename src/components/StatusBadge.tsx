import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: `${theme.colors.success}20`, text: theme.colors.success };
      case 'warning':
        return { bg: `${theme.colors.warning}20`, text: '#B8860B' }; // Darker yellow for text
      case 'error':
        return { bg: `${theme.colors.error}20`, text: theme.colors.error };
      case 'info':
      default:
        return { bg: `${theme.colors.secondary}20`, text: theme.colors.secondary };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
