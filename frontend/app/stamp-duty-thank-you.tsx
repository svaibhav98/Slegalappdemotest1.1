import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSavedDocuments } from '../contexts/SavedDocumentsContext';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  teal: '#14B8A6',
  amber: '#F59E0B',
  blue: '#3B82F6',
};

export default function StampDutyThankYouScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { docId, templateId, templateTitle } = params;
  
  // Use shared documents context for persistence
  const { 
    isDocumentSaved, 
    toggleSaveDocument, 
    getDocument,
    updateDocument 
  } = useSavedDocuments();
  
  // Get saved state from context
  const isSaved = isDocumentSaved(docId as string);
  
  // Update document to mark stamp duty as completed
  useEffect(() => {
    if (docId) {
      updateDocument(docId as string, { hasStampDuty: true });
    }
  }, [docId]);

  const handleContinueToLawyerReview = () => {
    router.push('/lawyers');
  };

  const handleViewDocument = () => {
    // Navigate to My Documents tab
    router.replace({
      pathname: '/(tabs)/documents',
      params: { tab: 'documents' }
    });
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  // Toggle save/unsave document using context
  const handleToggleSave = () => {
    if (docId) {
      toggleSaveDocument(docId as string);
      // Show feedback
      const newSavedState = !isSaved;
      Alert.alert(
        newSavedState ? 'Document Saved' : 'Document Unsaved',
        newSavedState 
          ? 'Your document has been saved to My Documents and Saved Items.' 
          : 'Your document has been removed from Saved Items.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle download PDF
  const handleDownload = () => {
    Alert.alert(
      'Download Started',
      `Your ${templateTitle || 'document'} with stamp duty is being downloaded.`,
      [{ text: 'OK' }]
    );
    // In a real app, this would trigger actual PDF download
  };

  // Handle share document
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${templateTitle || 'legal document'} created with SunoLegal (Stamp Duty Completed)`,
        title: templateTitle as string || 'Legal Document',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FFF5F0" />
      
      <LinearGradient colors={['#FFF5F0', '#FFFFFF', '#F8F9FA']} style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon with Animation */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Stamp Duty Completed</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your stamp duty step is complete. You may now proceed with lawyer review or final document actions.
          </Text>

          {/* Document Info Card */}
          <View style={styles.documentCard}>
            <View style={styles.documentIconWrapper}>
              <Ionicons name="document-text" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{templateTitle || 'Document'}</Text>
              <View style={styles.stampBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.stampBadgeText}>Stamp Duty Paid</Text>
              </View>
            </View>
          </View>

          {/* Document Actions - Save / Share / Download */}
          <View style={styles.documentActions}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={handleToggleSave}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isSaved ? 'bookmark' : 'bookmark-outline'} 
                size={24} 
                color={isSaved ? COLORS.amber : COLORS.textMuted} 
              />
              <Text style={[styles.actionBtnText, isSaved && { color: COLORS.amber }]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={24} color={COLORS.blue} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={handleDownload}
              activeOpacity={0.8}
            >
              <Ionicons name="download" size={24} color={COLORS.success} />
              <Text style={styles.actionBtnText}>Download</Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.teal} />
            <Text style={styles.infoText}>
              Your document is now legally valid. Consider getting a lawyer review for complete legal assurance.
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContinueToLawyerReview}
              activeOpacity={0.9}
            >
              <Ionicons name="shield-checkmark" size={22} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Continue to Lawyer Review</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleViewDocument}
              activeOpacity={0.9}
            >
              <Ionicons name="folder-open" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>View Document</Text>
            </TouchableOpacity>
          </View>

          {/* Go Home Link */}
          <TouchableOpacity 
            style={styles.homeLink}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.homeLinkText}>Go to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Icon
  iconWrapper: {
    marginBottom: 32,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  // Document Card
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  documentIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  stampBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },

  // Document Actions - Save / Share / Download
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.teal + '10',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.teal,
    lineHeight: 21,
  },

  // Action Buttons
  actionButtons: {
    width: '100%',
    gap: 14,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Home Link
  homeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  homeLinkText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
