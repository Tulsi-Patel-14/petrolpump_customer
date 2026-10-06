import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fuel, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleRegister = () => {
    if (!name || !mobile) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    // Simulate API call for NFP
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PendingApproval');
    }, 1000);
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
            Create your customer account. Registration requires admin approval before you can access the app.
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
            onChangeText={setMobile}
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
              onPress={() => navigation.goBack()}
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
