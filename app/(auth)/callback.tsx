import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Callback() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoading && isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login'); // fallback if not logged in
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#435465" />
    </View>
  );
}
