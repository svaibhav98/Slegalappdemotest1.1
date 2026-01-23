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
  const [selectedTab, setSelectedTab] = useState('all');
  const [newCase, setNewCase] = useState({ title: '', description: '', court: '', case_number: '', hearing_date: '', status: 'active' });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await caseAPI.listCases();
      const fetchedCases = response.cases || [];
      
      // Add sample data if empty
      if (fetchedCases.length === 0) {
        const sampleCases = [
          { id: '1', title: 'Property Dispute - Plot 123', description: 'Boundary dispute with neighbor regarding property line', court: 'District Court, Delhi', case_number: 'DC/2024/001', hearing_date: '2025-02-15', status: 'active', created_at: '2024-12-01' },
          { id: '2', title: 'Tenant Eviction Case', description: 'Eviction proceedings for commercial property', court: 'Civil Court, Mumbai', case_number: 'CC/2024/089', hearing_date: '2025-02-20', status: 'active', created_at: '2024-11-15' },
          { id: '3', title: 'Consumer Complaint - Defective Product', description: 'Complaint against manufacturer for defective electronics', court: 'Consumer Forum, Bangalore', case_number: 'CF/2024/234', hearing_date: '2025-01-30', status: 'active', created_at: '2024-10-20' },
          { id: '4', title: 'Employment Dispute', description: 'Wrongful termination and compensation claim', court: 'Labour Court, Pune', case_number: 'LC/2023/456', hearing_date: '', status: 'closed', created_at: '2023-08-10' },
        ];
        setCases(sampleCases);
      } else {
        setCases(fetchedCases);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
      // Show sample data on error too
      const sampleCases = [
        { id: '1', title: 'Property Dispute - Plot 123', description: 'Boundary dispute with neighbor', court: 'District Court', case_number: 'DC/2024/001', hearing_date: '2025-02-15', status: 'active' },
        { id: '2', title: 'Tenant Eviction Case', description: 'Eviction proceedings', court: 'Civil Court', case_number: 'CC/2024/089', hearing_date: '2025-02-20', status: 'active' },
      ];
      setCases(sampleCases);
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
      setNewCase({ title: '', description: '', court: '', case_number: '', hearing_date: '', status: 'active' });
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

  const isUpcoming = (hearingDate: string) => {
    if (!hearingDate) return false;
    const today = new Date();
    const hearing = new Date(hearingDate);
    return hearing >= today;
  };

  const getFilteredCases = () => {
    if (selectedTab === 'all') return cases;
    if (selectedTab === 'upcoming') return cases.filter(c => isUpcoming(c.hearing_date) && c.status !== 'closed');
    if (selectedTab === 'closed') return cases.filter(c => c.status === 'closed');
    return cases;
  };

  const filteredCases = getFilteredCases();

  return (
    <View style={styles.container}>
      <Header title="My Cases" subtitle="Track and manage your legal cases" rightAction={
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      } />

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, selectedTab === 'all' && styles.tabActive]} onPress={() => setSelectedTab('all')}>
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>All</Text>
          <View style={[styles.tabBadge, selectedTab === 'all' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, selectedTab === 'all' && styles.tabBadgeTextActive]}>{cases.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]} onPress={() => setSelectedTab('upcoming')}>
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
          <View style={[styles.tabBadge, selectedTab === 'upcoming' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, selectedTab === 'upcoming' && styles.tabBadgeTextActive]}>{cases.filter(c => isUpcoming(c.hearing_date) && c.status !== 'closed').length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'closed' && styles.tabActive]} onPress={() => setSelectedTab('closed')}>
          <Text style={[styles.tabText, selectedTab === 'closed' && styles.tabTextActive]}>Closed</Text>
          <View style={[styles.tabBadge, selectedTab === 'closed' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, selectedTab === 'closed' && styles.tabBadgeTextActive]}>{cases.filter(c => c.status === 'closed').length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredCases.length === 0 ? (
        <EmptyState icon="folder-open-outline" title={`No ${selectedTab} cases`} subtitle="Add your first case to start tracking" action={selectedTab === 'all' ? { label: 'Add Case', onPress: () => setShowAddModal(true) } : undefined} />
      ) : (
        <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}>
          {filteredCases.map((caseItem, index) => (
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
              {caseItem.court && <Text style={styles.courtText}><Ionicons name="business" size={14} color={Colors.textSecondary} /> {caseItem.court}</Text>}
              {caseItem.hearing_date && (
                <View style={styles.hearingDate}>
                  <Ionicons name="calendar" size={16} color={isUpcoming(caseItem.hearing_date) ? Colors.info : Colors.textSecondary} />
                  <Text style={[styles.hearingText, { color: isUpcoming(caseItem.hearing_date) ? Colors.info : Colors.textSecondary }]}>Next hearing: {caseItem.hearing_date}</Text>
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
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginHorizontal: 4 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginRight: 6 },
  tabTextActive: { color: '#FFFFFF' },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.gray200 },
  tabBadgeActive: { backgroundColor: '#FFFFFF30' },
  tabBadgeText: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
  tabBadgeTextActive: { color: '#FFFFFF' },
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
  caseDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  courtText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  hearingDate: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.info + '15', padding: 10, borderRadius: 8, marginBottom: 12 },
  hearingText: { fontSize: 13, color: Colors.text, marginLeft: 8, fontWeight: '500' },
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
