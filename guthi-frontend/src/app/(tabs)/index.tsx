import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, SafeAreaView } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const guthiLogo = require('../../../assets/images/logo.jpg');

export default function HomeScreen() {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotices(list);
      },
      (error) => {
        console.error('Error fetching notices:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <Image source={guthiLogo} style={styles.bannerLogo} resizeMode="contain" />
          <Text style={styles.orgTitle}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
          <Text style={styles.orgSub}>मण्डनदेउपुर नगरपालिका ३, काभ्रेपलाञ्चोक</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📢 गुठीका ताजा सूचनाहरू</Text>
          {notices.length === 0 ? (
            <Text style={styles.emptyText}>हाल कुनै नयाँ सूचना उपलब्ध छैन।</Text>
          ) : (
            notices.map((notice) => (
              <View key={notice.id} style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDate}>{notice.date}</Text>
                <Text style={styles.noticeContent}>{notice.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerBox: {
    backgroundColor: '#881337',
    padding: 20,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#690F2B',
  },
  bannerLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  orgTitle: { fontSize: 17, fontWeight: '900', color: '#FFFFFF', textAlign: 'center' },
  orgSub: { fontSize: 12, fontWeight: '600', color: '#FEE2E2', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 6, marginBottom: 16, borderWidth: 1, borderColor: '#CBD5E1' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  emptyText: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
  noticeCard: {
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#881337',
  },
  noticeTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  noticeDate: { fontSize: 11, color: '#6B7280', marginVertical: 2 },
  noticeContent: { fontSize: 13, color: '#374151', marginTop: 4 },
});