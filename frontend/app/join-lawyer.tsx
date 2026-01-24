import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

// Design System Colors matching the reference
const COLORS = {
  headerBg: '#2C2E3E',
  white: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#AAAAAA',
  textMuted: '#888888',
  surface: '#F5F7FA',
  inputBg: '#FFFFFF',
  inputBorder: '#E5E7EB',
  uploadBg: '#E6E9F0',
  uploadIcon: '#7F879A',
  buttonOrange: '#FF9933',
  error: '#DC2626',
};

export default function JoinLawyerScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    experience: '',
    languages: '',
    councilNumber: '',
  });
  const [uploads, setUploads] = useState({
    photo: null as string | null,
    certificates: null as string | null,
    barCouncilId: null as string | null,
  });
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const specializations = [
    'Corporate Law',
    'Family Law',
    'Criminal Law',
    'Property Law',
    'Tax Law',
    'Cyber Law',
    'Labour Law',
    'Constitutional Law',
  ];

  const experienceYears = [
    '0-1 Years',
    '1-3 Years',
    '4-7 Years',
    '8-12 Years',
    '12+ Years',
  ];

  const languageOptions = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Marathi',
    'Bengali',
    'Gujarati',
    'Kannada',
  ];

  // Safe back navigation
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleUpload = async (field: keyof typeof uploads) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: field === 'photo' ? 'image/*' : '*/*',
      });
      if (result.assets && result.assets[0]) {
        setUploads({ ...uploads, [field]: result.assets[0].name });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.specialization || !formData.councilNumber) {
      alert('Please fill in all required fields');
      return;
    }
    console.log('Form submitted:', formData, uploads);
    
    // Navigate to verification in progress screen
    router.push({
      pathname: '/verification-in-progress',
      params: {
        lawyerName: formData.fullName,
        submittedDate: new Date().toISOString(),
      },
    });
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join as a Lawyer</Text>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Header */}
          <Text style={styles.formTitle}>Create an account</Text>
          <Text style={styles.formSubtitle}>Sign up your account to continue</Text>

          {/* Full Name */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />

          {/* Specialization */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Specialization</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSpecializationModal(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dropdownText,
                formData.specialization && styles.dropdownTextSelected,
              ]}
            >
              {formData.specialization || 'Select Specialization'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Experience & Languages Row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Experience</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowExperienceModal(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    formData.experience && styles.dropdownTextSelected,
                  ]}
                >
                  {formData.experience || 'Years'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Languages</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowLanguageModal(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    formData.languages && styles.dropdownTextSelected,
                  ]}
                >
                  {formData.languages || 'Select language'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Council Number */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Council Number</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Registration Number"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.councilNumber}
            onChangeText={(text) => setFormData({ ...formData, councilNumber: text })}
          />

          {/* Uploads Section */}
          <Text style={styles.label}>Uploads</Text>
          <View style={styles.uploadsRow}>
            <TouchableOpacity
              style={[styles.uploadBox, uploads.photo && styles.uploadBoxSelected]}
              onPress={() => handleUpload('photo')}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                {uploads.photo ? (
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.uploadIcon} />
                )}
              </View>
              <Text style={styles.uploadLabel}>Profile Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadBox, uploads.certificates && styles.uploadBoxSelected]}
              onPress={() => handleUpload('certificates')}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                {uploads.certificates ? (
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.uploadIcon} />
                )}
              </View>
              <Text style={styles.uploadLabel}>Certificates</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadBox, uploads.barCouncilId && styles.uploadBoxSelected]}
              onPress={() => handleUpload('barCouncilId')}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                {uploads.barCouncilId ? (
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.uploadIcon} />
                )}
              </View>
              <Text style={styles.uploadLabel}>Bar Council ID</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Your profile will go live only after verification by the SunoLegal team.
            Verification may take 2-3 working days
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modals */}
        {renderPickerModal(
          showSpecializationModal,
          () => setShowSpecializationModal(false),
          'Select Specialization',
          specializations,
          (value) => setFormData({ ...formData, specialization: value })
        )}
        {renderPickerModal(
          showExperienceModal,
          () => setShowExperienceModal(false),
          'Select Experience',
          experienceYears,
          (value) => setFormData({ ...formData, experience: value })
        )}
        {renderPickerModal(
          showLanguageModal,
          () => setShowLanguageModal(false),
          'Select Language',
          languageOptions,
          (value) => setFormData({ ...formData, languages: value })
        )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.headerBg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: {
    padding: 24,
  },

  // Form Header
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },

  // Form Fields
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  dropdownTextSelected: {
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },

  // Uploads
  uploadsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  uploadBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.uploadBg,
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed',
  },
  uploadBoxSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  uploadIconContainer: {
    marginBottom: 10,
  },
  uploadLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Submit Button
  submitButton: {
    marginTop: 36,
    backgroundColor: COLORS.buttonOrange,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.buttonOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
