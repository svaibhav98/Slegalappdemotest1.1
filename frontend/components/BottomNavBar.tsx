import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  NyayAIIcon, 
  HomeIcon, 
  LawBookIcon, 
  FolderIcon, 
  LegalDocumentIcon 
} from './icons/LegalIcons';

const COLORS = {
  primary: '#FF9933',
  secondary: '#059669',
  background: '#F8F9FA',
  border: '#E5E7EB',
  gray400: '#9CA3AF',
  charcoal: '#2B2D42',
};

const TAB_ITEMS = [
  { name: 'home', route: '/(tabs)/home' },
  { name: 'laws', route: '/(tabs)/laws' },
  { name: 'chat', route: '/(tabs)/chat' },
  { name: 'cases', route: '/(tabs)/cases' },
  { name: 'documents', route: '/(tabs)/documents' },
];

interface BottomNavBarProps {
  activeTab?: string;
}

export default function BottomNavBar({ activeTab }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    for (const tab of TAB_ITEMS) {
      if (pathname.includes(tab.name)) return tab.name;
    }
    return 'home';
  };
  
  const currentTab = getActiveTab();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const renderIcon = (tabName: string, isActive: boolean) => {
    const color = isActive ? COLORS.primary : COLORS.gray400;
    const secondaryColor = isActive ? COLORS.secondary : COLORS.gray400;
    const iconSize = 24; // Uniform size for all icons
    
    switch (tabName) {
      case 'home':
        return <HomeIcon size={iconSize} color={color} />;
      case 'laws':
        return <LawBookIcon size={iconSize} color={color} />;
      case 'chat':
        return <NyayAIIcon size={iconSize} color={color} secondaryColor={secondaryColor} />;
      case 'cases':
        return <FolderIcon size={iconSize} color={color} />;
      case 'documents':
        return <LegalDocumentIcon size={iconSize} color={color} />;
      default:
        return <HomeIcon size={iconSize} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((tab) => {
        const isActive = currentTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tabButton, tab.name === 'chat' && styles.centerTab]}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            {renderIcon(tab.name, isActive)}
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
    height: Platform.OS === 'ios' ? 52 : 56,
    paddingBottom: 0,
    paddingTop: 0,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 0,
  },
  centerTab: {
    // All tabs now uniform - no special styling needed
  },
});
