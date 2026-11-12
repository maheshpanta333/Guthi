import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useRouter } from 'expo-router';

export const handleUserRouting = async (
  uid: string,
  router: ReturnType<typeof useRouter>,
) => {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    const role = userData.role || 'user';

    if (role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/(tabs)');
    }
  } else {
    router.replace('/(tabs)');
  }
};