import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerById, Lawyer, LawyerPackage } from '../services/lawyersData';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
};

export default function ScheduleBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lawyerId, packageId } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<LawyerPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedReminder, setSelectedReminder] = useState<number>(15);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) {
      setLawyer(lawyerData);
      const pkg = lawyerData.packages.find(p => p.id === packageId);
      setSelectedPackage(pkg || null);
      // Do not auto-select first date - user must explicitly choose
    }
  }, [lawyerId, packageId]);

  const handleBack = () => router.back();

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const scheduledDateTime = `${selectedDate}T${convertTo24Hour(selectedTime)}`;
    router.push({
      pathname: '/booking-summary',
      params: { 
        lawyerId: lawyerId as string,
        packageId: packageId as string,
        mode: 'scheduled',
        scheduledDateTime,
      }
    });
  };

  const convertTo24Hour = (time: string) => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const reminderOptions = [5, 10, 15, 30, 60];

  if (!lawyer || !selectedPackage) return null;

  const selectedDateSlots = lawyer.availableSlots.find(d => d.date === selectedDate)?.slots || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Meeting</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateRow}>
                {lawyer.availableSlots.slice(0, 7).map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[styles.dateCard, selectedDate === day.date && styles.dateCardSelected]}
                    onPress={() => { setSelectedDate(day.date); setSelectedTime(''); }}
                  >
                    <Text style={[styles.dateDayName, selectedDate === day.date && styles.dateTextSelected]}>{getDayName(day.date)}</Text>
                    <Text style={[styles.dateDay, selectedDate === day.date && styles.dateTextSelected]}>{new Date(day.date).getDate()}</Text>
                    <Text style={[styles.dateMonth, selectedDate === day.date && styles.dateTextSelected]}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Time Slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            <View style={styles.timeGrid}>
              {selectedDateSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.timeSlotDisabled,
                    selectedTime === slot.time && styles.timeSlotSelected
                  ]}
                  onPress={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                >
                  <Text style={[
                    styles.timeText,
                    !slot.available && styles.timeTextDisabled,
                    selectedTime === slot.time && styles.timeTextSelected
                  ]}>{slot.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reminder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remind me before</Text>
            <View style={styles.reminderRow}>
              {reminderOptions.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[styles.reminderChip, selectedReminder === mins && styles.reminderChipSelected]}
                  onPress={() => setSelectedReminder(mins)}
                >
                  <Text style={[styles.reminderText, selectedReminder === mins && styles.reminderTextSelected]}>
                    {mins >= 60 ? `${mins / 60} hr` : `${mins} min`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, (!selectedDate || !selectedTime) && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            <Text style={styles.confirmButtonText}>Confirm Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  headerSpacer: { width: 44 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateCard: { width: 70, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  dateCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDayName: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  dateDay: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  dateMonth: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  dateTextSelected: { color: COLORS.white },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  timeSlotDisabled: { backgroundColor: COLORS.background, opacity: 0.5 },
  timeSlotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  timeTextDisabled: { color: COLORS.textMuted },
  timeTextSelected: { color: COLORS.white },
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reminderChip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  reminderChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  reminderText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  reminderTextSelected: { color: COLORS.white },
  bottomContainer: { padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  confirmButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});