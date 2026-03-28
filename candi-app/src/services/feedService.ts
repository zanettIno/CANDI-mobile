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
export const getPosts = async (topic: string = 'Feed') => {
  // O backend usa a palavra 'posts' para listar tudo (global ou por tópico)
  // O tópico 'Feed' no front-end mapeia para o feed geral no backend (sem query param)
  const topicParam = topic === 'Feed' ? '' : topic;
  const endpoint = topicParam ? `/feed/posts?topic=${topicParam}` : '/feed/posts';
  
  return fetchFeedAPI(endpoint);
};


/**
 * Cria uma nova postagem, com suporte a arquivo.
 */
export const createPost = async (
  content: string,
  topic: string,
  imageFile?: { uri: string; name: string; type: string }
) => {
  try {
    // Validação básica
    if (!content?.trim() && !imageFile) {
      throw new Error('A postagem deve conter texto ou uma imagem.');
    }

    const endpoint = `/feed/posts?topic=${topic}`;
    const formData = new FormData();

    // Adiciona conteúdo (pode estar vazio se apenas imagem)
    formData.append('content', content || '');

    // Adiciona arquivo se houver
    if (imageFile) {
      try {
        // Converte URI para blob (necessário para upload)
        const response = await fetch(imageFile.uri);
        const blob = await response.blob();
        formData.append('file', blob, imageFile.name);
      } catch (error) {
        console.error('Erro ao converter imagem para blob:', error);
        throw new Error('Não foi possível processar a imagem selecionada.');
      }
    }

    console.log('[createPost] Enviando para backend:', {
      topic,
      hasContent: !!content?.trim(),
      hasImage: !!imageFile,
    });

    // O fetch cuida de definir automaticamente 'Content-Type: multipart/form-data'
    const response = await fetchFeedAPI(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Não defina Content-Type - o fetch define automaticamente
      },
    });

    return response;
  } catch (error) {
    console.error('[createPost] Erro:', error);
    throw error;
  }
};

/**
 * Interface para comentário
 */
export interface Comment {
  comment_id: string;
  post_id: string;
  profile_id: string;
  profile_name: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Toggle like on a post (add or remove)
 */
export const toggleLike = async (postId: string): Promise<{ liked: boolean; likes_count: number }> => {
  const endpoint = `/feed/posts/${postId}/likes`;

  const response = await fetchFeedAPI(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  return {
    liked: response.liked,
    likes_count: response.likes_count,
  };
};

/**
 * Add comment to a post
 */
export const addComment = async (
  postId: string,
  content: string,
): Promise<Comment> => {
  const endpoint = `/feed/posts/${postId}/comments`;

  const response = await fetchFeedAPI(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  return response.comment;
};

/**
 * Get all comments for a post
 */
export const getComments = async (
  postId: string,
  limit: number = 20,
): Promise<Comment[]> => {
  const endpoint = `/feed/posts/${postId}/comments?limit=${limit}`;

  const response = await fetchFeedAPI(endpoint);

  return response.comments || [];
};

/**
 * Delete a comment (only by author)
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const endpoint = `/feed/comments/${commentId}`;

  await fetchFeedAPI(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Check if user already liked a post
 */
export const checkUserLike = async (postId: string): Promise<boolean> => {
  const endpoint = `/feed/posts/${postId}/likes/check`;

  const response = await fetchFeedAPI(endpoint);

  return response.user_liked || false;
};

/**
 * Save a post to user's saved posts
 */
export const savePost = async (postId: string): Promise<void> => {
  const endpoint = `/feed/posts/${postId}/save`;

  await fetchFeedAPI(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
};

/**
 * Unsave a post from user's saved posts
 */
export const unsavePost = async (postId: string): Promise<void> => {
  const endpoint = `/feed/posts/${postId}/save`;

  await fetchFeedAPI(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Get all saved posts for user
 */
export const getSavedPosts = async () => {
  const endpoint = '/feed/saved-posts';

  const response = await fetchFeedAPI(endpoint);

  return response.posts || [];
};

/**
 * Check if user saved a post
 */
export const checkUserSave = async (postId: string): Promise<boolean> => {
  const endpoint = `/feed/posts/${postId}/save/check`;

  const response = await fetchFeedAPI(endpoint);

  return response.is_saved || false;
};