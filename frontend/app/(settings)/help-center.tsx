import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

const helpItems = [
  { icon: 'chatbubbles', title: 'Chat with Support', desc: 'Get instant help from our team' },
  { icon: 'call', title: 'Call Us', desc: '+91 1800-XXX-XXXX' },
  { icon: 'mail', title: 'Email Support', desc: 'support@sunolegal.com' },
  { icon: 'book', title: 'FAQs', desc: 'Find answers to common questions' },
  { icon: 'videocam', title: 'Video Tutorials', desc: 'Learn how to use the app' },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>We're here to assist you 24/7</Text>
        </View>

        <View style={styles.listCard}>
          {helpItems.map((item, index) => (
            <TouchableOpacity key={index} style={[styles.helpItem, index !== helpItems.length - 1 && styles.helpItemBorder]}>
              <View style={styles.helpIcon}>
                <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.helpInfo}>
                <Text style={styles.helpTitle}>{item.title}</Text>
                <Text style={styles.helpDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  heroCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 8 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  heroSubtitle: { fontSize: 14, color: COLORS.white, opacity: 0.9, marginTop: 4 },
  listCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  helpItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  helpItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  helpIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  helpInfo: { flex: 1, marginLeft: 12 },
  helpTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  helpDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
