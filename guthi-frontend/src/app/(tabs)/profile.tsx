import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [familyData, setFamilyData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) setUserData(userSnap.data());

        const regSnap = await getDoc(doc(db, 'registrations', uid));
        if (regSnap.exists()) setFamilyData(regSnap.data());
      } catch (err) {
        console.error('Profile Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#881337" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.wrapper}>
        <View style={styles.headerCard}>
          {familyData?.photoUrl ? (
            <Image source={{ uri: familyData.photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>
                {(userData?.fullName || 'स').charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{familyData?.muliName || userData?.fullName}</Text>
            <Text style={styles.userPhone}>सम्पर्क नं: {familyData?.contactNo || userData?.phone}</Text>
            <Text style={styles.statusBadge}>
              स्थिति: {familyData ? 'फारम दर्ता भइसकेको (Submitted)' : 'फारम भर्न बाँकी (Pending)'}
            </Text>
          </View>
        </View>

        {familyData ? (
          <>
            <View style={styles.sectionBar}>
              <Text style={styles.sectionTitle}>दर्ता गरिएको पारिवारिक विवरण</Text>
            </View>
            <View style={styles.tableBox}>
              <View style={styles.tableRow}>
                <Text style={styles.cellLabel}>स्थायी ठेगाना:</Text>
                <Text style={styles.cellValue}>{familyData.address} ({familyData.tol})</Text>
              </View>
              <View style={styles.tableRowAlt}>
                <Text style={styles.cellLabel}>बाबु / पतिको नाम:</Text>
                <Text style={styles.cellValue}>{familyData.fatherOrHusband}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.cellLabel}>बाजे / ससुराको नाम:</Text>
                <Text style={styles.cellValue}>{familyData.grandfatherOrFatherInLaw}</Text>
              </View>
              <View style={styles.tableRowAlt}>
                <Text style={styles.cellLabel}>कुल सदस्य संख्या:</Text>
                <Text style={styles.cellValue}>{familyData.memberCount} जना</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyNotice}>
            <Text style={styles.emptyNoticeText}>
              तपाईंले अहिलेसम्म पारिवारिक लगत फारम भर्नुभएको छैन। कृपया तलको 'दर्ता फारम' ट्याबमा गएर विवरण भर्नुहोस्।
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: 760 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#881337',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32, marginRight: 16, borderWidth: 1, borderColor: '#CBD5E1' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  headerInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '800', color: '#1C1917', marginBottom: 4 },
  userPhone: { fontSize: 13.5, color: '#475569', marginBottom: 4 },
  statusBadge: { fontSize: 12.5, fontWeight: '700', color: '#881337' },
  sectionBar: {
    backgroundColor: '#E7E5E4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D6D3D1',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1C1917' },
  tableBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4 },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tableRowAlt: { flexDirection: 'row', padding: 12, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  cellLabel: { width: 150, fontSize: 13, fontWeight: '700', color: '#475569' },
  cellValue: { flex: 1, fontSize: 13.5, color: '#0F172A', fontWeight: '600' },
  emptyNotice: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 16, borderRadius: 4 },
  emptyNoticeText: { color: '#92400E', fontSize: 13.5, fontWeight: '600', lineHeight: 20 },
});