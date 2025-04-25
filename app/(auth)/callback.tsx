import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Callback() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoading) {
        if (isLoggedIn) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#435465" />
      <Text style={styles.text}>Completing authentication...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  }
});