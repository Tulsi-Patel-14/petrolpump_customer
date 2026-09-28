import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  hideNavActions?: boolean;
  hideNotification?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack = false, onBackPress, rightComponent, hideNavActions = false, hideNotification = false }) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.innerContainer}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress ? onBackPress : () => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={theme.colors.surface} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.rightComponentContainer}>
          {rightComponent ? rightComponent : !hideNavActions ? (
            <View style={styles.navActions}>
              {!hideNotification && (
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
                  <Bell color={theme.colors.surface} size={24} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} style={styles.iconButton}>
                <User color={theme.colors.surface} size={24} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
  },
  innerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.surface,
    flex: 1,
    textAlign: 'center',
    flexShrink: 1,
  },
  backButton: {
    padding: theme.spacing.xs,
    width: 40,
  },
  placeholder: {
    width: 40,
  },
  rightComponentContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: theme.spacing.md,
    padding: theme.spacing.xs,
  },
});

export default AppHeader;
