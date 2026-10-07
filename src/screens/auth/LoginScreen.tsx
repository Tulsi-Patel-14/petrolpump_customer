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
  const [errorMessage, setErrorMessage] = useState('');
  const { login, requestOtp } = useAuthStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleSendOtp = async () => {
    setErrorMessage('');
    if (!mobile || mobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(mobile);
      setOtpSent(true);
      
      const returnedOtp = res.data?.otp || res.otp || res.data?.data?.otp || '1234';
      Alert.alert('Demo OTP', `Your OTP is: ${returnedOtp}`);
    } catch (error: any) {
      let errorMsg = error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : 'Failed to send OTP.');
      // Strip out '[Error: ...]' wrapping if the backend or Error object stringifies it that way
      errorMsg = errorMsg.replace(/\[Error:\s*|\]/g, '').trim();
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (override?: string, isPending: boolean = false) => {
    setErrorMessage('');
    if (isPending) {
      navigation.navigate('PendingApproval');
      return;
    }

    if (!otp && !override) {
      setErrorMessage('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      await login(mobile, override || otp);
    } catch (error: any) {
      let errorMsg = error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : 'An error occurred during login.');
      errorMsg = errorMsg.replace(/\[Error:\s*|\]/g, '').trim();
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
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
          {!!errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {!otpSent ? (
            <AppInput
              label="Mobile Number *"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChangeText={(text) => {
                setErrorMessage('');
                setMobile(text.replace(/[^0-9]/g, ''));
              }}
              maxLength={10}
              keyboardType="phone-pad"
              leftIcon={<Phone color={theme.colors.textLight} size={20} />}
            />
          ) : (
            <View>
              <AppInput
                label="Enter OTP *"
                placeholder="4-digit OTP (e.g. 1234)"
                value={otp}
                onChangeText={(text) => {
                  setErrorMessage('');
                  setOtp(text);
                }}
                keyboardType="number-pad"
                secureTextEntry
                leftIcon={<Hash color={theme.colors.textLight} size={20} />}
              />
              <View style={styles.changeNumberContainer}>
                <Text 
                  style={styles.changeNumberText}
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                >
                  Change Number?
                </Text>
              </View>
            </View>
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
  errorText: {
    color: '#EF4444', // Red 500
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
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
  changeNumberContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  changeNumberText: {
    ...theme.typography.bodySmall,
    color: theme.colors.secondary,
    fontWeight: 'bold',
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
