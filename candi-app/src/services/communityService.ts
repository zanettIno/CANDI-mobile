import { getValidAccessToken } from './authService';
import { API_BASE_URL } from '../constants/api';

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  // Só define Content-Type JSON quando há body — POST sem body causa 400 no Fastify
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Erro na requisição');
  }
  return response.json();
};

const fetchMultipart = async (endpoint: string, formData: FormData, method = 'POST') => {
  const token = await getValidAccessToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Erro no upload');
  }
  return response.json();
};

// ─── GRUPOS ──────────────────────────────────────────────────────────────────

export const listGroups = (topic?: string) => {
  const query = topic ? `?topic=${encodeURIComponent(topic)}` : '';
  return fetchAPI(`/community/groups${query}`);
};

export const getMyGroups = () => fetchAPI('/community/groups/mine');

export const getGroup = (groupId: string) => fetchAPI(`/community/groups/${groupId}`);

export const createGroup = (data: { name: string; description?: string; topic?: string }) =>
  fetchAPI('/community/groups', { method: 'POST', body: JSON.stringify(data) });

export const joinGroup = (groupId: string) =>
  fetchAPI(`/community/groups/${groupId}/join`, { method: 'POST' });

export const leaveGroup = (groupId: string) =>
  fetchAPI(`/community/groups/${groupId}/leave`, { method: 'DELETE' });

export const getGroupMembers = (groupId: string) =>
  fetchAPI(`/community/groups/${groupId}/members`);

// ─── LIKES ───────────────────────────────────────────────────────────────────

export const toggleLike = (postId: string) =>
  fetchAPI(`/community/posts/${postId}/like`, { method: 'POST' });

export const getPostLikes = (postId: string) =>
  fetchAPI(`/community/posts/${postId}/likes`);

export const getUserLikedPosts = () => fetchAPI('/community/me/liked-posts');

// ─── FAVORITOS ───────────────────────────────────────────────────────────────

export const toggleFavorite = (postId: string) =>
  fetchAPI(`/community/posts/${postId}/favorite`, { method: 'POST' });

export const getMyFavorites = () => fetchAPI('/community/me/favorites');

export const getMyFavoritedPosts = () => fetchAPI('/community/me/favorited-posts');

// ─── COMENTÁRIOS ─────────────────────────────────────────────────────────────

export const getComments = (postId: string) =>
  fetchAPI(`/community/posts/${postId}/comments`);

export const addComment = (postId: string, text: string) =>
  fetchAPI(`/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

export const deleteComment = (postId: string, commentId: string) =>
  fetchAPI(`/community/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });

// ─── COMPARTILHAR ────────────────────────────────────────────────────────────

export const sharePostToChat = (postId: string, conversationId: string) =>
  fetchAPI(`/community/posts/${postId}/share`, {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  });

// ─── POSTS DE GRUPO ──────────────────────────────────────────────────────────

export const getGroupPosts = (groupId: string) =>
  fetchAPI(`/feed/posts?subgroup=${encodeURIComponent(groupId)}`);

export const getMyMemberStatus = (groupId: string) =>
  fetchAPI(`/community/groups/${groupId}/my-status`);

export const getPendingRequests = (groupId: string) =>
  fetchAPI(`/community/groups/${groupId}/requests`);

export const handleJoinRequest = (groupId: string, profileId: string, action: 'approve' | 'reject') =>
  fetchAPI(`/community/groups/${groupId}/requests/${profileId}`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });

export const removeMember = (groupId: string, profileId: string) =>
  fetchAPI(`/community/groups/${groupId}/members/${profileId}`, { method: 'DELETE' });

export const updateMemberRole = (groupId: string, profileId: string, role: 'co-leader' | 'member') =>
  fetchAPI(`/community/groups/${groupId}/members/${profileId}/role`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });

export const deleteGroupPost = (groupId: string, postId: string) =>
  fetchAPI(`/community/groups/${groupId}/posts/${postId}`, { method: 'DELETE' });

// ─── FEED COM IMAGEM ─────────────────────────────────────────────────────────

export const createPostWithImage = async (
  content: string,
  topic: string,
  imageFile?: { uri: string; name: string; type: string },
  subgroup?: string,
) => {
  const formData = new FormData();
  formData.append('content', content);

  if (imageFile) {
    if (typeof document !== 'undefined') {
      const res = await fetch(imageFile.uri);
      const blob = await res.blob();
      formData.append('file', blob, imageFile.name);
    } else {
      formData.append('file', { uri: imageFile.uri, name: imageFile.name, type: imageFile.type } as any);
    }
  }

  const topicParam = topic === 'Feed' ? 'GERAL' : topic;
  const subgroupParam = subgroup ? `&subgroup=${encodeURIComponent(subgroup)}` : '';
  return fetchMultipart(`/feed/posts?topic=${encodeURIComponent(topicParam)}${subgroupParam}`, formData);
};
