import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../theme';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AppInput: React.FC<AppInputProps> = ({ label, error, leftIcon, rightIcon, style, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} <Text style={{color: theme.colors.error}}>*</Text>
      </Text>
      <View style={[styles.inputContainer, error && styles.inputError, style]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.textLight}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F8', // Light grayish-blue from screenshot
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 52,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body,
    height: '100%',
  },
  leftIconContainer: {
    paddingLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  rightIconContainer: {
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default AppInput;
