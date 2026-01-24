import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getCases, 
  getCaseCounts, 
  getCaseById,
  updateCaseStatus,
  deleteCase,
  Case, 
  CaseStatus 
} from '../../services/casesData';

const { width } = Dimensions.get('window');

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
  ongoing: '#10B981',
  closed: '#EF4444',
  upcoming: '#F59E0B',
  yellow: '#FFC107',
  searchBg: '#2D2D44',
};

type TabType = 'all' | 'ongoing' | 'closed' | 'upcoming';

export default function CasesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [counts, setCounts] = useState({ all: 0, ongoing: 0, closed: 0, upcoming: 0 });
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [activeTab, searchQuery])
  );

  const refreshData = () => {
    setCounts(getCaseCounts());
    const status = activeTab === 'all' ? undefined : activeTab as CaseStatus;
    setCases(getCases('user-1', status, searchQuery));
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddCase = () => {
    router.push('/add-case');
  };

  const handleCasePress = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (newStatus: CaseStatus) => {
    if (selectedCase) {
      updateCaseStatus(selectedCase.id, newStatus);
      setSelectedCase({ ...selectedCase, status: newStatus });
      refreshData();
    }
  };

  const handleDeleteCase = () => {
    if (selectedCase) {
      Alert.alert(
        'Delete Case',
        'Are you sure you want to delete this case? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              deleteCase(selectedCase.id);
              setShowDetailModal(false);
              setSelectedCase(null);
              refreshData();
            }
          }
        ]
      );
    }
  };

  const handleAddReminder = () => {
    if (selectedCase) {
      setShowDetailModal(false);
      router.push({
        pathname: '/add-reminder',
        params: { caseId: selectedCase.id }
      });
    }
  };

  const handleEditCase = () => {
    if (selectedCase) {
      setShowDetailModal(false);
      router.push({
        pathname: '/edit-case',
        params: { caseId: selectedCase.id }
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'ongoing': return COLORS.ongoing;
      case 'closed': return COLORS.closed;
      case 'upcoming': return COLORS.upcoming;
      default: return COLORS.textMuted;
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'closed', label: 'Closed' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF5F0" />
      
      <LinearGradient
        colors={['#FFF5F0', '#FFFFFF']}
        style={styles.gradientHeader}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Cases</Text>
          
          <TouchableOpacity 
            style={styles.headerAction} 
            onPress={() => router.push('/lawyers')}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.textPrimary} />
            <Text style={styles.headerActionText}>Consult</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Case Number or Party Name..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              refreshData();
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); refreshData(); }}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* My Cases Summary Card - Now Interactive */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="ribbon" size={20} color="#60A5FA" />
            <Text style={styles.summaryTitle}>My Cases</Text>
          </View>
          <View style={styles.summaryRow}>
            <TouchableOpacity 
              style={[styles.summaryItem, activeTab === 'all' && styles.summaryItemActive]}
              onPress={() => {
                setActiveTab('all');
                refreshData();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.summaryCount, activeTab === 'all' && styles.summaryCountActive]}>{counts.all}</Text>
              <Text style={[styles.summaryLabel, activeTab === 'all' && styles.summaryLabelActive]}>All</Text>
            </TouchableOpacity>
            <View style={styles.summaryDivider} />
            <TouchableOpacity 
              style={[styles.summaryItem, activeTab === 'ongoing' && styles.summaryItemActive]}
              onPress={() => {
                setActiveTab('ongoing');
                refreshData();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.summaryCount, activeTab === 'ongoing' && styles.summaryCountActive]}>{counts.ongoing}</Text>
              <Text style={[styles.summaryLabel, activeTab === 'ongoing' && styles.summaryLabelActive]}>Ongoing</Text>
            </TouchableOpacity>
            <View style={styles.summaryDivider} />
            <TouchableOpacity 
              style={[styles.summaryItem, activeTab === 'closed' && styles.summaryItemActive]}
              onPress={() => {
                setActiveTab('closed');
                refreshData();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.summaryCount, activeTab === 'closed' && styles.summaryCountActive]}>{counts.closed}</Text>
              <Text style={[styles.summaryLabel, activeTab === 'closed' && styles.summaryLabelActive]}>Closed</Text>
            </TouchableOpacity>
            <View style={styles.summaryDivider} />
            <TouchableOpacity 
              style={[styles.summaryItem, activeTab === 'upcoming' && styles.summaryItemActive]}
              onPress={() => {
                setActiveTab('upcoming');
                refreshData();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.summaryCount, activeTab === 'upcoming' && styles.summaryCountActive]}>{counts.upcoming}</Text>
              <Text style={[styles.summaryLabel, activeTab === 'upcoming' && styles.summaryLabelActive]}>Upcoming</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cases List */}
        {cases.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="folder-open-outline" size={64} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No cases found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' 
                ? "You haven't added any cases yet" 
                : `No ${activeTab} cases at the moment`}
            </Text>
            <TouchableOpacity 
              style={styles.addFirstCaseButton}
              onPress={handleAddCase}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addFirstCaseText}>Add your first case</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cases.map((caseItem) => (
            <TouchableOpacity
              key={caseItem.id}
              style={styles.caseCard}
              onPress={() => handleCasePress(caseItem)}
              activeOpacity={0.9}
            >
              {/* Reminder Bell Icon - Top Right */}
              <TouchableOpacity 
                style={styles.reminderIcon}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push({
                    pathname: '/create-reminder',
                    params: {
                      caseId: caseItem.id,
                      caseTitle: caseItem.title,
                      caseStatus: caseItem.status,
                    },
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={caseItem.reminders.length > 0 ? "notifications" : "notifications-outline"} 
                  size={22} 
                  color={caseItem.reminders.length > 0 ? COLORS.primary : COLORS.textMuted} 
                />
              </TouchableOpacity>

              {/* Case Icon */}
              <View style={styles.caseIconContainer}>
                <View style={[styles.caseIcon, { backgroundColor: getStatusColor(caseItem.status) + '20' }]}>
                  <Ionicons 
                    name={
                      caseItem.caseType === 'Consumer' ? 'shield-checkmark' :
                      caseItem.caseType === 'RTI' ? 'document-text' :
                      caseItem.caseType === 'Property' ? 'home' :
                      caseItem.caseType === 'Labour' ? 'briefcase' :
                      caseItem.caseType === 'Family' ? 'people' :
                      'business'
                    } 
                    size={28} 
                    color={getStatusColor(caseItem.status)} 
                  />
                </View>
                {caseItem.reminders.length > 0 && (
                  <View style={styles.reminderBadge}>
                    <Ionicons name="notifications" size={12} color={COLORS.white} />
                  </View>
                )}
              </View>

              {/* Case Content */}
              <View style={styles.caseContent}>
                <Text style={styles.caseTitle} numberOfLines={2}>{caseItem.title}</Text>
                <Text style={styles.caseId}>
                  Case ID: {caseItem.caseNumber} | {caseItem.court}, {caseItem.city}
                </Text>
                <Text style={styles.caseActivity}>
                  Last Activity: {formatDate(caseItem.lastActivityDate)}
                </Text>
                
                <View style={styles.caseFooter}>
                  <Text style={styles.nextHearing}>
                    {caseItem.status === 'closed' 
                      ? `Resolved ${formatDate(caseItem.lastActivityDate)}`
                      : `Next Hearing: ${formatDate(caseItem.nextHearingDate)}`
                    }
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: getStatusColor(caseItem.status) }]}>
                    <Text style={styles.statusText}>
                      {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddCase}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Case Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCase && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle} numberOfLines={2}>{selectedCase.title}</Text>
                    <View style={[styles.statusPillLarge, { backgroundColor: getStatusColor(selectedCase.status) }]}>
                      <Text style={styles.statusTextLarge}>
                        {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Case Details */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text" size={18} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Case Number</Text>
                      <Text style={styles.detailValue}>{selectedCase.caseNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="business" size={18} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Court/Authority</Text>
                      <Text style={styles.detailValue}>{selectedCase.court}, {selectedCase.city}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={18} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Petitioner</Text>
                      <Text style={styles.detailValue}>{selectedCase.petitioner}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="people" size={18} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Respondent</Text>
                      <Text style={styles.detailValue}>{selectedCase.respondent}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={18} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Filing Date</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedCase.filingDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={18} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Last Activity</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedCase.lastActivityDate)}</Text>
                    </View>
                    {selectedCase.status !== 'closed' && (
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                        <Text style={[styles.detailLabel, { color: COLORS.primary }]}>Next Hearing</Text>
                        <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '600' }]}>
                          {formatDate(selectedCase.nextHearingDate)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Notes */}
                  {selectedCase.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesSectionTitle}>Notes</Text>
                      <Text style={styles.notesText}>{selectedCase.notes}</Text>
                    </View>
                  )}

                  {/* Reminders */}
                  {selectedCase.reminders.length > 0 && (
                    <View style={styles.remindersSection}>
                      <Text style={styles.remindersSectionTitle}>
                        Reminders ({selectedCase.reminders.length})
                      </Text>
                      {selectedCase.reminders.map((reminder) => (
                        <View key={reminder.id} style={styles.reminderItem}>
                          <Ionicons name="notifications" size={16} color={COLORS.primary} />
                          <View style={styles.reminderContent}>
                            <Text style={styles.reminderType}>
                              {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
                            </Text>
                            <Text style={styles.reminderDateTime}>
                              {formatDate(reminder.dateTime.split('T')[0])}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Update Status */}
                  <View style={styles.statusSection}>
                    <Text style={styles.statusSectionTitle}>Update Status</Text>
                    <View style={styles.statusButtons}>
                      {(['upcoming', 'ongoing', 'closed'] as CaseStatus[]).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            selectedCase.status === status && styles.statusButtonActive,
                            { borderColor: getStatusColor(status) }
                          ]}
                          onPress={() => handleUpdateStatus(status)}
                          activeOpacity={0.8}
                        >
                          <Text style={[
                            styles.statusButtonText,
                            selectedCase.status === status && { color: COLORS.white },
                            { color: getStatusColor(status) }
                          ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsSection}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={handleEditCase}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.actionButtonText}>Edit Case</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={handleAddReminder}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.actionButtonText}>Add Reminder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={handleDeleteCase}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={20} color={COLORS.closed} />
                      <Text style={[styles.actionButtonText, { color: COLORS.closed }]}>Delete Case</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientHeader: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.yellow,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryItemActive: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    paddingVertical: 8,
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryCountActive: {
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addFirstCaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  addFirstCaseText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },

  // Case Card
  caseCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  reminderIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  caseIconContainer: {
    position: 'relative',
    marginRight: 14,
  },
  caseIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.closed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseContent: {
    flex: 1,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  caseId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  caseActivity: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  caseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextHearing: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  statusPillLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextLarge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },

  // Detail Section
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 12,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  // Notes Section
  notesSection: {
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 16,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Reminders Section
  remindersSection: {
    marginBottom: 20,
  },
  remindersSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderType: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  reminderDateTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Status Section
  statusSection: {
    marginBottom: 20,
  },
  statusSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: 'currentColor',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Actions Section
  actionsSection: {
    gap: 10,
    paddingBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.closed + '10',
  },
});
