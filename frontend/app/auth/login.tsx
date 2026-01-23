import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
      const mockEmail = `user${phone}@sunolegal.com`;
      const mockPassword = 'password123';
      
      try {
        await signInWithEmailAndPassword(auth, mockEmail, mockPassword);
      } catch (signInError: any) {
        console.log('Mock auth flow');
      }
      
      setLoading(false);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.title}>SunoLegal</Text>
          <Text style={styles.subtitle}>Nyay (Justice) for All</Text>
          <Text style={styles.tagline}>Your trusted AI legal assistant</Text>
        </View>

        <View style={styles.formContainer}>
          {!otpSent ? (
            <>
              <Text style={styles.label}>Enter Mobile Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput style={styles.phoneInput} placeholder="10-digit phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} editable={!loading} />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <Text style={styles.helperText}>OTP sent to +91 {phone}</Text>
              <TextInput style={styles.otpInput} placeholder="6-digit OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} editable={!loading} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyOTP} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendButton} onPress={() => setOtpSent(false)} disabled={loading}>
                <Text style={styles.resendText}>Change Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.disclaimerText}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </View>

        <Text style={styles.mockNote}>🧪 Mock Mode: Any 10-digit number + any 6-digit OTP works</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 18, fontWeight: '600', color: Colors.secondary, marginBottom: 4 },
  tagline: { fontSize: 14, color: Colors.textSecondary },
  formContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  helperText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, backgroundColor: Colors.surface, marginBottom: 16 },
  countryCode: { fontSize: 16, fontWeight: '600', color: Colors.text, marginRight: 8 },
  phoneInput: { flex: 1, height: 56, fontSize: 16, color: Colors.text },
  otpInput: { height: 56, borderWidth: 2, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, fontSize: 20, fontWeight: '600', letterSpacing: 8, textAlign: 'center', backgroundColor: Colors.surface, marginBottom: 16 },
  button: { height: 56, backgroundColor: Colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  resendButton: { alignItems: 'center' },
  resendText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  error: { fontSize: 14, color: Colors.error, marginBottom: 12 },
  disclaimer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 16 },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4, textAlign: 'center', flex: 1 },
  mockNote: { fontSize: 12, color: Colors.warning, textAlign: 'center', fontStyle: 'italic' },
});
