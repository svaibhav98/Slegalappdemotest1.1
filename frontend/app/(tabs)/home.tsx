import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { QuickAccessCard, Card } from '../../components/CommonComponents';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logoSmall} resizeMode="contain" />
            <View>
              <Text style={styles.headerGreeting}>{greeting}</Text>
              <Text style={styles.headerName}>Welcome to SunoLegal</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}>
        <View style={styles.heroBanner}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>NyayAI Made Simple{"\n"}for भारत</Text>
              <Text style={styles.heroSubtitle}>Get instant legal guidance in plain language.{"\n"}Powered by AI, verified by lawyers.</Text>
              <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/chat')} activeOpacity={0.9}>
                <Text style={styles.heroButtonText}>Start Chat with NyayAI</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <QuickAccessCard icon="chatbubble-ellipses" title="NyayAI Chat" subtitle="Ask legal questions" color={Colors.primary} onPress={() => router.push('/(tabs)/chat')} />
          <QuickAccessCard icon="people" title="Find Lawyer" subtitle="Expert consultation" color={Colors.secondary} onPress={() => router.push('/lawyers')} />
          <QuickAccessCard icon="document-text" title="Documents" subtitle="Generate papers" color={Colors.info} onPress={() => router.push('/(tabs)/documents')} />
          <QuickAccessCard icon="folder" title="My Cases" subtitle="Track progress" color={Colors.success} onPress={() => router.push('/(tabs)/cases')} />
          <QuickAccessCard icon="book" title="Laws & Schemes" subtitle="Browse info" color={Colors.warning} onPress={() => router.push('/(tabs)/laws')} />
          <QuickAccessCard icon="information-circle" title="Help Center" subtitle="Get support" color={Colors.gray600} onPress={() => {}} />
        </View>

        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
            <LinearGradient colors={[Colors.secondary + '15', Colors.secondary + '05']} style={styles.serviceGradient}>
              <View style={styles.serviceIcon}>
                <Ionicons name="briefcase" size={28} color={Colors.secondary} />
              </View>
              <Text style={styles.serviceTitle}>Join as Lawyer</Text>
              <Text style={styles.serviceSubtitle}>Offer legal services</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
            <LinearGradient colors={[Colors.warning + '15', Colors.warning + '05']} style={styles.serviceGradient}>
              <View style={styles.serviceIcon}>
                <Ionicons name="bookmark" size={28} color={Colors.warning} />
              </View>
              <Text style={styles.serviceTitle}>Saved Items</Text>
              <Text style={styles.serviceSubtitle}>Chats & documents</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card>
          <View style={styles.activityItem}>
            <View style={styles.activityIconWrapper}>
              <LinearGradient colors={[Colors.info + '20', Colors.info + '10']} style={styles.activityIconGradient}>
                <Ionicons name="book-outline" size={20} color={Colors.info} />
              </LinearGradient>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Consumer Protection Act</Text>
              <Text style={styles.activitySubtitle}>Viewed 2 hours ago</Text>
              <Text style={styles.activityDescription} numberOfLines={2}>Learn about your rights as a consumer under Indian law...</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <Ionicons name="flask" size={14} color={Colors.warning} />
            <Text style={styles.footerText}>Demo Mode Active</Text>
          </View>
          <Text style={styles.footerSubtext}>Firebase credentials pending</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoSmall: { width: 48, height: 48, marginRight: 12, borderRadius: 24, backgroundColor: '#FFFFFF' },
  headerGreeting: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, fontWeight: '500' },
  headerName: { fontSize: 18, color: '#FFFFFF', fontWeight: '700', marginTop: 2 },
  signOutButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { flex: 1 },
  heroBanner: { margin: 20, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  heroGradient: { padding: 28, minHeight: 200 },
  heroContent: { alignItems: 'flex-start' },
  heroIconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 12, lineHeight: 34, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.95, marginBottom: 24, lineHeight: 22 },
  heroButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  heroButtonText: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginRight: 8, letterSpacing: -0.3 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginTop: 32, marginBottom: 16, letterSpacing: -0.5 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12 },
  servicesGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  serviceCard: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  serviceGradient: { padding: 20, alignItems: 'center', minHeight: 140 },
  serviceIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4, textAlign: 'center' },
  serviceSubtitle: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start' },
  activityIconWrapper: { marginRight: 12 },
  activityIconGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  activitySubtitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  activityDescription: { fontSize: 13, color: Colors.text, lineHeight: 19, opacity: 0.7 },
  footer: { padding: 32, alignItems: 'center' },
  footerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warning + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 8 },
  footerText: { fontSize: 12, color: Colors.warning, fontWeight: '600', marginLeft: 6 },
  footerSubtext: { fontSize: 11, color: Colors.textSecondary },
});
