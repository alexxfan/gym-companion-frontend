import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { getItem, saveItem, deleteItem } from '@/lib/storage';
import { useRouter } from 'expo-router';


WebBrowser.maybeCompleteAuthSession();

type User = {
  user_id: number;
  email: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const auth0ClientId = 'sv0lXLuNn0xOY8CZeQ5VxfTVIqe4rVrR';
const auth0Domain = 'dev-10hyxzgnigs4hncj.us.auth0.com';
const audience = 'https://gym-companion-api';

// Safe redirect URI generator for web + native + SSR
const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/callback`;
    } else {
      // return 'http://localhost:8081/callback';
      return 'http://192.168.1.242:8081/callback';
    }
  } else {
    return AuthSession.makeRedirectUri({
      scheme: 'myapp',
      path: 'callback',
    });
  }
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectUri, setRedirectUri] = useState<string>('');

  useEffect(() => {
    setRedirectUri(getRedirectUri());

    const loadUser = async () => {
      try {
        const token = await getItem('auth0_access_token');
        const userJson = await getItem('user_data');

        if (token && userJson) {
          setIsLoggedIn(true);
          setUser(JSON.parse(userJson));
        }
      } catch (err) {
        console.error('Failed to load user from storage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const router = useRouter(); // <-- INIT THIS
  const signIn = async () => {
    try {
      setIsLoading(true);
  
      // const nonce = Math.random().toString(36).substring(2);
      // const uri = redirectUri || 'myapp://callback';
  
      const authRequest = new AuthSession.AuthRequest({
        clientId: auth0ClientId,
        redirectUri,
        responseType: 'token id_token', // <- IMPORTANT FIX HERE
        scopes: ['openid', 'profile', 'email'],
        extraParams: {
          // audience: `https://${auth0Domain}/userinfo`, // <- specifically request access to userinfo
          audience: 'https://gym-companion-api',
          nonce: Math.random().toString(36).substring(2, 15)
        },
      });
      
  
      const result = await authRequest.promptAsync({
        authorizationEndpoint: `https://${auth0Domain}/authorize`,
      });
  
      if (result.type === 'success') {
        const idToken = result.params.id_token;
        const accessToken = result.params.access_token;

        console.log('Access Token:', accessToken);
        console.log('ID Token:', idToken);


  
        const userInfoResponse = await fetch(`https://${auth0Domain}/userinfo`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        const auth0User = await userInfoResponse.json();
  
        // const serverResponse = await axios.post('http://localhost:5000/auth/register-auth0-user', {
        const serverResponse = await axios.post('http://192.168.1.242:5000/auth/register-auth0-user', {
          auth0_id: auth0User.sub,
          email: auth0User.email,
        });
  
        const dbUser = serverResponse.data.user;
  
        await saveItem('auth0_id_token', idToken);
        await saveItem('auth0_access_token', accessToken);
        await saveItem('user_data', JSON.stringify(dbUser));
  
        setUser(dbUser);
        setIsLoggedIn(true);
  
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);

      } else {
        Alert.alert('Login failed', 'Could not authenticate with Auth0');
      }
    } catch (err) {
      console.error('[Auth] Sign-in error:', err);
      Alert.alert('Login error', 'There was a problem logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
  
      await deleteItem('auth0_id_token');
      await deleteItem('auth0_access_token');
      await deleteItem('user_data');
  
      const returnTo = Platform.OS === 'web'
        ? 'http://localhost:8081/login'
        : 'http://192.168.1.242:8081/login';
  
      const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(returnTo)}`;

  
      if (Platform.OS === 'web') {
        // 🚀 Just send user directly to Auth0 logout
        window.location.href = logoutUrl;
      } else {
        await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo);
      }
  
      setUser(null);
      setIsLoggedIn(false);
    } catch (err) {
      console.error('[Auth] Sign-out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

