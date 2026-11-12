import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useRouter } from 'expo-router';

// ---------- Popup helpers ----------
const confirmAction = (
  title: string,
  message: string,
  confirmText: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    else onCancel?.();
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'रद्द गर्नुहोस्', style: 'cancel', onPress: onCancel },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true, onDismiss: onCancel }
    );
  }
};

// ---------- Input helpers ----------
const MAX_MEMBERS = 30;
const blankMember = () => ({ name: '', age: '', fatherOrHusband: '', relation: '', remarks: '' });

const toAsciiDigits = (t: string) =>
  t.replace(/[\u0966-\u096F]/g, (d) => String(d.charCodeAt(0) - 0x0966));
const onlyDigits = (t: string, max: number) => toAsciiDigits(t).replace(/\D/g, '').slice(0, max);

const cleanName = (t: string) => t.replace(/[^A-Za-z\u0900-\u0965\u0970-\u097F\s.]/g, '');
const isName = (t: string) =>
  /^[A-Za-z\u0900-\u0965\u0970-\u097F][A-Za-z\u0900-\u0965\u0970-\u097F\s.]*$/.test(t);

const cleanAddress = (t: string) => t.replace(/[^A-Za-z0-9\u0900-\u097F\s,.\-\/]/g, '');
const isAddress = (t: string) => /[A-Za-z\u0900-\u0965\u0970-\u097F]/.test(t);

const isNepaliMobile = (t: string) => /^9[678]\d{8}$/.test(t);
const inRange = (t: string, min: number, max: number) =>
  /^\d+$/.test(t) && Number(t) >= min && Number(t) <= max;

