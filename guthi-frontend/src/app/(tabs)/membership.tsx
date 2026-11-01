import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

export default function MembershipScreen() {
  const [amount, setAmount] = useState('');
  const [txnId, setTxnId] = useState('');
  
  // Mock history of past payments
  const [history, setHistory] = useState([
    { id: '1', date: '२०८२/११/१५', amount: 'रु. १,०००', status: 'स्वीकृत (Approved)', txn: 'ESEWA98231' },
    { id: '2', date: '२०८१/११/१०', amount: 'रु. ५००', status: 'स्वीकृत (Approved)', txn: 'KHAL99312' },
  ]);

  const handleSubmitPayment = () => {
    if (!amount || !txnId) {
      alert('कृपया रकम र कारोबार संकेत (Transaction ID) राख्नुहोस्।');
      return;
    }
    const newRecord = {
      id: Date.now().toString(),
      date: 'आज भर्खरै',
      amount: `रु. ${amount}`,
      status: 'प्रक्रियामा (Pending)',
      txn: txnId,
    };
    setHistory([newRecord, ...history]);
    setAmount('');
    setTxnId('');
    alert('भुक्तानी विवरण सफलतापूर्वक पेश गरियो!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bank QR & Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏦 बैंक तथा भुक्तानी विवरण (Bank QR)</Text>
        <Text style={styles.cardSub}>गुठीको खातामा सहयोग वा सदस्यता शुल्क जम्मा गर्नुहोस्</Text>

        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrEmoji}>📱</Text>
          <Text style={styles.qrText}>[ eSewa / Khalti / Bank QR Code ]</Text>
        </View>

        <View style={styles.bankInfoBox}>
          <Text style={styles.bankText}><Text style={styles.bold}>बैंक नाम:</Text> ग्लोबल आइएमई बैंक</Text>
          <Text style={styles.bankText}><Text style={styles.bold}>खाता नाम:</Text> माण्डव्य बजगाईं जाल्पा देवी गुठी</Text>
          <Text style={styles.bankText}><Text style={styles.bold}>खाता नम्बर:</Text> 012010100XXXXX</Text>
          <Text style={styles.bankText}><Text style={styles.bold}>eSewa/Khalti:</Text> ९८XXXXXXXX</Text>
        </View>
      </View>

      {/* Submit Payment Proof Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 भुक्तानी प्रमाणित गर्ने फारम</Text>
        
        <Text style={styles.label}>पठाएको रकम (रु.)</Text>
        <TextInput
          style={styles.input}
          placeholder="उदाहरण: १०००"
          placeholderTextColor="#A8A29E"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>कारोबार संकेत नं. (Transaction ID / Voucher No)</Text>
        <TextInput
          style={styles.input}
          placeholder="उदाहरण: ESEWA_TXN_123456"
          placeholderTextColor="#A8A29E"
          value={txnId}
          onChangeText={setTxnId}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitPayment}>
          <Text style={styles.buttonText}>भुक्तानी पेश गर्नुहोस्</Text>
        </TouchableOpacity>
      </View>

      {/* Payment History Records */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📜 भुक्तानी इतिहास (Payment Records)</Text>
        {history.map((item) => (
          <View key={item.id} style={styles.historyRow}>
            <View>
              <Text style={styles.historyAmount}>{item.amount}</Text>
              <Text style={styles.historyTxn}>Txn: {item.txn} ({item.date})</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5EF' },
  content: { padding: 16, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#9A3412', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#78350F', marginBottom: 16 },
  qrPlaceholder: {
    height: 160,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrEmoji: { fontSize: 36, marginBottom: 6 },
  qrText: { color: '#C2410C', fontSize: 13, fontWeight: '600' },
  bankInfoBox: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  bankText: { fontSize: 13, color: '#44403C', marginBottom: 4 },
  bold: { fontWeight: '700', color: '#78350F' },
  label: { fontSize: 12, fontWeight: '600', color: '#44403C', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#292524',
  },
  primaryButton: { backgroundColor: '#EA580C', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  historyAmount: { fontSize: 14, fontWeight: '700', color: '#292524' },
  historyTxn: { fontSize: 11, color: '#78350F', marginTop: 2 },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#047857' },
});