import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fuel, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchWithAuth } from '../../services/apiClient';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleRegister = async () => {
    if (!name || !mobile || mobile.length !== 10) {
      Alert.alert('Error', 'Please fill in your name and a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: name,
          mobile: mobile,
          email: email,
          vehicle: vehicle
        }),
      });
      Alert.alert('Success', 'Account created successfully! You can now log in.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Customer Registration" hideNavActions showBack />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <Text style={styles.title}>Join Customer Portal</Text>
          <Text style={styles.subtitle}>
            Create your customer account to start generating QR codes and tracking your fueling.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <AppInput
            label="Full Name *"
            placeholder="e.g. Vikram Singh"
            value={name}
            onChangeText={setName}
            leftIcon={<User color={theme.colors.textLight} size={20} />}
          />
          <AppInput
            label="Mobile Number *"
            placeholder="e.g. 9876543210"
            value={mobile}
            onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
            maxLength={10}
            keyboardType="phone-pad"
            leftIcon={<Phone color={theme.colors.textLight} size={20} />}
          />
          <AppInput
            label="Email Address"
            placeholder="e.g. customer@petrolpump.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon={<Mail color={theme.colors.textLight} size={20} />}
          />
          <AppInput
            label="Vehicle Number"
            placeholder="e.g. MH01AB1234 "
            value={vehicle}
            onChangeText={setVehicle}
            leftIcon={<Fuel color={theme.colors.textLight} size={20} />}
          />

          <AppButton
            title="SUBMIT REGISTRATION"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an authorized account?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA', // Light background matching screenshot
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  topSection: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: 8,
    fontSize: 24,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  loginText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
