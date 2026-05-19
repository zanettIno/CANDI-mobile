import { getValidAccessToken } from './authService';
import { API_BASE_URL } from '../constants/api';

const fetchAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers as any },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro');
  }
  return res.json();
};

export const createInvite = (data: { email: string; permissions: string[] }) =>
  fetchAuth('/auth/invite', { method: 'POST', body: JSON.stringify(data) });

export const getInviteInfo = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/invite/${token}`);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Convite inválido');
  return res.json();
};

export const registerSupport = (data: { name: string; email: string; password: string; invite_token: string }) =>
  fetch(`${API_BASE_URL}/auth/register-support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async r => {
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Erro');
    return r.json();
  });

export const getMyInvites = () => fetchAuth('/auth/my-invites');
export const getSupportNetwork = () => fetchAuth('/auth/support-network');
export const getMyPatient = () => fetchAuth('/auth/my-patient');

export const reportPost = (postId: string, reason: string) =>
  fetchAuth(`/community/posts/${postId}/report`, { method: 'POST', body: JSON.stringify({ reason }) });
