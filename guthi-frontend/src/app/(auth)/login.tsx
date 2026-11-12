import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useRouter } from 'expo-router';

const guthiLogo = require('../../../assets/images/logo.jpg');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('कृपया इमेल र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'इमेल वा पासवर्ड मिलेन।',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image source={guthiLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>माण्डव्य बजगाईं गुठी</Text>
        <Text style={styles.subtitle}>लगइन गर्नुहोस्</Text>
        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        <Text style={styles.label}>इमेल (Email):</Text>
        <TextInput 
          style={styles.input} 
          placeholder="admin@guthi.com" 
          autoCapitalize="none"
          keyboardType="email-address"
          value={email} 
          onChangeText={setEmail} 
        />

        <Text style={styles.label}>पासवर्ड (Password):</Text>
        <TextInput 
          style={styles.input} 
          placeholder="********" 
          secureTextEntry
          value={password} 
          onChangeText={setPassword} 
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'प्रवेश गर्दै...' : 'लगइन गर्नुहोस्'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/signup')} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>खाता छैन? दर्ता (Sign Up) गर्नुहोस्</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', padding: 24, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  logo: { width: 75, height: 75, borderRadius: 37.5, marginBottom: 12, borderWidth: 2, borderColor: '#FDE68A' },
  title: { fontSize: 17, fontWeight: '900', color: '#881337', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#4B5563', marginBottom: 20, fontWeight: '600' },
  errorMessage: { alignSelf: 'stretch', color: '#B91C1C', fontSize: 13, marginBottom: 8 },
  label: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4, marginTop: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, backgroundColor: '#F9FAFB', color: '#111827' },
  btn: { width: '100%', backgroundColor: '#881337', borderRadius: 4, paddingVertical: 12, alignItems: 'center', marginTop: 18 },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  linkText: { color: '#881337', fontSize: 13, fontWeight: '700' },
});