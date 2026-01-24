import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981', warning: '#F59E0B' };

const appointments = [
  { id: 1, client: 'Rahul Sharma', type: 'Video', date: 'Today', time: '2:00 PM', status: 'upcoming' },
  { id: 2, client: 'Priya Patel', type: 'Chat', date: 'Tomorrow', time: '10:30 AM', status: 'upcoming' },
  { id: 3, client: 'Amit Kumar', type: 'Voice', date: 'Jan 20', time: '4:00 PM', status: 'completed' },
  { id: 4, client: 'Sneha Reddy', type: 'Video', date: 'Jan 18', time: '11:00 AM', status: 'completed' },
];

export default function AppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getTypeIcon = (type: string) => {
    switch(type) { case 'Video': return 'videocam'; case 'Voice': return 'call'; default: return 'chatbubbles'; }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointments</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>UPCOMING</Text>
        {appointments.filter(a => a.status === 'upcoming').map((apt) => (
          <View key={apt.id} style={styles.aptCard}>
            <View style={styles.aptIcon}>
              <Ionicons name={getTypeIcon(apt.type) as any} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.aptInfo}>
              <Text style={styles.aptClient}>{apt.client}</Text>
              <Text style={styles.aptMeta}>{apt.type} • {apt.date} at {apt.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '15' }]}>
              <Text style={[styles.statusText, { color: COLORS.success }]}>Upcoming</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>PAST</Text>
        {appointments.filter(a => a.status === 'completed').map((apt) => (
          <View key={apt.id} style={[styles.aptCard, { opacity: 0.7 }]}>
            <View style={styles.aptIcon}>
              <Ionicons name={getTypeIcon(apt.type) as any} size={20} color={COLORS.textMuted} />
            </View>
            <View style={styles.aptInfo}>
              <Text style={styles.aptClient}>{apt.client}</Text>
              <Text style={styles.aptMeta}>{apt.type} • {apt.date} at {apt.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.textMuted + '15' }]}>
              <Text style={[styles.statusText, { color: COLORS.textMuted }]}>Completed</Text>
            </View>
          </View>
        ))}
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
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 1, marginTop: 20, marginBottom: 12, marginLeft: 4 },
  aptCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 10 },
  aptIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  aptInfo: { flex: 1, marginLeft: 12 },
  aptClient: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  aptMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
});
