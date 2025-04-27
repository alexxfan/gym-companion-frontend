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

const auth0ClientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID as string;
const auth0Domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN as string;
const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE as string;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string;

const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/callback`;
    } else {
      return 'http://localhost:8081/callback';
    }
  } else {
    const standardUri = AuthSession.makeRedirectUri();
    console.log('Using redirect URI:', standardUri);
    console.log("Auth0 Client ID:", auth0ClientId);
    console.log("Auth0 Domain:", auth0Domain);
    console.log("Auth0 Audience:", audience);

    return standardUri;
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

  const router = useRouter();
  const signIn = async () => {
    try {
      setIsLoading(true);
  
      const authRequest = new AuthSession.AuthRequest({
        clientId: auth0ClientId,
        redirectUri,
        responseType: 'token id_token', 
        scopes: ['openid', 'profile', 'email'],
        extraParams: {
          audience: audience,
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
  
        const serverResponse = await axios.post(`${API_BASE_URL}/auth/register-auth0-user`, {
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

  // const signOut = async () => {
  //   try {
  //     setIsLoading(true);
  //     await deleteItem('auth0_id_token');
  //     await deleteItem('auth0_access_token');
  //     await deleteItem('user_data');
  
  //     const returnTo = Platform.OS === 'web'
  //       ? 'http://localhost:8081/login'
  //       : 'myapp://login';
  
  //     const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(returnTo)}`;

  
  //     if (Platform.OS === 'web') {
  //       // Send user directly to Auth0 logout
  //       window.location.href = logoutUrl;
  //     } else {
  //       console.log('we are int he else lol')
  //       router.replace('/(auth)/login');
  //     }
  
  //     setUser(null);
  //     setIsLoggedIn(false);

  //   } catch (err) {
  //     console.error('[Auth] Sign-out error:', err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

// const signOut = async () => {
//   try {
//     console.log('Starting signOut process');
//     setIsLoading(true);

//     // Set a logout flag
//     await saveItem('manually_logged_out', 'true');
    
//     // Then clear the stored tokens
//     await Promise.all([
//       deleteItem('auth0_id_token'),
//       deleteItem('auth0_access_token'),
//       deleteItem('user_data')
//     ]);
    
//     // For web, we need to log out of Auth0
//     if (Platform.OS === 'web') {
//       const returnTo = window.location.origin + '/login';
//       const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(returnTo)}`;
//       window.location.href = logoutUrl;
//     } else {
//       // For mobile, log out of Auth0 session and then navigate
//       const returnTo = 'exp://ilredko-alexfan-8081.exp.direct/--/login';
//       const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(returnTo)}`;
      
//       try {
//         // Clear the Auth0 session in the browser
//         await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo);
//         WebBrowser.maybeCompleteAuthSession();
//         router.replace('/(auth)/login');
//       } catch (browserErr) {
//         console.log('Browser session error:', browserErr);
//       }
      
//     setUser(null);
//     setIsLoggedIn(false);

//     }
//   } catch (err) {
//     console.error('[Auth] Sign-out error:', err);
//   } finally {
//     setIsLoading(false);
//   }
// };
const signOut = async () => {
  try {
    console.log('Starting signOut process');
    setIsLoading(true);

    //clear tokens
    await Promise.all([
      deleteItem('auth0_id_token'),
      deleteItem('auth0_access_token'),
      deleteItem('user_data')
    ]);

    //log out from Auth0
    const returnTo = Platform.OS === 'web'
      ? window.location.origin + '/login'  // Web redirect
      : 'myapp://login';  // Mobile redirect to a deep link in your app

    const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(returnTo)}`;

    //open the Auth session to log out on moble
    if (Platform.OS !== 'web') {
      await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo);

      //ensure that any session is cleared
      WebBrowser.maybeCompleteAuthSession();

      //go back to the login screen after the session completes
      setTimeout(() => {
        router.replace('/(auth)/login');  
      }, 1000);
    }

    //redirect
    if (Platform.OS === 'web') {
      window.location.href = logoutUrl;
    }

    //set user data to null and loggedIn to false
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

