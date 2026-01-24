import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLawyerById, Lawyer } from '../services/lawyersData';
import BottomNavBar from '../components/BottomNavBar';

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
  starEmpty: '#E5E7EB',
  headerDark: '#1F2937',
};

export default function PostConsultationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookingId, lawyerId } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) setLawyer(lawyerData);
  }, [lawyerId]);

  const handleRate = () => {
    // Submit rating and navigate home
    router.replace('/(tabs)/home');
  };

  const handleNoThanks = () => {
    router.replace('/(tabs)/home');
  };

  const handleBookAnother = () => {
    if (lawyer) {
      router.push({
        pathname: '/booking-summary',
        params: {
          lawyerId: lawyer.id,
          packageId: lawyer.packages[1].id,
          mode: 'instant'
        }
      });
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons 
            name={i <= rating ? 'star' : 'star-outline'} 
            size={36} 
            color={i <= rating ? COLORS.star : COLORS.starEmpty} 
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  // Generate a mock consultation ID and date
  const consultationId = bookingId || `345465667`;
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/home')}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Consultation</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {/* Curved bottom */}
          <View style={styles.curveContainer}>
            <View style={styles.curveBackground} />
          </View>
        </LinearGradient>

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

        {/* Feedback Card */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>How's your meeting with {lawyer.name.split(' ').pop()}?</Text>
          <Text style={styles.feedbackSubtitle}>Your feedback will help us to make improvements</Text>
          
          {/* Star Rating */}
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          {/* Feedback Input */}
          <TextInput
            style={styles.feedbackInput}
            placeholder="Add your comment here... (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
          />
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.noThanksButton} onPress={handleNoThanks}>
              <Text style={styles.noThanksText}>NO THANKS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rateButton} onPress={handleRate}>
              <Text style={styles.rateButtonText}>RATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Consultation Info */}
        <View style={styles.consultationInfo}>
          <Text style={styles.consultationId}>
            Consultation ID: {consultationId} | {consultationDate} | {consultationTime}
          </Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.bookAnotherButton} 
            onPress={handleBookAnother}
            activeOpacity={0.9}
          >
            <Text style={styles.bookAnotherText}>Book another Session</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation Bar */}
        <BottomNavBar activeTab="home" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  
  // Header
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 60,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.white,
  },
  moreButton: {
    padding: 8,
  },
  curveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    overflow: 'hidden',
  },
  curveBackground: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: -20,
    height: 60,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  // Profile
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
    paddingHorizontal: 20,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  lawyerName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  practiceArea: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 8,
    color: COLORS.textMuted,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },

  // Feedback Card
  feedbackCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  feedbackInput: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  noThanksButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#FCE7DB',
    alignItems: 'center',
  },
  noThanksText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Consultation Info
  consultationInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  consultationId: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Bottom
  bottomContainer: { 
    padding: 20, 
    backgroundColor: COLORS.white, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border,
  },
  bookAnotherButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.primary, 
    borderRadius: 30, 
    paddingVertical: 18,
  },
  bookAnotherText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.white,
  },
});
