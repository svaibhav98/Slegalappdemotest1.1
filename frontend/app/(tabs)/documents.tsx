import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Card, EmptyState } from '../../components/CommonComponents';
import { documentAPI } from '../../utils/api';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const templates = [
    { id: 'rent_agreement', title: 'Rent Agreement', icon: 'home', color: Colors.primary, fields: ['landlord_name', 'tenant_name', 'address', 'rent_amount', 'security_deposit', 'duration'] },
    { id: 'legal_notice', title: 'Legal Notice', icon: 'mail', color: Colors.warning, fields: ['sender_name', 'sender_address', 'recipient_name', 'recipient_address', 'issue_description', 'demand', 'timeline'] },
    { id: 'affidavit', title: 'Affidavit', icon: 'document-text', color: Colors.info, fields: ['declarant_name', 'declarant_address', 'statement', 'date'] },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.listDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);
    setShowFormModal(true);
    const initialData: any = {};
    template.fields.forEach((field: string) => { initialData[field] = ''; });
    setFormData(initialData);
  };

  const handleGenerateDocument = async () => {
    if (!selectedTemplate) return;

    try {
      await documentAPI.generateDocument({ document_type: selectedTemplate.id, data: formData });
      setShowFormModal(false);
      setSelectedTemplate(null);
      setFormData({});
      loadDocuments();
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  const formatFieldName = (field: string) => {
    return field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.info, Colors.info + 'DD']} style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/logo.jpg')} style={styles.logoSmall} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Legal Documents</Text>
            <Text style={styles.headerSubtitle}>Generate & manage papers</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowTemplateModal(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState icon="document-text-outline" title="No documents yet" subtitle="Start by choosing a template below" />
          <Text style={styles.templatesTitle}>Available Templates</Text>
          <View style={styles.templateGrid}>
            {templates.map((template) => (
              <TouchableOpacity key={template.id} style={styles.templateCardLarge} onPress={() => handleSelectTemplate(template)} activeOpacity={0.85}>
                <LinearGradient colors={[template.color, template.color + 'DD']} style={styles.templateGradient}>
                  <View style={styles.templateIconWrapper}>
                    <Ionicons name={template.icon as any} size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.templateTitleLarge}>{template.title}</Text>
                  <Text style={styles.templateSubtitle}>{template.fields.length} fields</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {documents.map((doc, index) => (
            <Card key={index} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <LinearGradient colors={[Colors.primary + '20', Colors.primary + '10']} style={styles.documentIconGradient}>
                  <Ionicons name="document-text" size={24} color={Colors.primary} />
                </LinearGradient>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.documentDate}>Created {new Date(doc.created_at).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.documentActions}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                  <Ionicons name="download-outline" size={18} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                  <Ionicons name="share-outline" size={18} color={Colors.info} />
                  <Text style={[styles.actionButtonText, { color: Colors.info }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <Modal visible={showTemplateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Template</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {templates.map((template) => (
                <TouchableOpacity key={template.id} style={styles.templateOption} onPress={() => handleSelectTemplate(template)} activeOpacity={0.8}>
                  <LinearGradient colors={[template.color + '25', template.color + '10']} style={styles.templateOptionIconGradient}>
                    <Ionicons name={template.icon as any} size={28} color={template.color} />
                  </LinearGradient>
                  <View style={styles.templateOptionInfo}>
                    <Text style={styles.templateOptionTitle}>{template.title}</Text>
                    <Text style={styles.templateOptionSubtitle}>{template.fields.length} fields to fill</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showFormModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTemplate?.title}</Text>
              <TouchableOpacity onPress={() => setShowFormModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selectedTemplate?.fields.map((field: string) => (
                <View key={field}>
                  <Text style={styles.inputLabel}>{formatFieldName(field)}</Text>
                  <TextInput style={styles.input} placeholder={`Enter ${formatFieldName(field).toLowerCase()}`} placeholderTextColor={Colors.gray400} value={formData[field]} onChangeText={(text) => setFormData({ ...formData, [field]: text })} />
                </View>
              ))}
              <TouchableOpacity style={styles.submitButton} onPress={handleGenerateDocument} activeOpacity={0.9}>
                <Text style={styles.submitButtonText}>Generate Document</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  logoSmall: { width: 48, height: 48, marginRight: 12, borderRadius: 24, backgroundColor: '#FFFFFF' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginTop: 2 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary },
  emptyContainer: { flex: 1 },
  templatesTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 16, letterSpacing: -0.5 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  templateCardLarge: { width: '48%', aspectRatio: 0.9, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  templateGradient: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  templateIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  templateTitleLarge: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4, textAlign: 'center', letterSpacing: -0.3 },
  templateSubtitle: { fontSize: 12, color: '#FFFFFF', opacity: 0.9, textAlign: 'center' },
  documentCard: { marginBottom: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  documentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  documentIconGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4, letterSpacing: -0.3 },
  documentDate: { fontSize: 13, color: Colors.textSecondary },
  moreButton: { padding: 8 },
  documentActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: Colors.background, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', gap: 6 },
  actionButtonText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  templateOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  templateOptionIconGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  templateOptionInfo: { flex: 1 },
  templateOptionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4, letterSpacing: -0.3 },
  templateOptionSubtitle: { fontSize: 13, color: Colors.textSecondary },
  inputLabel: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 10, marginTop: 16, letterSpacing: -0.3 },
  input: { borderWidth: 2, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface, fontWeight: '500' },
  submitButton: { marginTop: 28, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
});
