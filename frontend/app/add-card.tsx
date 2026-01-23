import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLawyerById, createBooking, Lawyer, LawyerPackage } from '../services/lawyersData';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  cardGradientStart: '#4FD1C5',
  cardGradientEnd: '#3B82F6',
};

export default function AddCardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lawyerId, packageId, mode, scheduledDateTime, slots, totalPrice } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<LawyerPackage | null>(null);
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) {
      setLawyer(lawyerData);
      const pkg = lawyerData.packages.find(p => p.id === packageId);
      setSelectedPackage(pkg || null);
    }
  }, [lawyerId, packageId]);

  const handleBack = () => router.back();

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getDisplayCardNumber = () => {
    if (cardNumber.length >= 16) {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);
      return `**** **** **** ${last4}`;
    }
    return cardNumber || '**** **** **** ****';
  };

  const handleContinue = () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const booking = createBooking({
        lawyerId: lawyerId as string,
        lawyerName: lawyer?.name || '',
        userId: 'user-1',
        packageType: selectedPackage?.type || 'chat',
        packageName: selectedPackage?.name || '',
        price: parseInt(totalPrice as string) || selectedPackage?.price || 0,
        duration: (selectedPackage?.duration || 10) * parseInt(slots as string || '1'),
        status: 'confirmed',
        paymentStatus: 'paid',
        scheduledDateTime: scheduledDateTime as string || '',
      });

      setProcessing(false);
      
      router.replace({
        pathname: '/booking-confirmation',
        params: { 
          bookingId: booking.id,
          lawyerId: lawyerId as string,
          packageType: selectedPackage?.type || 'chat',
        }
      });
    }, 2000);
  };

  const isFormValid = cardHolderName.length > 2 && 
                      cardNumber.replace(/\s/g, '').length === 16 && 
                      expiryDate.length === 5 && 
                      cvv.length === 3;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Card</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card Preview */}
          <LinearGradient
            colors={[COLORS.cardGradientStart, COLORS.cardGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardPreview}
          >
            {/* Chip */}
            <View style={styles.cardChip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
            
            {/* Visa Logo */}
            <Text style={styles.visaLogo}>VISA</Text>

            {/* Card Number */}
            <Text style={styles.cardNumberPreview}>{getDisplayCardNumber()}</Text>

            {/* Card Details Row */}
            <View style={styles.cardDetailsRow}>
              <View>
                <Text style={styles.cardLabel}>Card Holder Name</Text>
                <Text style={styles.cardValue}>{cardHolderName || 'Your Name'}</Text>
              </View>
              <View style={styles.expiryPreview}>
                <Text style={styles.cardLabel}>Expiry Date</Text>
                <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Credit Holder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                value={cardHolderName}
                onChangeText={setCardHolderName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={COLORS.textMuted}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.textMuted}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={COLORS.textMuted}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (!isFormValid || processing) && styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!isFormValid || processing}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>
              {processing ? 'Processing...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white,
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 16,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.background, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textPrimary,
  },
  headerSpacer: { width: 44 },

  // Content
  content: { 
    flex: 1,
    paddingHorizontal: 20,
  },

  // Card Preview
  cardPreview: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    height: 200,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 45,
    height: 32,
    backgroundColor: '#E5C16E',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 3,
    backgroundColor: '#C9A84C',
    borderRadius: 2,
  },
  visaLogo: {
    position: 'absolute',
    top: 24,
    right: 24,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    fontStyle: 'italic',
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 3,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  expiryPreview: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Form
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputWithIconPadding: {
    paddingRight: 70,
  },
  visaText: {
    position: 'absolute',
    right: 18,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 16,
    fontWeight: '700',
    color: '#1A237E',
    fontStyle: 'italic',
  },
  rowInputs: {
    flexDirection: 'row',
  },

  // Bottom
  bottomContainer: { 
    padding: 20, 
    backgroundColor: COLORS.white, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border,
  },
  continueButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.primary, 
    borderRadius: 30, 
    paddingVertical: 18,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.white,
  },
});
