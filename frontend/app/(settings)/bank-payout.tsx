import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { background: '#F5F7FA', white: '#FFFFFF', primary: '#FF9933', textPrimary: '#1A1A2E', textSecondary: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB', success: '#10B981' };

export default function BankPayoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bankDetails, setBankDetails] = useState({ accountName: 'Vaibhav Sharma', accountNumber: 'XXXX XXXX 4567', ifsc: 'HDFC0001234', upiId: 'vaibhav@upi' });

  const handleSave = () => Alert.alert('Success', 'Bank details updated!');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank / Payout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹12,450</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>BANK ACCOUNT</Text>
        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account Holder Name</Text>
            <TextInput style={styles.fieldInput} value={bankDetails.accountName} onChangeText={(t) => setBankDetails({...bankDetails, accountName: t})} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput style={styles.fieldInput} value={bankDetails.accountNumber} onChangeText={(t) => setBankDetails({...bankDetails, accountNumber: t})} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>IFSC Code</Text>
            <TextInput style={styles.fieldInput} value={bankDetails.ifsc} onChangeText={(t) => setBankDetails({...bankDetails, ifsc: t})} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>UPI ID (Optional)</Text>
            <TextInput style={styles.fieldInput} value={bankDetails.upiId} onChangeText={(t) => setBankDetails({...bankDetails, upiId: t})} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Bank Details</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  balanceCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 8 },
  balanceLabel: { fontSize: 14, color: COLORS.white, opacity: 0.9 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: COLORS.white, marginVertical: 8 },
  withdrawBtn: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  withdrawBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 1, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  formCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  fieldInput: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.textPrimary },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
