import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

const guthiLogo = require('../../../assets/images/logo.jpg');

function CustomHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandBox}>
        <Image source={guthiLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandTitle} numberOfLines={1}>
          माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={16} color="#881337" />
        <Text style={styles.logoutText}>लगआउट</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.layout}>
      <Tabs
        screenOptions={{
          header: () => <CustomHeader />,
          tabBarActiveTintColor: '#881337',
          tabBarInactiveTintColor: '#4B5563',
          tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'गृह पृष्ठ',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="kuldevta"
          options={{
            title: 'कुलदेवता',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="samiti"
          options={{
            title: 'समिति',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            title: 'दर्ता फारम',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="membership"
          options={{
            title: 'सदस्यता',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'प्रोफाइल',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color as string} />
            ),
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={styles.devFooter}
        onPress={() => Linking.openURL('https://maheshpanta.pantamahesh99.workers.dev/')}
        activeOpacity={0.8}
        accessibilityRole="link"
        accessibilityLabel="यस्तै वेबसाइट वा एप बनाउन विकासकर्तालाई सम्पर्क गर्नुहोस्"
      >
        <Text style={styles.devText}>
          यस्तै वेबसाइट वा एप बनाउन चाहनुहुन्छ?{' '}
          <Text style={styles.devLink}>विकासकर्तालाई सम्पर्क गर्नुहोस्</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#881337',
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  brandTitle: {
    backgroundColor: '#881337',
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutText: {
    color: '#881337',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  devFooter: {
    backgroundColor: '#FFF8F1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7C9B0',
  },
  devText: {
    fontSize: 11,
    color: '#6B4B3E',
    fontWeight: '500',
    textAlign: 'center',
  },
  devLink: {
    color: '#881337',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});