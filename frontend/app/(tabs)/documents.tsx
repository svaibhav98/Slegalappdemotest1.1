import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSavedLaws } from '../../contexts/SavedLawsContext';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  success: '#10B981',
  teal: '#14B8A6',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  red: '#EF4444',
  amber: '#F59E0B',
  pink: '#EC4899',
};

// Subtle icon color mapping for document types
const DOCUMENT_COLORS: Record<string, string> = {
  'rent_agreement': '#E67E22',        // Muted Orange
  'legal_notice': '#5B8FB9',          // Muted Blue
  'affidavit': '#8B7EC8',             // Muted Purple
  'consumer_complaint': '#5FA097',    // Muted Teal
  'nda': '#4A7BA7',                   // Muted Blue (darker)
  'power_of_attorney': '#6B7CB7',     // Muted Indigo
};

// Helper function to get icon color by document type/id
const getDocumentIconColor = (typeOrId: string): string => {
  const normalized = typeOrId.toLowerCase().replace(/\s+/g, '_');
  return DOCUMENT_COLORS[normalized] || COLORS.textSecondary;
};

type Tab = 'create' | 'documents' | 'saved';
type Screen = 'list' | 'form' | 'preview' | 'success';

interface DocumentTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  fields: { key: string; label: string; placeholder: string; multiline?: boolean }[];
}

interface SavedDocument {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  size: string;
  isSaved: boolean;
}

const TEMPLATES: DocumentTemplate[] = [
  {
    id: 'consumer_complaint',
    title: 'Consumer Complaint',
    subtitle: 'File product/service complaints',
    icon: 'shield-checkmark',
    fields: [
      { key: 'complainant_name', label: 'Complainant Name', placeholder: 'Enter your full name' },
      { key: 'complainant_address', label: 'Address', placeholder: 'Enter your address' },
      { key: 'respondent_name', label: 'Respondent/Company Name', placeholder: 'Enter company name' },
      { key: 'product_service', label: 'Product/Service', placeholder: 'Describe the product/service' },
      { key: 'complaint_details', label: 'Complaint Details', placeholder: 'Describe your complaint in detail', multiline: true },
      { key: 'relief_sought', label: 'Relief Sought', placeholder: 'What resolution do you seek?' },
    ],
  },
  {
    id: 'rent_agreement',
    title: 'Rent Agreement',
    subtitle: 'Property lease documentation',
    icon: 'home',
    fields: [
      { key: 'landlord_name', label: 'Landlord Name', placeholder: 'Enter landlord name' },
      { key: 'tenant_name', label: 'Tenant Name', placeholder: 'Enter tenant name' },
      { key: 'property_address', label: 'Property Address', placeholder: 'Enter property address' },
      { key: 'rent_amount', label: 'Monthly Rent (₹)', placeholder: 'Enter rent amount' },
      { key: 'security_deposit', label: 'Security Deposit (₹)', placeholder: 'Enter deposit amount' },
      { key: 'lease_duration', label: 'Lease Duration', placeholder: 'e.g., 11 months' },
    ],
  },
  {
    id: 'affidavit',
    title: 'Affidavit',
    subtitle: 'Sworn legal statement',
    icon: 'document-text',
    fields: [
      { key: 'declarant_name', label: 'Declarant Name', placeholder: 'Enter your full name' },
      { key: 'father_name', label: 'Father\'s Name', placeholder: 'Enter father\'s name' },
      { key: 'address', label: 'Address', placeholder: 'Enter your address' },
      { key: 'purpose', label: 'Purpose of Affidavit', placeholder: 'e.g., Name Change, Address Proof' },
      { key: 'declaration', label: 'Declaration Statement', placeholder: 'Enter your declaration', multiline: true },
    ],
  },
  {
    id: 'nda',
    title: 'NDA',
    subtitle: 'Non-Disclosure Agreement',
    icon: 'lock-closed',
    fields: [
      { key: 'disclosing_party', label: 'Disclosing Party', placeholder: 'Enter party name' },
      { key: 'receiving_party', label: 'Receiving Party', placeholder: 'Enter party name' },
      { key: 'purpose', label: 'Purpose', placeholder: 'Purpose of disclosure' },
      { key: 'confidential_info', label: 'Confidential Information', placeholder: 'Describe the information', multiline: true },
      { key: 'duration', label: 'Duration', placeholder: 'e.g., 2 years' },
    ],
  },
  {
    id: 'legal_notice',
    title: 'Legal Notice',
    subtitle: 'Formal legal communication',
    icon: 'mail',
    fields: [
      { key: 'sender_name', label: 'Sender Name', placeholder: 'Enter your name' },
      { key: 'sender_address', label: 'Sender Address', placeholder: 'Enter your address' },
      { key: 'recipient_name', label: 'Recipient Name', placeholder: 'Enter recipient name' },
      { key: 'recipient_address', label: 'Recipient Address', placeholder: 'Enter recipient address' },
      { key: 'subject', label: 'Subject', placeholder: 'Subject of notice' },
      { key: 'notice_content', label: 'Notice Content', placeholder: 'Enter the full notice content', multiline: true },
    ],
  },
  {
    id: 'power_of_attorney',
    title: 'Power of Attorney',
    subtitle: 'Legal authority delegation',
    icon: 'person',
    fields: [
      { key: 'principal_name', label: 'Principal Name', placeholder: 'Enter principal name' },
      { key: 'agent_name', label: 'Agent/Attorney Name', placeholder: 'Enter agent name' },
      { key: 'powers_granted', label: 'Powers Granted', placeholder: 'Describe powers being granted', multiline: true },
      { key: 'duration', label: 'Duration', placeholder: 'e.g., Until revoked' },
    ],
  },
];

