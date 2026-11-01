import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const notices = [
    {
      id: '1',
      title: 'वार्षिक कुलपूजा तथा देवाली सम्बन्धी महत्वपूर्ण सूचना',
      date: '२०८३ बैशाख १५',
      content: 'यस माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठीको वार्षिक पूजा आगामी बैशाख १५ गते मूल मन्दिर परिसरमा हुने भएकाले सम्पूर्ण बन्धुवानहरूमा अनिवार्य उपस्थितिका लागि हार्दिक अनुरोध गरिन्छ।',
    },
    {
      id: '2',
      title: 'गुठी साधारण सभा तथा आर्थिक प्रतिवेदन प्रस्तुतसम्बन्धी',
      date: '२०८३ जेठ ०२',
      content: 'गुठीको आगामी कार्ययोजना तथा वार्षिक लेखा परीक्षण प्रतिवेदन पेश गर्नका लागि कार्यसमितिको बैठक तथा साधारण सभा आह्वान गरिएको छ।',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.wrapper}>
        {/* Institutional Banner Block */}
        <View style={styles.bannerBlock}>
          <Text style={styles.bannerTitle}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
          <Text style={styles.bannerSubtitle}>केन्द्रीय आधिकारिक पोर्टल • धुलिखेल, नेपाल</Text>
        </View>

        {/* Section Heading */}
        <View style={styles.tableHeaderBar}>
          <Text style={styles.tableHeaderText}>सूचना तथा समाचार पाटी (Notices & Announcements)</Text>
        </View>

        {/* Notices Stack */}
        {notices.map((item) => (
          <View key={item.id} style={styles.noticeRow}>
            <View style={styles.noticeMetaBar}>
              <Text style={styles.noticeTitleText}>{item.title}</Text>
              <Text style={styles.noticeDateText}>{item.date}</Text>
            </View>
            <View style={styles.noticeBodyBox}>
              <Text style={styles.noticeContentText}>{item.content}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },
  content: { padding: 20, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: 800 },
  bannerBlock: {
    backgroundColor: '#881337',
    borderLeftWidth: 6,
    borderLeftColor: '#D97706',
    padding: 20,
    marginBottom: 24,
    borderRadius: 2,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12.5, color: '#FEE2E2', fontWeight: '600' },
  tableHeaderBar: {
    backgroundColor: '#E7E5E4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D6D3D1',
    marginBottom: 12,
  },
  tableHeaderText: { fontSize: 13, fontWeight: '700', color: '#1C1917', textTransform: 'uppercase' },
  noticeRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6D3D1',
    marginBottom: 12,
    borderRadius: 2,
  },
  noticeMetaBar: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  noticeTitleText: { fontSize: 14, fontWeight: '700', color: '#1C1917', flex: 1, marginRight: 10 },
  noticeDateText: { fontSize: 12, fontWeight: '700', color: '#9F1239' },
  noticeBodyBox: { padding: 14 },
  noticeContentText: { fontSize: 13.5, color: '#44403C', lineHeight: 21 },
});