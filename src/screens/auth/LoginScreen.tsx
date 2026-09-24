import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fuel, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleLogin = async (override?: string, isPending: boolean = false) => {
    if (isPending) {
      navigation.navigate('PendingApproval');
      return;
    }
    
    setLoading(true);
    // Passing fixed values for NFP testing
    const success = await login(mobile || '1234567890', override || '1234');
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.contentContainer}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Fuel color={theme.colors.secondary} size={42} />
          </View>
          <Text style={styles.title}>Customer Portal</Text>
          <Text style={styles.subtitle}>
            Sign in to generate QR codes &{'\n'}track your fueling
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <AppInput
            label="Email or Mobile Number *"
            placeholder="vikram.singh@petrolpump.com"
            value={mobile}
            onChangeText={setMobile}
            leftIcon={<Mail color={theme.colors.textLight} size={20} />}
          />
          <AppInput
            label="Password *"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock color={theme.colors.textLight} size={20} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color={theme.colors.textLight} size={20} />
                ) : (
                  <Eye color={theme.colors.textLight} size={20} />
                )}
              </TouchableOpacity>
            }
          />
          
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AppButton 
            title="SIGN IN" 
            onPress={() => handleLogin(password)} 
            loading={loading}
            style={styles.button}
          />

          <View style={styles.quickTestContainer}>
            <Text style={styles.quickTestLabel}>QUICK TEST ACCOUNTS:</Text>
            <View style={styles.quickTestButtons}>
              <TouchableOpacity style={styles.testBadge} onPress={() => handleLogin('1234', false)}>
                <Text style={styles.testBadgeText}>Active Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testBadge} onPress={() => handleLogin('1234', true)}>
                <Text style={styles.testBadgeText}>Pending Customer</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.registerContainer, { marginTop: 24 }]}>
            <Text style={[styles.registerText, { color: theme.colors.text }]}>
              New customer?{' '}
              <Text 
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Register Account
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 143, 197, 0.3)',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.surface,
    marginBottom: 10,
    fontSize: 26,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.surface,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  button: {
    marginBottom: theme.spacing.xl,
  },
  quickTestContainer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
  },
  quickTestLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickTestButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  testBadge: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
  },
  testBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '500',
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  registerText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    opacity: 0.9,
  },
  registerLink: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
