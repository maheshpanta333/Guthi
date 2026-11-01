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
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = () => {
    if (!fullName || !phone || !password) {
      alert('कृपया सबै आवश्यक विवरणहरू प्रविष्ट गर्नुहोस्।');
      return;
    }
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.panelBox}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>नयाँ सदस्याता दर्ता फारम</Text>
              <Text style={styles.panelSub}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>पूरा नाम (Full Name)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="तपाईको पूरा नाम"
                placeholderTextColor="#A8A29E"
                value={fullName}
                onChangeText={setFullName}
              />

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

              <Text style={styles.inputLabel}>पासवर्ड सिर्जना गर्नुहोस् (Password)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSignup} activeOpacity={0.9}>
                <Text style={styles.submitButtonText}>दर्ता पेश गर्नुहोस् (Register)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.panelFooter}>
              <Text style={styles.footerText}>पहिले नै खाता छ? </Text>
              <Link href="/(auth)/login" style={styles.footerLink}>
                लगइन गर्नुहोस्
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF' },
  innerContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
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
    marginVertical: 20,
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