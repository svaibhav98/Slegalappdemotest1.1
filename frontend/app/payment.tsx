import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerById, Lawyer, LawyerPackage } from '../services/lawyersData';
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
  teal: '#14B8A6',
};

interface PaymentMethod {
  id: string;
  name: string;
  email: string;
  icon: 'paypal' | 'google' | 'apple';
  iconColor: string;
  bgColor: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'paypal',
    name: 'Paypal Account',
    email: 'jo******uff@mail.com',
    icon: 'paypal',
    iconColor: '#003087',
    bgColor: '#E8F4FD',
  },
  {
    id: 'google',
    name: 'Google Account',
    email: 'ze*********211@mail.com',
    icon: 'google',
    iconColor: '#4285F4',
    bgColor: '#F1F3F4',
  },
  {
    id: 'apple',
    name: 'Apple Account',
    email: 'li***********ohn@mail.com',
    icon: 'apple',
    iconColor: '#000000',
    bgColor: '#F5F5F7',
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lawyerId, packageId, mode, scheduledDateTime, slots, totalPrice } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<LawyerPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('paypal');

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) {
      setLawyer(lawyerData);
      const pkg = lawyerData.packages.find(p => p.id === packageId);
      setSelectedPackage(pkg || null);
    }
  }, [lawyerId, packageId]);

  const handleBack = () => router.back();

  const handleContinue = () => {
    if (selectedMethod === 'card') {
      router.push({
        pathname: '/add-card',
        params: { 
          lawyerId: lawyerId as string,
          packageId: packageId as string,
          mode: mode as string,
          scheduledDateTime: scheduledDateTime as string || '',
          slots: slots as string,
          totalPrice: totalPrice as string,
        }
      });
    } else {
      // Process mock payment directly
      processPayment();
    }
  };

  const handleAddCard = () => {
    router.push({
      pathname: '/add-card',
      params: { 
        lawyerId: lawyerId as string,
        packageId: packageId as string,
        mode: mode as string,
        scheduledDateTime: scheduledDateTime as string || '',
        slots: slots as string,
        totalPrice: totalPrice as string,
      }
    });
  };

  const processPayment = () => {
    // Navigate to confirmation after mock payment
    const { createBooking } = require('../services/lawyersData');
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

    router.replace({
      pathname: '/booking-confirmation',
      params: { 
        bookingId: booking.id,
        lawyerId: lawyerId as string,
        packageType: selectedPackage?.type || 'chat',
      }
    });
  };

  const renderPaymentIcon = (icon: string, color: string) => {
    switch (icon) {
      case 'paypal':
        return (
          <Text style={[styles.iconText, { color }]}>P</Text>
        );
      case 'google':
        return (
          <Text style={[styles.iconText, { color }]}>G</Text>
        );
      case 'apple':
        return (
          <Ionicons name="logo-apple" size={24} color={color} />
        );
      default:
        return null;
    }
  };

  if (!lawyer || !selectedPackage) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo-transparent.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Suno<Text style={styles.logoTitleAccent}>Legal</Text></Text>
              <Text style={styles.logoSubtitle}>Nyay-AI Powered Legal Assistant</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Which <Text style={styles.titleHighlight}>Payment</Text> do you want to use?</Text>
          </View>

          {/* Payment Methods */}
          <Text style={styles.sectionTitle}>Choose Payment</Text>
          
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.methodIconContainer, { backgroundColor: method.bgColor }]}>
                {renderPaymentIcon(method.icon, method.iconColor)}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodEmail}>{method.email}</Text>
              </View>
              <View style={styles.radioOuter}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Add New Card */}
          <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
            <Ionicons name="add" size={22} color={COLORS.primary} />
            <Text style={styles.addCardText}>Add New Card</Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    backgroundColor: COLORS.white,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.background, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 44,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logoTitleAccent: {
    color: COLORS.teal,
  },
  logoSubtitle: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },

  // Content
  content: { 
    flex: 1,
    backgroundColor: COLORS.white,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 34,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Method Card
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  methodCardSelected: {
    borderColor: COLORS.teal,
    backgroundColor: '#F0FDFA',
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 24,
    fontWeight: '700',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  methodEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
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

  // Add Card Button
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
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
  continueButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.white,
  },
});
