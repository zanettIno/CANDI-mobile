import { Socket, io } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getValidAccessToken } from '@/services/authService';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

let socketInstance: Socket | null = null;

export const initializeSocket = async (): Promise<Socket> => {
  if (socketInstance?.connected) {
    console.log('[SocketService] Socket já conectado');
    return socketInstance;
  }

  try {
    const token = await getValidAccessToken();
    if (!token) throw new Error('Sem token de acesso');

    console.log('[SocketService] Inicializando socket com token');
    socketInstance = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 10000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('[SocketService] Socket conectado, id:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[SocketService] Socket desconectado:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[SocketService] Erro de conexão:', err);
    });

    return socketInstance;
  } catch (error) {
    console.error('[SocketService] Erro ao inicializar socket:', error);
    throw error;
  }
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    console.log('[SocketService] Desconectando socket');
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socketInstance?.connected || false;
};
