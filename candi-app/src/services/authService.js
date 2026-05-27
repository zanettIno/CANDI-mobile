import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

// ── Login com email e senha ───────────────────────────────────────────────────
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

// ── Login com Google OAuth ────────────────────────────────────────────────────
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

// ── Decode JWT local (sem validar assinatura — só lê o exp) ──────────────────
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ?? 0; // segundos desde epoch
  } catch {
    return 0;
  }
}

function isTokenExpired(token, marginSeconds = 60) {
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  return Date.now() / 1000 >= exp - marginSeconds;
}

// ── Mutex para evitar refresh paralelo ───────────────────────────────────────
let refreshPromise = null;

async function doRefresh(refreshToken) {
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

  // Refresh falhou — limpa sessão
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  throw new Error('Sessão expirada. Faça o login novamente.');
}

// ── Principal: retorna token válido, renovando se necessário ─────────────────
export async function getValidAccessToken() {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) {
    throw new Error('Tokens não encontrados. Faça o login novamente.');
  }

  // Token ainda válido — retorna direto sem bater no servidor
  if (!isTokenExpired(accessToken)) {
    return accessToken;
  }

  // Token expirado ou prestes a expirar — faz refresh (com mutex)
  if (!refreshPromise) {
    refreshPromise = doRefresh(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
