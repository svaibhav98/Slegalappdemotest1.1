import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#FF9933',
  background: '#F8F9FA',
  border: '#E5E7EB',
  gray400: '#9CA3AF',
};

const TAB_ITEMS = [
  { name: 'home', icon: 'home', route: '/(tabs)/home' },
  { name: 'laws', icon: 'book', route: '/(tabs)/laws' },
  { name: 'chat', icon: 'sparkles', route: '/(tabs)/chat' },
  { name: 'cases', icon: 'folder', route: '/(tabs)/cases' },
  { name: 'documents', icon: 'document-text', route: '/(tabs)/documents' },
];

interface BottomNavBarProps {
  activeTab?: string;
}

export default function BottomNavBar({ activeTab }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    // Determine active tab from pathname
    for (const tab of TAB_ITEMS) {
      if (pathname.includes(tab.name)) return tab.name;
    }
    return 'home';
  };
  
  const currentTab = getActiveTab();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TAB_ITEMS.map((tab) => {
        const isActive = currentTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isActive ? COLORS.primary : COLORS.gray400}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    height: 56,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
