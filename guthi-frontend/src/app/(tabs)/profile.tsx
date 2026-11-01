import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const userProfile = {
    formNo: 'GUTHI-२०८३-०१४',
    name: 'रामप्रसाद बजगाईं',
    phone: '९८५१२३४५६७',
    address: 'मण्डनदेउपुर नगरपालिका ३, काभ्रेपलाञ्चोक',
    tol: 'देउपुर',
    fatherName: 'हरिहर बजगाईं',
    grandfatherName: 'कृष्णबहादुर बजगाईं',
    totalMembers: '४ जना',
    membershipStatus: 'कायम भएको (Active)',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.wrapper}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{userProfile.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.formBadge}>फारम नं: {userProfile.formNo}</Text>
            <Text style={styles.userPhone}>फोन: {userProfile.phone}</Text>
          </View>
        </View>

        {/* Detailed Info Table */}
        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>व्यक्तिगत तथा पारिवारिक विवरण (Personal Details)</Text>
        </View>

        <View style={styles.tableBox}>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>स्थायी ठेगाना:</Text>
            <Text style={styles.cellValue}>{userProfile.address}</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.cellLabel}>टोल:</Text>
            <Text style={styles.cellValue}>{userProfile.tol}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>बाबु/पतिको नाम:</Text>
            <Text style={styles.cellValue}>{userProfile.fatherName}</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.cellLabel}>बाजे/ससुराको नाम:</Text>
            <Text style={styles.cellValue}>{userProfile.grandfatherName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>परिवार सदस्य संख्या:</Text>
            <Text style={styles.cellValue}>{userProfile.totalMembers}</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.cellLabel}>सदस्यता स्थिति:</Text>
            <Text style={styles.statusText}>{userProfile.membershipStatus}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => alert('विवरण सच्याउन अनुरोध पठाइयो।')}>
            <Text style={styles.secondaryButtonText}>विवरण सच्याउनुहोस्</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#881337',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  headerInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '800', color: '#1C1917', marginBottom: 2 },
  formBadge: { fontSize: 12, fontWeight: '700', color: '#881337', marginBottom: 2 },
  userPhone: { fontSize: 13, color: '#57534E' },
  sectionBar: {
    backgroundColor: '#E7E5E4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D6D3D1',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1C1917', textTransform: 'uppercase' },
  tableBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cellLabel: { width: 160, fontSize: 13, fontWeight: '700', color: '#475569' },
  cellValue: { flex: 1, fontSize: 13.5, color: '#0F172A', fontWeight: '500' },
  statusText: { flex: 1, fontSize: 13, color: '#15803D', fontWeight: '700' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#881337',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: '#881337', fontSize: 13, fontWeight: '700' },
});