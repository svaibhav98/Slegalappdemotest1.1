import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#FF9933',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  warning: '#F59E0B',
  success: '#10B981',
};

export default function VerificationPendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Generate application reference ID
  const generateRefId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `SL-${timestamp}`;
  };

  const applicationRefId = generateRefId();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownloadReceipt = () => {
    // Show alert for now (PDF generation would require additional library)
    Alert.alert(
      'Receipt Download',
      `Your acknowledgement receipt has been generated.\n\nApplication ID: ${applicationRefId}\n\nIn a production app, this would download a PDF file with your submission details.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.success, '#059669']}
              style={styles.iconGradient}
            >
              <Ionicons name="checkmark-circle" size={60} color={COLORS.white} />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Verification Submitted</Text>
          <Text style={styles.subtitle}>
            Your application has been received and is currently under verification.{'\n'}
            This process usually takes 24–48 hours.
          </Text>

          {/* Application Reference Card */}
          <View style={styles.refCard}>
            <Text style={styles.refLabel}>Application Reference ID</Text>
            <Text style={styles.refId}>{applicationRefId}</Text>
            <Text style={styles.refNote}>Please save this ID for future reference</Text>
          </View>

          {/* Submission Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Submission Summary</Text>
            
            <View style={styles.summaryRow}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Lawyer Name</Text>
                <Text style={styles.summaryValue}>{params.lawyerName || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Contact</Text>
                <Text style={styles.summaryValue}>As per form submission</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>As per form submission</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Submission Date & Time</Text>
                <Text style={styles.summaryValue}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Ionicons name="hourglass" size={20} color={COLORS.warning} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Pending Verification</Text>
                </View>
              </View>
            </View>
          </View>

          {/* What's Next */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What Happens Next?</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Document Verification</Text>
                <Text style={styles.stepDescription}>
                  Our team will verify your credentials and submitted documents
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Notification</Text>
                <Text style={styles.stepDescription}>
                  You'll receive an email and SMS once verification is complete (24-48 hours)
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Profile Activation</Text>
                <Text style={styles.stepDescription}>
                  After approval, your profile will be live on SunoLegal marketplace
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadReceipt}
          >
            <Ionicons name="download" size={20} color={COLORS.white} />
            <Text style={styles.downloadButtonText}>Download Acknowledgement Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  refCard: {
    width: '100%',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  refLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refId: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  refNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.warning,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginBottom: 16,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  downloadButton: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  homeButton: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
