import { Redirect } from 'expo-router';

export default function Index() {
  // Replace this flag with your actual authentication check (e.g., checking SecureStore or AsyncStorage)
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}