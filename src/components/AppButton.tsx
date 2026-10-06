import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle, View } from 'react-native';
import { theme } from '../theme';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({ 
  title, 
  variant = 'primary', 
  loading = false, 
  style, 
  textStyle,
  disabled,
  icon,
  ...props 
}) => {
  const getBackgroundStyle = () => {
    if (disabled) return styles.disabledBackground;
    switch (variant) {
      case 'primary': return styles.primaryBackground;
      case 'secondary': return styles.secondaryBackground;
      case 'outline': return styles.outlineBackground;
      default: return styles.primaryBackground;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.disabledText;
    switch (variant) {
      case 'primary': return styles.primaryText;
      case 'secondary': return styles.secondaryText;
      case 'outline': return styles.outlineText;
      default: return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getBackgroundStyle(), style]} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.surface} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  primaryBackground: {
    backgroundColor: theme.colors.secondary,
  },
  secondaryBackground: {
    backgroundColor: theme.colors.tertiary,
  },
  outlineBackground: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  disabledBackground: {
    backgroundColor: theme.colors.border,
  },
  text: {
    ...theme.typography.button,
  },
  primaryText: {
    color: theme.colors.surface,
  },
  secondaryText: {
    color: theme.colors.surface,
  },
  outlineText: {
    color: theme.colors.secondary,
  },
  disabledText: {
    color: theme.colors.textLight,
  },
});

export default AppButton;
