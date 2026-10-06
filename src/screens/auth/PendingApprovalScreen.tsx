import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ShieldCheck, Check, RotateCw, Zap, LogOut } from 'lucide-react-native';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

const PendingApprovalScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuthStore();

  const handleDemoAuthorize = async () => {
    // For NFP demo: instantly authorize and login
    await login('1234567890', '1234');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ShieldCheck color={theme.colors.secondary} size={48} />
          </View>
          <Text style={styles.title}>Approval Pending</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>PENDING APPROVAL</Text>
          </View>
          <Text style={styles.subtitle}>
            Thank you for registering. Your account has been submitted for authorization from the admin portal.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <ShieldCheck color={theme.colors.primary} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Verification in Progress</Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, styles.stepCompleted]}>
                <Check color="#fff" size={14} />
              </View>
              <View style={styles.stepLine} />
            </View>
            <Text style={styles.stepTextCompleted}>Customer Registration Submitted</Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, styles.stepActive]}>
                <Text style={styles.stepNumberActive}>2</Text>
              </View>
              <View style={[styles.stepLine, styles.stepLineInactive]} />
            </View>
            <Text style={styles.stepTextActive}>Admin Portal Authorization</Text>
          </View>

          <View style={[styles.stepContainer, { marginBottom: 0 }]}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, styles.stepInactive]}>
                <Text style={styles.stepNumberInactive}>3</Text>
              </View>
            </View>
            <Text style={styles.stepTextInactive}>Account Activation</Text>
          </View>

          <Text style={styles.noteText}>
            Note: Contact your admin or branch manager to expedite account activation.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.checkButton} onPress={() => {}}>
            <RotateCw color={theme.colors.surface} size={18} style={{ marginRight: 8 }} />
            <Text style={styles.checkButtonText}>CHECK APPROVAL STATUS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoButton} onPress={handleDemoAuthorize}>
            <Zap color={theme.colors.surface} size={18} style={{ marginRight: 8 }} />
            <Text style={styles.demoButtonText}>Demo: Authorize Account Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={() => navigation.goBack()}>
            <LogOut color={theme.colors.surface} size={18} style={{ marginRight: 8, opacity: 0.8 }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 143, 197, 0.1)',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.surface,
    marginBottom: 12,
  },
  badgeContainer: {
    backgroundColor: '#FFE8CC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
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
    borderRadius: 16,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepActive: {
    backgroundColor: theme.colors.secondary,
  },
  stepInactive: {
    backgroundColor: theme.colors.border,
  },
  stepNumberActive: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepNumberInactive: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: theme.colors.success,
    position: 'absolute',
    top: 24,
    zIndex: 1,
  },
  stepLineInactive: {
    backgroundColor: theme.colors.border,
  },
  stepTextCompleted: {
    ...theme.typography.body,
    color: theme.colors.success,
    flex: 1,
    marginTop: 2,
  },
  stepTextActive: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 2,
  },
  stepTextInactive: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    flex: 1,
    marginTop: 2,
  },
  noteText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginTop: 24,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  checkButton: {
    backgroundColor: '#008FC5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  demoButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  demoButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  signOutText: {
    color: theme.colors.surface,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default PendingApprovalScreen;
