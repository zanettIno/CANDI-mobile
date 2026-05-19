import { getValidAccessToken } from './authService';
import { API_BASE_URL } from '../constants/api';

const fetchAdmin = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers as any },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro na requisição admin');
  }
  return res.json();
};

export const getAdminStats = () => fetchAdmin('/admin/stats');
export const getSuspendedPosts = () => fetchAdmin('/admin/posts/suspended');
export const getAllReportedPosts = () => fetchAdmin('/admin/reports/all');
export const getPostReports = (postId: string) => fetchAdmin(`/admin/posts/${postId}/reports`);
export const approvePost = (postId: string) => fetchAdmin(`/admin/posts/${postId}/approve`, { method: 'PATCH' });
export const removePost = (postId: string) => fetchAdmin(`/admin/posts/${postId}/remove`, { method: 'PATCH' });
export const getBannedUsers = () => fetchAdmin('/admin/users/banned');
export const unbanUser = (userId: string) => fetchAdmin(`/admin/users/${userId}/unban`, { method: 'PATCH' });
export const getAdmins = () => fetchAdmin('/admin/admins');
export const createAdmin = (data: { name: string; email: string; password: string }) =>
  fetchAdmin('/admin/admins', { method: 'POST', body: JSON.stringify(data) });
export const deleteAdmin = (adminId: string) =>
  fetchAdmin(`/admin/admins/${adminId}`, { method: 'DELETE' });
export const updateMyCredentials = (data: { email?: string; password?: string; current_password: string }) =>
  fetchAdmin('/admin/me/credentials', { method: 'PATCH', body: JSON.stringify(data) });
