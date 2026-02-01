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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  NyayAIIcon, 
  LegalDocumentIcon, 
  BriefcaseIcon, 
  LawBookIcon, 
  ConsultationIcon,
  BookmarkIcon 
} from '../../components/icons/LegalIcons';
import { Colors, Spacing, Layout, Typography, Shadows } from '../../theme';

const { width } = Dimensions.get('window');

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
  const { user, signOut, isGuest } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning');
    else if (hour < 17) setGreeting('Afternoon');
    else if (hour < 21) setGreeting('Evening');
    else setGreeting('Night');
  }, []);

  // Check and show guest disclaimer popup
  useEffect(() => {
    const checkGuestDisclaimer = async () => {
      if (isGuest) {
        const disclaimerShown = await AsyncStorage.getItem('guest_disclaimer_shown');
        if (disclaimerShown !== 'true') {
          setShowDisclaimer(true);
          await AsyncStorage.setItem('guest_disclaimer_shown', 'true');
          // Auto-dismiss after 3 seconds
          setTimeout(() => {
            setShowDisclaimer(false);
          }, 3000);
        }
      }
    };
    checkGuestDisclaimer();
  }, [isGuest]);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };

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

// Quick Access Items with consistent icons
const quickAccessItems = [
  { icon: 'sparkles', label: 'NyayAI Assistant', route: '/(tabs)/chat', color: Colors.primary },
  { icon: 'document-text', label: 'Legal Documents', route: '/(tabs)/documents', color: Colors.secondary },
  { icon: 'briefcase', label: 'My Cases', route: '/(tabs)/cases', color: Colors.info },
  { icon: 'chatbubbles', label: 'Consult Lawyer', route: '/lawyers', color: Colors.warning },
];

  const categoryItems = [
    {
      id: 'join-lawyer',
      title: 'Join as a\nLawyer',
      subtitle: 'Register to offer Legal...',
      iconColor: COLORS.purple,
      route: '/join-lawyer',
    },
    {
      id: 'saved',
      title: 'Saved Items',
      subtitle: 'View and manage.....',
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

  // Dummy notifications data for MVP
  const notifications = [
    {
      id: '1',
      title: 'Document Ready',
      message: 'Your Rent Agreement draft is ready for review',
      time: '2 hours ago',
      icon: 'document-text',
      unread: true,
    },
    {
      id: '2',
      title: 'Lawyer Response',
      message: 'Adv. Priya Sharma has responded to your query',
      time: '5 hours ago',
      icon: 'chatbubbles',
      unread: true,
    },
    {
      id: '3',
      title: 'Case Update',
      message: 'New hearing date scheduled for your case',
      time: 'Yesterday',
      icon: 'briefcase',
      unread: false,
    },
    {
      id: '4',
      title: 'New Law Alert',
      message: 'Updates to tenant protection laws in your state',
      time: '2 days ago',
      icon: 'book',
      unread: false,
    },
  ];

  // Notifications Modal Component
  const renderNotifications = () => (
    <Modal
      visible={showNotifications}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowNotifications(false)}
    >
      <View style={styles.notificationsOverlay}>
        <TouchableOpacity 
          style={styles.notificationsBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowNotifications(false)}
        />
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <TouchableOpacity 
              style={styles.notificationsCloseBtn} 
              onPress={() => setShowNotifications(false)}
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
            {notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id} 
                style={[
                  styles.notificationItem,
                  notification.unread && styles.notificationItemUnread
                ]}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.notificationIconContainer,
                  notification.unread && styles.notificationIconUnread
                ]}>
                  <Ionicons 
                    name={notification.icon as any} 
                    size={18} 
                    color={notification.unread ? COLORS.primary : COLORS.textMuted} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationItemTitle,
                    notification.unread && styles.notificationItemTitleUnread
                  ]}>{notification.title}</Text>
                  <Text style={styles.notificationMessage} numberOfLines={1}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {notification.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.markAllReadBtn}>
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
      
      {/* Guest Disclaimer Popup */}
      <Modal
        visible={showDisclaimer}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseDisclaimer}
      >
        <View style={styles.disclaimerOverlay}>
          <View style={styles.disclaimerCard}>
            <TouchableOpacity 
              style={styles.disclaimerCloseBtn} 
              onPress={handleCloseDisclaimer}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerBody}>
              SunoLegal / NyayAI is an informational platform and not a law firm. We do not provide legal advice. Any guidance is general and for awareness only. For legal advice, consult a qualified advocate.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      {renderNotifications()}

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
            Welcome to <Text style={styles.brandOrange}>Suno</Text><Text style={styles.brandGreen}>Legal</Text>
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowNotifications(true)}
            data-testid="notification-bell-btn"
          >
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
        {/* Hero Banner - Professional with Original Content */}
        <View style={styles.heroBannerContainer}>
          <View style={styles.heroBanner}>
            <LinearGradient
              colors={['#2B2D42', '#6B3FA0', '#8B5A2B', '#E68A00', '#FF9933']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroGradientOverlay} />
            
            {/* Subtle Logo Watermark */}
            <View style={styles.logoWatermark}>
              <Image 
                source={require('../../assets/logo-transparent.png')} 
                style={styles.logoWatermarkImage}
                resizeMode="contain"
              />
            </View>
            
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
                activeOpacity={0.85}
              >
                <Text style={styles.heroButtonText}>Explore NyayAI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Access Section - Modern Design */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickAccessCard} 
                onPress={() => router.push(item.route as any)} 
                activeOpacity={0.7}
              >
                <View style={[
                  styles.quickAccessIconContainer,
                  { backgroundColor: item.color + '15' }
                ]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.quickAccessLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {categoryItems.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.categoryCard} 
                onPress={() => router.push(item.route as any)} 
                activeOpacity={0.9}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: item.iconColor + '15' }]}>
                    {item.id === 'join-lawyer' && <BriefcaseIcon size={28} color={item.iconColor} />}
                    {item.id === 'saved' && <BookmarkIcon size={28} color={item.iconColor} />}
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
        </View>

        {/* Recently Activity Section */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
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
        </View>

        {/* Top / Available Lawyers Section */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
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
        </View>

        <View style={{ height: 20 }} />
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
          <NyayAIIcon size={32} color="#FFFFFF" secondaryColor="#FFFFFF" />
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
  
  // Guest Disclaimer Popup
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  disclaimerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    paddingTop: 32,
    width: '100%',
    maxWidth: 340,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  disclaimerCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  disclaimerBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
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
    paddingTop: 20,
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
    paddingTop: 12, 
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
  brandOrange: { 
    color: '#FF9933',
    fontWeight: '700',
  },
  brandGreen: { 
    color: '#138808',
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
    paddingTop: 12,
  },
  
  // Unified Section Spacing System
  sectionWrapper: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  
  // Hero Banner - Clean & Professional
  heroBannerContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
  },
  heroBanner: { 
    borderRadius: Layout.borderRadius.lg, 
    overflow: 'hidden',
    minHeight: 180,
    position: 'relative',
    ...Shadows.lg,
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  logoWatermark: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    opacity: 0.15,
    zIndex: 0,
  },
  logoWatermarkImage: {
    width: 60,
    height: 60,
  },
  heroContent: { 
    padding: Spacing.xl,
    zIndex: 1,
  },
  heroTitle: { 
    ...Typography.displayMedium,
    color: Colors.textInverse,
    marginBottom: Spacing.md,
  },
  heroTitleHindi: {
    color: Colors.textInverse,
  },
  heroSubtitle: { 
    ...Typography.body,
    color: 'rgba(255,255,255,0.90)',
    marginBottom: Layout.sectionSpacing,
  },
  heroButton: { 
    backgroundColor: Colors.headerBg, 
    paddingVertical: 14, 
    paddingHorizontal: Spacing.xl, 
    borderRadius: Layout.borderRadius.md, 
    alignSelf: 'flex-start',
  },
  heroButtonText: { 
    ...Typography.label,
    color: Colors.textInverse,
  },
  
  // Section Title
  sectionTitle: { 
    ...Typography.h2,
    paddingHorizontal: Layout.screenPadding, 
    marginBottom: Spacing.md,
  },
  
  // Quick Access - Modern Grid
  quickAccessGrid: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.itemSpacing,
  },
  quickAccessCard: { 
    width: '47%',
    alignItems: 'center', 
    padding: Layout.cardPadding,
    borderRadius: Layout.borderRadius.lg, 
    backgroundColor: Colors.surface, 
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  quickAccessIconContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: Spacing.md,
  },
  quickAccessLabel: { 
    ...Typography.labelSmall,
    textAlign: 'center', 
    lineHeight: 16,
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
  seeAllText: { 
    fontSize: 14, 
    color: COLORS.primary, 
    fontWeight: '600',
  },
  notificationBadge: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  notificationText: { 
    fontSize: 13, 
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activityCard: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 10,
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

  // Top Lawyers Section - Modern Cards
  lawyerCard: {
    flexDirection: 'row',
    marginHorizontal: Layout.screenPadding,
    marginBottom: Layout.itemSpacing,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  lawyerImage: {
    width: 72,
    height: 72,
    borderRadius: Layout.borderRadius.md,
    marginRight: Spacing.md,
  },
  lawyerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  lawyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  lawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lawyerName: {
    ...Typography.h4,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.md,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: Spacing.xs,
  },
  availableText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.success,
  },
  lawyerSpecialization: {
    ...Typography.bodySmall,
    marginBottom: Spacing.xs,
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

  // Notifications Modal Styles
  notificationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  notificationsBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notificationsCloseBtn: {
    padding: 4,
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.primary + '08',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconUnread: {
    backgroundColor: COLORS.primary + '15',
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  notificationItemTitleUnread: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  markAllReadBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
