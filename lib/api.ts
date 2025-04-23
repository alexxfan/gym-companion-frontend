import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // assuming mobile
import { getItem } from './storage'; // already exists in your code

const API = axios.create({
//   baseURL: 'http://localhost:5000', // or wherever your backend lives
    baseURL: 'http://192.168.1.242:5000', // Use your actual server URL
});

// Attach token on each request
API.interceptors.request.use(async (config) => {
    const token = await getItem('auth0_access_token');
    console.log('🔐 token', token);
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Sending headers:', config.headers);
    }
  
    return config;
  });
  

export default API;

