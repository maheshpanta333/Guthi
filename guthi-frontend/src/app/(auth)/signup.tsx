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
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!fullName.trim() || !phone.trim() || !password) {
      Alert.alert('अपूर्ण विवरण', 'कृपया सबै आवश्यक विवरणहरू भर्नुहोस्।');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('त्रुटि', 'कृपया १० अंकको मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    setLoading(true);

    try {
      // Format phone into a secure private identifier token for Auth
      const secureEmail = `${phone.trim()}@guthi.org.np`;

      // 1. Create Cloud Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, secureEmail, password);
      const uid = userCredential.user.uid;

      // 2. Save protected document in Firestore database
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        fullName: fullName.trim(),
        phone: phone.trim(),
        role: 'member',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert('सफलता', 'खाता सफलतापूर्वक दर्ता भयो।');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('त्रुटि', 'यो मोबाइल नम्बर पहिले नै दर्ता भइसकेको छ।');
      } else {
        Alert.alert('दर्ता असफल', error.message || 'खाता सिर्जना गर्न सकिएन।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.panelBox}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>नयाँ सदस्यता दर्ता फारम</Text>
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

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.disabledButton]} 
                onPress={handleSignup} 
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'दर्ता हुँदैछ...' : 'दर्ता पेश गर्नुहोस्'}
                </Text>
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