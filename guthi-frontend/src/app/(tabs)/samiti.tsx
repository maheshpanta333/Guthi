import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const COMMITTEE_GROUPS = [
  'संस्थापक कार्यसमिति पदाधिकारीहरू',
  'सल्लाहकार समिति',
  'कार्यसमिति सदस्यहरू',
];

const POSITION_PRIORITY: Record<string, number> = {
  'अध्यक्ष': 1,
  'उपाध्यक्ष': 2,
  'महासचिव': 3,
  'कोषाध्यक्ष': 4,
  'सचिव': 5,
  'सदस्य': 6,
  'सल्लाहकार': 7,
};

export default function SamitiScreen() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'sanchalak'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMembers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getGroupedMembers = (groupName: string) => {
    return members
      .filter((m) => (m.group || COMMITTEE_GROUPS[0]) === groupName)
      .sort((a, b) => {
        const rankA = POSITION_PRIORITY[a.position] ?? 99;
        const rankB = POSITION_PRIORITY[b.position] ?? 99;
        if (rankA !== rankB) return rankA - rankB;
        return (a.order ?? 999) - (b.order ?? 999);
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#881337" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>संचालक समिति विवरण</Text>

        {COMMITTEE_GROUPS.map((groupName) => {
          const groupMembers = getGroupedMembers(groupName);
          if (groupMembers.length === 0) return null;

          return (
            <View key={groupName} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupHeaderText}>{groupName}</Text>
              </View>

              {groupMembers.map((m) => (
                <View key={m.id} style={styles.memberCard}>
                  {m.photoUrl ? (
                    <Image source={{ uri: m.photoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {m.name ? m.name.trim().charAt(0) : 'स'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberPosition}>{m.position}</Text>
                    {m.phone ? (
                      <Text style={styles.memberPhone}>सम्पर्क: {m.phone}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {members.length === 0 && (
          <Text style={styles.emptyText}>समिति विवरण उपलब्ध छैन।</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5EE' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF5EE' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#881337',
    marginBottom: 14,
  },
  groupSection: { marginBottom: 18 },
  groupHeader: {
    backgroundColor: '#881337',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 10,
  },
  groupHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3E8D2',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#881337',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  memberPosition: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
});