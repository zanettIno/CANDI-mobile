// src/services/feedService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
import { getValidAccessToken } from './authService';

/**
 * Helper para fazer requisições autenticadas.
 * Não usamos JSON por padrão, pois precisamos suportar FormData (multipart).
 */
const fetchFeedAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();
  
  const defaultHeaders: HeadersInit = {
    'Authorization': `Bearer ${token}`,
  };
  
  // Se não houver body (GET), ou se for FormData (o fetch cuida do Content-Type), 
  // não precisamos definir Content-Type. Se for JSON, o chamador deve definir.

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na requisição do Feed.');
  }
  return response.json();
};


/**
 * Busca postagens por tópico ou o feed global.
 */
export const getPosts = async (hashtag?: string) => {
  if (hashtag) {
    const tag = hashtag.replace(/^#/, '').toLowerCase();
    return fetchFeedAPI(`/feed/posts?hashtag=${encodeURIComponent(tag)}`);
  }
  return fetchFeedAPI('/feed/posts');
};


/**
 * Cria uma nova postagem, com suporte a arquivo.
 */
export const createPost = async (
  content: string, 
  topic: string, 
  imageFile?: { uri: string; name: string; type: string }
) => {
  const endpoint = `/feed/posts?topic=${topic}`;
  
  const formData = new FormData();
  formData.append('content', content);

  if (imageFile) {
    formData.append('file', imageFile as any);
  }

  // O fetch cuida de definir o 'Content-Type: multipart/form-data'
  return fetchFeedAPI(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      // 🔹 Não defina 'Content-Type': 'application/json' aqui!
      // O fetch deve definir automaticamente como 'multipart/form-data'
    }
  });
};