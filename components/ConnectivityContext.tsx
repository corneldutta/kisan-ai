import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ConnectivityContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: true,
  isInternetReachable: true,
});

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};

interface ConnectivityProviderProps {
  children: React.ReactNode;
}

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    // Get initial state
    const getInitialState = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
    };

    getInitialState();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    isConnected,
    isInternetReachable,
  };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}; 