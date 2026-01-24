import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

export default function ConsultationFeesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fees, setFees] = useState({ chat: '200', voice: '300', video: '500' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Fees</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Set your fees for different consultation types (per 10 min)</Text>
        
        <View style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
            <Text style={styles.feeTitle}>Chat Consultation</Text>
          </View>
          <View style={styles.feeInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput style={styles.feeInput} value={fees.chat} onChangeText={(t) => setFees({...fees, chat: t})} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <Ionicons name="call" size={24} color={COLORS.success} />
            <Text style={styles.feeTitle}>Voice Consultation</Text>
          </View>
          <View style={styles.feeInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput style={styles.feeInput} value={fees.voice} onChangeText={(t) => setFees({...fees, voice: t})} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <Ionicons name="videocam" size={24} color="#8B5CF6" />
            <Text style={styles.feeTitle}>Video Consultation</Text>
          </View>
          <View style={styles.feeInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput style={styles.feeInput} value={fees.video} onChangeText={(t) => setFees({...fees, video: t})} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Fees</Text>
        </TouchableOpacity>
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
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 8, marginBottom: 20 },
  feeCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16 },
  feeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  feeTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  feeInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, padding: 12 },
  currencySymbol: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginRight: 8 },
  feeInput: { flex: 1, fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
