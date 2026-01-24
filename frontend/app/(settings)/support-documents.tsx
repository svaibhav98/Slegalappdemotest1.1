import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

const documents = [
  { name: 'Bar Council Certificate', type: 'PDF', size: '2.3 MB', date: 'Jan 15, 2025' },
  { name: 'ID Proof (Aadhar)', type: 'PDF', size: '1.1 MB', date: 'Jan 10, 2025' },
  { name: 'Address Proof', type: 'PDF', size: '890 KB', date: 'Jan 10, 2025' },
  { name: 'Professional Photo', type: 'JPG', size: '450 KB', date: 'Jan 8, 2025' },
];

export default function SupportDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.uploadCard}>
          <Ionicons name="cloud-upload" size={32} color={COLORS.primary} />
          <Text style={styles.uploadTitle}>Upload New Document</Text>
          <Text style={styles.uploadSubtitle}>PDF, JPG, PNG (Max 5MB)</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>UPLOADED DOCUMENTS</Text>
        <View style={styles.listCard}>
          {documents.map((doc, index) => (
            <View key={index} style={[styles.docItem, index !== documents.length - 1 && styles.docItemBorder]}>
              <View style={styles.docIcon}>
                <Ionicons name="document" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} • {doc.size} • {doc.date}</Text>
              </View>
              <TouchableOpacity><Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
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
  uploadCard: { backgroundColor: COLORS.primary + '10', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 8, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed' },
  uploadTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginTop: 12 },
  uploadSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 1, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  listCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  docItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  docIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1, marginLeft: 12 },
  docName: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  docMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
