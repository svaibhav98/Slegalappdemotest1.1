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
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    fullName: 'Vaibhav Sharma',
    email: 'vaibhav@email.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra',
    bio: 'Legal enthusiast seeking justice for all.',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const renderField = (label: string, key: keyof typeof formData, multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.multilineInput]}
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.primary} />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Ionicons name="camera" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          {renderField('Full Name', 'fullName')}
          {renderField('Email', 'email')}
          {renderField('Phone', 'phone')}
          {renderField('Address', 'address')}
          {renderField('Bio', 'bio', true)}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  avatarSection: { alignItems: 'center', marginVertical: 24, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center' },
  changePhotoBtn: { position: 'absolute', bottom: 0, right: '35%', width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  formCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  fieldContainer: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  fieldInput: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.textPrimary },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
