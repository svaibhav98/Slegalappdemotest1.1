import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LAWYERS_DATA } from '../../services/lawyersData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

// Design System Colors
const COLORS = {
  headerBg: '#1E1F3B',
  headerBgLight: '#2B2D4A',
  primary: '#FF9933',
  primaryDark: '#E68A00',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#F5F7FA',
  cardBg: '#FFFFFF',
  success: '#10B981',
  accent: '#00D084',
  purple: '#6B21A8',
  blue: '#3B82F6',
  orange: '#F97316',
  amber: '#F59E0B',
  red: '#EF4444',
};

interface DrawerMenuItem {
  icon: string;
  label: string;
  route: string;
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning');
    else if (hour < 17) setGreeting('Afternoon');
    else if (hour < 21) setGreeting('Evening');
    else setGreeting('Night');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSignOut = async () => {
    try {
      setDrawerOpen(false);
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const drawerMenuItems: DrawerMenuItem[] = [
    { icon: 'home', label: 'Home', route: '/(tabs)/home' },
    { icon: 'sparkles', label: 'NyayAI Assistant', route: '/(tabs)/chat' },
    { icon: 'people', label: 'Find Lawyers', route: '/lawyers' },
    { icon: 'document-text', label: 'Documents', route: '/(tabs)/documents' },
    { icon: 'folder', label: 'My Cases', route: '/(tabs)/cases' },
    { icon: 'book', label: 'Laws & Schemes', route: '/(tabs)/laws' },
    { icon: 'briefcase', label: 'Join as Lawyer', route: '/join-lawyer' },
    { icon: 'bookmark', label: 'Saved Items', route: '/(tabs)/laws' },
    { icon: 'settings', label: 'Settings', route: '/(settings)' },
    { icon: 'help-circle', label: 'Help & Support', route: '/(settings)/help-center' },
  ];

  const handleMenuItemPress = (route: string) => {
    setDrawerOpen(false);
    router.push(route as any);
  };

  const quickAccessItems = [
    { 
      icon: 'sparkles', 
      label: 'Nyay-Ai\nAssistant', 
      route: '/(tabs)/chat', 
      iconColor: '#FFD700',
      bgColor: '#FEF3C7',
    },
    { 
      icon: 'megaphone', 
      label: 'Legal\nConsultation', 
      route: '/lawyers', 
      iconColor: '#EF4444',
      bgColor: '#FEE2E2',
    },
    { 
      icon: 'document-text', 
      label: 'Notice\nDrafting', 
      route: '/(tabs)/documents', 
      iconColor: '#FF9933',
      bgColor: '#FFFFFF',
    },
    { 
      icon: 'briefcase', 
      label: 'Case\nTracker', 
      route: '/(tabs)/cases', 
      iconColor: '#8B4513',
      bgColor: '#FED7AA',
    },
    { 
      icon: 'book', 
      label: 'Laws &\nSchemes', 
      route: '/(tabs)/laws', 
      iconColor: '#3B82F6',
      bgColor: '#DBEAFE',
    },
  ];

  const categoryItems = [
    {
      title: 'Join as a\nLawyer',
      subtitle: 'Register to offer Legal...',
      icon: 'briefcase',
      iconColor: COLORS.purple,
      route: '/join-lawyer',
    },
    {
      title: 'Saved Items',
      subtitle: 'View and manage.....',
      icon: 'bookmark',
      iconColor: COLORS.amber,
      route: '/(tabs)/documents?tab=saved' as any,
    },
  ];

  const recentActivity = [
    {
      id: 'tenancy-laws',
      title: 'Tenancy Laws',
      subtitle: 'Tenant Rights and Responsibilities',
      description: 'Acts and the Model Tenancy Act\nwritten rental agreement, fair...\nnder state Rent\nts include a\nssession...',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200',
    },
  ];

  // Get top 3-4 lawyers for home screen
  const topLawyers = LAWYERS_DATA.filter(l => l.isAvailable).slice(0, 4);

  // Drawer Component
  const renderDrawer = () => (
    <Modal
      visible={drawerOpen}
      animationType="none"
      transparent={true}
      onRequestClose={() => setDrawerOpen(false)}
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity 
          style={styles.drawerBackdrop} 
          activeOpacity={1} 
          onPress={() => setDrawerOpen(false)}
        />
        <View style={styles.drawerContainer}>
          {/* Drawer Header */}
          <LinearGradient colors={[COLORS.headerBg, COLORS.headerBgLight]} style={styles.drawerHeader}>
            <View style={styles.drawerUserInfo}>
              <View style={styles.drawerAvatar}>
                <Ionicons name="person" size={32} color={COLORS.white} />
              </View>
              <View style={styles.drawerUserText}>
                <Text style={styles.drawerUserName}>Vaibhav</Text>
                <Text style={styles.drawerUserEmail}>vaibhav@email.com</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Drawer Menu Items */}
          <ScrollView style={styles.drawerMenu} showsVerticalScrollIndicator={false}>
            {drawerMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.drawerMenuItem}
                onPress={() => handleMenuItemPress(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name={item.icon as any} size={22} color={COLORS.textPrimary} />
                </View>
                <Text style={styles.drawerMenuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.drawerMenuItem, styles.drawerLogout]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <View style={[styles.drawerMenuIcon, { backgroundColor: COLORS.red + '15' }]}>
                <Ionicons name="log-out" size={22} color={COLORS.red} />
              </View>
              <Text style={[styles.drawerMenuLabel, { color: COLORS.red }]}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Drawer Footer */}
          <View style={styles.drawerFooter}>
            <Text style={styles.drawerFooterText}>SunoLegal v1.0.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      
      {/* Drawer */}
      {renderDrawer()}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setDrawerOpen(true)}>
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoRow}>
            <Image 
              source={require('../../assets/logo-transparent.png')} 
              style={styles.headerLogo} 
              resizeMode="contain"
            />
            <Text style={styles.greetingText}>{greeting}, Vaibhav 👋</Text>
          </View>
          <Text style={styles.welcomeText}>
            Welcome to <Text style={styles.brandText}>SunoLegal</Text>
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary} 
          />
        }
      >
        {/* Hero Banner */}
        <View style={styles.heroBannerContainer}>
          <View style={styles.heroBanner}>
            <View style={styles.heroBannerBg} />
            <LinearGradient
              colors={['rgba(30,31,59,0.9)', 'rgba(75,43,109,0.7)', 'rgba(139,90,43,0.5)', 'rgba(230,138,0,0.3)', 'rgba(255,153,51,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroOrangeGlow} />
            <View style={styles.heroPurpleGlow} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                NyayAI, Made Simple{`\n`}for <Text style={styles.heroTitleHindi}>भारत</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Your trusted AI assistant for laws, documents,{`\n`}and legal help in everyday language
              </Text>
              <TouchableOpacity 
                style={styles.heroButton} 
                onPress={() => router.push('/(tabs)/chat')} 
                activeOpacity={0.8}
              >
                <Text style={styles.heroButtonText}>Explore NyayAI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Access Section */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.quickAccessScroll}
          contentContainerStyle={styles.quickAccessContainer}
        >
          {quickAccessItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickAccessCard} 
              onPress={() => router.push(item.route as any)} 
              activeOpacity={0.85}
            >
              <View style={[
                styles.quickAccessIconContainer,
                { backgroundColor: item.bgColor }
              ]}>
                <Ionicons 
                  name={item.icon as any} 
                  size={28} 
                  color={item.iconColor} 
                />
              </View>
              <Text style={styles.quickAccessLabel}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Section */}
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categoryItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryCard} 
              onPress={() => router.push(item.route as any)} 
              activeOpacity={0.9}
            >
              <View style={styles.categoryCardHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: item.iconColor + '15' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
                </View>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {/* Explore More Card - partially visible */}
          <View style={styles.categoryCardPartial}>
            <View style={styles.categoryCardHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.blue + '15' }]}>
                <Ionicons name="compass" size={28} color={COLORS.blue} />
              </View>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Explore More</Text>
              <Text style={styles.categorySubtitle}>Discover...</Text>
            </View>
          </View>
        </ScrollView>

        {/* Recently Activity Section */}
        <View style={styles.recentActivityHeader}>
          <Text style={styles.sectionTitle}>Recently Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>New Notification</Text>
        </View>

        {recentActivity.map((activity, index) => (
          <TouchableOpacity 
            key={activity.id} 
            style={styles.activityCard} 
            onPress={() => router.push(`/law-detail/${activity.id}` as any)} 
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: activity.image }} 
              style={styles.activityImage} 
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              <Text style={styles.activityDescription} numberOfLines={4}>
                {activity.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Top / Available Lawyers Section */}
        <View style={styles.topLawyersHeader}>
          <Text style={styles.sectionTitle}>Top Lawyers</Text>
          <TouchableOpacity onPress={() => router.push('/lawyers')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {topLawyers.map((lawyer) => (
          <TouchableOpacity 
            key={lawyer.id} 
            style={styles.lawyerCard} 
            onPress={() => router.push({ pathname: '/lawyers', params: { lawyerId: lawyer.id } } as any)} 
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: lawyer.image }} 
              style={styles.lawyerImage} 
            />
            <View style={styles.lawyerContent}>
              <View style={styles.lawyerHeader}>
                <View style={styles.lawyerInfo}>
                  <Text style={styles.lawyerName}>{lawyer.name}</Text>
                  {lawyer.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                  )}
                </View>
                {lawyer.isAvailable && (
                  <View style={styles.availableBadge}>
                    <View style={styles.availableDot} />
                    <Text style={styles.availableText}>Available</Text>
                  </View>
                )}
              </View>
              <Text style={styles.lawyerSpecialization}>{lawyer.title}</Text>
              <View style={styles.lawyerMeta}>
                <View style={styles.lawyerMetaItem}>
                  <Ionicons name="star" size={14} color={COLORS.amber} />
                  <Text style={styles.lawyerMetaText}>{lawyer.rating} ({lawyer.reviewCount})</Text>
                </View>
                <View style={styles.lawyerMetaItem}>
                  <Ionicons name="briefcase" size={14} color={COLORS.textMuted} />
                  <Text style={styles.lawyerMetaText}>{lawyer.experience} yrs</Text>
                </View>
                <View style={styles.lawyerMetaItem}>
                  <Ionicons name="language" size={14} color={COLORS.textMuted} />
                  <Text style={styles.lawyerMetaText}>{lawyer.languages.join(', ')}</Text>
                </View>
              </View>
              <Text style={styles.lawyerPrice}>Starting from ₹{lawyer.packages[0].price}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity 
        style={styles.floatingAIButton} 
        onPress={() => router.push('/(tabs)/chat')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.floatingAIGradient}
        >
          <Ionicons name="sparkles" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.headerBg,
  },
  
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: COLORS.white,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  drawerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  drawerUserText: {},
  drawerUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  drawerUserEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: 8,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 12,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  drawerMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  drawerMenuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  drawerLogout: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingTop: 20,
  },
  drawerFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  drawerFooterText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  
  // Header Styles
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    backgroundColor: COLORS.headerBg,
  },
  menuButton: { 
    padding: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 12,
  },
  headerCenter: { 
    flex: 1, 
    marginLeft: 16,
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  greetingText: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.7)',
  },
  welcomeText: { 
    fontSize: 18, 
    color: COLORS.white, 
    fontWeight: '600',
  },
  brandText: { 
    color: COLORS.accent,
    fontWeight: '700',
  },
  headerActions: { 
    flexDirection: 'row', 
    gap: 8,
  },
  iconButton: { 
    padding: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 12, 
    position: 'relative',
  },
  badge: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: COLORS.red,
  },
  
  // Content
  content: { 
    flex: 1, 
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -4,
  },
  
  // Hero Banner
  heroBannerContainer: {
    padding: 20,
    paddingTop: 24,
  },
  heroBanner: { 
    borderRadius: 24, 
    overflow: 'hidden',
    minHeight: 200,
    position: 'relative',
  },
  heroBannerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#3D2B5A',
  },
  heroOrangeGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 153, 51, 0.6)',
  },
  heroPurpleGlow: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(107, 63, 160, 0.4)',
  },
  heroContent: { 
    padding: 24,
    zIndex: 1,
  },
  heroTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: COLORS.white, 
    marginBottom: 12, 
    lineHeight: 36,
  },
  heroTitleHindi: {
    color: COLORS.white,
  },
  heroSubtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.85)', 
    marginBottom: 20, 
    lineHeight: 22,
  },
  heroButton: { 
    backgroundColor: COLORS.headerBg, 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignSelf: 'flex-start',
  },
  heroButtonText: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: COLORS.white,
  },
  
  // Section Title
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    paddingHorizontal: 20, 
    marginTop: 8,
    marginBottom: 16,
  },
  
  // Quick Access
  quickAccessScroll: { 
    paddingLeft: 20,
  },
  quickAccessContainer: { 
    paddingRight: 20, 
    gap: 12,
  },
  quickAccessCard: { 
    width: 90, 
    alignItems: 'center', 
    padding: 12,
    paddingTop: 16,
    paddingBottom: 14,
    borderRadius: 20, 
    backgroundColor: COLORS.cardBg, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4,
  },
  quickAccessCardFeatured: { 
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  quickAccessIconContainer: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  quickAccessIconFeatured: { 
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  quickAccessLabel: { 
    fontSize: 11, 
    color: COLORS.textPrimary, 
    textAlign: 'center', 
    fontWeight: '600', 
    lineHeight: 14,
  },
  quickAccessLabelFeatured: { 
    color: COLORS.white,
  },
  
  // Category
  categoryScroll: {
    paddingLeft: 20,
  },
  categoryContainer: { 
    paddingRight: 20, 
    gap: 16,
  },
  categoryCard: { 
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg, 
    padding: 16, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    elevation: 4,
  },
  categoryCardPartial: {
    width: CARD_WIDTH * 0.5,
    backgroundColor: COLORS.cardBg, 
    padding: 16, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    elevation: 4,
    opacity: 0.6,
  },
  categoryCardHeader: {
    marginBottom: 12,
  },
  categoryIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  categoryInfo: { 
    marginBottom: 16,
  },
  categoryTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    marginBottom: 4, 
    lineHeight: 22,
  },
  categorySubtitle: { 
    fontSize: 13, 
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  categoryAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
  },
  categoryActionText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.success,
  },
  
  // Recent Activity
  recentActivityHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingRight: 20,
    marginTop: 24,
  },
  seeAllText: { 
    fontSize: 14, 
    color: COLORS.primary, 
    fontWeight: '600',
  },
  notificationBadge: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notificationText: { 
    fontSize: 13, 
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activityCard: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 12,
    backgroundColor: COLORS.cardBg, 
    borderRadius: 16, 
    padding: 14, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3,
  },
  activityImage: { 
    width: 90, 
    height: 100, 
    borderRadius: 12, 
    marginRight: 14,
  },
  activityImagePlaceholder: {
    width: 90, 
    height: 100, 
    borderRadius: 12, 
    marginRight: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: { 
    flex: 1,
    justifyContent: 'flex-start',
  },
  activityTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    marginBottom: 4,
  },
  activitySubtitle: { 
    fontSize: 13, 
    color: COLORS.success, 
    marginBottom: 6,
    fontWeight: '500',
  },
  activityDescription: { 
    fontSize: 12, 
    color: COLORS.textSecondary, 
    lineHeight: 16,
  },
  
  // Floating AI Button
  floatingAIButton: { 
    position: 'absolute', 
    bottom: 90, 
    right: 20, 
    shadowColor: COLORS.primary, 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 12, 
    elevation: 10,
  },
  floatingAIGradient: {
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  // Top Lawyers Section
  topLawyersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingRight: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  lawyerCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lawyerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 14,
  },
  lawyerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  lawyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  lawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  lawyerSpecialization: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  lawyerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  lawyerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lawyerMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  lawyerPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
