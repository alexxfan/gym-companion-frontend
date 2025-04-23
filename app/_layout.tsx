

// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Button, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <HeaderWrappedStack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Separate so we can use hooks
function HeaderWrappedStack() {
  const { isLoggedIn, signOut } = useAuth();

  return (
    <Stack
      screenOptions={({ route }) => ({
        // Apply a custom header to every screen
        header: ({ navigation, route, options }) => (
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.homeButtonText}>HOME</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Gym Companion</Text>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => router.replace('/(auth)/logout')}
            >
              <Text style={styles.logoutButtonText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        ),
      })}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="programs" options={{ headerShown: true }} />
      <Stack.Screen name="meal-plans" options={{ headerShown: true }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#435465',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  homeButton: {
    padding: 8,
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});