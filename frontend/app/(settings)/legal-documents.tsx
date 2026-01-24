import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

const documents = [
  { name: 'Service Agreement', type: 'PDF', desc: 'Terms of service for lawyers' },
  { name: 'Non-Disclosure Agreement', type: 'PDF', desc: 'Client confidentiality terms' },
  { name: 'Payment Terms', type: 'PDF', desc: 'Fee structure and payments' },
  { name: 'Code of Conduct', type: 'PDF', desc: 'Professional conduct guidelines' },
];

export default function LegalDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Important documents for your reference</Text>
        
        <View style={styles.listCard}>
          {documents.map((doc, index) => (
            <TouchableOpacity key={index} style={[styles.docItem, index !== documents.length - 1 && styles.docItemBorder]}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docDesc}>{doc.desc}</Text>
              </View>
              <View style={styles.downloadBtn}>
                <Ionicons name="download" size={18} color={COLORS.primary} />
              </View>
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
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 8, marginBottom: 20 },
  listCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  docItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  docIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1, marginLeft: 12 },
  docName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  docDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  downloadBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
});
