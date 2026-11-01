import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function KuldevtaScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>आराध्य कुलदेवता</Text>
        </View>
        <Text style={styles.heroTitle}>श्री जाल्पा देवी कुलदेवता</Text>
        <Text style={styles.heroSubtitle}>माण्डव्य गोत्रीय बजगाईं बन्धुहरूको वंशज इतिहास तथा परम्परा</Text>
      </View>

      {/* History Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionHeader}>इतिहास तथा उत्पत्ति</Text>
        </View>
        <Text style={styles.bodyText}>
          माण्डव्य गोत्रीय बजगाईं परिवारका वंशजहरूले प्राचीन कालदेखि श्री जाल्पा देवीलाई आफ्नो कुलदेवताको रूपमा स्थापना गरी निष्ठापूर्वक पूजा-आजा गर्दै आएका छन्। कुलदेवताको मन्दिर र पूजास्थल हाम्रो वंशगत एकता, संस्कृति र पहिचानको मुख्य धरोहर हो।
        </Text>
      </View>

      {/* Rituals Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionHeader}>वार्षिक पूजा तथा देवाली</Text>
        </View>
        <Text style={styles.bodyText}>
          प्रत्येक वर्षको वैशाख तथा मंसीर महिनाको शुभ तिथिमा वार्षिक कुलपूजा (देवाली) सम्पन्न गरिन्छ। यस विशेष अवसरमा देशभरि रहेका बन्धु-बान्धवहरू एकै थलोमा भेला भई कुलदेवताको आराधना र भण्डारा गर्ने परम्परा छ।
        </Text>
      </View>

      {/* Rules Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionHeader}>कुलको परम्परा र नियमहरू</Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletMarker} />
          <Text style={styles.bulletText}>देवाली पूजाको अघिल्लो दिनदेखि नै चोखो-नितो गरी शुद्ध आहार ग्रहण गर्नुपर्दछ।</Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletMarker} />
          <Text style={styles.bulletText}>वंश वृद्धि भएका नयाँ सदस्यहरूको नामावली गुठीको स्रेस्तामा अनिवार्य दर्ता गराउनुपर्छ।</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  content: { padding: 16, alignItems: 'center' },
  heroCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#881337',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#881337',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: { color: '#FDE68A', fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 13, color: '#FECDD3', lineHeight: 20 },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    shadowColor: '#44403C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  accentBar: { width: 4, height: 18, backgroundColor: '#881337', borderRadius: 2, marginRight: 10 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1C1917' },
  bodyText: { fontSize: 14, color: '#44403C', lineHeight: 22 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  bulletMarker: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D97706', marginTop: 8, marginRight: 10 },
  bulletText: { fontSize: 14, color: '#44403C', flex: 1, lineHeight: 22 },
});