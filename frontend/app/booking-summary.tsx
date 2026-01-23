import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerById, Lawyer, LawyerPackage } from '../services/lawyersData';
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
  teal: '#14B8A6',
  star: '#F59E0B',
  headerDark: '#1F2937',
};

export default function BookingSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lawyerId, packageId, mode, scheduledDateTime } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<LawyerPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState(1);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) {
      setLawyer(lawyerData);
      const pkg = lawyerData.packages.find(p => p.id === packageId);
      setSelectedPackage(pkg || lawyerData.packages[1]); // Default to chat package
    }
    setLoading(false);
  }, [lawyerId, packageId]);

  const handleProceedToPayment = () => {
    router.push({
      pathname: '/payment',
      params: { 
        lawyerId: lawyerId as string,
        packageId: packageId as string,
        mode: mode as string,
        scheduledDateTime: scheduledDateTime as string || '',
        slots: slots.toString(),
        totalPrice: ((selectedPackage?.price || 0) * slots).toString(),
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const incrementSlots = () => {
    if (slots < 5) setSlots(slots + 1);
  };

  const decrementSlots = () => {
    if (slots > 1) setSlots(slots - 1);
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'voice': return 'call';
      case 'chat': return 'chatbubble-ellipses';
      case 'video': return 'videocam';
      default: return 'chatbubble';
    }
  };

  const totalCost = (selectedPackage?.price || 0) * slots;

  if (loading || !lawyer || !selectedPackage) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Booking</Text>
            <View style={styles.headerSpacer} />
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

        {/* Selected Package */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Selected Package</Text>
          <View style={styles.packageCard}>
            <View style={[styles.packageIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name={getPackageIcon(selectedPackage.type) as any} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>Messaging with {lawyer.name.split(' ').pop()}</Text>
              <Text style={styles.packagePrice}>
                <Text style={styles.priceAmount}>₹{selectedPackage.price}</Text>
                <Text style={styles.priceDuration}>/{selectedPackage.duration} Minutes</Text>
              </Text>
            </View>
            <View style={styles.packageRadio}>
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
            </View>
          </View>

          {/* Slots Counter */}
          <Text style={styles.sectionTitle}>Slots</Text>
          <View style={styles.slotsContainer}>
            <TouchableOpacity 
              style={styles.slotButton} 
              onPress={decrementSlots}
              disabled={slots <= 1}
            >
              <Ionicons name="remove" size={24} color={slots <= 1 ? COLORS.textMuted : COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.slotsCount}>{slots.toString().padStart(2, '0')}</Text>
            <TouchableOpacity 
              style={styles.slotButton} 
              onPress={incrementSlots}
              disabled={slots >= 5}
            >
              <Ionicons name="add" size={24} color={slots >= 5 ? COLORS.textMuted : COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Total Cost */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total cost</Text>
            <Text style={styles.totalValue}>₹{totalCost}</Text>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.payButton} 
            onPress={handleProceedToPayment} 
            activeOpacity={0.9}
          >
            <Text style={styles.payButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
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
  headerSpacer: { width: 44 },
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
    marginTop: 16,
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

  // Content
  content: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.teal,
    marginBottom: 24,
  },
  packageIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  packagePrice: {
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.teal,
  },
  priceDuration: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  packageRadio: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // Slots
  slotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
  },
  slotButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotsCount: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Bottom
  bottomContainer: { 
    padding: 20, 
    backgroundColor: COLORS.white, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border,
  },
  payButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.primary, 
    borderRadius: 30, 
    paddingVertical: 18,
  },
  payButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.white,
  },
});
