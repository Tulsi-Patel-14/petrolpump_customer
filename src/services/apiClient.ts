import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

const rawApiUrl = process.env.API_URL || 'http://localhost:5000/api/v1';

export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
export const BASE_URL = rawApiUrl
  ? (API_BASE_URL.endsWith('/customer-app') ? API_BASE_URL : `${API_BASE_URL}/customer-app`)
  : '';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('userToken');
  const headers = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn(`[API Timeout] Call to ${BASE_URL}${endpoint} timed out.`);
      throw new Error(`Connection timed out (${API_BASE_URL}).`);
    }
    console.warn(`[API Network Error] Call to ${BASE_URL}${endpoint} failed:`, err);
    throw new Error(`Network request failed (${API_BASE_URL}). Check server IP.`);
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
    throw new Error(`Invalid response from server. Status: ${response.status}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      await AsyncStorage.removeItem('userToken');
    }
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data;
};
