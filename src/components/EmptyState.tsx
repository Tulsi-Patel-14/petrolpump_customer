import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import AppButton from './AppButton';
import { theme } from '../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, actionLabel, onAction }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertCircle color={theme.colors.secondary} size={48} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <AppButton 
          title={actionLabel} 
          onPress={onAction} 
          variant="outline" 
          style={styles.button} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.round,
    backgroundColor: `${theme.colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});

export default EmptyState;
