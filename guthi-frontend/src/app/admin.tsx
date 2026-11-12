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
  Modal,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const guthiLogo = require('../../assets/images/logo.jpg');

const COMMITTEE_GROUPS = [
  'संस्थापक कार्यसमिति पदाधिकारीहरू',
  'सल्लाहकार समिति',
  'कार्यसमिति सदस्यहरू',
];

const POSITIONS = [
  'अध्यक्ष',
  'उपाध्यक्ष',
  'महासचिव',
  'कोषाध्यक्ष',
  'सचिव',
  'सदस्य',
  'सल्लाहकार',
];

const MULTI_MEMBER_POSITIONS = ['सदस्य', 'सल्लाहकार'];

// Renders real <img> on Web so images always display cleanly
const PrintableImage = ({
  uri,
  style,
  resizeMode = 'contain',
}: {
  uri?: string | null;
  style?: any;
  resizeMode?: 'contain' | 'cover';
}) => {
  if (!uri) return null;
  if (Platform.OS === 'web') {
    return (
      <img
        src={uri}
        alt="document"
        style={{
          width: '100%',
          height: '100%',
          objectFit: resizeMode,
          display: 'block',
        }}
      />
    );
  }
  return <Image source={{ uri }} style={style} resizeMode={resizeMode} />;
};

