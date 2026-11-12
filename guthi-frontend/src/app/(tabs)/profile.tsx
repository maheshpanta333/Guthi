import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [familyNo, setFamilyNo] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = undefined;
      }

      if (!currentUser) {
        setProfileData(null);
        setLoading(false);
        return;
      }

      // Query by userId field (since document ID is familyNo e.g. GT-0001)
      const q = query(
        collection(db, 'registrations'),
        where('userId', '==', currentUser.uid),
        limit(1)
      );

      unsubSnapshot = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            setFamilyNo(docSnap.id);
            setProfileData(docSnap.data());
          } else {
            setProfileData(null);
            setFamilyNo('');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching profile:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  const formatDate = (data: any) => {
    if (data?.registrationDate) return data.registrationDate;
    if (data?.createdAt?.toDate) {
      return data.createdAt.toDate().toLocaleDateString('ne-NP');
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#881337" />
        <Text style={styles.loadingText}>प्रोफाइल लोड हुँदैछ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>मेरो पारिवारिक प्रोफाइल</Text>
          <Text style={styles.headerSub}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
        </View>

        {!profileData ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>तपाईंले अहिलेसम्म पारिवारिक लगत फारम भरेको छैन।</Text>
            <Text style={styles.emptySubText}>कृपया 'दर्ता फारम' ट्याबमा गएर फारम भर्नुहोस्।</Text>
          </View>
        ) : (
          <>
            {/* Verification Status & Family No Banner */}
            <View
              style={[
                styles.statusBanner,
                profileData.status === 'verified' ? styles.statusVerified : styles.statusPending,
              ]}
            >
              <Text style={styles.familyNoText}>
                परिवार नं: {profileData.familyNo || familyNo}
              </Text>
              <Text
                style={[
                  styles.statusBadge,
                  profileData.status === 'verified' ? styles.badgeOk : styles.badgeWait,
                ]}
              >
                {profileData.status === 'verified' ? '✓ प्रमाणित (Verified)' : '⏳ प्रमाणीकरणको प्रतीक्षामा'}
              </Text>
            </View>

            {/* Avatar & Head Details */}
            <View style={styles.card}>
              <View style={styles.profileTopRow}>
                {profileData.photoUrl ? (
                  <Image source={{ uri: profileData.photoUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Text style={styles.placeholderText}>तस्वीर छैन</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.muliName}>{profileData.muliName}</Text>
                  <Text style={styles.metaLabel}>
                    उमेर: <Text style={styles.metaVal}>{profileData.muliAge} वर्ष</Text>
                  </Text>
                  <Text style={styles.metaLabel}>
                    सम्पर्क नं: <Text style={styles.metaVal}>{profileData.contactNo}</Text>
                  </Text>
                  <Text style={styles.metaLabel}>
                    दर्ता मिति: <Text style={styles.metaVal}>{formatDate(profileData)}</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.subHeading}>ठेगाना तथा वंश विवरण</Text>
              <Text style={styles.infoRow}>
                <Text style={styles.bold}>ठेगाना:</Text> {profileData.address} (टोल: {profileData.tol || 'N/A'})
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.bold}>बाबु/पतिको नाम:</Text> {profileData.fatherOrHusband}
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.bold}>बाजे/ससुराको नाम:</Text> {profileData.grandfatherOrFatherInLaw}
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.bold}>परिवार सदस्य संख्या:</Text> {profileData.memberCount} जना
              </Text>
            </View>

            {/* Family Members List */}
            {profileData.members && profileData.members.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.subHeading}>परिवारका अन्य सदस्यहरूको विवरण</Text>
                {profileData.members.map((member: any, index: number) => (
                  <View key={index} style={styles.memberItem}>
                    <Text style={styles.memberSn}>{index + 1}.</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>
                        {member.name} ({member.age || '-'} वर्ष)
                      </Text>
                      <Text style={styles.memberSub}>
                        नाता: {member.relation} | बाबु/पति: {member.fatherOrHusband}
                      </Text>
                      {member.remarks && member.remarks !== '-' ? (
                        <Text style={styles.memberSub}>कैफियत: {member.remarks}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#4B5563', fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: '#881337', padding: 16, borderRadius: 6, marginBottom: 14, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: '#FEE2E2', marginTop: 2 },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusVerified: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  statusPending: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  familyNoText: { fontSize: 13, fontWeight: '800', color: '#881337' },
  statusBadge: { fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  badgeOk: { backgroundColor: '#DCFCE7', color: '#166534' },
  badgeWait: { backgroundColor: '#FEF3C7', color: '#92400E' },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 6, marginBottom: 16, borderWidth: 1, borderColor: '#CBD5E1' },
  profileTopRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 85, height: 85, borderRadius: 42.5, borderWidth: 2, borderColor: '#881337' },
  placeholderAvatar: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 11, color: '#6B7280', fontWeight: '700' },
  muliName: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 4 },
  metaLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  metaVal: { fontWeight: '700', color: '#374151' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  subHeading: { fontSize: 14, fontWeight: '800', color: '#881337', marginBottom: 8 },
  infoRow: { fontSize: 13, color: '#374151', marginBottom: 4 },
  bold: { fontWeight: '700', color: '#1F2937' },
  emptyText: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  emptySubText: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  memberItem: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  memberSn: { fontSize: 13, fontWeight: '800', color: '#881337', width: 24 },
  memberName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  memberSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});