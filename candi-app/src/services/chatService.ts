// src/services/chatService.ts (React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
// 🔹 Assume que getValidAccessToken está no seu authService
import { getValidAccessToken } from './authService'; 

/**
 * Helper para fazer requisições autenticadas
 */
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na requisição');
  }
  return response.json();
};

/**
 * (Tela 2) Busca a lista de conversas do usuário
 */
export const getInbox = async () => {
  return fetchWithAuth('/chat/inbox');
};

/**
 * (Tela 3) Busca as mensagens de uma conversa
 */
export const getMessages = async (conversationId: string) => {
  // 🔹 'encodeURIComponent' é crucial por causa do '#' no ID
  const encodedId = encodeURIComponent(conversationId);
  return fetchWithAuth(`/chat/messages/${encodedId}`);
};

/**
 * (Tela 3) Envia uma nova mensagem
 */
export const sendMessage = async (conversationId: string, messageContent: string) => {
  const encodedId = encodeURIComponent(conversationId);
  return fetchWithAuth(`/chat/messages/${encodedId}`, {
    method: 'POST',
    body: JSON.stringify({ messageContent }),
  });
};

/**
 * (Modal) Inicia uma nova conversa com um usuário por email
 */
export const startConversationByEmail = async (email: string) => {
  return fetchWithAuth('/chat/start', {
    method: 'POST',
    body: JSON.stringify({ otherUserEmail: email }),
  });
};

export const getReadStatus = async (conversationId: string): Promise<{
  isRead: boolean;
  isDelivered: boolean;
  readUpTo: string | null;
}> => {
  return fetchWithAuth(`/chat/read-status/${encodeURIComponent(conversationId)}`);
};