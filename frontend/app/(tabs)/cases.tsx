import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header, Card, EmptyState } from '../../components/CommonComponents';
import { caseAPI } from '../../utils/api';

export default function CasesScreen() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', description: '', court: '', case_number: '', hearing_date: '' });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await caseAPI.listCases();
      setCases(response.cases || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddCase = async () => {
    if (!newCase.title || !newCase.description) return;

    try {
      await caseAPI.createCase(newCase);
      setShowAddModal(false);
      setNewCase({ title: '', description: '', court: '', case_number: '', hearing_date: '' });
      loadCases();
    } catch (error) {
      console.error('Error creating case:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCases();
  };

  const getStatusColor = (status: string) => {
    const colors: any = { active: Colors.info, pending: Colors.warning, closed: Colors.textSecondary, resolved: Colors.success };
    return colors[status] || Colors.gray400;
  };

  return (
    <View style={styles.container}>
      <Header title="My Cases" subtitle="Track and manage your legal cases" rightAction={
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      } />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : cases.length === 0 ? (
        <EmptyState icon="folder-open-outline" title="No cases yet" subtitle="Add your first case to start tracking" action={{ label: 'Add Case', onPress: () => setShowAddModal(true) }} />
      ) : (
        <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}>
          {cases.map((caseItem, index) => (
            <Card key={index} style={styles.caseCard}>
              <View style={styles.caseHeader}>
                <View style={styles.caseIcon}>
                  <Ionicons name="document-text" size={24} color={Colors.primary} />
                </View>
                <View style={styles.caseInfo}>
                  <Text style={styles.caseTitle}>{caseItem.title}</Text>
                  <View style={styles.caseMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseItem.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(caseItem.status) }]}>{caseItem.status}</Text>
                    </View>
                    {caseItem.case_number && <Text style={styles.caseNumber}> • {caseItem.case_number}</Text>}
                  </View>
                </View>
              </View>
              <Text style={styles.caseDescription} numberOfLines={2}>{caseItem.description}</Text>
              {caseItem.hearing_date && (
                <View style={styles.hearingDate}>
                  <Ionicons name="calendar" size={16} color={Colors.info} />
                  <Text style={styles.hearingText}>Next hearing: {caseItem.hearing_date}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Case</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Case Title *</Text>
              <TextInput style={styles.input} placeholder="e.g., Property Dispute" value={newCase.title} onChangeText={(text) => setNewCase({ ...newCase, title: text })} />
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Brief description of the case" value={newCase.description} onChangeText={(text) => setNewCase({ ...newCase, description: text })} multiline numberOfLines={4} />
              <Text style={styles.inputLabel}>Court</Text>
              <TextInput style={styles.input} placeholder="e.g., District Court" value={newCase.court} onChangeText={(text) => setNewCase({ ...newCase, court: text })} />
              <Text style={styles.inputLabel}>Case Number</Text>
              <TextInput style={styles.input} placeholder="e.g., 123/2025" value={newCase.case_number} onChangeText={(text) => setNewCase({ ...newCase, case_number: text })} />
              <Text style={styles.inputLabel}>Next Hearing Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newCase.hearing_date} onChangeText={(text) => setNewCase({ ...newCase, hearing_date: text })} />
              <TouchableOpacity style={[styles.submitButton, (!newCase.title || !newCase.description) && styles.submitButtonDisabled]} onPress={handleAddCase} disabled={!newCase.title || !newCase.description}>
                <Text style={styles.submitButtonText}>Add Case</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  addButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  caseCard: { marginBottom: 16 },
  caseHeader: { flexDirection: 'row', marginBottom: 12 },
  caseIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  caseInfo: { flex: 1 },
  caseTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  caseMeta: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  caseNumber: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8 },
  caseDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  hearingDate: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.info + '15', padding: 8, borderRadius: 8, marginBottom: 12 },
  hearingText: { fontSize: 13, color: Colors.text, marginLeft: 8 },
  viewButton: { flexDirection: 'row', alignItems: 'center' },
  viewButtonText: { fontSize: 14, fontWeight: '600', color: Colors.primary, marginRight: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: Colors.text, backgroundColor: Colors.surface },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { marginTop: 24, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