export default function RegistrationScreen() {
  const router = useRouter();
  const [muliName, setMuliName] = useState('');
  const [address, setAddress] = useState('');
  const [tol, setTol] = useState('');
  const [fatherOrHusband, setFatherOrHusband] = useState('');
  const [grandfatherOrFatherInLaw, setGrandfatherOrFatherInLaw] = useState('');
  const [muliAge, setMuliAge] = useState('');
  const [memberCount, setMemberCount] = useState('1');
  const [contactNo, setContactNo] = useState('');

  // Photos (stored as compressed JPEG base64 Data URLs)
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [citizenshipFrontUri, setCitizenshipFrontUri] = useState<string | null>(null);
  const [citizenshipBackUri, setCitizenshipBackUri] = useState<string | null>(null);

  // Members dynamic rows
  const [members, setMembers] = useState<any[]>([blankMember()]);
  const [submitting, setSubmitting] = useState(false);

  const [familyNo, setFamilyNo] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // ---------- Snackbar ----------
  type SnackType = 'error' | 'success' | 'warning';
  const [snack, setSnack] = useState<{ title: string; message: string; type: SnackType } | null>(null);
  const slide = useRef(new Animated.Value(0)).current;
  const snackTimer = useRef<any>(null);
  const snackDone = useRef<(() => void) | undefined>(undefined);

  const hideSnack = () => {
    clearTimeout(snackTimer.current);
    Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }).start(
      ({ finished }) => {
        if (!finished) return;
        setSnack(null);
        const cb = snackDone.current;
        snackDone.current = undefined;
        cb?.();
      }
    );
  };

  const notify = (title: string, message: string, onOk?: () => void) => {
    const type: SnackType = title === 'सफलता' ? 'success' : title === 'अपूर्ण विवरण' ? 'warning' : 'error';
    clearTimeout(snackTimer.current);
    snackDone.current = onOk;
    setSnack({ title, message, type });
    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
    const ms = type === 'success' ? 2500 : Math.min(15000, 4000 + message.length * 50);
    snackTimer.current = setTimeout(hideSnack, ms);
  };

  useEffect(() => () => clearTimeout(snackTimer.current), []);

  // Fill form from saved registration (data URLs display directly in <Image> without manual decompression)
  const fillForm = (d: any, no: string) => {
    setMuliName(d.muliName ?? '');
    setAddress(d.address ?? '');
    setTol(d.tol ?? '');
    setFatherOrHusband(d.fatherOrHusband ?? '');
    setGrandfatherOrFatherInLaw(d.grandfatherOrFatherInLaw ?? '');
    setMuliAge(d.muliAge ?? '');
    setContactNo(d.contactNo ?? '');
    setPhotoUri(d.photoUrl ?? null);
    setCitizenshipFrontUri(d.citizenshipFrontUrl ?? null);
    setCitizenshipBackUri(d.citizenshipBackUrl ?? null);
    const loaded =
      Array.isArray(d.members) && d.members.length
        ? d.members.map((m: any) => ({ ...blankMember(), ...m }))
        : [blankMember()];
    setMembers(loaded);
    setMemberCount(String(loaded.length));
    setFamilyNo(no);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setInitializing(false);
        return;
      }
      try {
        const q = query(collection(db, 'registrations'), where('userId', '==', user.uid), limit(1));
        const res = await getDocs(q);
        if (!res.empty) {
          const found = res.docs[0];
          fillForm(found.data(), found.id);
        }
      } catch (e: any) {
        notify('त्रुटि', e.message);
      } finally {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  // Auto-compress image to lightweight JPEG Data URL
  const compressImage = async (uri: string, maxWidth: number): Promise<string> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );
    if (manipulated.base64) {
      return `data:image/jpeg;base64,${manipulated.base64}`;
    }
    // Fallback if base64 wasn't returned on a specific platform
    const response = await fetch(manipulated.uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const pickImage = async (type: 'profile' | 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const maxWidth = type === 'profile' ? 400 : 900;
        const compressedDataUrl = await compressImage(result.assets[0].uri, maxWidth);
        if (type === 'profile') setPhotoUri(compressedDataUrl);
        if (type === 'front') setCitizenshipFrontUri(compressedDataUrl);
        if (type === 'back') setCitizenshipBackUri(compressedDataUrl);
      } catch (e: any) {
        notify('त्रुटि', 'तस्वीर कम्प्रेस गर्न सकिएन: ' + (e?.message || ''));
      }
    }
  };

  const ensureCompressedBase64 = async (uri: string, maxWidth: number): Promise<string> => {
    if (uri.startsWith('data:')) return uri;
    return compressImage(uri, maxWidth);
  };

  const handleMemberChange = (text: string, index: number, field: string) => {
    let value = text;
    if (field === 'age') value = onlyDigits(text, 3);
    else if (field !== 'remarks') value = cleanName(text);
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMemberRow = () => {
    if (members.length >= MAX_MEMBERS) {
      notify('सीमा नाघ्यो', `अधिकतम ${MAX_MEMBERS} सदस्य मात्र थप्न सकिन्छ।`);
      return;
    }
    setMembers([...members, blankMember()]);
    setMemberCount(String(members.length + 1));
  };

  const removeMemberRow = (index: number) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    setMemberCount(String(updated.length));
  };

  const applyMemberCount = () => {
    const n = parseInt(memberCount, 10);
    if (!n || n < 1) {
      setMemberCount(String(members.length));
      return;
    }
    if (n > MAX_MEMBERS) {
      notify('सीमा नाघ्यो', `अधिकतम ${MAX_MEMBERS} सदस्य मात्र थप्न सकिन्छ।`);
    }
    const target = Math.min(n, MAX_MEMBERS);

    if (target === members.length) {
      setMemberCount(String(target));
      return;
    }
    if (target > members.length) {
      const extra = Array.from({ length: target - members.length }, () => blankMember());
      setMembers([...members, ...extra]);
      setMemberCount(String(target));
      return;
    }

    const hasData = members
      .slice(target)
      .some((m) => Object.values(m).some((v) => String(v).trim() !== ''));
    const shrink = () => {
      setMembers(members.slice(0, target));
      setMemberCount(String(target));
    };
    if (!hasData) {
      shrink();
      return;
    }
    confirmAction(
      'सदस्य हटाउने?',
      `सदस्य ${target + 1} देखि ${members.length} सम्मको विवरण मेटिनेछ।`,
      'मेटाउनुहोस्',
      shrink,
      () => setMemberCount(String(members.length))
    );
  };

  const validate = () => {
    const missing: string[] = [];
    const invalid: string[] = [];

    const filled = (v: string, label: string) => {
      if (!v.trim()) {
        missing.push(label);
        return false;
      }
      return true;
    };

    if (filled(muliName, 'परिवारमुलीको नाम थर') && !isName(muliName.trim()))
      invalid.push('परिवारमुलीको नाम थर (अक्षर मात्र)');
    if (filled(address, 'स्थायी ठेगाना') && !isAddress(address.trim()))
      invalid.push('स्थायी ठेगाना (अक्षर समावेश हुनुपर्छ)');
    if (filled(tol, 'टोल') && !isName(tol.trim())) invalid.push('टोल (अक्षर मात्र)');
    if (filled(fatherOrHusband, 'बाबु/पतिको नाम') && !isName(fatherOrHusband.trim()))
      invalid.push('बाबु/पतिको नाम (अक्षर मात्र)');
    if (filled(grandfatherOrFatherInLaw, 'बाजे/ससुराको नाम') && !isName(grandfatherOrFatherInLaw.trim()))
      invalid.push('बाजे/ससुराको नाम (अक्षर मात्र)');
    if (filled(muliAge, 'उमेर') && !inRange(muliAge.trim(), 1, 120))
      invalid.push('उमेर (1 देखि 120 बीचको अङ्क)');
    if (filled(memberCount, 'परिवार सदस्य संख्या')) {
      if (!inRange(memberCount.trim(), 1, MAX_MEMBERS)) {
        invalid.push(`परिवार सदस्य संख्या (1 देखि ${MAX_MEMBERS} बीच)`);
      } else if (Number(memberCount) !== members.length) {
        invalid.push(`सदस्य संख्या (${memberCount}) र तलका सदस्य विवरण (${members.length}) मिलेन`);
      }
    }
    if (filled(contactNo, 'सम्पर्क नम्बर') && !isNepaliMobile(contactNo.trim()))
      invalid.push('सम्पर्क नम्बर (98/97/96 बाट सुरु हुने 10 अङ्कको नेपाली मोबाइल नम्बर)');

    if (!photoUri) missing.push('मुलीको तस्वीर');
    if (!citizenshipFrontUri) missing.push('नागरिकता (अगाडि)');
    if (!citizenshipBackUri) missing.push('नागरिकता (पछाडि)');

    members.forEach((m, i) => {
      const p = `सदस्य ${i + 1}: `;
      if (filled(m.name, p + 'नाम थर') && !isName(m.name.trim())) invalid.push(p + 'नाम (अक्षर मात्र)');
      if (filled(m.age, p + 'उमेर') && !inRange(m.age.trim(), 0, 120)) invalid.push(p + 'उमेर (0 देखि 120)');
      if (filled(m.fatherOrHusband, p + 'बाबु/पति') && !isName(m.fatherOrHusband.trim()))
        invalid.push(p + 'बाबु/पति (अक्षर मात्र)');
      if (filled(m.relation, p + 'नाता') && !isName(m.relation.trim())) invalid.push(p + 'नाता (अक्षर मात्र)');
      filled(m.remarks, p + 'कैफियत');
    });

    return { missing, invalid };
  };

  const handleSubmit = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      notify('त्रुटि', 'कृपया पहिले लगइन गर्नुहोस्।');
      return;
    }

    const { missing, invalid } = validate();
    if (missing.length) {
      notify('अपूर्ण विवरण', 'कृपया निम्न विवरण भर्नुहोस्:\n\n' + missing.map((m) => '• ' + m).join('\n'));
      return;
    }
    if (invalid.length) {
      notify('अमान्य विवरण', 'कृपया यी विवरण सच्याउनुहोस्:\n\n' + invalid.map((m) => '• ' + m).join('\n'));
      return;
    }

    setSubmitting(true);
    try {
      const photoBase64 = await ensureCompressedBase64(photoUri as string, 400);
      const frontBase64 = await ensureCompressedBase64(citizenshipFrontUri as string, 900);
      const backBase64 = await ensureCompressedBase64(citizenshipBackUri as string, 900);

      const data = {
        muliName: muliName.trim(),
        address: address.trim(),
        tol: tol.trim(),
        fatherOrHusband: fatherOrHusband.trim(),
        grandfatherOrFatherInLaw: grandfatherOrFatherInLaw.trim(),
        muliAge: muliAge.trim(),
        memberCount: String(members.length),
        contactNo: contactNo.trim(),
        photoUrl: photoBase64,
        citizenshipFrontUrl: frontBase64,
        citizenshipBackUrl: backBase64,
        members: members.map((m) => ({
          name: m.name.trim(),
          age: m.age.trim(),
          fatherOrHusband: m.fatherOrHusband.trim(),
          relation: m.relation.trim(),
          remarks: m.remarks.trim(),
        })),
        status: 'pending',
        updatedAt: serverTimestamp(),
      };

      if (familyNo) {
        await updateDoc(doc(db, 'registrations', familyNo), data);
        notify('सफलता', `परिवार नम्बर ${familyNo} को फारम अद्यावधिक गरियो।`, () => router.back());
      } else {
        const counterRef = doc(db, 'counters', 'registrations');
        const newNo = await runTransaction(db, async (tx) => {
          const snap = await tx.get(counterRef);
          const next = (snap.exists() ? (snap.data().last as number) : 0) + 1;
          const no = `GT-${String(next).padStart(4, '0')}`;
          tx.set(counterRef, { last: next });
          tx.set(doc(db, 'registrations', no), {
            ...data,
            familyNo: no,
            userId: currentUser.uid,
            email: currentUser.email || 'N/A',
            createdAt: serverTimestamp(),
          });
          return no;
        });
        setFamilyNo(newNo);
        notify(
          'सफलता',
          `तपाईंको पारिवारिक लगत फारम प्रशासकलाई पठाइयो।\n\nतपाईंको परिवार नम्बर: ${newNo}`,
          () => router.back()
        );
      }
    } catch (e: any) {
      notify('त्रुटि', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#881337" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {snack && (
        <Animated.View
          style={[
            styles.snack,
            snack.type === 'success' ? styles.snackOk : snack.type === 'warning' ? styles.snackWarn : styles.snackErr,
            { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.snackTitle}>{snack.title}</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              <Text style={styles.snackMsg}>{snack.message}</Text>
            </ScrollView>
          </View>
          <TouchableOpacity onPress={hideSnack} hitSlop={10} style={{ paddingLeft: 10 }}>
            <Text style={styles.snackClose}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>पारिवारिक लगत दर्ता फारम</Text>

        {familyNo && (
          <View style={styles.editBanner}>
            <Text style={styles.editBannerText}>सम्पादन मोड — परिवार नम्बर: {familyNo}</Text>
          </View>
        )}

        {/* Muli Details Card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.label}>परिवारमुलीको नाम थर:</Text>
              <TextInput style={styles.input} placeholder="नाम थर" value={muliName} onChangeText={(t) => setMuliName(cleanName(t))} />

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={styles.label}>स्थायी ठेगाना:</Text>
                  <TextInput style={styles.input} placeholder="ठेगाना" value={address} onChangeText={(t) => setAddress(cleanAddress(t))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>टोल:</Text>
                  <TextInput style={styles.input} placeholder="टोल" value={tol} onChangeText={(t) => setTol(cleanName(t))} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>बाबु/पतिको नाम:</Text>
                  <TextInput style={styles.input} placeholder="नाम" value={fatherOrHusband} onChangeText={(t) => setFatherOrHusband(cleanName(t))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>बाजे/ससुराको नाम:</Text>
                  <TextInput style={styles.input} placeholder="नाम" value={grandfatherOrFatherInLaw} onChangeText={(t) => setGrandfatherOrFatherInLaw(cleanName(t))} />
                </View>
              </View>
            </View>

            {/* Profile Picture */}
            <View style={styles.photoContainer}>
              <Text style={styles.photoLabel}>मुलीको तस्वीर</Text>
              <TouchableOpacity style={styles.imageBox} onPress={() => pickImage('profile')}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.imagePlaceholderText}>+ फोटो</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>उमेर:</Text>
              <TextInput style={styles.input} placeholder="उमेर" keyboardType="numeric" maxLength={3} value={muliAge} onChangeText={(t) => setMuliAge(onlyDigits(t, 3))} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>परिवार सदस्य संख्या:</Text>
              <TextInput
                style={styles.input}
                placeholder="संख्या"
                keyboardType="numeric"
                maxLength={2}
                value={memberCount}
                onChangeText={(t) => setMemberCount(onlyDigits(t, 2))}
                onEndEditing={applyMemberCount}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>सम्पर्क नम्बर:</Text>
              <TextInput style={styles.input} placeholder="मोबाइल नं" keyboardType="phone-pad" maxLength={10} value={contactNo} onChangeText={(t) => setContactNo(onlyDigits(t, 10))} />
            </View>
          </View>

          {/* Citizenship Verification Uploads */}
          <Text style={[styles.label, { marginTop: 14, color: '#881337' }]}>नागरिकता प्रमाण पत्र (अगाडि र पछाडि):</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <TouchableOpacity style={styles.citizenshipBox} onPress={() => pickImage('front')}>
              <Text style={styles.citLabel}>नागरिकता (अगाडि - Front)</Text>
              {citizenshipFrontUri ? (
                <Image source={{ uri: citizenshipFrontUri }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <Text style={styles.imagePlaceholderText}>+ अपलोड अगाडि भाग</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.citizenshipBox} onPress={() => pickImage('back')}>
              <Text style={styles.citLabel}>नागरिकता (पछाडि - Back)</Text>
              {citizenshipBackUri ? (
                <Image source={{ uri: citizenshipBackUri }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <Text style={styles.imagePlaceholderText}>+ अपलोड पछाडि भाग</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Members Table Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>परिवारका सदस्यहरूको विवरण</Text>
          {members.map((m, index) => (
            <View key={index} style={styles.memberRowCard}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#881337', marginBottom: 4 }}>सदस्य क्र.सं. {index + 1}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <TextInput style={[styles.input, { flex: 2, marginRight: 6 }]} placeholder="नाम थर" value={m.name} onChangeText={(t) => handleMemberChange(t, index, 'name')} />
                <TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} placeholder="उमेर" keyboardType="numeric" maxLength={3} value={m.age} onChangeText={(t) => handleMemberChange(t, index, 'age')} />
                <TextInput style={[styles.input, { flex: 2 }]} placeholder="बाबु/पति" value={m.fatherOrHusband} onChangeText={(t) => handleMemberChange(t, index, 'fatherOrHusband')} />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TextInput style={[styles.input, { flex: 1.5, marginRight: 6 }]} placeholder="नाता" value={m.relation} onChangeText={(t) => handleMemberChange(t, index, 'relation')} />
                <TextInput style={[styles.input, { flex: 2, marginRight: 6 }]} placeholder="कैफियत (छैन भने -)" value={m.remarks} onChangeText={(t) => handleMemberChange(t, index, 'remarks')} />
                {members.length > 1 && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeMemberRow(index)}>
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>मेटाउनु</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addRowBtn} onPress={addMemberRow}>
            <Text style={{ color: '#881337', fontWeight: '800', fontSize: 12 }}>+ थप सदस्य जोड्नुहोस्</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitBtnText}>
            {submitting ? 'पेश गर्दै...' : familyNo ? 'फारम अद्यावधिक गर्नुहोस्' : 'फारम पेस गर्नुहोस्'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 14, paddingBottom: 40 },
  pageTitle: { fontSize: 16, fontWeight: '800', color: '#881337', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '700', color: '#374151', marginTop: 6, marginBottom: 3 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 7, fontSize: 12, backgroundColor: '#F9FAFB', color: '#111827' },
  photoContainer: { width: 120, alignItems: 'center' },
  photoLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  imageBox: { width: 100, height: 110, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  citizenshipBox: { flex: 1, height: 110, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, overflow: 'hidden', padding: 4 },
  citLabel: { fontSize: 9, fontWeight: '700', color: '#4B5563', marginBottom: 2 },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholderText: { fontSize: 11, color: '#64748B', fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  memberRowCard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 8, borderRadius: 4, marginBottom: 8 },
  removeBtn: { backgroundColor: '#DC2626', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  addRowBtn: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, borderRadius: 4, alignItems: 'center', marginTop: 4 },
  submitBtn: { backgroundColor: '#881337', padding: 12, borderRadius: 4, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  editBanner: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, borderRadius: 4, marginBottom: 12 },
  editBannerText: { color: '#881337', fontSize: 12, fontWeight: '800' },
  snack: { position: 'absolute', top: 10, width: '92%', maxWidth: 640, alignSelf: 'center', zIndex: 100, elevation: 12, flexDirection: 'row', padding: 12, borderRadius: 8, borderLeftWidth: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  snackErr: { backgroundColor: '#FEF2F2', borderLeftColor: '#DC2626' },
  snackWarn: { backgroundColor: '#FFFBEB', borderLeftColor: '#D97706' },
  snackOk: { backgroundColor: '#F0FDF4', borderLeftColor: '#16A34A' },
  snackTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 4 },
  snackMsg: { fontSize: 12, lineHeight: 18, color: '#374151' },
  snackClose: { fontSize: 16, color: '#6B7280', fontWeight: '800' },
});