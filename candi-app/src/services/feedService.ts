// src/services/feedService.ts
import { API_BASE_URL } from '../constants/api';
import { getValidAccessToken } from './authService';

export interface PaginatedFeed {
  items: Post[];
  nextKey: string | null;
}

export interface Post {
  post_id: string;
  profile_id: string;
  profile_name: string;
  profile_nickname?: string;
  content: string;
  file_url?: string;
  created_at: string;
  topic: string;
  like_count?: number;
  comment_count?: number;
  subgroup?: string;
  hashtags?: string[];
}

const fetchFeedAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro na requisição do Feed.');
  }
  return response.json();
};

export const getPosts = async (
  hashtag?: string,
  limit = 20,
  lastKey?: string,
): Promise<PaginatedFeed> => {
  const params = new URLSearchParams();
  if (hashtag) params.set('hashtag', hashtag.replace(/^#/, ''));
  if (limit !== 20) params.set('limit', String(limit));
  if (lastKey) params.set('lastKey', lastKey);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchFeedAPI(`/feed/posts${query}`);
};

export const getPostsByTopic = async (
  topic: string,
  limit = 20,
  lastKey?: string,
): Promise<PaginatedFeed> => {
  const params = new URLSearchParams({ topic });
  if (lastKey) params.set('lastKey', lastKey);
  params.set('limit', String(limit));
  return fetchFeedAPI(`/feed/posts?${params.toString()}`);
};

export const deletePost = async (postId: string): Promise<void> => {
  await fetchFeedAPI(`/feed/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });
};

export const createPost = async (
  content: string,
  topic: string,
  imageFile?: { uri: string; name: string; type: string },
) => {
  const formData = new FormData();
  formData.append('content', content);
  if (imageFile) {
    formData.append('file', imageFile as any);
  }
  return fetchFeedAPI(`/feed/posts?topic=${encodeURIComponent(topic)}`, {
    method: 'POST',
    body: formData,
  });
};
