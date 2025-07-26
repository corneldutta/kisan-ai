import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#31A05F',
        tabBarInactiveTintColor: '#4B4B4B',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#D3EDDF',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="house.fill" 
              color={focused ? '#31A05F' : '#4B4B4B'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="image-search"
        options={{
          title: 'Image Search',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="camera.fill" 
              color={focused ? '#31A05F' : '#4B4B4B'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="voice-chat"
        options={{
          title: 'Voice Chat',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="mic.fill" 
              color={focused ? '#31A05F' : '#4B4B4B'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="text-chat"
        options={{
          title: 'Text Chat',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="message.fill" 
              color={focused ? '#31A05F' : '#4B4B4B'} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
