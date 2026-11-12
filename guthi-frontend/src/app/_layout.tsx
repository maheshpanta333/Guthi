import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { handleUserRouting } from '../utils/authNavigation';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      setIsRouting(true);
      setRouteError(null);
      void handleUserRouting(user.uid, router).catch((error: unknown) => {
        console.error('Unable to determine user role:', error);
        setRouteError(
          error instanceof Error ? error.message : 'प्रयोगकर्ताको भूमिका जाँच गर्न सकिएन।',
        );
      }).finally(() => setIsRouting(false));
    }
  }, [user, initializing, segments, router]);

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#881337" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      {isRouting && <Text style={styles.routeNotice}>खाताको भूमिका जाँच हुँदैछ...</Text>}
      {routeError && (
        <Text style={styles.routeError}>
          भूमिका जाँच गर्न सकिएन: {routeError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
  },
  routeNotice: { padding: 12, color: '#374151', textAlign: 'center' },
  routeError: { padding: 12, color: '#B91C1C', textAlign: 'center' },
});