import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  getCaseById, 
  addReminder, 
  getSuggestedReminders,
  REMINDER_TYPES,
  Case 
} from '../services/casesData';

// Design System Colors
const COLORS = {
  headerBg: '#1A1A2E',
  primary: '#FF9933',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  background: '#F5F7FA',
  inputBg: '#F9FAFB',
  success: '#10B981',
};

export default function AddReminderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId as string;
  
  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    repeat: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    type: 'hearing' as 'hearing' | 'follow-up' | 'document' | 'custom',
    notes: '',
    notificationEnabled: true,
  });
  const [suggestedReminders, setSuggestedReminders] = useState<{ type: string; days: number; label: string }[]>([]);

  useEffect(() => {
    if (caseId) {
      const foundCase = getCaseById(caseId);
      if (foundCase) {
        setCaseItem(foundCase);
        setSuggestedReminders(getSuggestedReminders(foundCase.caseType));
      }
    }
  }, [caseId]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    if (!formData.date) {
      Alert.alert('Validation Error', 'Please select a date for the reminder.');
      return;
    }

    const dateTime = `${formData.date}T${formData.time || '09:00'}:00`;
    
    addReminder(caseId, {
      dateTime,
      repeat: formData.repeat,
      type: formData.type,
      notes: formData.notes,
      notificationEnabled: formData.notificationEnabled,
    });

    Alert.alert(
      'Reminder Added',
      'Your reminder has been set successfully.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleSuggestedReminder = (suggestion: { type: string; days: number; label: string }) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + suggestion.days);
    
    setFormData({
      ...formData,
      date: futureDate.toISOString().split('T')[0],
      type: suggestion.type as any,
      notes: suggestion.label,
    });
  };

  const repeatOptions = [
    { id: 'none', label: 'Do not repeat' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Add Reminder</Text>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Case Info */}
          {caseItem && (
            <View style={styles.caseInfo}>
              <Text style={styles.caseInfoLabel}>Reminder for:</Text>
              <Text style={styles.caseInfoTitle} numberOfLines={2}>{caseItem.title}</Text>
              <Text style={styles.caseInfoId}>Case ID: {caseItem.caseNumber}</Text>
            </View>
          )}

          {/* Suggested Reminders */}
          {suggestedReminders.length > 0 && (
            <View style={styles.suggestedSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} /> Suggested Reminders
              </Text>
              <View style={styles.suggestedCards}>
                {suggestedReminders.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestedCard}
                    onPress={() => handleSuggestedReminder(suggestion)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestedLabel}>{suggestion.label}</Text>
                    <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Date & Time */}
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Date & Time</Text>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (e.g., 09:00)"
                placeholderTextColor={COLORS.textMuted}
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
              />
            </View>
          </View>

          {/* Repeat */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Repeat</Text>
            <View style={styles.repeatOptions}>
              {repeatOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.repeatOption,
                    formData.repeat === option.id && styles.repeatOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, repeat: option.id as any })}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.repeatOptionText,
                    formData.repeat === option.id && styles.repeatOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reminder Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder Type</Text>
            <View style={styles.typeOptions}>
              {REMINDER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    formData.type === type.id && styles.typeOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.id as any })}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={20} 
                    color={formData.type === type.id ? COLORS.white : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    formData.type === type.id && styles.typeOptionTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Push Notification Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications" size={22} color={COLORS.primary} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Push Notification</Text>
                <Text style={styles.toggleDescription}>
                  Receive a notification at the scheduled time
                </Text>
              </View>
            </View>
            <Switch
              value={formData.notificationEnabled}
              onValueChange={(value) => setFormData({ ...formData, notificationEnabled: value })}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={formData.notificationEnabled ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes for this reminder..."
              placeholderTextColor={COLORS.textMuted}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSave}
            activeOpacity={0.9}
          >
            <Ionicons name="notifications" size={22} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Set Reminder</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.headerBg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.headerBg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 24,
  },

  // Case Info
  caseInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  caseInfoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  caseInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  caseInfoId: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Suggested Section
  suggestedSection: {
    marginBottom: 24,
  },
  suggestedCards: {
    gap: 10,
    marginTop: 12,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  suggestedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },

  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },

  // Repeat Options
  repeatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  repeatOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  repeatOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  repeatOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  repeatOptionTextActive: {
    color: COLORS.white,
  },

  // Type Options
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  typeOptionTextActive: {
    color: COLORS.white,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  toggleDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 10,
  },
});
