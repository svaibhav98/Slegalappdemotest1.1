import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = {
  background: '#F5F7FA',
  white: '#FFFFFF',
  primary: '#FF9933',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  teal: '#14B8A6',
  pink: '#EC4899',
  indigo: '#6366F1',
};

interface SettingsItem {
  icon: string;
  iconBg: string;
  label: string;
  route: string;
  badge?: string;
  badgeColor?: string;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
  gridLayout?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const sections: SettingsSection[] = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: 'person', iconBg: COLORS.primary, label: 'Profile', route: '/(settings)/profile' },
        { icon: 'shield-checkmark', iconBg: COLORS.warning, label: 'Verification Status', route: '/(settings)/verification', badge: 'Under Review', badgeColor: COLORS.warning },
        { icon: 'briefcase', iconBg: COLORS.purple, label: 'Practice Areas', route: '/(settings)/practice-areas' },
      ],
    },
    {
      title: 'WORK & PREFERENCES',
      gridLayout: true,
      items: [
        { icon: 'language', iconBg: COLORS.blue, label: 'Languages', route: '/(settings)/languages' },
        { icon: 'calendar', iconBg: COLORS.teal, label: 'Availability', route: '/(settings)/availability' },
        { icon: 'cash', iconBg: COLORS.success, label: 'Consultation Fees', route: '/(settings)/consultation-fees' },
        { icon: 'card', iconBg: COLORS.indigo, label: 'Bank / Payout', route: '/(settings)/bank-payout' },
      ],
    },
    {
      title: 'SUPPORT',
      gridLayout: true,
      items: [
        { icon: 'notifications', iconBg: COLORS.danger, label: 'Notifications', route: '/(settings)/notifications', badge: '2', badgeColor: COLORS.danger },
        { icon: 'document-text', iconBg: COLORS.primary, label: 'Documents', route: '/(settings)/support-documents' },
        { icon: 'help-circle', iconBg: COLORS.blue, label: 'Help Center', route: '/(settings)/help-center' },
        { icon: 'calendar-outline', iconBg: COLORS.purple, label: 'Appointments', route: '/(settings)/appointments' },
      ],
    },
    {
      title: 'LEGAL & SECURITY',
      gridLayout: true,
      items: [
        { icon: 'lock-closed', iconBg: COLORS.teal, label: 'Privacy', route: '/(settings)/privacy' },
        { icon: 'document', iconBg: COLORS.textSecondary, label: 'Terms & Policies', route: '/(settings)/terms' },
        { icon: 'folder', iconBg: COLORS.warning, label: 'Documents', route: '/(settings)/legal-documents' },
        { icon: 'log-out', iconBg: COLORS.danger, label: 'Logout', route: 'logout' },
      ],
    },
  ];

  const handleItemPress = async (route: string) => {
    if (route === 'logout') {
      try {
        await signOut();
        router.replace('/auth/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      router.push(route as any);
    }
  };

  const renderListItem = (item: SettingsItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.listItem, !isLast && styles.listItemBorder]}
      onPress={() => handleItemPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg + '15' }]}>
        <Ionicons name={item.icon as any} size={20} color={item.iconBg} />
      </View>
      <Text style={styles.listItemLabel}>{item.label}</Text>
      <View style={styles.listItemRight}>
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: item.badgeColor + '15' }]}>
            <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = (item: SettingsItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.gridItem}
      onPress={() => handleItemPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.gridIconContainer, { backgroundColor: item.iconBg + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.iconBg} />
        {item.badge && (
          <View style={styles.gridBadge}>
            <Text style={styles.gridBadgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.gridItemLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.gridLayout ? (
              <View style={styles.gridContainer}>
                {section.items.map((item, index) => renderGridItem(item, index))}
              </View>
            ) : (
              <View style={styles.listContainer}>
                {section.items.map((item, index) => 
                  renderListItem(item, index, index === section.items.length - 1)
                )}
              </View>
            )}
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  gridBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  gridItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
