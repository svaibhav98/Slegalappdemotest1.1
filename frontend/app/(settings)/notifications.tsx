import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981', danger: '#EF4444', warning: '#F59E0B' };

const notifications = [
  { id: 1, title: 'New Consultation Request', message: 'You have a new booking for tomorrow at 10:00 AM', time: '2 min ago', unread: true },
  { id: 2, title: 'Payment Received', message: '₹500 credited to your account for consultation', time: '1 hour ago', unread: true },
  { id: 3, title: 'Document Verified', message: 'Your Bar Council certificate has been verified', time: '2 hours ago', unread: false },
  { id: 4, title: 'Reminder', message: 'You have a consultation scheduled in 30 minutes', time: 'Yesterday', unread: false },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity><Text style={styles.markAllRead}>Mark all read</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <TouchableOpacity key={notif.id} style={[styles.notifCard, notif.unread && styles.notifCardUnread]}>
            <View style={[styles.notifDot, notif.unread && styles.notifDotActive]} />
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifMessage}>{notif.message}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </TouchableOpacity>
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
  markAllRead: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  content: { flex: 1, paddingHorizontal: 16 },
  notifCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginTop: 12, alignItems: 'flex-start' },
  notifCardUnread: { backgroundColor: COLORS.primary + '08' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginRight: 12, marginTop: 6 },
  notifDotActive: { backgroundColor: COLORS.primary },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  notifMessage: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 6 },
  notifTime: { fontSize: 12, color: COLORS.textMuted },
});
