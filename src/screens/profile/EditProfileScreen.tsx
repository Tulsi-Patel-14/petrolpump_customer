import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { User, Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [editName, setEditName] = useState(user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : null) || user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || user?.mobileNumber || user?.phone || '');
  const [editPhoto, setEditPhoto] = useState(user?.profilePhoto || null);

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      name: editName,
      email: editEmail,
      mobile: editMobile,
      profilePhoto: editPhoto || undefined,
    });

    Alert.alert('Success', 'Profile updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleSelectPhoto = async () => {
    try {
      launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri || null;
          setEditPhoto(uri);
        }
      });
    } catch (error) {
      Alert.alert(
        'Rebuild Required',
        'Image picker module issue. Please restart Metro bundler.'
      );
    }
  };

  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <AppHeader title="Edit Profile" showBack hideNavActions />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.avatarLargeContainer}
                onPress={handleSelectPhoto}
                activeOpacity={0.8}
              >
                <View style={styles.avatarLarge}>
                  {editPhoto ? (
                    <Image
                      source={{ uri: editPhoto }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <User color={theme.colors.surface} size={40} />
                  )}
                </View>
                <View style={styles.avatarEditBadge}>
                  <Camera color={theme.colors.primary} size={16} />
                </View>
              </TouchableOpacity>

              <Text style={styles.name} numberOfLines={1}>{editName}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.badgeDark}>
                  <Text style={styles.badgeDarkText}>CUSTOMER</Text>
                </View>
                <View style={styles.badgeOutline}>
                  <Text style={styles.badgeOutlineText}>ACTIVE</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formContainer}>
            <AppInput
              label="Full Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your full name"
            />
            <AppInput
              label="Mobile Number"
              value={editMobile}
              onChangeText={setEditMobile}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
            <AppInput
              label="Email Address"
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>

          <AppButton
            title="Save Changes"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  avatarLargeContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1D9E6',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.surface,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeDark: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeDarkText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeOutline: {
    backgroundColor: '#E6F6ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  badgeOutlineText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 16,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  saveButton: {
    width: '100%',
  },
});

export default EditProfileScreen;
