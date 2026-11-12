import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const fonepayImage = require('../../../assets/images/fonepay.jpg');

export default function MembershipScreen() {
  const [amount, setAmount] = useState('');
  const [txnId, setTxnId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userPayments, setUserPayments] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(collection(db, 'payments'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUserPayments(list);
    });

    return () => unsubscribe();
  }, []);

  const totalVerified = userPayments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const handleDownloadQr = () => {
    if (Platform.OS === 'web') {
      const resolved = typeof Image.resolveAssetSource === 'function'
        ? Image.resolveAssetSource(fonepayImage)
        : undefined;

      const assetUri = resolved?.uri ?? '';

      if (!assetUri) {
        Alert.alert('त्रुटि', 'QR कोड डाउनलोड गर्न सकिएन।');
        return;
      }

      const link = document.createElement('a');
      link.href = assetUri;
      link.download = 'Mandawya_Bajagain_Guthi_FonePay_QR.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('जानकारी', 'तपाईंले यो QR कोडलाई आफ्नो मोबाइल ग्यालरीमा सेभ गर्न सक्नुहुन्छ।');
    }
  };

  const handlePaymentSubmit = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('त्रुटि', 'कृपया पहिले लगइन गर्नुहोस्।');
      return;
    }

    if (!amount.trim() || !txnId.trim()) {
      Alert.alert('अपूर्ण विवरण', 'कृपया पठाएको रकम र कारोबार संकेत नं. (Transaction ID) प्रविष्ट गर्नुहोस्।');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'payments'), {
        userId: currentUser.uid,
        email: currentUser.email || 'N/A',
        amount: amount.trim(),
        txnId: txnId.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert('सफलता', 'तपाईंको भुक्तानी विवरण प्रमाणीकरणको लागि प्रशासकलाई पठाइयो।');
      setAmount('');
      setTxnId('');
    } catch (error: any) {
      Alert.alert('त्रुटि', error.message || 'डेटा पठाउन सकिएन।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Compact Payment Tracker & Horizontal Wheel */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>भुक्तानी ट्र्याकर तथा इतिहास</Text>
          
          <View style={styles.trackerSummaryBox}>
            <Text style={styles.trackerSummaryLabel}>कुल प्रमाणित रकम:</Text>
            <Text style={styles.trackerSummaryValue}>रु. {totalVerified}</Text>
          </View>

          <Text style={styles.trackerSubHeading}>तपाईंका हालका भुक्तानीहरू:</Text>
          
          {userPayments.length === 0 ? (
            <Text style={styles.emptyText}>कुनै भुक्तानी रेकर्ड फेला परेन।</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wheelContainer}>
              {userPayments.map((p) => (
                <View key={p.id} style={styles.wheelItemCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.paymentAmountText}>रु. {p.amount}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: p.status === 'verified' ? '#DCFCE7' : '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: p.status === 'verified' ? '#166534' : '#92400E' }]}>
                        {p.status === 'verified' ? 'प्रमाणित' : 'प्रक्रियामा'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.paymentTxnText} numberOfLines={1}>Txn: {p.txnId}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bank & QR Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>बैंक तथा भुक्तानी विवरण (FonePay QR)</Text>
          <Text style={styles.subText}>गुठीको खातामा सहयोग वा सदस्यता शुल्क जम्मा गर्नुहोस्</Text>
          
          <View style={styles.qrContainer}>
            <Image source={fonepayImage} style={styles.qrImage} resizeMode="contain" />
            
            <TouchableOpacity style={styles.payLinkBtn} onPress={handleDownloadQr} activeOpacity={0.85}>
              <Text style={styles.payLinkText}>QR कोड डाउनलोड गर्नुहोस्</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>खाता नाम:</Text> MANDAWYA BAJAGAIN JALPA DEVI KULDEWATA GUTHI
            </Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>बैंक:</Text> ग्लोबल आइएमई बैंक (धुलिखेल शाखा)
            </Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>Terminal ID:</Text> 2222030020424714
            </Text>
          </View>
        </View>

        {/* Payment Verification Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>भुक्तानी प्रमाणित गर्ने फारम</Text>

          <Text style={styles.label}>पठाएको रकम (रु.):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="उदाहरण: १०००" 
            keyboardType="numeric"
            value={amount} 
            onChangeText={setAmount} 
          />

          <Text style={styles.label}>कारोबार संकेत नं. (Transaction ID):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="उदाहरण: FONEPAY_TXN_123456" 
            value={txnId} 
            onChangeText={setTxnId} 
          />

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.disabledBtn]} 
            onPress={handlePaymentSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>{submitting ? 'पेश गर्दै...' : 'प्रमाणित गर्न पेस गर्नुहोस्'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 12, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#881337', marginBottom: 4 },
  subText: { fontSize: 11, color: '#4B5563', marginBottom: 10 },
  qrContainer: { alignItems: 'center', marginVertical: 8, backgroundColor: '#FAFAFA', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  qrImage: { width: 180, height: 220 },
  payLinkBtn: {
    marginTop: 10,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  payLinkText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  infoBox: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 4, borderWidth: 1, borderColor: '#FDE68A', marginTop: 6 },
  infoText: { fontSize: 12, color: '#374151', marginBottom: 4 },
  bold: { fontWeight: '700', color: '#1F2937' },
  label: { fontSize: 11, fontWeight: '700', color: '#374151', marginTop: 8, marginBottom: 3 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 7, fontSize: 12, backgroundColor: '#F9FAFB', color: '#111827' },
  submitBtn: { backgroundColor: '#881337', borderRadius: 4, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  trackerSummaryBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackerSummaryLabel: { fontSize: 12, fontWeight: '700', color: '#166534' },
  trackerSummaryValue: { fontSize: 14, fontWeight: '900', color: '#166534' },
  trackerSubHeading: { fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 4, marginBottom: 6 },
  wheelContainer: { paddingVertical: 4 },
  wheelItemCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    width: 150,
  },
  paymentAmountText: { fontSize: 13, fontWeight: '800', color: '#111827' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 9, fontWeight: '700' },
  paymentTxnText: { fontSize: 11, color: '#4B5563', marginTop: 2 },
  emptyText: { fontStyle: 'italic', color: '#6B7280', fontSize: 11 },
});