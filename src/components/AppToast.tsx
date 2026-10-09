import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useToastStore } from '../store/toastStore';

export const AppToast = () => {
  const { visible, message, textColor, hideToast } = useToastStore();

  if (!visible || !message) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={hideToast}
      style={styles.toastContainer}
      pointerEvents="box-none"
    >
      <View style={styles.toastCard}>
        <Text style={[styles.toastText, { color: textColor || 'red' }]}>{message}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 85,
    left: 20,
    right: 20,
    zIndex: 999999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCard: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    maxWidth: '92%',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default AppToast;