// Mock saved documents
const INITIAL_DOCUMENTS: SavedDocument[] = [
  { id: 'doc-1', name: 'Rent Agreement - Flat 302', type: 'Rent Agreement', createdAt: '2025-01-20', size: '245 KB', isSaved: true },
  { id: 'doc-2', name: 'Consumer Complaint - Amazon', type: 'Consumer Complaint', createdAt: '2025-01-18', size: '189 KB', isSaved: false },
  { id: 'doc-3', name: 'NDA - TechCorp India', type: 'NDA', createdAt: '2025-01-15', size: '156 KB', isSaved: true },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialTab = (params.tab as Tab) || 'create';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<SavedDocument[]>(INITIAL_DOCUMENTS);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const { savedLaws, unsaveLaw } = useSavedLaws();

  // Handle tab parameter from navigation
  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab as Tab);
    }
  }, [params.tab]);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, string> = {};
    template.fields.forEach(f => { initialData[f.key] = ''; });
    setFormData(initialData);
    setCurrentScreen('form');
  };

  const handlePreview = () => {
    setCurrentScreen('preview');
  };

  const handleEditDetails = () => {
    setCurrentScreen('form');
  };

  const handleGeneratePDF = () => {
    // Create new document
    const newDoc: SavedDocument = {
      id: `doc-${Date.now()}`,
      name: `${selectedTemplate?.title} - ${formData[selectedTemplate?.fields[0].key || ''] || 'Draft'}`,
      type: selectedTemplate?.title || '',
      createdAt: new Date().toISOString().split('T')[0],
      size: `${Math.floor(Math.random() * 200) + 100} KB`,
      isSaved: false,
    };
    setDocuments([newDoc, ...documents]);
    setGeneratedDocId(newDoc.id);
    setCurrentScreen('success');
  };

  const handleSaveDocument = (docId: string) => {
    setDocuments(docs => docs.map(d => d.id === docId ? { ...d, isSaved: true } : d));
  };

  const handleRemoveFromSaved = (docId: string) => {
    setDocuments(docs => docs.map(d => d.id === docId ? { ...d, isSaved: false } : d));
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedTemplate(null);
    setFormData({});
    setGeneratedDocId(null);
    setActiveTab('documents');
  };

  const handleCreateNew = () => {
    setCurrentScreen('list');
    setSelectedTemplate(null);
    setFormData({});
    setGeneratedDocId(null);
    setActiveTab('create');
  };

  const savedItems = documents.filter(d => d.isSaved);

  // Handle law card press
  const handleLawPress = (lawId: string) => {
    router.push({
      pathname: '/law-detail/[id]',
      params: { id: lawId }
    });
  };

  // Handle unsave law
  const handleUnsaveLaw = (lawId: string) => {
    unsaveLaw(lawId);
  };

  const generatePreviewContent = () => {
    if (!selectedTemplate) return '';
    
    let content = `\n${selectedTemplate.title.toUpperCase()}\n${'='.repeat(40)}\n\n`;
    content += `Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
    
    selectedTemplate.fields.forEach(field => {
      content += `${field.label}:\n${formData[field.key] || '[Not provided]'}\n\n`;
    });
    
    content += `\n${'='.repeat(40)}\n`;
    content += `\nGenerated by SunoLegal - NyayAI\n`;
    content += `This is an auto-generated draft document.\n`;
    
    return content;
  };

  // Render Template Selection (Create Tab) - Modern 2-Column Grid Design
  const renderTemplateList = () => (
    <View style={styles.templateListContainer}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <Text style={styles.sectionTitle}>Document Templates</Text>
        <Text style={styles.sectionSubtitle}>Select a template to generate your legal document</Text>

        <View style={styles.templateGrid}>
          {TEMPLATES.map((template) => {
            const iconColor = getDocumentIconColor(template.id);
            return (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleSelectTemplate(template)}
                activeOpacity={0.85}
              >
                <View style={[styles.templateIconWrapper, { backgroundColor: iconColor + '15' }]}>
                  <Ionicons name={template.icon as any} size={28} color={iconColor} />
                </View>
                <Text style={styles.templateTitle} numberOfLines={2}>{template.title}</Text>
                <Text style={styles.templateSubtitle}>Generate PDF</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );

  // Render Form Screen
  const renderForm = () => (
    <View style={styles.formContainer}>
      {/* Form Header */}
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.formBackButton} onPress={() => setCurrentScreen('list')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.formHeaderInfo}>
          <Text style={styles.formHeaderTitle}>{selectedTemplate?.title}</Text>
          <Text style={styles.formHeaderSubtitle}>Fill in the details below</Text>
        </View>
      </View>

      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        {selectedTemplate?.fields.map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.inputMultiline]}
              placeholder={field.placeholder}
              placeholderTextColor={COLORS.textMuted}
              value={formData[field.key]}
              onChangeText={(text) => setFormData({ ...formData, [field.key]: text })}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 4 : 1}
            />
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Preview Button */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.previewButton} onPress={handlePreview} activeOpacity={0.9}>
          <Ionicons name="eye" size={20} color={COLORS.white} />
          <Text style={styles.previewButtonText}>Preview Document</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Preview Screen
  const renderPreview = () => (
    <View style={styles.previewContainer}>
      {/* Preview Header */}
      <View style={styles.previewHeader}>
        <TouchableOpacity style={styles.formBackButton} onPress={handleEditDetails}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.formHeaderInfo}>
          <Text style={styles.formHeaderTitle}>Preview Document</Text>
          <Text style={styles.formHeaderSubtitle}>Review before final download</Text>
        </View>
      </View>

      {/* Preview Content */}
      <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.previewCard}>
          <View style={styles.previewDocHeader}>
            <Ionicons name="document-text" size={24} color={getDocumentIconColor(selectedTemplate?.id || '')} />
            <Text style={styles.previewDocTitle}>{selectedTemplate?.title}</Text>
          </View>
          <Text style={styles.previewText}>{generatePreviewContent()}</Text>
        </View>
        
        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.amber} />
          <Text style={styles.disclaimerText}>
            Auto-generated draft using NyayAI. Please review carefully before submission.
          </Text>
        </View>
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.editButton} onPress={handleEditDetails} activeOpacity={0.9}>
          <Ionicons name="create" size={20} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Edit Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePDF} activeOpacity={0.9}>
          <Ionicons name="download" size={20} color={COLORS.white} />
          <Text style={styles.generateButtonText}>Generate PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Success Screen
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <ScrollView 
        style={styles.successScrollView}
        contentContainerStyle={styles.successContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIconWrapper}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        </View>
        <Text style={styles.successTitle}>Document Ready!</Text>
        <Text style={styles.successSubtitle}>Your {selectedTemplate?.title} has been generated successfully</Text>
        
        {/* Document Preview Card */}
        <View style={styles.successDocCard}>
          <View style={[styles.successDocIcon, { backgroundColor: getDocumentIconColor(selectedTemplate?.id || '') + '15' }]}>
            <Ionicons name="document-text" size={40} color={getDocumentIconColor(selectedTemplate?.id || '')} />
          </View>
          <View style={styles.successDocInfo}>
            <Text style={styles.successDocName}>{selectedTemplate?.title}</Text>
            <Text style={styles.successDocMeta}>PDF • {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.successActions}>
          <TouchableOpacity style={styles.successActionBtn} onPress={() => handleSaveDocument(generatedDocId || '')}>
            <Ionicons name="bookmark" size={24} color={COLORS.primary} />
            <Text style={styles.successActionText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successActionBtn}>
            <Ionicons name="share-social" size={24} color={COLORS.blue} />
            <Text style={styles.successActionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successActionBtn}>
            <Ionicons name="download" size={24} color={COLORS.success} />
            <Text style={styles.successActionText}>Download</Text>
          </TouchableOpacity>
        </View>

        {/* Lawyer Review CTA - NOW VISIBLE WITHOUT SCROLLING */}
        <TouchableOpacity 
          style={styles.lawyerReviewCTA}
          onPress={() => router.push('/lawyers')}
          activeOpacity={0.9}
        >
          <View style={styles.lawyerReviewContent}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <View style={styles.lawyerReviewText}>
              <Text style={styles.lawyerReviewTitle}>Get Lawyer Review</Text>
              <Text style={styles.lawyerReviewSubtitle}>Expert verification for ₹200</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Bottom Buttons */}
        <View style={styles.successBottomActions}>
          <TouchableOpacity style={styles.viewDocsButton} onPress={handleBackToList} activeOpacity={0.9}>
            <Text style={styles.viewDocsText}>View My Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createNewButton} onPress={handleCreateNew} activeOpacity={0.9}>
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.createNewText}>Create Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // Render Documents List
  const renderDocumentsList = (docs: SavedDocument[], showSaveButton: boolean) => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {docs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No documents yet</Text>
          <Text style={styles.emptySubtitle}>{showSaveButton ? 'Documents you save will appear here' : 'Create your first document'}</Text>
        </View>
      ) : (
        docs.map((doc) => {
          const iconColor = getDocumentIconColor(doc.type);
          return (
            <View key={doc.id} style={styles.documentCard}>
              <View style={[styles.docIconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name="document-text" size={28} color={iconColor} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} • {doc.createdAt} • {doc.size}</Text>
              </View>
              <View style={styles.docActions}>
                {showSaveButton ? (
                  <TouchableOpacity style={styles.docActionBtn} onPress={() => handleRemoveFromSaved(doc.id)}>
                    <Ionicons name="bookmark" size={22} color={COLORS.amber} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.docActionBtn} 
                    onPress={() => doc.isSaved ? handleRemoveFromSaved(doc.id) : handleSaveDocument(doc.id)}
                  >
                    <Ionicons name={doc.isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={doc.isSaved ? COLORS.amber : COLORS.textMuted} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.docActionBtn}>
                  <Ionicons name="share-outline" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.docActionBtn}>
                  <Ionicons name="download-outline" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Render Saved Items with two sections (Documents + Laws)
  const renderSavedItems = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Section 1: Saved Documents */}
      <Text style={styles.savedSectionTitle}>Saved Documents</Text>
      {savedItems.length === 0 ? (
        <View style={styles.sectionEmptyState}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.sectionEmptyText}>No saved documents yet</Text>
        </View>
      ) : (
        savedItems.map((doc) => {
          const iconColor = getDocumentIconColor(doc.type);
          return (
            <View key={doc.id} style={styles.documentCard}>
              <View style={[styles.docIconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name="document-text" size={28} color={iconColor} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} • {doc.createdAt} • {doc.size}</Text>
              </View>
              <View style={styles.docActions}>
                <TouchableOpacity style={styles.docActionBtn} onPress={() => handleRemoveFromSaved(doc.id)}>
                  <Ionicons name="bookmark" size={22} color={COLORS.amber} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.docActionBtn}>
                  <Ionicons name="share-outline" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.docActionBtn}>
                  <Ionicons name="download-outline" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Section 2: Saved Laws & Schemes */}
      <Text style={[styles.savedSectionTitle, { marginTop: 28 }]}>Saved Laws & Schemes</Text>
      {savedLaws.length === 0 ? (
        <View style={styles.sectionEmptyState}>
          <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.sectionEmptyText}>No saved laws yet</Text>
          <Text style={styles.sectionEmptyHint}>Save laws from Laws & Schemes tab</Text>
        </View>
      ) : (
        savedLaws.map((law) => (
          <TouchableOpacity 
            key={law.lawId} 
            style={styles.savedLawCard}
            onPress={() => handleLawPress(law.lawId)}
            activeOpacity={0.9}
          >
            <View style={[styles.lawIconContainer, { backgroundColor: law.tagColor + '20' }]}>
              <Ionicons name="book" size={24} color={law.tagColor} />
            </View>
            <View style={styles.lawInfo}>
              <Text style={styles.lawTitle} numberOfLines={2}>{law.title}</Text>
              <View style={[styles.lawCategoryTag, { backgroundColor: law.tagColor }]}>
                <Text style={styles.lawCategoryText}>{law.tagLabel}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.lawSaveBtn} 
              onPress={() => handleUnsaveLaw(law.lawId)}
            >
              <Ionicons name="bookmark" size={22} color={COLORS.amber} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Main render based on current screen
  if (currentScreen === 'form') return renderForm();
  if (currentScreen === 'preview') return renderPreview();
  if (currentScreen === 'success') return renderSuccess();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF5F0" />
      
      {/* Header */}
      <LinearGradient colors={['#FFF5F0', '#FFFFFF']} style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/logo-transparent.png')} 
            style={styles.headerLogo} 
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Legal Documents</Text>
            <Text style={styles.headerSubtitle}>Generate & manage papers</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={() => router.push('/(settings)')}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'create' && styles.tabActive]} 
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>Create New</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'documents' && styles.tabActive]} 
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[styles.tabText, activeTab === 'documents' && styles.tabTextActive]}>My Documents</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]} 
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>Saved Items</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'create' && renderTemplateList()}
      {activeTab === 'documents' && renderDocumentsList(documents, false)}
      {activeTab === 'saved' && renderSavedItems()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // Header
  header: { paddingTop: 12, paddingBottom: 14, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: { width: 32, height: 32 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  settingsButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  
  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary + '15' },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },
  
  // Content
  content: { flex: 1, padding: 20 },
  
  // Template Grid - Modern 2-Column Grid Design
  templateListContainer: {
    flex: 1,
  },
  templateGrid: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateCard: { 
    width: '48%',
    backgroundColor: COLORS.white, 
    borderRadius: 16, 
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  templateIconWrapper: { 
    width: 56, 
    height: 56, 
    borderRadius: 14, 
    backgroundColor: '#FFF7ED',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12,
  },
  templateTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.textPrimary, 
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  templateSubtitle: { 
    fontSize: 11, 
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  
  // Document Card
  documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  docIconContainer: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  docMeta: { fontSize: 13, color: COLORS.textSecondary },
  docActions: { flexDirection: 'row', gap: 8 },
  docActionBtn: { padding: 8 },
  
  // Empty State
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  
  // Saved Items Sections
  savedSectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  sectionEmptyState: { alignItems: 'center', paddingVertical: 32, backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 12 },
  sectionEmptyText: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted, marginTop: 12 },
  sectionEmptyHint: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  
  // Saved Law Card
  savedLawCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  lawIconContainer: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  lawInfo: { flex: 1 },
  lawTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6, lineHeight: 20 },
  lawCategoryTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  lawCategoryText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  lawSaveBtn: { padding: 8 },

  // Form Screen
  formContainer: { flex: 1, backgroundColor: COLORS.background },
  formHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  formBackButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  formHeaderInfo: { flex: 1 },
  formHeaderTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  formHeaderSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  formContent: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 10 },
  input: { backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  bottomCTA: { padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  previewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 18, gap: 8 },
  previewButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  
  // Preview Screen
  previewContainer: { flex: 1, backgroundColor: COLORS.background },
  previewHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  previewContent: { flex: 1, padding: 20 },
  previewCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  previewDocHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  previewDocTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 12 },
  previewText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22, fontFamily: 'monospace' },
  disclaimerBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.amber + '15', borderRadius: 12, padding: 16, marginTop: 20, gap: 12 },
  disclaimerText: { flex: 1, fontSize: 13, color: COLORS.amber, lineHeight: 20 },
  previewActions: { flexDirection: 'row', padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12 },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 30, paddingVertical: 16, borderWidth: 2, borderColor: COLORS.primary, gap: 8 },
  editButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  generateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success, borderRadius: 30, paddingVertical: 16, gap: 8 },
  generateButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  
  // Success Screen
  successContainer: { flex: 1, backgroundColor: COLORS.background },
  successScrollView: { flex: 1 },
  successContent: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 20, paddingBottom: 40 },
  successIconWrapper: { marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '800', color: COLORS.success, marginBottom: 8 },
  successSubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },
  successDocCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, marginBottom: 32 },
  successDocIcon: { width: 72, height: 72, borderRadius: 18, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  successDocInfo: { flex: 1 },
  successDocName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  successDocMeta: { fontSize: 14, color: COLORS.textSecondary },
  successActions: { flexDirection: 'row', gap: 32 },
  successActionBtn: { alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, minWidth: 80 },
  successActionText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 8 },
  lawyerReviewCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary + '15', padding: 20, borderRadius: 16, marginTop: 24, borderWidth: 1, borderColor: COLORS.primary + '30' },
  lawyerReviewContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lawyerReviewText: { flex: 1 },
  lawyerReviewTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  lawyerReviewSubtitle: { fontSize: 13, color: COLORS.textSecondary },
  successBottomActions: { padding: 20, gap: 12 },
  viewDocsButton: { backgroundColor: COLORS.white, borderRadius: 30, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  viewDocsText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  createNewButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  createNewText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
