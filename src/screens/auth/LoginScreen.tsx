import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fuel, Phone, Lock, Hash } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleSendOtp = () => {
    if (!mobile || mobile.length !== 12) {
      Alert.alert('Invalid Number', 'Please enter a valid 12-digit mobile number (Country Code + 10 digits)');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      // For demo purposes, we can pre-fill or just let user type 1234
    }, 1000);
  };

  const handleLogin = async (override?: string, isPending: boolean = false) => {
    if (isPending) {
      navigation.navigate('PendingApproval');
      return;
    }

    if (!otp && !override) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    // Passing fixed values for NFP testing
    const success = await login(mobile || '1234567890', override || otp || '1234');
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}
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
          {!otpSent ? (
            <AppInput
              label="Mobile Number *"
              placeholder="Enter 12-digit mobile number"
              value={mobile}
              onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
              maxLength={12}
              keyboardType="phone-pad"
              leftIcon={<Phone color={theme.colors.textLight} size={20} />}
            />
          ) : (
            <AppInput
              label="Enter OTP *"
              placeholder="4-digit OTP (e.g. 1234)"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              secureTextEntry
              leftIcon={<Hash color={theme.colors.textLight} size={20} />}
            />
          )}

          {!otpSent ? (
            <AppButton
              title="SEND OTP"
              onPress={handleSendOtp}
              loading={loading}
              style={styles.button}
            />
          ) : (
            <AppButton
              title="VERIFY & LOGIN"
              onPress={() => handleLogin()}
              loading={loading}
              style={styles.button}
            />
          )}


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
    marginTop: 16,
    marginBottom: theme.spacing.xl,
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
