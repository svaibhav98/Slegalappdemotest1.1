import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setMockUser, setGuestMode } = useAuth();

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        setOtp('123456');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use mock user for demo mode
      await setMockUser(phone);
      setLoading(false);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      await setGuestMode();
      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.error('Failed to set guest mode:', err);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo-transparent.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.brandRow}>
            <Text style={styles.brandOrange}>Suno</Text>
            <Text style={styles.brandGreen}>Legal</Text>
          </View>
          <Text style={styles.subtitle}>Nyay (Justice) for All</Text>
          <Text style={styles.tagline}>Your trusted AI legal assistant for India</Text>
        </View>

        <View style={styles.formContainer}>
          {!otpSent ? (
            <>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput style={styles.phoneInput} placeholder="10-digit phone number" placeholderTextColor={Colors.gray400} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} editable={!loading} />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
              </TouchableOpacity>
              
              {/* Guest Mode Button */}
              <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode} activeOpacity={0.8}>
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <Text style={styles.helperText}>We've sent a 6-digit code to +91-{phone}</Text>
              <TextInput style={styles.otpInput} placeholder="• • • • • •" placeholderTextColor={Colors.gray300} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} editable={!loading} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendButton} onPress={() => setOtpSent(false)} disabled={loading}>
                <Text style={styles.resendText}>Change Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.disclaimerText}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </View>

        <Text style={styles.mockNote}>🧪 Demo Mode: Any number works with OTP 123456</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandOrange: { fontSize: 32, fontWeight: '700', color: '#FF9933', letterSpacing: -0.5 },
  brandGreen: { fontSize: 32, fontWeight: '700', color: '#059669', letterSpacing: -0.5 },
  subtitle: { fontSize: 18, fontWeight: '600', color: Colors.secondary, marginBottom: 4 },
  tagline: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  formContainer: { marginBottom: 32 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 10, letterSpacing: -0.3 },
  helperText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 18, backgroundColor: Colors.surface, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  countryCode: { fontSize: 16, fontWeight: '600', color: Colors.text, marginRight: 12, paddingRight: 12, borderRightWidth: 1, borderRightColor: Colors.border },
  phoneInput: { flex: 1, height: 56, fontSize: 16, color: Colors.text, fontWeight: '500' },
  otpInput: { height: 64, borderWidth: 2, borderColor: Colors.primary + '40', borderRadius: 14, paddingHorizontal: 20, fontSize: 24, fontWeight: '700', letterSpacing: 12, textAlign: 'center', backgroundColor: Colors.surface, marginBottom: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  button: { height: 56, backgroundColor: Colors.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.5 },
  guestButton: { height: 56, backgroundColor: Colors.success, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: Colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  guestButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.5 },
  resendButton: { alignItems: 'center', paddingVertical: 12 },
  resendText: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
  error: { fontSize: 14, color: Colors.error, marginBottom: 16, paddingHorizontal: 4 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 20, paddingVertical: 16, backgroundColor: Colors.gray100, borderRadius: 12 },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 18 },
  mockNote: { fontSize: 12, color: Colors.warning, textAlign: 'center', fontStyle: 'italic', fontWeight: '500' },
});
