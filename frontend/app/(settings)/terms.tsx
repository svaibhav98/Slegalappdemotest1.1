import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB' };

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Policies</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>By accessing and using SunoLegal, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</Text>
          
          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.paragraph}>SunoLegal provides a platform connecting users with legal professionals. We do not provide legal advice directly. All advice comes from registered lawyers on our platform.</Text>
          
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.paragraph}>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</Text>
          
          <Text style={styles.sectionTitle}>4. Payment Terms</Text>
          <Text style={styles.paragraph}>All payments for consultations are processed through our secure payment gateway. Refunds are subject to our refund policy and may be requested within 24 hours of a consultation.</Text>
          
          <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.paragraph}>SunoLegal shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</Text>
          
          <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
          <Text style={styles.paragraph}>We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new terms on this page.</Text>
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
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginTop: 8 },
  lastUpdated: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 20, marginBottom: 8 },
  paragraph: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});
