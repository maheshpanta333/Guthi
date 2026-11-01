import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface MemberRow {
  name: string;
  age: string;
  fatherOrHusband: string;
  relation: string;
  remarks: string;
}

export default function RegisterFormScreen() {
  // Date State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [muliName, setMuliName] = useState('');
  const [muliAge, setMuliAge] = useState('');
  const [address, setAddress] = useState('');
  const [tol, setTol] = useState('');
  const [fatherOrHusband, setFatherOrHusband] = useState('');
  const [grandfatherOrFatherInLaw, setGrandfatherOrFatherInLaw] = useState('');
  const [contactNo, setContactNo] = useState('');
  
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(3);
  const [members, setMembers] = useState<MemberRow[]>(
    Array.from({ length: 20 }, () => ({
      name: '',
      age: '',
      fatherOrHusband: '',
      relation: '',
      remarks: '',
    }))
  );

  const [collectorName, setCollectorName] = useState('');
  const [collectorPost, setCollectorPost] = useState('');
  const [submitterName, setSubmitterName] = useState('');

  // Handle Date Change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('अनुमति आवश्यक', 'फोटो छान्न ग्यालरी पहुँच अनुमति आवश्यक छ।');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleMemberChange = (index: number, field: keyof MemberRow, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = () => {
    if (!muliName || !address || !contactNo) {
      Alert.alert('अपूर्ण विवरण', 'कृपया परिवारमुलीको नाम, ठेगाना र सम्पर्क नं प्रविष्ट गर्नुहोस्।');
      return;
    }
    Alert.alert('सफलता', 'पारिवारिक लगत फारम सफलतापूर्वक दर्ता भयो।');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formContainer}>
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
          <Text style={styles.headerSub}>मण्डनदेउपुर नगरपालिका ३, काभ्रेपलाञ्चोक</Text>
          <View style={styles.badgeTag}>
            <Text style={styles.badgeTagText}>आधिकारिक पारिवारिक लगत फारम</Text>
          </View>
        </View>

        {/* Top Info Grid (Date Selector + Photo Card) */}
        <View style={styles.topSectionGrid}>
          {/* Interactive Date Picker Box */}
          <View style={styles.dateCard}>
            <Text style={styles.inputLabel}>दर्ता मिति (Date)</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color="#881337" style={{ marginRight: 8 }} />
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString('en-CA')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            <Text style={styles.dateSubText}>फारम पेस गरिने मिति स्वतः चयन हुन्छ</Text>
          </View>

          {/* Photo Upload Card */}
          <TouchableOpacity style={styles.photoUploadCard} onPress={handlePickImage} activeOpacity={0.85}>
            {photoUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.uploadedPhoto} />
                <View style={styles.photoChangeBar}>
                  <Text style={styles.photoChangeText}>फोटो फेर्नुहोस्</Text>
                </View>
              </View>
            ) : (
              <View style={styles.photoPlaceholderBox}>
                <Ionicons name="camera-outline" size={22} color="#64748B" style={{ marginBottom: 4 }} />
                <Text style={styles.photoText}>सदस्यता कायमका लागि फोटो अनिवार्य</Text>
                <Text style={styles.photoBtnText}>फोटो अपलोड</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Section 1: Main Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>१. गुठी सदस्यको पारिवारिक विवरण</Text>
        </View>

        <View style={styles.inputGrid}>
          <View style={[styles.fieldGroup, { flex: 2, minWidth: 200 }]}>
            <Text style={styles.inputLabel}>परिवारमुलीको नाम</Text>
            <TextInput style={styles.textInput} value={muliName} onChangeText={setMuliName} placeholder="पूरा नाम" placeholderTextColor="#A8A29E" />
          </View>

          <View style={[styles.fieldGroup, { width: 100 }]}>
            <Text style={styles.inputLabel}>उमेर (वर्ष)</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={muliAge} onChangeText={setMuliAge} placeholder="उमेर" placeholderTextColor="#A8A29E" />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={[styles.fieldGroup, { flex: 2, minWidth: 200 }]}>
            <Text style={styles.inputLabel}>हालको स्थायी ठेगाना</Text>
            <TextInput style={styles.textInput} value={address} onChangeText={setAddress} placeholder="जिल्ला, पालिका, वडा नं." placeholderTextColor="#A8A29E" />
          </View>

          <View style={[styles.fieldGroup, { flex: 1, minWidth: 120 }]}>
            <Text style={styles.inputLabel}>टोल</Text>
            <TextInput style={styles.textInput} value={tol} onChangeText={setTol} placeholder="टोलको नाम" placeholderTextColor="#A8A29E" />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={[styles.fieldGroup, { flex: 1, minWidth: 180 }]}>
            <Text style={styles.inputLabel}>बाबु / पतिको नाम</Text>
            <TextInput style={styles.textInput} value={fatherOrHusband} onChangeText={setFatherOrHusband} placeholder="बाबु वा पतिको नाम" placeholderTextColor="#A8A29E" />
          </View>

          <View style={[styles.fieldGroup, { flex: 1, minWidth: 180 }]}>
            <Text style={styles.inputLabel}>बाजे / ससुराको नाम</Text>
            <TextInput style={styles.textInput} value={grandfatherOrFatherInLaw} onChangeText={setGrandfatherOrFatherInLaw} placeholder="बाजे वा ससुराको नाम" placeholderTextColor="#A8A29E" />
          </View>
        </View>

        {/* Section 2: Member Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>२. परिवार सदस्य विवरण (मुलीसमेत)</Text>
        </View>

        <View style={styles.memberPickerContainer}>
          <View style={styles.memberPickerHeader}>
            <Text style={styles.inputLabel}>परिवार सदस्य संख्या छनोट गर्नुहोस्:</Text>
            <Text style={styles.memberCountBadge}>{memberCount} जना</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {Array.from({ length: 18 }, (_, i) => i + 3).map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.chipButton, memberCount === num && styles.chipButtonActive]}
                onPress={() => setMemberCount(num)}
              >
                <Text style={[styles.chipText, memberCount === num && styles.chipTextActive]}>
                  {num} जना
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.fieldGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>सम्पर्क नम्बर</Text>
            <TextInput style={styles.textInput} keyboardType="phone-pad" value={contactNo} onChangeText={setContactNo} placeholder="९८XXXXXXXX" placeholderTextColor="#A8A29E" />
          </View>
        </View>

        {/* Section 3: Members Table */}
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 40 }]}>क्र.सं.</Text>
            <Text style={[styles.th, { flex: 2 }]}>नाम, थर</Text>
            <Text style={[styles.th, { width: 55 }]}>उमेर</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>बाबु/पति</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>नाता</Text>
            <Text style={[styles.th, { flex: 1 }]}>कैफियत</Text>
          </View>

          {Array.from({ length: memberCount }).map((_, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.tdIndex, { width: 40 }]}>{idx + 1}</Text>
              <View style={[styles.td, { flex: 2 }]}>
                <TextInput style={styles.tableInput} placeholder="नाम थर" placeholderTextColor="#A8A29E" value={members[idx].name} onChangeText={(val) => handleMemberChange(idx, 'name', val)} />
              </View>
              <View style={[styles.td, { width: 55 }]}>
                <TextInput style={[styles.tableInput, { textAlign: 'center' }]} keyboardType="numeric" placeholder="उमेर" placeholderTextColor="#A8A29E" value={members[idx].age} onChangeText={(val) => handleMemberChange(idx, 'age', val)} />
              </View>
              <View style={[styles.td, { flex: 1.5 }]}>
                <TextInput style={styles.tableInput} placeholder="बाबु/पति" placeholderTextColor="#A8A29E" value={members[idx].fatherOrHusband} onChangeText={(val) => handleMemberChange(idx, 'fatherOrHusband', val)} />
              </View>
              <View style={[styles.td, { flex: 1.5 }]}>
                <TextInput style={styles.tableInput} placeholder="नाता" placeholderTextColor="#A8A29E" value={members[idx].relation} onChangeText={(val) => handleMemberChange(idx, 'relation', val)} />
              </View>
              <View style={[styles.td, { flex: 1 }]}>
                <TextInput style={styles.tableInput} placeholder="कैफियत" placeholderTextColor="#A8A29E" value={members[idx].remarks} onChangeText={(val) => handleMemberChange(idx, 'remarks', val)} />
              </View>
            </View>
          ))}
        </View>

        {/* Section 4: Signature / Verification Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>३. विवरण पेश तथा संकलनकर्ता</Text>
        </View>

        <View style={styles.inputGrid}>
          <View style={[styles.fieldGroup, { flex: 1, minWidth: 200 }]}>
            <Text style={styles.inputLabel}>विवरण पेश गर्नेको नाम थर</Text>
            <TextInput style={styles.textInput} value={submitterName} onChangeText={setSubmitterName} placeholder="पेश गर्नेको नाम" placeholderTextColor="#A8A29E" />
          </View>

          <View style={[styles.fieldGroup, { flex: 1, minWidth: 200 }]}>
            <Text style={styles.inputLabel}>विवरण संकलन गर्नेको नाम थर</Text>
            <TextInput style={styles.textInput} value={collectorName} onChangeText={setCollectorName} placeholder="संकलनकर्ताको नाम" placeholderTextColor="#A8A29E" />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={[styles.fieldGroup, { flex: 1, minWidth: 200 }]}>
            <Text style={styles.inputLabel}>संकलनकर्ताको पद</Text>
            <TextInput style={styles.textInput} value={collectorPost} onChangeText={setCollectorPost} placeholder="पद (उदा. सचिव/सदस्य)" placeholderTextColor="#A8A29E" />
          </View>
        </View>

        {/* Submit Action */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.9}>
          <Text style={styles.submitBtnText}>पारिवारिक विवरण दर्ता गर्नुहोस्</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF' },
  content: { paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center' },
  formContainer: {
    width: '100%',
    maxWidth: 820,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBlock: {
    backgroundColor: '#881337',
    padding: 20,
    borderRadius: 3,
    borderBottomWidth: 3,
    borderBottomColor: '#D97706',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  headerSub: { fontSize: 13, color: '#FEE2E2', fontWeight: '600', marginBottom: 10 },
  badgeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  badgeTagText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  topSectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  dateCard: { flex: 1, minWidth: 220 },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  dateSubText: { fontSize: 10.5, color: '#64748B', marginTop: 4 },
  photoUploadCard: {
    width: 140,
    height: 120,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  photoPlaceholderBox: { padding: 8, alignItems: 'center', justifyContent: 'center', flex: 1 },
  photoText: { fontSize: 9.5, textAlign: 'center', color: '#64748B', fontWeight: '600', marginBottom: 4 },
  photoBtnText: { fontSize: 11, fontWeight: '700', color: '#881337' },
  photoPreviewWrapper: { width: '100%', height: '100%', position: 'relative' },
  uploadedPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoChangeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  photoChangeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  sectionHeader: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#881337',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    marginTop: 6,
  },
  sectionTitle: { fontSize: 13.5, fontWeight: '800', color: '#0F172A', textTransform: 'uppercase' },
  inputGrid: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  fieldGroup: { flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 },
  textInput: {
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  memberPickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    padding: 14,
    marginBottom: 16,
  },
  memberPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  memberCountBadge: { fontSize: 13, fontWeight: '800', color: '#881337' },
  chipScroll: { paddingVertical: 4 },
  chipButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: '#FFFFFF',
  },
  chipButtonActive: { backgroundColor: '#881337', borderColor: '#881337' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  chipTextActive: { color: '#FFFFFF' },

  tableWrapper: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 8,
  },
  th: { fontSize: 11.5, fontWeight: '800', color: '#334155', textAlign: 'center', paddingHorizontal: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#FFFFFF' },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  tdIndex: { fontSize: 12, fontWeight: '700', color: '#475569', textAlign: 'center' },
  td: { padding: 4 },
  tableInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12.5,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#881337',
    paddingVertical: 14,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});