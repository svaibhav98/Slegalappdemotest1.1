import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerById, Lawyer } from '../services/lawyersData';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  star: '#F59E0B',
  headerDark: '#1F2937',
};

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookingId, lawyerId, packageType } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) setLawyer(lawyerData);
  }, [lawyerId]);

  const handleStartConsultation = () => {
    const path = packageType === 'chat' ? '/consultation-chat' : 
                 packageType === 'voice' ? '/consultation-call' : '/consultation-video';
    router.replace({
      pathname: path,
      params: { bookingId, lawyerId }
    });
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  // Generate consultation details
  const consultationId = bookingId || `SL${Date.now().toString().slice(-8)}`;
  const consultationDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const consultationTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (!lawyer) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerDark} />
      
      <View style={styles.container}>
        {/* Header with Dark Background */}
        <LinearGradient 
          colors={['#1F2937', '#374151']} 
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Booking Confirmed</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          {/* Curved bottom */}
          <View style={styles.curveContainer}>
            <View style={styles.curveBackground} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Lawyer Profile Card - Overlapping */}
          <View style={styles.profileContainer}>
            <View style={styles.profileImageWrapper}>
              <Image source={{ uri: lawyer.image }} style={styles.profileImage} />
              {lawyer.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              )}
            </View>
            
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            <View style={styles.practiceRow}>
              <Text style={styles.practiceArea}>{lawyer.practiceArea}</Text>
              <Text style={styles.separator}>|</Text>
              <View style={styles.availabilityDot} />
              <Text style={styles.availabilityText}>Availability</Text>
            </View>

            {/* Stats Badges */}
            <View style={styles.statsRow}>
              <View style={[styles.statBadge, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="star" size={16} color={COLORS.star} />
                <Text style={styles.statText}>{lawyer.rating} ({lawyer.reviewCount})</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="briefcase" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{lawyer.experience}+ Years</Text>
              </View>
            </View>
          </View>

          {/* Success Message */}
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>Your consultation has been booked successfully</Text>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="document-text" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{consultationId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name={packageType === 'chat' ? 'chatbubble' : packageType === 'voice' ? 'call' : 'videocam'} size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Consultation Type</Text>
              <Text style={styles.detailValue}>{packageType === 'chat' ? 'Chat' : packageType === 'voice' ? 'Voice Call' : 'Video Call'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{consultationDate}, {consultationTime}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="checkmark-done" size={20} color={COLORS.success} />
              <Text style={styles.detailLabel}>Payment Status</Text>
              <Text style={[styles.detailValue, { color: COLORS.success }]}>Paid</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartConsultation} activeOpacity={0.9}>
            <Ionicons name={packageType === 'chat' ? 'chatbubbles' : packageType === 'voice' ? 'call' : 'videocam'} size={20} color={COLORS.white} />
            <Text style={styles.startButtonText}>Start Consultation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  successBanner: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  checkCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  successSubtitle: { fontSize: 15, color: COLORS.white, opacity: 0.9, textAlign: 'center' },
  content: { flex: 1, padding: 20, marginTop: -20 },
  lawyerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  lawyerImage: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  lawyerInfo: { flex: 1 },
  lawyerName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  lawyerPractice: { fontSize: 13, color: COLORS.success, marginTop: 2 },
  detailsCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  detailLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, marginLeft: 12 },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  noteCard: { flexDirection: 'row', backgroundColor: COLORS.primary + '15', borderRadius: 14, padding: 16 },
  noteText: { flex: 1, fontSize: 13, color: COLORS.primary, marginLeft: 12, lineHeight: 20, fontWeight: '500' },
  bottomContainer: { padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 18, marginBottom: 12 },
  startButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginLeft: 8 },
  homeButton: { alignItems: 'center', paddingVertical: 14 },
  homeButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
});