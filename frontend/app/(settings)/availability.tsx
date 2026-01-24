import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [availability, setAvailability] = useState<Record<string, boolean>>({ Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false });

  const toggleDay = (day: string) => {
    setAvailability(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Set your available days for consultations</Text>
        <View style={styles.listCard}>
          {days.map((day, index) => (
            <View key={index} style={[styles.listItem, index !== days.length - 1 && styles.listItemBorder]}>
              <Text style={styles.listItemText}>{day}</Text>
              <Switch value={availability[day]} onValueChange={() => toggleDay(day)} trackColor={{ true: COLORS.primary, false: COLORS.border }} thumbColor={COLORS.white} />
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>Working hours: 9:00 AM - 6:00 PM</Text>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Availability</Text>
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
  listCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  listItemText: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primary + '15', borderRadius: 12, padding: 16, marginTop: 20 },
  infoText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