export default function AdminScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'payments' | 'registrations' | 'notices' | 'kuldevta' | 'samiti'>('payments');
  const [regSubTab, setRegSubTab] = useState<'requests' | 'verified'>('requests');

  // Data states
  const [payments, setPayments] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [kuldevtaList, setKuldevtaList] = useState<any[]>([]);
  const [samitiList, setSamitiList] = useState<any[]>([]);

  // Selected registration modal state (Full Screen)
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  // Full-screen zoom modal for Nagarikta / Photos
  const [zoomedImage, setZoomedImage] = useState<{ uri: string; label: string } | null>(null);

  // Notice state (with image support)
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePhoto, setNoticePhoto] = useState<string | null>(null);

  // Kuldevta form states
  const [kuldevtaTitle, setKuldevtaTitle] = useState('');
  const [kuldevtaContent, setKuldevtaContent] = useState('');
  const [kuldevtaPhoto, setKuldevtaPhoto] = useState<string | null>(null);

  // Samiti form states
  const [samitiName, setSamitiName] = useState('');
  const [samitiGroup, setSamitiGroup] = useState(COMMITTEE_GROUPS[0]);
  const [samitiPosition, setSamitiPosition] = useState(POSITIONS[0]);
  const [samitiPhone, setSamitiPhone] = useState('');
  const [samitiPhoto, setSamitiPhoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let authCheckId = 0;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      const currentCheckId = ++authCheckId;
      setAuthorized(false);
      setCheckingAuth(true);

      if (!user) {
        setCheckingAuth(false);
        router.replace('/login');
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!isMounted || currentCheckId !== authCheckId) return;

        if (userSnap.exists() && userSnap.data()?.role === 'admin') {
          setAuthorized(true);
        } else {
          await signOut(auth);
          if (isMounted && currentCheckId === authCheckId) {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Unable to verify admin access:', error);
        if (isMounted && currentCheckId === authCheckId) {
          router.replace('/login');
        }
      } finally {
        if (isMounted && currentCheckId === authCheckId) {
          setCheckingAuth(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authCheckId += 1;
      unsubscribe();
    };
  }, [router]);

  // ---------- Dynamic-Size Snackbar (Alerts & Confirmations) ----------
  type SnackType = 'error' | 'success' | 'warning' | 'confirm';
  const [snack, setSnack] = useState<{
    title: string;
    message: string;
    type: SnackType;
    onConfirm?: () => void;
  } | null>(null);
  const slide = useRef(new Animated.Value(0)).current;
  const snackTimer = useRef<any>(null);

  const hideSnack = () => {
    clearTimeout(snackTimer.current);
    Animated.timing(slide, {
      toValue: 0,
      duration: 180,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) setSnack(null);
    });
  };

  const notify = (title: string, message: string, customType?: SnackType) => {
    const type: SnackType =
      customType ||
      (title === 'सफलता'
        ? 'success'
        : title === 'अपूर्ण विवरण' || title === 'जानकारी'
        ? 'warning'
        : 'error');

    clearTimeout(snackTimer.current);
    setSnack({ title, message, type });
    slide.setValue(0);
    Animated.timing(slide, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    const duration = type === 'success' ? 3000 : Math.min(12000, 3500 + message.length * 45);
    snackTimer.current = setTimeout(hideSnack, duration);
  };

  const confirmSnack = (title: string, message: string, onConfirm: () => void) => {
    clearTimeout(snackTimer.current);
    setSnack({ title, message, type: 'confirm', onConfirm });
    slide.setValue(0);
    Animated.timing(slide, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  useEffect(() => () => clearTimeout(snackTimer.current), []);

  useEffect(() => {
    if (!authorized) return;

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubReg = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      setRegistrations(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubNotices = onSnapshot(collection(db, 'notices'), (snapshot) => {
      setNotices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubKul = onSnapshot(collection(db, 'kuldevta'), (snapshot) => {
      setKuldevtaList(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubSamiti = onSnapshot(collection(db, 'sanchalak'), (snapshot) => {
      setSamitiList(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubPayments();
      unsubReg();
      unsubNotices();
      unsubKul();
      unsubSamiti();
    };
  }, [authorized]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const compressAndConvertToBase64 = async (uri: string, maxWidth = 700): Promise<string> => {
    if (uri.startsWith('data:')) return uri;
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: 0.65, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      if (manipulated.base64) {
        return `data:image/jpeg;base64,${manipulated.base64}`;
      }
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status: 'verified', verifiedAt: serverTimestamp() });
      notify('सफलता', 'भुक्तानी प्रमाणित गरियो।');
    } catch (e: any) {
      notify('त्रुटि', e.message);
    }
  };

  const deletePayment = (paymentId: string) => {
    confirmSnack('पुष्टि गर्नुहोस्', 'के तपाईं यो भुक्तानी विवरण हटाउन चाहनुहुन्छ?', async () => {
      try {
        await deleteDoc(doc(db, 'payments', paymentId));
        notify('सफलता', 'भुक्तानी हटाइयो।');
      } catch (e: any) {
        notify('त्रुटि', e.message);
      }
    });
  };

  const verifyRegistration = async (regId: string) => {
    try {
      await updateDoc(doc(db, 'registrations', regId), { status: 'verified' });
      if (selectedReg?.id === regId) {
        setSelectedReg({ ...selectedReg, status: 'verified' });
      }
      notify('सफलता', 'पारिवारिक लगत प्रमाणित गरियो।');
    } catch (e: any) {
      notify('त्रुटि', e.message);
    }
  };

  const deleteRegistration = (regId: string) => {
    confirmSnack('पुष्टि गर्नुहोस्', 'के तपाईं यो पारिवारिक लगत मेटाउन चाहनुहुन्छ?', async () => {
      try {
        await deleteDoc(doc(db, 'registrations', regId));
        if (selectedReg?.id === regId) setSelectedReg(null);
        notify('सफलता', 'लगत हटाइयो।');
      } catch (e: any) {
        notify('त्रुटि', e.message);
      }
    });
  };

  const handlePrintRegistration = (reg: any) => {
    if (Platform.OS !== 'web') {
      notify('जानकारी', 'प्रिन्ट सुविधा वेब ब्राउजरमा उपलब्ध छ।');
      return;
    }

    const esc = (val: any) =>
      String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const safeMuliName = (reg.muliName || 'Pariwar_Lagat').trim().replace(/[\\/:*?"<>|]/g, '_');
    const safeFamilyNo = (reg.familyNo || reg.id || '').trim();
    const pdfFileName = safeFamilyNo ? `${safeMuliName}_${safeFamilyNo}` : safeMuliName;

    const membersRows = (reg.members || [])
      .map(
        (m: any, idx: number) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${esc(m.name)}</td>
          <td style="text-align:center;">${esc(m.age)}</td>
          <td>${esc(m.fatherOrHusband)}</td>
          <td>${esc(m.relation)}</td>
          <td>${esc(m.remarks)}</td>
        </tr>`
      )
      .join('');

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${esc(pdfFileName)}</title>
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: Arial, sans-serif; margin: 0; color: #111827; font-size: 12.5px; }
          .header { text-align: center; border-bottom: 2px solid #881337; padding-bottom: 8px; margin-bottom: 12px; }
          .header h2 { margin: 0; color: #881337; font-size: 18px; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #374151; }
          .card { border: 1px solid #CBD5E1; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
          .top-grid { display: flex; justify-content: space-between; gap: 14px; }
          .fields { flex: 1; }
          .row { display: flex; gap: 10px; margin-bottom: 8px; }
          .field { flex: 1; }
          .label { font-size: 11px; font-weight: bold; color: #374151; margin-bottom: 2px; }
          .box { border: 1px solid #D1D5DB; border-radius: 4px; padding: 5px 8px; background: #F9FAFB; min-height: 26px; }
          .photo-col { width: 125px; text-align: center; }
          .photo-box { width: 115px; height: 130px; border: 1px solid #CBD5E1; border-radius: 4px; overflow: hidden; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #F8FAFC; }
          .photo-box img { width: 100%; height: 100%; object-fit: cover; }
          .cit-section-title { font-size: 12px; font-weight: bold; color: #881337; margin: 10px 0 6px; }
          .cit-grid { display: flex; gap: 12px; }
          .cit-box { flex: 1; border: 1px solid #CBD5E1; border-radius: 4px; padding: 6px; text-align: center; background: #F8FAFC; }
          .cit-box img { width: 100%; height: 165px; object-fit: contain; display: block; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px; }
          th, td { border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left; }
          th { background: #F1F5F9; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>पारिवारिक लगत विवरण फारम</h2>
          <p>परिवार नम्बर: <strong>${esc(safeFamilyNo)}</strong> | अवस्था: <strong>${reg.status === 'verified' ? 'प्रमाणित' : 'प्रतीक्षारत'}</strong></p>
        </div>

        <div class="card">
          <div class="top-grid">
            <div class="fields">
              <div class="row">
                <div class="field">
                  <div class="label">परिवारमुलीको नाम:</div>
                  <div class="box">${esc(reg.muliName)}</div>
                </div>
              </div>
              <div class="row">
                <div class="field" style="flex:2;">
                  <div class="label">हालको स्थायी ठेगाना:</div>
                  <div class="box">${esc(reg.address)}</div>
                </div>
                <div class="field" style="flex:1;">
                  <div class="label">टोल:</div>
                  <div class="box">${esc(reg.tol)}</div>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <div class="label">बाबु/पतिको नाम:</div>
                  <div class="box">${esc(reg.fatherOrHusband)}</div>
                </div>
                <div class="field">
                  <div class="label">बाजे/ससुराको नाम:</div>
                  <div class="box">${esc(reg.grandfatherOrFatherInLaw)}</div>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <div class="label">परिवारमुलीको उमेर:</div>
                  <div class="box">${esc(reg.muliAge)}</div>
                </div>
                <div class="field">
                  <div class="label">परिवार सदस्य संख्या:</div>
                  <div class="box">${esc(reg.memberCount)}</div>
                </div>
                <div class="field">
                  <div class="label">सम्पर्क नं.:</div>
                  <div class="box">${esc(reg.contactNo)}</div>
                </div>
              </div>
            </div>

            <div class="photo-col">
              <div class="label">परिवारमुलीको तस्वीर</div>
              <div class="photo-box">
                ${reg.photoUrl ? `<img src="${reg.photoUrl}" alt="Muli Photo" />` : '<span>तस्वीर छैन</span>'}
              </div>
            </div>
          </div>

          <div class="cit-section-title">नागरिकता प्रमाण पत्र (प्रमाणित कागजात):</div>
          <div class="cit-grid">
            <div class="cit-box">
              <div class="label">अगाडि भाग (Front)</div>
              ${reg.citizenshipFrontUrl ? `<img src="${reg.citizenshipFrontUrl}" alt="Citizenship Front" />` : '<div style="padding:45px 0;color:#6B7280;">उपलब्ध छैन</div>'}
            </div>
            <div class="cit-box">
              <div class="label">पछाडि भाग (Back)</div>
              ${reg.citizenshipBackUrl ? `<img src="${reg.citizenshipBackUrl}" alt="Citizenship Back" />` : '<div style="padding:45px 0;color:#6B7280;">उपलब्ध छैन</div>'}
            </div>
          </div>
        </div>

        <div class="card">
          <div style="font-weight:bold; font-size:13.5px; margin-bottom:6px;">परिवारका सदस्यहरूको विवरण</div>
          <table>
            <thead>
              <tr>
                <th style="width:45px; text-align:center;">क्र.सं.</th>
                <th>नाम, थर</th>
                <th style="width:55px; text-align:center;">उमेर</th>
                <th>बाबु/पति</th>
                <th>मुलिसँगको नाता</th>
                <th>कैफियत</th>
              </tr>
            </thead>
            <tbody>
              ${membersRows}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const existingFrame = document.getElementById('guthi-hidden-print-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'guthi-hidden-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc || !iframe.contentWindow) return;

    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();

    const originalTitle = document.title;

    setTimeout(() => {
      const imgs = Array.from(frameDoc.images);
      Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
        )
      ).then(() => {
        document.title = pdfFileName;
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        setTimeout(() => {
          document.title = originalTitle;
          iframe.remove();
        }, 1000);
      });
    }, 150);
  };

  // ---------------- NOTICE HANDLERS (WITH IMAGE) ----------------
  const pickNoticeImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const compressed = await compressAndConvertToBase64(res.assets[0].uri, 800);
        setNoticePhoto(compressed);
      }
    } catch (e: any) {
      notify('त्रुटि', 'तस्वीर छान्न सकिएन: ' + (e?.message || ''));
    }
  };

  const handleSaveNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      notify('अपूर्ण विवरण', 'कृपया सूचनाको शीर्षक र विवरण दुवै भर्नुहोस्।');
      return;
    }
    setLoading(true);
    try {
      if (editingNoticeId) {
        await updateDoc(doc(db, 'notices', editingNoticeId), {
          title: noticeTitle.trim(),
          content: noticeContent.trim(),
          photoUrl: noticePhoto || '',
          updatedAt: serverTimestamp(),
        });
        setEditingNoticeId(null);
      } else {
        await addDoc(collection(db, 'notices'), {
          title: noticeTitle.trim(),
          content: noticeContent.trim(),
          photoUrl: noticePhoto || '',
          createdAt: serverTimestamp(),
        });
      }
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePhoto(null);
      notify('सफलता', 'सूचना सुरक्षित गरियो।');
    } catch (e: any) {
      notify('त्रुटि', 'सूचना सुरक्षित गर्न सकिएन: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = (id: string) => {
    confirmSnack('पुष्टि गर्नुहोस्', 'के तपाईं यो सूचना मेटाउन चाहनुहुन्छ?', async () => {
      try {
        await deleteDoc(doc(db, 'notices', id));
        notify('सफलता', 'सूचना हटाइयो।');
      } catch (e: any) {
        notify('त्रुटि', e.message);
      }
    });
  };

  // ---------------- KULDEVTA HANDLERS ----------------
  const pickKuldevtaImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const compressed = await compressAndConvertToBase64(res.assets[0].uri, 800);
        setKuldevtaPhoto(compressed);
      }
    } catch (e: any) {
      notify('त्रुटि', 'तस्वीर छान्न सकिएन: ' + (e?.message || ''));
    }
  };

  const handleAddKuldevta = async () => {
    if (!kuldevtaTitle.trim() || !kuldevtaContent.trim()) {
      notify('अपूर्ण विवरण', 'कृपया कुलदेवताको शीर्षक र विवरण दुवै भर्नुहोस्।');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'kuldevta'), {
        title: kuldevtaTitle.trim(),
        content: kuldevtaContent.trim(),
        photoUrl: kuldevtaPhoto || '',
        order: kuldevtaList.length + 1,
        createdAt: serverTimestamp(),
      });
      setKuldevtaTitle('');
      setKuldevtaContent('');
      setKuldevtaPhoto(null);
      notify('सफलता', 'कुलदेवता विवरण सफलतापूर्वक थपियो।');
    } catch (e: any) {
      notify('त्रुटि', 'कुलदेवता विवरण थप्न सकिएन: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKuldevta = (id: string) => {
    confirmSnack('पुष्टि गर्नुहोस्', 'के तपाईं यो कुलदेवता विवरण मेटाउन चाहनुहुन्छ?', async () => {
      try {
        await deleteDoc(doc(db, 'kuldevta', id));
        notify('सफलता', 'विवरण हटाइयो।');
      } catch (e: any) {
        notify('त्रुटि', e.message);
      }
    });
  };

  // ---------------- SAMITI HANDLERS (WITH OVERWRITE LOGIC) ----------------
  const pickSamitiImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const compressed = await compressAndConvertToBase64(res.assets[0].uri, 400);
        setSamitiPhoto(compressed);
      }
    } catch (e: any) {
      notify('त्रुटि', 'फोटो छान्न सकिएन: ' + (e?.message || ''));
    }
  };

  const handleAddSamiti = async () => {
    if (!samitiName.trim()) {
      notify('अपूर्ण विवरण', 'कृपया पदाधिकारीको पूरा नाम भर्नुहोस्।');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: samitiName.trim(),
        group: samitiGroup,
        position: samitiPosition,
        phone: samitiPhone.trim(),
        photoUrl: samitiPhoto || '',
        updatedAt: serverTimestamp(),
      };

      if (MULTI_MEMBER_POSITIONS.includes(samitiPosition)) {
        await addDoc(collection(db, 'sanchalak'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } else {
        const existing = samitiList.find(
          (m) => m.group === samitiGroup && m.position === samitiPosition
        );

        if (existing) {
          await updateDoc(doc(db, 'sanchalak', existing.id), {
            ...payload,
            photoUrl: samitiPhoto || existing.photoUrl || '',
          });
        } else {
          const slotId = `${samitiGroup}_${samitiPosition}`.replace(/\s+/g, '_');
          await setDoc(doc(db, 'sanchalak', slotId), {
            ...payload,
            createdAt: serverTimestamp(),
          });
        }
      }

      setSamitiName('');
      setSamitiPhone('');
      setSamitiPhoto(null);
      notify('सफलता', 'समिति पदाधिकारी सफलतापूर्वक सुरक्षित गरियो।');
    } catch (e: any) {
      notify('त्रुटि', 'पदाधिकारी सुरक्षित गर्न सकिएन: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSamiti = (id: string) => {
    confirmSnack('पुष्टि गर्नुहोस्', 'के तपाईं यो पदाधिकारी हटाउन चाहनुहुन्छ?', async () => {
      try {
        await deleteDoc(doc(db, 'sanchalak', id));
        notify('सफलता', 'पदाधिकारी हटाइयो।');
      } catch (e: any) {
        notify('त्रुटि', e.message);
      }
    });
  };

  const filteredRegistrations = registrations.filter((r) =>
    regSubTab === 'verified' ? r.status === 'verified' : r.status !== 'verified'
  );

  // Reusable Snackbar Component
  const renderSnackbar = () => {
    if (!snack) return null;
    const isOk = snack.type === 'success';
    const isWarn = snack.type === 'warning';
    const isConfirm = snack.type === 'confirm';

    return (
      <Animated.View
        style={[
          styles.snack,
          isOk
            ? styles.snackOk
            : isWarn
            ? styles.snackWarn
            : isConfirm
            ? styles.snackConfirm
            : styles.snackErr,
          {
            opacity: slide,
            transform: [
              {
                translateY: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.snackTitle}>{snack.title}</Text>
          <ScrollView style={{ maxHeight: 240 }}>
            <Text style={styles.snackMsg}>{snack.message}</Text>
          </ScrollView>

          {isConfirm && (
            <View style={styles.snackConfirmRow}>
              <TouchableOpacity
                style={styles.snackConfirmYes}
                onPress={() => {
                  const fn = snack.onConfirm;
                  hideSnack();
                  fn?.();
                }}
              >
                <Text style={styles.snackConfirmYesText}>मेटाउनुहोस्</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.snackConfirmNo} onPress={hideSnack}>
                <Text style={styles.snackConfirmNoText}>रद्द गर्नुहोस्</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={hideSnack} hitSlop={10} style={{ paddingLeft: 12 }}>
          <Text style={styles.snackClose}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (checkingAuth || !authorized) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
        }}
      >
        <ActivityIndicator size="large" color="#881337" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderSnackbar()}

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={guthiLogo} style={styles.logo} />
          <View>
            <Text style={styles.headerTitle}>प्रशासक प्यानल (Admin)</Text>
            <Text style={styles.headerSub}>गुठी व्यवस्थापन प्रणाली</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>लगआउट</Text>
        </TouchableOpacity>
      </View>

      {/* Top Navigation Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'payments', label: `भुक्तानी (${payments.length})` },
            { key: 'registrations', label: `पारिवारिक लगत (${registrations.length})` },
            { key: 'notices', label: `सूचना (${notices.length})` },
            { key: 'kuldevta', label: `कुलदेवता (${kuldevtaList.length})` },
            { key: 'samiti', label: `समिति (${samitiList.length})` },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(t.key as any)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.content}>
        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <View>
            {payments.map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{p.userName || p.email || 'सदस्य'}</Text>
                  <Text style={[styles.badge, p.status === 'verified' ? styles.badgeOk : styles.badgePending]}>
                    {p.status === 'verified' ? 'प्रमाणित' : 'प्रतीक्षारत'}
                  </Text>
                </View>
                <Text style={styles.cardText}>रकम: रु. {p.amount}</Text>
                <Text style={styles.cardText}>विवरण: {p.remarks || '-'}</Text>
                {p.receiptUrl ? (
                  <TouchableOpacity
                    style={{ height: 150, marginTop: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#F1F5F9' }}
                    onPress={() => setZoomedImage({ uri: p.receiptUrl, label: 'भुक्तानी रसिद' })}
                  >
                    <PrintableImage uri={p.receiptUrl} resizeMode="contain" />
                  </TouchableOpacity>
                ) : null}
                <View style={styles.actionRow}>
                  {p.status !== 'verified' && (
                    <TouchableOpacity style={styles.verifyBtn} onPress={() => verifyPayment(p.id)}>
                      <Text style={styles.btnText}>प्रमाणित गर्नुहोस्</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePayment(p.id)}>
                    <Text style={styles.btnText}>हटाउनुहोस्</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === 'registrations' && (
          <View>
            <View style={styles.subTabRow}>
              <TouchableOpacity
                style={[styles.subTabBtn, regSubTab === 'requests' && styles.subTabActive]}
                onPress={() => setRegSubTab('requests')}
              >
                <Text style={[styles.subTabText, regSubTab === 'requests' && styles.subTabTextActive]}>
                  नयाँ अनुरोध ({registrations.filter((r) => r.status !== 'verified').length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subTabBtn, regSubTab === 'verified' && styles.subTabActive]}
                onPress={() => setRegSubTab('verified')}
              >
                <Text style={[styles.subTabText, regSubTab === 'verified' && styles.subTabTextActive]}>
                  प्रमाणित लगत ({registrations.filter((r) => r.status === 'verified').length})
                </Text>
              </TouchableOpacity>
            </View>

            {filteredRegistrations.map((reg) => (
              <View key={reg.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.familyNoText}>परिवार नं: {reg.familyNo || reg.id}</Text>
                    <Text style={styles.cardTitle}>मुली: {reg.muliName}</Text>
                    <Text style={styles.cardText}>ठेगाना: {reg.address} ({reg.tol})</Text>
                    <Text style={styles.cardText}>सम्पर्क: {reg.contactNo} | सदस्य: {reg.memberCount}</Text>
                  </View>
                  {reg.photoUrl ? (
                    <View style={styles.thumbBox}>
                      <PrintableImage uri={reg.photoUrl} resizeMode="cover" />
                    </View>
                  ) : null}
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => setSelectedReg(reg)}>
                    <Text style={styles.btnText}>विवरण हेर्नुहोस्</Text>
                  </TouchableOpacity>
                  {reg.status !== 'verified' && (
                    <TouchableOpacity style={styles.verifyBtn} onPress={() => verifyRegistration(reg.id)}>
                      <Text style={styles.btnText}>प्रमाणित</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteRegistration(reg.id)}>
                    <Text style={styles.btnText}>मेटाउनुहोस्</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* NOTICES TAB */}
        {activeTab === 'notices' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {editingNoticeId ? 'सूचना सम्पादन गर्नुहोस्' : 'नयाँ सूचना प्रकाशित गर्नुहोस्'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="शीर्षक"
                value={noticeTitle}
                onChangeText={setNoticeTitle}
              />
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                placeholder="विस्तृत विवरण..."
                multiline
                value={noticeContent}
                onChangeText={setNoticeContent}
              />

              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickNoticeImage}>
                <Text style={{ color: '#881337', fontWeight: 'bold' }}>
                  {noticePhoto ? 'तस्वीर छनोट भयो ✓' : '+ सूचना तस्वीर जोड्नुहोस्'}
                </Text>
              </TouchableOpacity>
              {noticePhoto ? (
                <View style={{ height: 120, marginVertical: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <PrintableImage uri={noticePhoto} resizeMode="cover" />
                </View>
              ) : null}

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveNotice} disabled={loading}>
                <Text style={styles.submitBtnText}>
                  {loading ? 'सुरक्षित गर्दै...' : editingNoticeId ? 'अद्यावधिक गर्नुहोस्' : 'प्रकाशित गर्नुहोस्'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>प्रकाशित सूचनाहरूको सूची</Text>
            {notices.map((n) => (
              <View key={n.id} style={styles.card}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardText}>{n.content}</Text>
                {n.photoUrl ? (
                  <TouchableOpacity
                    style={{ height: 140, marginTop: 8, borderRadius: 4, overflow: 'hidden' }}
                    onPress={() => setZoomedImage({ uri: n.photoUrl, label: n.title })}
                  >
                    <PrintableImage uri={n.photoUrl} resizeMode="cover" />
                  </TouchableOpacity>
                ) : null}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => {
                      setEditingNoticeId(n.id);
                      setNoticeTitle(n.title);
                      setNoticeContent(n.content);
                      setNoticePhoto(n.photoUrl || null);
                    }}
                  >
                    <Text style={styles.btnText}>सम्पादन</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteNotice(n.id)}>
                    <Text style={styles.btnText}>मेटाउनुहोस्</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* KULDEVTA TAB */}
        {activeTab === 'kuldevta' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>कुलदेवता खण्ड थप्नुहोस्</Text>
              <TextInput
                style={styles.input}
                placeholder="शीर्षक (जस्तै: इतिहास)"
                value={kuldevtaTitle}
                onChangeText={setKuldevtaTitle}
              />
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                placeholder="विवरण..."
                multiline
                value={kuldevtaContent}
                onChangeText={setKuldevtaContent}
              />
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickKuldevtaImage}>
                <Text style={{ color: '#881337', fontWeight: 'bold' }}>
                  {kuldevtaPhoto ? 'तस्वीर छनोट भयो ✓' : '+ खण्ड तस्वीर जोड्नुहोस्'}
                </Text>
              </TouchableOpacity>
              {kuldevtaPhoto ? (
                <View style={{ height: 120, marginVertical: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <PrintableImage uri={kuldevtaPhoto} resizeMode="cover" />
                </View>
              ) : null}
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddKuldevta} disabled={loading}>
                <Text style={styles.submitBtnText}>{loading ? 'थप्दै...' : 'कुलदेवता खण्ड थप्नुहोस्'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>कुलदेवता विवरण सूची</Text>
            {kuldevtaList.map((k) => (
              <View key={k.id} style={styles.card}>
                <Text style={styles.cardTitle}>{k.title}</Text>
                <Text style={styles.cardText}>{k.content}</Text>
                {k.photoUrl ? (
                  <TouchableOpacity
                    style={{ height: 140, marginTop: 8, borderRadius: 4, overflow: 'hidden' }}
                    onPress={() => setZoomedImage({ uri: k.photoUrl, label: k.title })}
                  >
                    <PrintableImage uri={k.photoUrl} resizeMode="cover" />
                  </TouchableOpacity>
                ) : null}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteKuldevta(k.id)}>
                    <Text style={styles.btnText}>मेटाउनुहोस्</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SAMITI TAB */}
        {activeTab === 'samiti' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>समिति पदाधिकारी थप्नुहोस्</Text>
              
              <Text style={styles.label}>समिति समूह:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {COMMITTEE_GROUPS.map((grp) => (
                  <TouchableOpacity
                    key={grp}
                    style={[styles.chip, samitiGroup === grp && styles.chipActive]}
                    onPress={() => setSamitiGroup(grp)}
                  >
                    <Text style={[styles.chipText, samitiGroup === grp && styles.chipTextActive]}>{grp}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>पद:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {POSITIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[styles.chip, samitiPosition === pos && styles.chipActive]}
                    onPress={() => setSamitiPosition(pos)}
                  >
                    <Text style={[styles.chipText, samitiPosition === pos && styles.chipTextActive]}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={styles.input}
                placeholder="पूरा नाम थर"
                value={samitiName}
                onChangeText={setSamitiName}
              />
              <TextInput
                style={styles.input}
                placeholder="सम्पर्क नम्बर"
                keyboardType="phone-pad"
                value={samitiPhone}
                onChangeText={setSamitiPhone}
              />

              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickSamitiImage}>
                <Text style={{ color: '#881337', fontWeight: 'bold' }}>
                  {samitiPhoto ? 'फोटो छनोट भयो ✓' : '+ पदाधिकारीको फोटो जोड्नुहोस्'}
                </Text>
              </TouchableOpacity>
              {samitiPhoto ? (
                <View style={{ width: 90, height: 90, marginVertical: 8, borderRadius: 45, overflow: 'hidden', alignSelf: 'center' }}>
                  <PrintableImage uri={samitiPhoto} resizeMode="cover" />
                </View>
              ) : null}

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddSamiti} disabled={loading}>
                <Text style={styles.submitBtnText}>{loading ? 'सुरक्षित गर्दै...' : 'पदाधिकारी सुरक्षित गर्नुहोस्'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>हालका पदाधिकारीहरू</Text>
            {samitiList.map((m) => (
              <View key={m.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{m.name}</Text>
                    <Text style={[styles.cardText, { color: '#881337', fontWeight: 'bold' }]}>
                      {m.group} - {m.position}
                    </Text>
                    {m.phone ? <Text style={styles.cardText}>सम्पर्क: {m.phone}</Text> : null}
                  </View>
                  {m.photoUrl ? (
                    <View style={styles.thumbBox}>
                      <PrintableImage uri={m.photoUrl} resizeMode="cover" />
                    </View>
                  ) : null}
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteSamiti(m.id)}>
                    <Text style={styles.btnText}>हटाउनुहोस्</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FULL REGISTRATION DETAILS MODAL */}
      {selectedReg && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedReg(null)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>पारिवारिक लगत फारम विवरण</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={styles.printBtnModal} onPress={() => handlePrintRegistration(selectedReg)}>
                  <Ionicons name="print-outline" size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>प्रिन्ट / PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedReg(null)} style={{ marginLeft: 12 }}>
                  <Text style={styles.closeBtnText}>बन्द गर्नुहोस्</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.label}>परिवारमुलीको नाम:</Text>
                    <TextInput style={styles.inputBox} value={selectedReg.muliName} editable={false} />

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.label}>ठेगाना:</Text>
                        <TextInput style={styles.inputBox} value={selectedReg.address} editable={false} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>टोल:</Text>
                        <TextInput style={styles.inputBox} value={selectedReg.tol || ''} editable={false} />
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>बाबु/पतिको नाम:</Text>
                        <TextInput style={styles.inputBox} value={selectedReg.fatherOrHusband} editable={false} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>बाजे/ससुराको नाम:</Text>
                        <TextInput style={styles.inputBox} value={selectedReg.grandfatherOrFatherInLaw || ''} editable={false} />
                      </View>
                    </View>
                  </View>

                  <View style={{ width: 110, alignItems: 'center' }}>
                    <Text style={styles.label}>तस्वीर</Text>
                    <TouchableOpacity
                      style={styles.modalPhotoBox}
                      onPress={() => selectedReg.photoUrl && setZoomedImage({ uri: selectedReg.photoUrl, label: 'परिवारमुलीको तस्वीर' })}
                    >
                      {selectedReg.photoUrl ? (
                        <PrintableImage uri={selectedReg.photoUrl} resizeMode="cover" />
                      ) : (
                        <Text style={{ fontSize: 11, color: '#6B7280' }}>तस्वीर छैन</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>उमेर:</Text>
                    <TextInput style={styles.inputBox} value={String(selectedReg.muliAge || '')} editable={false} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>सदस्य संख्या:</Text>
                    <TextInput style={styles.inputBox} value={String(selectedReg.memberCount || '')} editable={false} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>सम्पर्क नं:</Text>
                    <TextInput style={styles.inputBox} value={selectedReg.contactNo} editable={false} />
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 14 }]}>नागरिकता प्रमाण पत्र:</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={styles.citModalBox}
                    onPress={() => selectedReg.citizenshipFrontUrl && setZoomedImage({ uri: selectedReg.citizenshipFrontUrl, label: 'नागरिकता (अगाडि)' })}
                  >
                    <Text style={styles.citLabel}>अगाडि भाग (Front)</Text>
                    <View style={styles.citImgWrapper}>
                      {selectedReg.citizenshipFrontUrl ? (
                        <PrintableImage uri={selectedReg.citizenshipFrontUrl} resizeMode="contain" />
                      ) : (
                        <Text style={{ fontSize: 11, color: '#6B7280' }}>उपलब्ध छैन</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.citModalBox}
                    onPress={() => selectedReg.citizenshipBackUrl && setZoomedImage({ uri: selectedReg.citizenshipBackUrl, label: 'नागरिकता (पछाडि)' })}
                  >
                    <Text style={styles.citLabel}>पछाडि भाग (Back)</Text>
                    <View style={styles.citImgWrapper}>
                      {selectedReg.citizenshipBackUrl ? (
                        <PrintableImage uri={selectedReg.citizenshipBackUrl} resizeMode="contain" />
                      ) : (
                        <Text style={{ fontSize: 11, color: '#6B7280' }}>उपलब्ध छैन</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>परिवारका सदस्यहरूको विवरण</Text>
                {selectedReg.members?.map((m: any, idx: number) => (
                  <View key={idx} style={styles.memberCardRow}>
                    <Text style={styles.memberCardText}>
                      {idx + 1}. <Text style={{ fontWeight: 'bold' }}>{m.name}</Text> | उमेर: {m.age} | बाबु/पति: {m.fatherOrHusband} | नाता: {m.relation} {m.remarks ? `| कैफियत: ${m.remarks}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* FULL-SCREEN IMAGE ZOOM MODAL */}
      {zoomedImage && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setZoomedImage(null)}>
          <View style={styles.zoomOverlay}>
            <View style={styles.zoomHeader}>
              <Text style={styles.zoomTitle}>{zoomedImage.label}</Text>
              <TouchableOpacity onPress={() => setZoomedImage(null)} style={styles.zoomCloseBtn}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>बन्द गर्नुहोस्</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
              <PrintableImage uri={zoomedImage.uri} resizeMode="contain" />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#881337',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 38, height: 38, borderRadius: 19, marginRight: 10, borderWidth: 1, borderColor: '#FFFFFF' },
  headerTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  headerSub: { color: '#FEE2E2', fontSize: 11, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9F1239', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  logoutText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  tabBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#881337' },
  tabText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  tabTextActive: { color: '#881337', fontWeight: '800' },
  contentScroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 2 },
  cardText: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  familyNoText: { fontSize: 11, fontWeight: '700', color: '#881337', marginBottom: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  badgeOk: { backgroundColor: '#DCFCE7', color: '#166534' },
  badgePending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  thumbBox: { width: 55, height: 55, borderRadius: 4, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  actionRow: { flexDirection: 'row', marginTop: 10, gap: 8, flexWrap: 'wrap' },
  verifyBtn: { backgroundColor: '#16A34A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  viewBtn: { backgroundColor: '#0284C7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  deleteBtn: { backgroundColor: '#DC2626', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  btnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  subTabRow: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 4, padding: 3, marginBottom: 12 },
  subTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 4 },
  subTabActive: { backgroundColor: '#FFFFFF', elevation: 1 },
  subTabText: { fontSize: 12, color: '#4B5563', fontWeight: '700' },
  subTabTextActive: { color: '#881337', fontWeight: '900' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '700', color: '#374151', marginTop: 6, marginBottom: 3 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#F9FAFB', color: '#111827', marginBottom: 8 },
  inputBox: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, backgroundColor: '#F9FAFB', color: '#111827', marginBottom: 6 },
  submitBtn: { backgroundColor: '#881337', padding: 12, borderRadius: 4, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  imagePickerBtn: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, borderRadius: 4, alignItems: 'center', marginTop: 6 },
  chip: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  chipActive: { backgroundColor: '#881337', borderColor: '#881337' },
  chipText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#881337', padding: 14 },
  modalHeaderTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  closeBtnText: { color: '#FEE2E2', fontWeight: '700', fontSize: 12 },
  printBtnModal: { flexDirection: 'row', backgroundColor: '#16A34A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  modalPhotoBox: { width: 95, height: 110, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  citModalBox: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, padding: 6, backgroundColor: '#F8FAFC', alignItems: 'center' },
  citLabel: { fontSize: 10, fontWeight: '700', color: '#374151', marginBottom: 4 },
  citImgWrapper: { width: '100%', height: 130, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 4, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  memberCardRow: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 8, borderRadius: 4, marginBottom: 6 },
  memberCardText: { fontSize: 12, color: '#1F2937' },
  zoomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  zoomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#111827' },
  zoomTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  zoomCloseBtn: { paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#881337', borderRadius: 4 },
  snack: { position: 'absolute', top: 16, left: 16, right: 16, zIndex: 9999, borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6, borderWidth: 1 },
  snackOk: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  snackWarn: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  snackErr: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  snackConfirm: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  snackTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 2 },
  snackMsg: { fontSize: 12, color: '#374151', lineHeight: 17 },
  snackClose: { fontSize: 16, fontWeight: 'bold', color: '#6B7280', padding: 2 },
  snackConfirmRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  snackConfirmYes: { backgroundColor: '#DC2626', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 4 },
  snackConfirmYesText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  snackConfirmNo: { backgroundColor: '#E5E7EB', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 4 },
  snackConfirmNoText: { color: '#374151', fontSize: 12, fontWeight: '700' },
});