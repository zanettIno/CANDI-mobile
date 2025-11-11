import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

// --- Login com email e senha
export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Erro no login');

  if (data.accessToken && data.refreshToken) {
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }

  return data;
}

// --- Login com Google OAuth
export async function loginWithGoogle(googleUser) {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Erro no login com Google');

  if (data.accessToken && data.refreshToken) {
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }

  return data;
}

// --- Verificação e refresh de token
export async function getValidAccessToken() {
  let accessToken = await AsyncStorage.getItem('accessToken');
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) {
    throw new Error('Tokens não encontrados. Faça o login novamente.');
  }

  const verifyRes = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (verifyRes.ok) return accessToken;

  const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await refreshRes.json();

  if (refreshRes.ok && data.accessToken && data.refreshToken) {
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  }

  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  throw new Error('Sessão expirada. Por favor, faça o login novamente.');
}
