import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function TabsLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerTitleStyle: { display: 'none' },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#881337',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        headerLeft: () => (
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>माण्डव्य बजगाईं जाल्पा देवी कुलदेवता गुठी</Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={15} color="#9F1239" style={{ marginRight: 4 }} />
            <Text style={styles.logoutText}>लगआउट</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: '',
          tabBarLabel: 'गृह पृष्ठ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="kuldevta"
        options={{
          headerTitle: '',
          tabBarLabel: 'कुलदेवता',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={20} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="samiti"
        options={{
          headerTitle: '',
          tabBarLabel: 'समिति',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={20} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          headerTitle: '',
          tabBarLabel: 'दर्ता फारम',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={20} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          headerTitle: '',
          tabBarLabel: 'सदस्यता',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={20} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: '',
          tabBarLabel: 'प्रोफाइल',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#FFFFFF',
    height: 64,
    borderBottomWidth: 2,
    borderBottomColor: '#881337',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  brandBadge: {
    backgroundColor: '#881337',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 4,
    marginLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#CBD5E1',
    borderTopWidth: 1.5,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
  },
  logoutText: {
    color: '#9F1239',
    fontSize: 12,
    fontWeight: '800',
  },
});