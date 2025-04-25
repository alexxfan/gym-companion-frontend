import axios from 'axios';
import { getItem } from './storage';
import Constants from 'expo-constants';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string
const API = axios.create({
  baseURL: API_BASE_URL, 
});


//attach token on each request
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

