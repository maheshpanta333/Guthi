import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!phone || !password) {
      alert('कृपया मोबाइल नम्बर र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <View style={styles.panelBox}>
          {/* Panel Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>गुठी सदस्य लगइन (Member Portal)</Text>
            <Text style={styles.panelSub}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>मोबाइल नम्बर (Mobile Number)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="९८XXXXXXXX"
              placeholderTextColor="#A8A29E"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.inputLabel}>पासवर्ड (Password)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#A8A29E"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin} activeOpacity={0.9}>
              <Text style={styles.submitButtonText}>प्रवेश गर्नुहोस् (Login)</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.panelFooter}>
            <Text style={styles.footerText}>खाता छैन? </Text>
            <Link href="/(auth)/signup" style={styles.footerLink}>
              नयाँ दर्ता गर्नुहोस्
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF' },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  panelBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  panelHeader: {
    backgroundColor: '#881337',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#D97706',
  },
  panelTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  panelSub: { fontSize: 12, color: '#FEE2E2', fontWeight: '600' },
  formContainer: { padding: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#1C1917', marginBottom: 6 },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1C1917',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#881337',
    borderRadius: 3,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  panelFooter: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: { fontSize: 13, color: '#4B5563' },
  footerLink: { fontSize: 13, fontWeight: '700', color: '#881337' },
});