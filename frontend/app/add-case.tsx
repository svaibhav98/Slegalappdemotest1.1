import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addCase, CASE_TYPES, CaseType, CaseStatus } from '../services/casesData';

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
  ongoing: '#10B981',
  closed: '#EF4444',
  upcoming: '#F59E0B',
};

export default function AddCaseScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    caseType: '' as CaseType | '',
    caseNumber: '',
    court: '',
    city: '',
    petitioner: '',
    respondent: '',
    filingDate: '',
    nextHearingDate: '',
    status: 'upcoming' as CaseStatus,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCaseTypePicker, setShowCaseTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Case title is required';
    }
    if (!formData.caseType) {
      newErrors.caseType = 'Case type is required';
    }
    if (!formData.court.trim()) {
      newErrors.court = 'Court/Authority is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.petitioner.trim()) {
      newErrors.petitioner = 'Petitioner is required';
    }
    if (!formData.respondent.trim()) {
      newErrors.respondent = 'Respondent is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const newCase = addCase({
      userId: 'user-1',
      title: formData.title,
      caseType: formData.caseType as CaseType,
      caseNumber: formData.caseNumber || `CASE/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      court: formData.court,
      city: formData.city,
      petitioner: formData.petitioner,
      respondent: formData.respondent,
      filingDate: formData.filingDate || new Date().toISOString().split('T')[0],
      nextHearingDate: formData.nextHearingDate,
      lastActivityDate: new Date().toISOString().split('T')[0],
      status: formData.status,
      notes: formData.notes,
    });

    Alert.alert(
      'Case Added Successfully',
      `Your case "${newCase.title}" has been created.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'ongoing': return COLORS.ongoing;
      case 'closed': return COLORS.closed;
      case 'upcoming': return COLORS.upcoming;
      default: return COLORS.textMuted;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Add New Case</Text>
          
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Case Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Enter case title"
              placeholderTextColor={COLORS.textMuted}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Case Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Type *</Text>
            <TouchableOpacity 
              style={[styles.dropdown, errors.caseType && styles.inputError]}
              onPress={() => setShowCaseTypePicker(!showCaseTypePicker)}
            >
              <Text style={formData.caseType ? styles.dropdownText : styles.dropdownPlaceholder}>
                {formData.caseType || 'Select case type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            {showCaseTypePicker && (
              <View style={styles.pickerOptions}>
                {CASE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.pickerOption}
                    onPress={() => {
                      setFormData({ ...formData, caseType: type });
                      setShowCaseTypePicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.caseType && <Text style={styles.errorText}>{errors.caseType}</Text>}
          </View>

          {/* Case Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., RTI/2025/1234"
              placeholderTextColor={COLORS.textMuted}
              value={formData.caseNumber}
              onChangeText={(text) => setFormData({ ...formData, caseNumber: text })}
            />
          </View>

          {/* Court & City Row */}
          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Court/Authority *</Text>
              <TextInput
                style={[styles.input, errors.court && styles.inputError]}
                placeholder="e.g., High Court"
                placeholderTextColor={COLORS.textMuted}
                value={formData.court}
                onChangeText={(text) => setFormData({ ...formData, court: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="e.g., Delhi"
                placeholderTextColor={COLORS.textMuted}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>
          </View>

          {/* Parties */}
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Parties Involved</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Petitioner / Applicant *</Text>
            <TextInput
              style={[styles.input, errors.petitioner && styles.inputError]}
              placeholder="Enter petitioner name"
              placeholderTextColor={COLORS.textMuted}
              value={formData.petitioner}
              onChangeText={(text) => setFormData({ ...formData, petitioner: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Respondent / Opposite Party *</Text>
            <TextInput
              style={[styles.input, errors.respondent && styles.inputError]}
              placeholder="Enter respondent name"
              placeholderTextColor={COLORS.textMuted}
              value={formData.respondent}
              onChangeText={(text) => setFormData({ ...formData, respondent: text })}
            />
          </View>

          {/* Important Dates */}
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Important Dates</Text>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Filing Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
                value={formData.filingDate}
                onChangeText={(text) => setFormData({ ...formData, filingDate: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Next Hearing</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
                value={formData.nextHearingDate}
                onChangeText={(text) => setFormData({ ...formData, nextHearingDate: text })}
              />
            </View>
          </View>

          {/* Initial Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Initial Status</Text>
            <View style={styles.statusOptions}>
              {(['upcoming', 'ongoing', 'closed'] as CaseStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && { 
                      backgroundColor: getStatusColor(status),
                      borderColor: getStatusColor(status)
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, status })}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status && { color: COLORS.white }
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this case..."
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
            <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Save Case</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
  inputError: {
    borderColor: COLORS.closed,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.closed,
    marginTop: 6,
  },

  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  pickerOptions: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Status Options
  statusOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
