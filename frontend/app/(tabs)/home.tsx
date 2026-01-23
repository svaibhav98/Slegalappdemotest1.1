import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else if (hour < 21) setGreeting('Good Evening');
    else setGreeting('Good Night');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const quickAccessItems = [
    { icon: 'chatbubble-ellipses', label: 'Nyay-AI\nAssistant', route: '/(tabs)/chat', color: Colors.primary },
    { icon: 'people', label: 'Legal\nConsultat\nion', route: '/lawyers', color: Colors.error },
    { icon: 'document-text', label: 'Notice\nDrafting', route: '/(tabs)/documents', color: Colors.warning, featured: true },
    { icon: 'folder-open', label: 'Case\nTracker', route: '/(tabs)/cases', color: Colors.error },
    { icon: 'book', label: 'Laws &\nSchemes', route: '/(tabs)/laws', color: Colors.info },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.greetingText}>{greeting}, Vaibhav 👋</Text>
          <Text style={styles.welcomeText}>Welcome to <Text style={styles.brandText}>SunoLegal</Text></Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={22} color={Colors.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
            <Ionicons name="person-circle-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}>
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>NyayAI, Made Simple{"\n"}for भारत</Text>
            <Text style={styles.heroSubtitle}>Your trusted AI assistant for laws, documents,{"\n"}and legal help in everyday language.</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/chat')} activeOpacity={0.8}>
              <Text style={styles.heroButtonText}>Explore NyayAI</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAccessScroll} contentContainerStyle={styles.quickAccessContainer}>
          {quickAccessItems.map((item, index) => (
            <TouchableOpacity key={index} style={[styles.quickAccessCard, item.featured && styles.quickAccessCardFeatured]} onPress={() => router.push(item.route as any)} activeOpacity={0.85}>
              <View style={[styles.quickAccessIcon, item.featured && styles.quickAccessIconFeatured]}>
                <Ionicons name={item.icon as any} size={28} color={item.featured ? '#FFFFFF' : item.color} />
              </View>
              <Text style={[styles.quickAccessLabel, item.featured && styles.quickAccessLabelFeatured]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/join-lawyer')} activeOpacity={0.9}>
            <View style={styles.categoryIcon}>
              <Ionicons name="briefcase" size={32} color={Colors.primary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Join as a{"\n"}Lawyer</Text>
              <Text style={styles.categorySubtitle}>Register to offer Legal...</Text>
            </View>
            <TouchableOpacity style={styles.categoryAction}>
              <Text style={styles.categoryActionText}>Go to Schemes</Text>
              <Ionicons name="arrow-forward-circle" size={20} color={Colors.success} />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard} activeOpacity={0.9}>
            <View style={styles.categoryIcon}>
              <Ionicons name="bookmark" size={32} color={Colors.warning} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Saved Items</Text>
              <Text style={styles.categorySubtitle}>View and manage.....</Text>
            </View>
            <TouchableOpacity style={styles.categoryAction}>
              <Text style={styles.categoryActionText}>Contact Us</Text>
              <Ionicons name="arrow-forward-circle" size={20} color={Colors.success} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.recentActivityHeader}>
          <Text style={styles.sectionTitle}>Recently Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityNotification}>
          <Text style={styles.notificationText}>New Notification</Text>
        </View>
        <TouchableOpacity style={styles.activityCard} onPress={() => router.push('/law-detail/tenancy')} activeOpacity={0.9}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200' }} style={styles.activityImage} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Tenancy Laws</Text>
            <Text style={styles.activitySubtitle}>Rights and Responsibilities</Text>
            <Text style={styles.activityDescription} numberOfLines={2}>Tenants in India are protected under state Rent Acts and the Model Tenancy A...</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.floatingAIButton} onPress={() => router.push('/(tabs)/chat')}>
        <Ionicons name="sparkles" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2D42' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#2B2D42' },
  menuButton: { padding: 8, borderWidth: 1, borderColor: '#4A4D6A', borderRadius: 12 },
  headerCenter: { flex: 1, marginLeft: 12 },
  greetingText: { fontSize: 14, color: '#A8A8B3', marginBottom: 2 },
  welcomeText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  brandText: { color: Colors.primary },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8, borderWidth: 1, borderColor: '#4A4D6A', borderRadius: 12, position: 'relative' },
  badge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  content: { flex: 1, backgroundColor: Colors.background },
  heroBanner: { margin: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.primary, height: 200, justifyContent: 'center' },
  heroContent: { padding: 24 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, lineHeight: 32 },
  heroSubtitle: { fontSize: 13, color: '#FFFFFF', opacity: 0.9, marginBottom: 16, lineHeight: 18 },
  heroButton: { backgroundColor: '#2B2D42', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  heroButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  quickAccessScroll: { paddingLeft: 20 },
  quickAccessContainer: { paddingRight: 20, gap: 12 },
  quickAccessCard: { width: 100, alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  quickAccessCardFeatured: { backgroundColor: Colors.warning, transform: [{ scale: 1.08 }], shadowColor: Colors.warning, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  quickAccessIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickAccessIconFeatured: { backgroundColor: 'rgba(255,255,255,0.25)' },
  quickAccessLabel: { fontSize: 11, color: Colors.text, textAlign: 'center', fontWeight: '600', lineHeight: 14 },
  quickAccessLabelFeatured: { color: '#FFFFFF' },
  categoryContainer: { paddingHorizontal: 20, gap: 12 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  categoryIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4, lineHeight: 18 },
  categorySubtitle: { fontSize: 12, color: Colors.textSecondary },
  categoryAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryActionText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  recentActivityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24 },
  seeAllText: { fontSize: 14, color: Colors.warning, fontWeight: '600' },
  activityNotification: { paddingHorizontal: 20, marginBottom: 12 },
  notificationText: { fontSize: 13, color: Colors.textSecondary },
  activityCard: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  activityImage: { width: 80, height: 80, borderRadius: 12, marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  activitySubtitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  activityDescription: { fontSize: 12, color: Colors.text, lineHeight: 16, opacity: 0.7 },
  floatingAIButton: { position: 'absolute', bottom: 80, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.warning, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
