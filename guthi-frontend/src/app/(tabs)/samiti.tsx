import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const committeeMembers = [
  { id: '1', name: 'रामप्रसाद बजगाईं', role: 'अध्यक्ष (President)', phone: '९८५१XXXXXX' },
  { id: '2', name: 'हरिहर बजगाईं', role: 'उपाध्यक्ष (Vice President)', phone: '९८४१XXXXXX' },
  { id: '3', name: 'श्यामसुन्दर बजगाईं', role: 'सचिव (Secretary)', phone: '९८०१XXXXXX' },
  { id: '4', name: 'कृष्णबहादुर बजगाईं', role: 'कोषाध्यक्ष (Treasurer)', phone: '९८६०XXXXXX' },
];

export default function SamitiScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.pageTitle}>संचालक समिति विवरण</Text>
        <FlatList
          data={committeeMembers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberRole}>{item.role}</Text>
                <Text style={styles.memberPhone}>📞 {item.phone}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5EF', alignItems: 'center' },
  inner: { width: '100%', maxWidth: 600, padding: 16, flex: 1 },
  pageTitle: { fontSize: 16, fontWeight: '700', color: '#9A3412', marginBottom: 14 },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#EA580C' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#292524' },
  memberRole: { fontSize: 12, color: '#EA580C', fontWeight: '600', marginVertical: 2 },
  memberPhone: { fontSize: 12, color: '#78350F' },
});