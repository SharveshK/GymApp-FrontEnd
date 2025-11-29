import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CHANGE YOUR IP HERE ONE LAST TIME ---
const BASE_URL = 'http://192.168.0.102:8080'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- THE INTERCEPTOR (The Magic Part) ---
// Before any request is sent, this code runs.
api.interceptors.request.use(
  async (config) => {
    // 1. Get the token from storage
    const token = await AsyncStorage.getItem('userToken');
    
    // 2. If it exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;