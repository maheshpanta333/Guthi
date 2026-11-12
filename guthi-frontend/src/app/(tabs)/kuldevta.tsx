import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, SafeAreaView } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const guthiLogo = require('../../../assets/images/logo.jpg');

type KuldevtaItem = {
  id: string;
  title: string;
  content: string;
  photoUrl: string;
  order?: number;
  createdAtMillis: number;
};

export default function KuldevtaScreen() {
  const [kuldevtaData, setKuldevtaData] = useState<KuldevtaItem[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'kuldevta'),
      (snapshot) => {
        const list: KuldevtaItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt;

          return {
            id: doc.id,
            title: typeof data.title === 'string' ? data.title : '',
            content: typeof data.content === 'string' ? data.content : '',
            photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : '',
            order: typeof data.order === 'number' ? data.order : undefined,
            createdAtMillis:
              createdAt && typeof createdAt.toMillis === 'function'
                ? createdAt.toMillis()
                : 0,
          };
        });
        list.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
          const orderB = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
          if (orderA !== orderB) return orderA - orderB;
          return a.createdAtMillis - b.createdAtMillis;
        });
        setKuldevtaData(list);
        setLoadError(false);
      },
      (error) => {
        console.error('Error fetching kuldevta data:', error);
        setLoadError(true);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Image source={guthiLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>श्री जाल्पा देवी कुलदेवता</Text>
          <Text style={styles.headerSub}>माण्डव्य गोत्रीय बजगाईं बन्धुहरूको वंश इतिहास तथा परम्परा</Text>
        </View>

        {loadError ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>कुलदेवताको विवरण लोड गर्न सकिएन। कृपया पछि पुनः प्रयास गर्नुहोस्।</Text>
          </View>
        ) : kuldevtaData.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>कुलदेवताको विवरण प्रशासक (Admin) बाट थपिँदैछ।</Text>
          </View>
        ) : (
          kuldevtaData.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.itemImage} resizeMode="contain" />
              ) : null}
              <Text style={styles.bodyText}>{item.content}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: '#881337', padding: 20, borderRadius: 6, marginBottom: 16, alignItems: 'center' },
  headerLogo: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', marginBottom: 12, borderWidth: 2, borderColor: '#FDE68A' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', textAlign: 'center' },
  headerSub: { fontSize: 12, color: '#FEE2E2', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 6, marginBottom: 16, borderWidth: 1, borderColor: '#CBD5E1' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#881337', marginBottom: 10 },
  itemImage: { width: '100%', height: 320, borderRadius: 6, marginBottom: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
  bodyText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  emptyText: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', textAlign: 'center' },
});