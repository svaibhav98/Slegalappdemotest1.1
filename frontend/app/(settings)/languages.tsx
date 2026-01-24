import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam'];

export default function LanguagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(['English', 'Hindi']);

  const toggleLang = (lang: string) => {
    setSelected(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Languages</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Select languages you can communicate in</Text>
        <View style={styles.listCard}>
          {languages.map((lang, index) => {
            const isSelected = selected.includes(lang);
            return (
              <TouchableOpacity key={index} style={[styles.listItem, index !== languages.length - 1 && styles.listItemBorder]} onPress={() => toggleLang(lang)}>
                <Text style={styles.listItemText}>{lang}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save ({selected.length} selected)</Text>
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
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
