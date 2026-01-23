import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function CaseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ date: '', time: '', note: '' });
  const [newNote, setNewNote] = useState('');

  const mockCases: any = {
    '1': { id: '1', title: 'Property Boundary Dispute', description: 'Dispute with neighbor regarding property line demarcation', court: 'District Court, Delhi', case_number: 'DC/2024/001', hearing_date: '2025-02-15', status: 'upcoming', created_at: '2024-12-01', reminder_date: '2025-02-13', notes: ['Filed initial petition', 'Awaiting court hearing date'], reminders: [{ date: '2025-02-13', note: '2 days before hearing', type: 'automatic' }] },
    '2': { id: '2', title: 'Tenant Eviction Case', description: 'Eviction proceedings for commercial property lease violation', court: 'Civil Court, Mumbai', case_number: 'CC/2024/089', hearing_date: '2025-02-20', status: 'upcoming', created_at: '2024-11-15', notes: [], reminders: [{ date: '2025-02-18', note: '2 days before hearing', type: 'automatic' }] },
    '3': { id: '3', title: 'Consumer Complaint - Electronics', description: 'Complaint against manufacturer for defective product', court: 'Consumer Forum, Bangalore', case_number: 'CF/2024/234', hearing_date: '2025-02-10', status: 'ongoing', last_hearing: '2025-01-15', notes: ['Evidence submitted', 'Defendant response received'], reminders: [] },
    '4': { id: '4', title: 'Employment Wrongful Termination', description: 'Wrongful termination claim', court: 'Labour Court, Pune', case_number: 'LC/2023/456', status: 'closed', closed_date: '2024-12-01', notes: ['Settlement reached', 'Compensation paid'], reminders: [] },
    '5': { id: '5', title: 'Family Property Division', description: 'Property inheritance dispute', court: 'Family Court, Chennai', case_number: 'FC/2024/112', hearing_date: '2025-03-05', status: 'ongoing', last_hearing: '2025-01-20', notes: [], reminders: [] },
  };

  useEffect(() => {
    const caseId = params.id as string;
    if (mockCases[caseId]) {
      setCaseData(mockCases[caseId]);
    }
  }, [params.id]);

  const handleStatusChange = (newStatus: string) => {
    Alert.alert(
      'Change Status',
      `Change case status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setCaseData({ ...caseData, status: newStatus });
            Alert.alert('Success', 'Case status updated');
          }
        }
      ]
    );
  };

  const handleAddReminder = () => {
    if (!newReminder.date) {
      Alert.alert('Error', 'Please enter a reminder date');
      return;
    }
    const reminder = { ...newReminder, type: 'manual', id: Date.now().toString() };
    setCaseData({ ...caseData, reminders: [...(caseData.reminders || []), reminder] });
    setNewReminder({ date: '', time: '', note: '' });
    setShowReminderModal(false);
    Alert.alert('Success', 'Reminder added');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setCaseData({ ...caseData, notes: [...(caseData.notes || []), newNote] });
    setNewNote('');
    Alert.alert('Success', 'Note added');
  };

  if (!caseData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading case details...</Text>
      </View>
    );
  }

  const statusColor = caseData.status === 'upcoming' ? Colors.warning : caseData.status === 'ongoing' ? Colors.info : Colors.textSecondary;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Case Details</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.titleCard}>
            <View style={styles.titleHeader}>
              <Text style={styles.caseTitle}>{caseData.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{caseData.status}</Text>
              </View>
            </View>
            <Text style={styles.caseNumber}>{caseData.case_number}</Text>
            <Text style={styles.caseDescription}>{caseData.description}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{caseData.court}</Text>
            </View>
            {caseData.hearing_date && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color={Colors.info} />
                <Text style={[styles.infoText, { color: Colors.info, fontWeight: '600' }]}>Next Hearing: {caseData.hearing_date}</Text>
              </View>
            )}
            {caseData.last_hearing && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>Last Hearing: {caseData.last_hearing}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Management</Text>
            <View style={styles.statusButtons}>
              <TouchableOpacity style={[styles.statusButton, caseData.status === 'upcoming' && styles.statusButtonActive]} onPress={() => handleStatusChange('upcoming')} activeOpacity={0.8}>
                <Ionicons name="time" size={20} color={caseData.status === 'upcoming' ? '#FFFFFF' : Colors.warning} />
                <Text style={[styles.statusButtonText, caseData.status === 'upcoming' && styles.statusButtonTextActive]}>Upcoming</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton, caseData.status === 'ongoing' && styles.statusButtonActive]} onPress={() => handleStatusChange('ongoing')} activeOpacity={0.8}>
                <Ionicons name="sync" size={20} color={caseData.status === 'ongoing' ? '#FFFFFF' : Colors.info} />
                <Text style={[styles.statusButtonText, caseData.status === 'ongoing' && styles.statusButtonTextActive]}>Ongoing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton, caseData.status === 'closed' && styles.statusButtonActive]} onPress={() => handleStatusChange('closed')} activeOpacity={0.8}>
                <Ionicons name="checkmark-circle" size={20} color={caseData.status === 'closed' ? '#FFFFFF' : Colors.success} />
                <Text style={[styles.statusButtonText, caseData.status === 'closed' && styles.statusButtonTextActive]}>Closed</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reminders</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowReminderModal(true)} activeOpacity={0.8}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {(!caseData.reminders || caseData.reminders.length === 0) ? (
              <Text style={styles.emptyText}>No reminders set</Text>
            ) : (
              caseData.reminders.map((reminder: any, index: number) => (
                <View key={index} style={styles.reminderCard}>
                  <Ionicons name="notifications" size={20} color={Colors.warning} />
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderDate}>{reminder.date} {reminder.time}</Text>
                    <Text style={styles.reminderNote}>{reminder.note}</Text>
                    <Text style={styles.reminderType}>{reminder.type}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput style={styles.noteInput} placeholder="Add a note..." placeholderTextColor={Colors.gray400} value={newNote} onChangeText={setNewNote} multiline />
            <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote} activeOpacity={0.9}>
              <Text style={styles.addNoteButtonText}>Add Note</Text>
            </TouchableOpacity>
            {caseData.notes && caseData.notes.map((note: string, index: number) => (
              <View key={index} style={styles.noteCard}>
                <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <Modal visible={showReminderModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Reminder</Text>
                <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD) *</Text>
              <TextInput style={styles.input} placeholder="2025-02-15" placeholderTextColor={Colors.gray400} value={newReminder.date} onChangeText={(text) => setNewReminder({ ...newReminder, date: text })} />
              <Text style={styles.inputLabel}>Time (Optional)</Text>
              <TextInput style={styles.input} placeholder="10:00 AM" placeholderTextColor={Colors.gray400} value={newReminder.time} onChangeText={(text) => setNewReminder({ ...newReminder, time: text })} />
              <Text style={styles.inputLabel}>Note</Text>
              <TextInput style={styles.input} placeholder="Reminder note..." placeholderTextColor={Colors.gray400} value={newReminder.note} onChangeText={(text) => setNewReminder({ ...newReminder, note: text })} />
              <TouchableOpacity style={styles.submitButton} onPress={handleAddReminder} activeOpacity={0.9}>
                <Text style={styles.submitButtonText}>Add Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2D42' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', flex: 1, marginLeft: 16 },
  moreButton: { padding: 8 },
  content: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  titleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  caseTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 12, letterSpacing: -0.3 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  caseNumber: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12, fontWeight: '600' },
  caseDescription: { fontSize: 15, color: Colors.text, lineHeight: 22, opacity: 0.8 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12, letterSpacing: -0.3 },
  statusButtons: { flexDirection: 'row', gap: 8 },
  statusButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border, gap: 6 },
  statusButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusButtonText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  statusButtonTextActive: { color: '#FFFFFF' },
  addButton: { padding: 4 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  reminderCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.warning + '15', padding: 12, borderRadius: 12, marginBottom: 8, gap: 12 },
  reminderContent: { flex: 1 },
  reminderDate: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  reminderNote: { fontSize: 13, color: Colors.text, marginBottom: 2 },
  reminderType: { fontSize: 11, color: Colors.textSecondary, textTransform: 'capitalize' },
  noteInput: { borderWidth: 2, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface, marginBottom: 12, minHeight: 80, textAlignVertical: 'top' },
  addNoteButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  addNoteButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, padding: 12, borderRadius: 12, marginBottom: 8, gap: 8 },
  noteText: { fontSize: 14, color: Colors.text, flex: 1, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  inputLabel: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 10, marginTop: 16 },
  input: { borderWidth: 2, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface },
  submitButton: { marginTop: 24, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
