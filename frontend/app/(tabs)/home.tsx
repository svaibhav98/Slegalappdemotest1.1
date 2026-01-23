import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Header, QuickAccessCard, Card } from '../../components/CommonComponents';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';

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
    // Simulate refresh
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

  return (
    <View style={styles.container}>
      <Header
        title={`${greeting}, User`}
        subtitle="Welcome to SunoLegal"
        rightAction={
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        <View style={styles.heroBanner}>
          <View style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconLarge}>
                <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.heroTitle}>NyayAI Made Simple{'\n'}for भारत</Text>
              <Text style={styles.heroSubtitle}>Your trusted AI assistant for laws, documents,{'\n'}and legal help in everyday language</Text>
              <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/chat')}>
                <Text style={styles.heroButtonText}>Explore NyayAI</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.heroIllustration}>
              <Ionicons name="document-text-outline" size={80} color={Colors.primary + '40'} style={styles.floatingIcon1} />
              <Ionicons name="chatbubbles-outline" size={60} color={Colors.secondary + '40'} style={styles.floatingIcon2} />
              <Ionicons name="people-outline" size={70} color={Colors.warning + '40'} style={styles.floatingIcon3} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <QuickAccessCard
            icon="chatbubble-ellipses"
            title="NyayAI Assistant"
            subtitle="Ask legal questions"
            color={Colors.primary}
            onPress={() => router.push('/(tabs)/chat')}
          />
          <QuickAccessCard
            icon="people"
            title="Legal Consultation"
            subtitle="Talk to lawyers"
            color={Colors.secondary}
            onPress={() => router.push('/lawyers')}
          />
          <QuickAccessCard
            icon="document-text"
            title="Notice Drafting"
            subtitle="Create documents"
            color={Colors.info}
            onPress={() => router.push('/(tabs)/documents')}
          />
          <QuickAccessCard
            icon="folder"
            title="Case Tracker"
            subtitle="Manage your cases"
            color={Colors.success}
            onPress={() => router.push('/(tabs)/cases')}
          />
          <QuickAccessCard
            icon="book"
            title="Laws & Schemes"
            subtitle="Browse information"
            color={Colors.warning}
            onPress={() => router.push('/(tabs)/laws')}
          />
          <QuickAccessCard
            icon="shield-checkmark"
            title="Contact Us"
            subtitle="Get help & support"
            color={Colors.gray600}
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryList}>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="hammer" size={32} color={Colors.primary} />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Join as a Lawyer</Text>
              <Text style={styles.categorySubtitle}>Register to offer Legal Services</Text>
            </View>
            <TouchableOpacity style={styles.categoryAction}>
              <Text style={styles.categoryActionText}>Go to Schemes</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.success} />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="bookmark" size={32} color={Colors.warning} />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Saved Items</Text>
              <Text style={styles.categorySubtitle}>View and manage saved chats, docs</Text>
            </View>
            <TouchableOpacity style={styles.categoryAction}>
              <Text style={styles.categoryActionText}>Contact Us</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.success} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recently Activity</Text>
        <Card>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="book-outline" size={20} color={Colors.info} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Tenancy Laws</Text>
              <Text style={styles.activitySubtitle}>Rights and Responsibilities</Text>
              <Text style={styles.activityTime}>Tenants in India are protected under state Rent Control Acts...</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🧪 Running in Mock Mode</Text>
          <Text style={styles.footerSubtext}>Firebase credentials not configured</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  signOutButton: { padding: 8 },
  heroBanner: { margin: 20, marginTop: 0, borderRadius: 24, overflow: 'hidden', backgroundColor: Colors.primary },
  heroGradient: { padding: 32, paddingBottom: 160, position: 'relative' },
  heroContent: { zIndex: 2 },
  heroIconLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, lineHeight: 34 },
  heroSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.95, marginBottom: 24, lineHeight: 22 },
  heroButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, alignSelf: 'flex-start' },
  heroButtonText: { fontSize: 16, fontWeight: '600', color: Colors.primary, marginRight: 8 },
  heroIllustration: { position: 'absolute', right: -20, bottom: 20, opacity: 0.15 },
  floatingIcon1: { position: 'absolute', right: 40, top: 20 },
  floatingIcon2: { position: 'absolute', right: 100, bottom: 80 },
  floatingIcon3: { position: 'absolute', right: 10, bottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  categoryList: { paddingHorizontal: 20 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  categoryInfo: { flex: 1, marginLeft: 12 },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  categorySubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  categoryAction: { flexDirection: 'row', alignItems: 'center' },
  categoryActionText: { fontSize: 12, fontWeight: '600', color: Colors.success, marginRight: 4 },
  activityItem: { flexDirection: 'row' },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.info + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  activitySubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  activityTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  footer: { padding: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: Colors.warning, fontWeight: '600' },
  footerSubtext: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
});
