import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  pending: '#3B82F6',
};

const verificationItems = [
  { label: 'ID Proof', status: 'verified', icon: 'id-card' },
  { label: 'Bar Council Certificate', status: 'pending', icon: 'ribbon' },
  { label: 'Address Proof', status: 'verified', icon: 'location' },
  { label: 'Professional Photo', status: 'under_review', icon: 'camera' },
  { label: 'Educational Certificates', status: 'pending', icon: 'school' },
];

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified': return { color: COLORS.success, label: 'Verified', icon: 'checkmark-circle' };
      case 'under_review': return { color: COLORS.warning, label: 'Under Review', icon: 'time' };
      default: return { color: COLORS.pending, label: 'Pending', icon: 'ellipse-outline' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20' }]}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.statusTitle}>Under Review</Text>
          <Text style={styles.statusDesc}>Your verification is being processed. This usually takes 2-3 business days.</Text>
        </View>

        <Text style={styles.sectionTitle}>VERIFICATION CHECKLIST</Text>
        <View style={styles.listCard}>
          {verificationItems.map((item, index) => {
            const config = getStatusConfig(item.status);
            return (
              <View key={index} style={[styles.listItem, index !== verificationItems.length - 1 && styles.listItemBorder]}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemIcon}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: config.color + '15' }]}>
                  <Ionicons name={config.icon as any} size={14} color={config.color} />
                  <Text style={[styles.statusPillText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="cloud-upload" size={20} color={COLORS.white} />
          <Text style={styles.uploadBtnText}>Upload Missing Documents</Text>
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
  statusCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 16 },
  statusBadge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statusTitle: { fontSize: 20, fontWeight: '700', color: COLORS.warning, marginBottom: 8 },
  statusDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 1, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  listCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
  statusPillText: { fontSize: 12, fontWeight: '600' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, marginTop: 24 },
  uploadBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
