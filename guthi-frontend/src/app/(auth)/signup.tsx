import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, Alert, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useRouter } from 'expo-router';

const guthiLogo = require('../../../assets/images/logo.jpg');

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('त्रुटि', 'कृपया इमेल र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Write matching your exact Firestore schema structure
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: email.split('@')[0], // Default fallback name from email
        role: 'user', // Default role for public signups
        createdAt: serverTimestamp(),
      });

      Alert.alert('सफलता', 'तपाईंको खाता सफलतापूर्वक सिर्जना भयो!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('दर्ता असफल', error.message || 'खाता सिर्जना गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image source={guthiLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>माण्डव्य बजगाईं गुठी</Text>
        <Text style={styles.subtitle}>नयाँ खाता सिर्जना गर्नुहोस्</Text>

        <Text style={styles.label}>इमेल (Email):</Text>
        <TextInput 
          style={styles.input} 
          placeholder="yourname@gmail.com" 
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

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'खाता खुल्दैछ...' : 'साइन अप (Sign Up)'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>पहिले नै खाता छ? लगइन गर्नुहोस्</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '150%', maxWidth: 400, backgroundColor: '#FFFFFF', padding: 24, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  logo: { width: 75, height: 75, borderRadius: 37.5, marginBottom: 12, borderWidth: 2, borderColor: '#FDE68A' },
  title: { fontSize: 17, fontWeight: '900', color: '#881337', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#4B5563', marginBottom: 20, fontWeight: '600' },
  label: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4, marginTop: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, backgroundColor: '#F9FAFB', color: '#111827' },
  btn: { width: '100%', backgroundColor: '#881337', borderRadius: 4, paddingVertical: 12, alignItems: 'center', marginTop: 18 },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  linkText: { color: '#881337', fontSize: 13, fontWeight: '700' },
});