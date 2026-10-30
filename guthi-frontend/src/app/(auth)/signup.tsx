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

export default function SignupScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = () => {
    if (!phone || !password) {
      alert('कृपया मोबाइल नम्बर र पासवर्ड राख्नुहोस्।');
      return;
    }
    // Route to verify screen for phone confirmation during signup
    router.push({ pathname: '/verify', params: { phone } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🪷</Text>
            </View>
            <Text style={styles.orgTitle}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
            <Text style={styles.subtitle}>नयाँ सदस्य दर्ता</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>मोबाइल नम्बर</Text>
            <TextInput
              style={styles.input}
              placeholder="९८XXXXXXXX"
              placeholderTextColor="#A8A29E"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>नयाँ पासवर्ड</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A8A29E"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
              <Text style={styles.buttonText}>अगाडि बढ्नुहोस् (OTP पठाउनुहोस्)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>पहिले नै खाता छ? </Text>
            <Link href="/login" style={styles.link}>
              लगइन गर्नुहोस्
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5EF' },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#7C2D12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  header: { alignItems: 'center', marginBottom: 20 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: { fontSize: 26 },
  orgTitle: { fontSize: 16, fontWeight: '700', color: '#9A3412', textAlign: 'center', lineHeight: 22, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#78350F' },
  form: { width: '100%' },
  label: { fontSize: 12, fontWeight: '600', color: '#44403C', marginBottom: 6 },
  input: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#292524',
    marginBottom: 14,
  },
  primaryButton: { backgroundColor: '#EA580C', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { color: '#78350F', fontSize: 13 },
  link: { color: '#EA580C', fontSize: 13, fontWeight: '700' },
});