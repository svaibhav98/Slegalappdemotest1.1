import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header, Card, EmptyState } from '../../components/CommonComponents';
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
      <Header title="Legal Documents" subtitle="Create and manage your documents" rightAction={
        <TouchableOpacity style={styles.addButton} onPress={() => setShowTemplateModal(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      } />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState icon="document-text-outline" title="No documents yet" subtitle="Create your first legal document" action={{ label: 'Create Document', onPress: () => setShowTemplateModal(true) }} />
          <Text style={styles.templatesTitle}>Available Templates</Text>
          <View style={styles.templateGrid}>
            {templates.map((template) => (
              <TouchableOpacity key={template.id} style={[styles.templateCard, { backgroundColor: template.color + '15' }]} onPress={() => handleSelectTemplate(template)}>
                <Ionicons name={template.icon as any} size={32} color={template.color} />
                <Text style={styles.templateTitle}>{template.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {documents.map((doc, index) => (
            <Card key={index} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentIcon}>
                  <Ionicons name="document-text" size={24} color={Colors.primary} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.documentDate}>{new Date(doc.created_at).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.documentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={18} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={18} color={Colors.info} />
                  <Text style={[styles.actionButtonText, { color: Colors.info }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
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
                <TouchableOpacity key={template.id} style={styles.templateOption} onPress={() => handleSelectTemplate(template)}>
                  <View style={[styles.templateOptionIcon, { backgroundColor: template.color + '20' }]}>
                    <Ionicons name={template.icon as any} size={28} color={template.color} />
                  </View>
                  <View style={styles.templateOptionInfo}>
                    <Text style={styles.templateOptionTitle}>{template.title}</Text>
                    <Text style={styles.templateOptionSubtitle}>{template.fields.length} fields</Text>
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
                  <TextInput style={styles.input} placeholder={`Enter ${formatFieldName(field).toLowerCase()}`} value={formData[field]} onChangeText={(text) => setFormData({ ...formData, [field]: text })} />
                </View>
              ))}
              <TouchableOpacity style={styles.submitButton} onPress={handleGenerateDocument}>
                <Text style={styles.submitButtonText}>Generate Document</Text>
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
  emptyContainer: { flex: 1 },
  templatesTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  templateCard: { width: '48%', aspectRatio: 1, borderRadius: 16, padding: 16, justifyContent: 'center', alignItems: 'center' },
  templateTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 12, textAlign: 'center' },
  documentCard: { marginBottom: 16 },
  documentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  documentIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  documentDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  moreButton: { padding: 8 },
  documentActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: Colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: Colors.primary, marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  templateOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  templateOptionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  templateOptionInfo: { flex: 1 },
  templateOptionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  templateOptionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: Colors.text, backgroundColor: Colors.surface },
  submitButton: { marginTop: 24, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
