import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useConnectivity } from './ConnectivityContext';

export const ConnectivityBanner: React.FC = () => {
  const { isConnected, isInternetReachable } = useConnectivity();
  
  // Show banner when not connected or internet is not reachable
  const shouldShowBanner = !isConnected || isInternetReachable === false;
  
  if (!shouldShowBanner) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <IconSymbol name="wifi.slash" size={16} color="#FFFFFF" />
      <Text style={styles.bannerText}>
        No internet connection. Some features may be limited.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 