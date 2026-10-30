import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInputInstance,
  TextInputKeyPressEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInputInstance | null)[]>([]);
  const router = useRouter();

  const handleOtpChange = (text: string, index: number) => {
    // Handle pasting a full 6-digit code into the first box
    if (text.length > 1) {
      const pastedCode = text.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pastedCode.forEach((char, idx) => {
        if (index + idx < 6) newOtp[index + idx] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: TextInputKeyPressEvent,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      alert('कृपया ६ अंकको कोड पूर्ण रूपमा राख्नुहोस्।');
      return;
    }
    // Successful registration & verification
    router.replace('/');
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
              <Text style={styles.icon}>💬</Text>
            </View>
            <Text style={styles.title}>फोन प्रमाणीकरण</Text>
            <Text style={styles.subtitle}>
              तपाईंको नम्बर <Text style={styles.phoneHighlight}>{phone || '९८XXXXXXXX'}</Text> मा पठाइएको ६ अंकको कोड राख्नुहोस्।
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpBox}
                keyboardType="number-pad"
                maxLength={6}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
            <Text style={styles.buttonText}>दर्ता पुरा गर्नुहोस्</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendButton} onPress={() => alert('नयाँ कोड पठाइएको छ।')}>
            <Text style={styles.resendText}>पुन: कोड पठाउनुहोस्</Text>
          </TouchableOpacity>
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
  title: { fontSize: 18, fontWeight: '700', color: '#9A3412', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#78350F', textAlign: 'center', lineHeight: 18 },
  phoneHighlight: { fontWeight: '700', color: '#EA580C' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  otpBox: {
    width: 44,
    height: 50,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
  },
  primaryButton: { backgroundColor: '#EA580C', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  resendButton: { alignItems: 'center', marginTop: 16 },
  resendText: { color: '#EA580C', fontSize: 13, fontWeight: '600' },
});