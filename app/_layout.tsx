import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Button, Platform, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

//header buttons
interface HeaderButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
}

const HeaderButton = ({ title, onPress, color = "#fff" }: HeaderButtonProps) => (
  <TouchableOpacity 
    onPress={onPress}
    style={styles.headerButton}
  >
    <Text style={[styles.headerButtonText, { color }]}>{title}</Text>
  </TouchableOpacity>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: '#435465',
              height: Platform.OS === 'ios' ? 110 : 65, 
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center',
            title: 'Gym Companion',
            headerLeft: route.name !== '(tabs)' ? () => (
              <HeaderButton 
                title="HOME" 
                onPress={() => router.replace('/(tabs)')} 
              />
            ) : undefined,
            headerRight: () => (
              <HeaderButton
                title="LOGOUT"
                onPress={() => router.replace('/(auth)/logout')}
              />
            ),
            headerLeftContainerStyle: {
              paddingLeft: 15,
            },
            headerRightContainerStyle: {
              paddingRight: 15,
            },
            headerStatusBarHeight: Platform.OS === 'ios' ? 44 : 0,
          })}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  }
});