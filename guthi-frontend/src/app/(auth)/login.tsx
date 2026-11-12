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
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert('अपूर्ण विवरण', 'कृपया मोबाइल नम्बर र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }

    setLoading(true);

    try {
      const secureEmail = `${phone.trim()}@guthi.org.np`;
      const userCredential = await signInWithEmailAndPassword(auth, secureEmail, password);
      const uid = userCredential.user.uid;

      // Check role directly from Firestore and route automatically
      const userDoc = await getDoc(doc(db, 'users', uid));
      const role = userDoc.exists() ? userDoc.data().role : 'user';

      if (role === 'admin') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('लगइन असफल', 'मोबाइल नम्बर वा पासवर्ड मिलेन।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
        <View style={styles.panelBox}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>गुठी पोर्टल लगइन</Text>
            <Text style={styles.panelSub}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
          </View>

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

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'प्रवेश हुँदैछ...' : 'प्रवेश गर्नुहोस् (Login)'}
              </Text>
            </TouchableOpacity>
          </View>

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
  disabledButton: { opacity: 0.7 },
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