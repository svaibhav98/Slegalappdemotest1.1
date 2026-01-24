import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
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

const practiceAreas = [
  'Family Law', 'Criminal Law', 'Corporate Law', 'Civil Law',
  'Property Law', 'Tax Law', 'Labor Law', 'Intellectual Property',
  'Immigration Law', 'Consumer Protection', 'Environmental Law', 'Banking Law',
];

export default function PracticeAreasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(['Family Law', 'Property Law']);

  const toggleArea = (area: string) => {
    setSelected(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Areas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Select areas you specialize in</Text>
        
        <View style={styles.gridContainer}>
          {practiceAreas.map((area, index) => {
            const isSelected = selected.includes(area);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.areaChip, isSelected && styles.areaChipSelected]}
                onPress={() => toggleArea(area)}
              >
                {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} style={styles.checkIcon} />}
                <Text style={[styles.areaChipText, isSelected && styles.areaChipTextSelected]}>{area}</Text>
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
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  areaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: COLORS.border },
  areaChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkIcon: { marginRight: 6 },
  areaChipText: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  areaChipTextSelected: { color: COLORS.white },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
