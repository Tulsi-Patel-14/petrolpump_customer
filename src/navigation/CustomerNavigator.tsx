import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, QrCode, History, User } from 'lucide-react-native';
import HomeScreen from '../screens/home/HomeScreen';
import QRScreen from '../screens/qr/QRScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import TransactionDetailsScreen from '../screens/history/TransactionDetailsScreen';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { verifyGeofenceAndNavigate } from '../utils/geofenceHelper';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF', // Active tabs now white
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)', // Slightly faded white for inactive tabs
        tabBarStyle: {
          backgroundColor: theme.colors.primary, // Dark bottom bar
          borderTopColor: 'transparent',
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          elevation: 10,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="QRTab"
        component={QRScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            verifyGeofenceAndNavigate(navigation);
          },
        })}
        options={{
          tabBarStyle: { display: 'none' }, // Hide bottom bar when inside QR screen
          tabBarLabel: 'QR',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.floatingButton, focused && styles.floatingButtonActive, { bottom: insets.bottom > 0 ? 10 : 0 }]}>
              <QrCode color={theme.colors.surface} size={28} />
            </View>
          ),
          tabBarLabelStyle: {
            marginTop: 18,
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.secondary,
          },
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarStyle: { display: 'none' }, // Hide bottom bar on profile screen
          tabBarButton: () => null, // Hidden from bottom tab
          tabBarItemStyle: { display: 'none' }, // Ensure it takes 0 width
        }}
      />
    </Tab.Navigator>
  );
};

const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingButtonActive: {
    backgroundColor: theme.colors.tertiary,
  },
});

export default CustomerNavigator;
