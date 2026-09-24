import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import AppHeader from '../../components/AppHeader';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import { theme } from '../../theme';
import { User, LogOut, Settings, HelpCircle, Car, Edit2, Save, Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhoto, setEditPhoto] = useState(user?.profilePhoto || null);

  if (!user) return null;

  const handleSave = () => {
    // In NFP, just update local state visually (mock saving)
    // Normally we would call a backend API here.
    user.name = editName;
    user.email = editEmail;
    user.profilePhoto = editPhoto || undefined;
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const handleSelectPhoto = async () => {
    try {
      launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri || null;
          setEditPhoto(uri);
          // Instantly update user profile
          if (user) {
            user.profilePhoto = uri || undefined;
          }
        }
      });
    } catch (error) {
      Alert.alert(
        'Rebuild Required', 
        'It looks like the image picker module is not loaded. Please restart your Metro bundler and run "npm run android" again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Profile" hideNavActions showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarLargeContainer}
            onPress={handleSelectPhoto}
          >
            <View style={styles.avatarLarge}>
              {(isEditing ? editPhoto : user.profilePhoto) ? (
                <Image 
                  source={{ uri: (isEditing ? editPhoto : user.profilePhoto) || '' }} 
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
          <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.idText}>Customer ID: {user.customerId}</Text>
        </View>

        <AppCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{user.mobile}</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editModeContainer}>
              <AppInput
                label="Full Name"
                value={editName}
                onChangeText={setEditName}
                placeholder="Name"
              />
              <AppInput
                label="Email Address"
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email || 'Not provided'}</Text>
              </View>
            </>
          )}
        </AppCard>

        <AppCard style={styles.menuCard}>
          {isEditing ? (
            <TouchableOpacity style={styles.menuRow} onPress={handleSave}>
              <View style={[styles.menuIconBox, { backgroundColor: theme.colors.secondary }]}>
                <Save color={theme.colors.surface} size={20} />
              </View>
              <Text style={styles.menuRowText}>Save Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuRow} onPress={() => setIsEditing(true)}>
              <View style={styles.menuIconBox}>
                <Edit2 color={theme.colors.secondary} size={20} />
              </View>
              <Text style={styles.menuRowText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          <View style={styles.menuDivider} />

          <TouchableOpacity 
            style={styles.menuRow} 
            onPress={() => Alert.alert('Help & Support', 'Support contact details will be displayed here.')}
          >
            <View style={styles.menuIconBox}>
              <HelpCircle color={theme.colors.secondary} size={20} />
            </View>
            <Text style={styles.menuRowText}>Help & Support</Text>
          </TouchableOpacity>
          
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={logout}>
            <View style={[styles.menuIconBox, { backgroundColor: `${theme.colors.error}15` }]}>
              <LogOut color={theme.colors.error} size={20} />
            </View>
            <Text style={[styles.menuRowText, { color: theme.colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </AppCard>
      </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarLargeContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flexShrink: 1,
  },
  idText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  infoCard: {
    marginBottom: theme.spacing.xl,
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    width: 80,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  editModeContainer: {
    padding: theme.spacing.lg,
    backgroundColor: '#FAFCFF', // slight background to distinguish edit mode
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  menuCard: {
    padding: 0,
    marginBottom: theme.spacing.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.secondary}15`, // Light secondary bg
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuRowText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 70, // Align with text
  },
});

export default ProfileScreen;
