import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Header, Card, EmptyState } from '../../components/CommonComponents';
import { caseAPI } from '../../utils/api';

export default function CasesScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [newCase, setNewCase] = useState({ title: '', description: '', court: '', case_number: '', hearing_date: '', status: 'upcoming' });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await caseAPI.listCases();
      let fetchedCases = response.cases || [];
      
      if (fetchedCases.length === 0) {
        fetchedCases = [
          { id: '1', title: 'Property Boundary Dispute', description: 'Dispute with neighbor regarding property line demarcation', court: 'District Court, Delhi', case_number: 'DC/2024/001', hearing_date: '2025-02-15', status: 'upcoming', created_at: '2024-12-01', reminder_date: '2025-02-13', notes: [] },
          { id: '2', title: 'Tenant Eviction Case', description: 'Eviction proceedings for commercial property lease violation', court: 'Civil Court, Mumbai', case_number: 'CC/2024/089', hearing_date: '2025-02-20', status: 'upcoming', created_at: '2024-11-15', reminder_date: '2025-02-18', notes: [] },
          { id: '3', title: 'Consumer Complaint - Electronics', description: 'Complaint against manufacturer for defective product and refund', court: 'Consumer Forum, Bangalore', case_number: 'CF/2024/234', hearing_date: '2025-02-10', status: 'ongoing', created_at: '2024-10-20', last_hearing: '2025-01-15', notes: [] },
          { id: '4', title: 'Employment Wrongful Termination', description: 'Wrongful termination claim with compensation demand', court: 'Labour Court, Pune', case_number: 'LC/2023/456', hearing_date: '', status: 'closed', created_at: '2023-08-10', closed_date: '2024-12-01', notes: [] },
          { id: '5', title: 'Family Property Division', description: 'Property inheritance dispute among family members', court: 'Family Court, Chennai', case_number: 'FC/2024/112', hearing_date: '2025-03-05', status: 'ongoing', created_at: '2024-09-01', last_hearing: '2025-01-20', notes: [] },
        ];
      }
      setCases(fetchedCases);
    } catch (error) {
      console.error('Error loading cases:', error);
      setCases([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddCase = async () => {
    if (!newCase.title || !newCase.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const caseWithId = { ...newCase, id: Date.now().toString(), created_at: new Date().toISOString(), notes: [] };
      setCases([...cases, caseWithId]);
      setShowAddModal(false);
      setNewCase({ title: '', description: '', court: '', case_number: '', hearing_date: '', status: 'upcoming' });
      Alert.alert('Success', 'Case added successfully');
    } catch (error) {
      console.error('Error creating case:', error);
      Alert.alert('Error', 'Failed to add case');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCases();
  };

  const getStatusColor = (status: string) => {
    const colors: any = { upcoming: Colors.warning, ongoing: Colors.info, closed: Colors.textSecondary };
    return colors[status] || Colors.gray400;
  };

  const getFilteredCases = () => {
    if (selectedTab === 'upcoming') return cases.filter(c => c.status === 'upcoming');
    if (selectedTab === 'ongoing') return cases.filter(c => c.status === 'ongoing');
    if (selectedTab === 'closed') return cases.filter(c => c.status === 'closed');
    return cases;
  };

  const filteredCases = getFilteredCases();

  const getUpcomingCount = () => cases.filter(c => c.status === 'upcoming').length;
  const getOngoingCount = () => cases.filter(c => c.status === 'ongoing').length;
  const getClosedCount = () => cases.filter(c => c.status === 'closed').length;

  return (
    <View style={styles.container}>
      <Header title="My Cases" subtitle="Track and manage your legal cases" rightAction={
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      } />

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]} onPress={() => setSelectedTab('upcoming')} activeOpacity={0.8}>
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
          <View style={[styles.tabBadge, selectedTab === 'upcoming' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, selectedTab === 'upcoming' && styles.tabBadgeTextActive]}>{getUpcomingCount()}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'ongoing' && styles.tabActive]} onPress={() => setSelectedTab('ongoing')} activeOpacity={0.8}>
          <Text style={[styles.tabText, selectedTab === 'ongoing' && styles.tabTextActive]}>Ongoing</Text>
          <View style={[styles.tabBadge, selectedTab === 'ongoing' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, selectedTab === 'ongoing' && styles.tabBadgeTextActive]}>{getOngoingCount()}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'closed' && styles.tabActive]} onPress={() => setSelectedTab('closed')} activeOpacity={0.8}>
          <Text style={[styles.tabText, selectedTab === 'closed' && styles.tabTextActive]}>Closed</Text>
          <View style={[styles.tabBadge, selectedTab === 'closed' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, selectedTab === 'closed' && styles.tabBadgeTextActive]}>{getClosedCount()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading cases...</Text>
        </View>
      ) : filteredCases.length === 0 ? (
        <EmptyState icon="folder-open-outline" title={`No ${selectedTab} cases`} subtitle={selectedTab === 'upcoming' ? 'Add your first case to start tracking' : `You don't have any ${selectedTab} cases yet`} action={selectedTab === 'upcoming' ? { label: 'Add Case', onPress: () => setShowAddModal(true) } : undefined} />
      ) : (
        <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}>
          {filteredCases.map((caseItem, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => router.push(`/case-detail/${caseItem.id}` as any)}>
              <Card style={styles.caseCard}>
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
                {caseItem.hearing_date && caseItem.status !== 'closed' && (
                  <View style={styles.hearingDate}>
                    <Ionicons name="calendar" size={16} color={Colors.info} />
                    <Text style={styles.hearingText}>Next hearing: {caseItem.hearing_date}</Text>
                  </View>
                )}
                {caseItem.status === 'closed' && caseItem.closed_date && (
                  <View style={styles.closedBanner}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.closedText}>Closed on {caseItem.closed_date}</Text>
                  </View>
                )}
                <View style={styles.caseFooter}>
                  <TouchableOpacity style={styles.actionChip}>
                    <Ionicons name="notifications-outline" size={16} color={Colors.text} />
                    <Text style={styles.actionChipText}>Reminders</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
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
              <TextInput style={styles.input} placeholder="e.g., Property Dispute" placeholderTextColor={Colors.gray400} value={newCase.title} onChangeText={(text) => setNewCase({ ...newCase, title: text })} />
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Brief description of the case" placeholderTextColor={Colors.gray400} value={newCase.description} onChangeText={(text) => setNewCase({ ...newCase, description: text })} multiline numberOfLines={4} />
              <Text style={styles.inputLabel}>Court</Text>
              <TextInput style={styles.input} placeholder="e.g., District Court" placeholderTextColor={Colors.gray400} value={newCase.court} onChangeText={(text) => setNewCase({ ...newCase, court: text })} />
              <Text style={styles.inputLabel}>Case Number</Text>
              <TextInput style={styles.input} placeholder="e.g., 123/2025" placeholderTextColor={Colors.gray400} value={newCase.case_number} onChangeText={(text) => setNewCase({ ...newCase, case_number: text })} />
              <Text style={styles.inputLabel}>Next Hearing Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.gray400} value={newCase.hearing_date} onChangeText={(text) => setNewCase({ ...newCase, hearing_date: text })} />
              <TouchableOpacity style={[styles.submitButton, (!newCase.title || !newCase.description) && styles.submitButtonDisabled]} onPress={handleAddCase} disabled={!newCase.title || !newCase.description} activeOpacity={0.9}>
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
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginHorizontal: 4 },
  tabActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginRight: 6 },
  tabTextActive: { color: '#FFFFFF' },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: Colors.gray200 },
  tabBadgeActive: { backgroundColor: '#FFFFFF30' },
  tabBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.text },
  tabBadgeTextActive: { color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary },
  caseCard: { marginBottom: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  caseHeader: { flexDirection: 'row', marginBottom: 12 },
  caseIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  caseInfo: { flex: 1 },
  caseTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6, letterSpacing: -0.3 },
  caseMeta: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  caseNumber: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4, fontWeight: '500' },
  caseDescription: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 10, opacity: 0.8 },
  courtText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  hearingDate: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.info + '15', padding: 10, borderRadius: 10, marginBottom: 12 },
  hearingText: { fontSize: 13, color: Colors.info, marginLeft: 8, fontWeight: '600' },
  closedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.success + '15', padding: 10, borderRadius: 10, marginBottom: 12 },
  closedText: { fontSize: 13, color: Colors.success, marginLeft: 8, fontWeight: '600' },
  caseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  actionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  actionChipText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  viewDetailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetailsText: { fontSize: 14, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 10, marginTop: 16, letterSpacing: -0.3 },
  input: { borderWidth: 2, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface, fontWeight: '500' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { marginTop: 28, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
});
