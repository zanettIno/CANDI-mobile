import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { useNotification } from '@/context/NotificationContext';
import { useChat } from '@/context/ChatContext';
import { initializeSocket } from '@/services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Socket } from 'socket.io-client';

interface InboxUpdate {
  conversation_id: string;
  sender_name: string;
  last_message: string;
}

export default function GlobalSocketController() {
  const { showNotification } = useNotification();
  const { incrementUnread, triggerInboxRefresh, triggerFeedRefresh, activeConversationId } = useChat();

  // Refs — evitam stale closure sem recriar o socket
  const showNotifRef = useRef(showNotification);
  const incrementRef = useRef(incrementUnread);
  const triggerInboxRef = useRef(triggerInboxRefresh);
  const triggerFeedRef = useRef(triggerFeedRefresh);
  const activeConvRef = useRef(activeConversationId);

  useEffect(() => { showNotifRef.current = showNotification; }, [showNotification]);
  useEffect(() => { incrementRef.current = incrementUnread; }, [incrementUnread]);
  useEffect(() => { triggerInboxRef.current = triggerInboxRefresh; }, [triggerInboxRefresh]);
  useEffect(() => { triggerFeedRef.current = triggerFeedRefresh; }, [triggerFeedRefresh]);
  useEffect(() => { activeConvRef.current = activeConversationId; }, [activeConversationId]);

  const socketRef = useRef<Socket | null>(null);
  const inboxHandlerRef = useRef<((data: InboxUpdate) => void) | null>(null);
  const feedHandlerRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    // Decodifica o profile_id do JWT para filtrar notificações de próprias postagens
    const getMyProfileId = async (): Promise<string | null> => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return null;
        const payload = token.split('.')[1];
        const decoded = Platform.OS === 'web'
          ? JSON.parse(atob(payload))
          : JSON.parse(Buffer.from(payload, 'base64').toString());
        return decoded.id ?? null;
      } catch { return null; }
    };

    const attach = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token || !mounted) return;
        const myProfileId = await getMyProfileId();

        const socket = await initializeSocket();
        if (!mounted) return;

        // Remove listeners anteriores (evita duplicatas no socket singleton)
        if (inboxHandlerRef.current) socket.off('inbox_update', inboxHandlerRef.current);
        if (feedHandlerRef.current) socket.off('new_post', feedHandlerRef.current);

        // Handler: nova mensagem recebida → atualiza inbox + badge + notificação
        const inboxHandler = (data: InboxUpdate) => {
          if (!mounted) return;
          if (activeConvRef.current === data.conversation_id) return;

          incrementRef.current();
          triggerInboxRef.current?.();

          const markRead = () => {
            socket.emit('ack_read', { conversationId: data.conversation_id });
            triggerInboxRef.current?.();
          };

          showNotifRef.current({
            title: data.sender_name,
            message: data.last_message,
            type: 'info',
            duration: 7000,
            conversationId: data.conversation_id,
            conversationName: data.sender_name,
            onMarkRead: markRead,
          });
        };

        // Handler: nova publicação → atualiza feed + notifica (exceto posts próprios)
        const feedHandler = (data: { post_id: string; profile_name: string; topic: string; profile_id?: string; subgroup?: string }) => {
          if (!mounted) return;
          triggerFeedRef.current?.();
          // Não notifica o próprio autor do post
          if (data.profile_id && data.profile_id === myProfileId) return;
          const where = data.subgroup ? 'no grupo' : `no feed de ${data.topic || 'Geral'}`;
          showNotifRef.current({
            title: data.profile_name || 'Nova publicação',
            message: `Publicou algo novo ${where}`,
            type: 'success',
            duration: 5000,
          });
        };

        inboxHandlerRef.current = inboxHandler;
        feedHandlerRef.current = feedHandler;
        socketRef.current = socket;
        socket.on('inbox_update', inboxHandler);
        socket.on('new_post', feedHandler);
      } catch {
        // Usuário não autenticado — silencioso
      }
    };

    attach();

    return () => {
      mounted = false;
      if (socketRef.current) {
        if (inboxHandlerRef.current) socketRef.current.off('inbox_update', inboxHandlerRef.current);
        if (feedHandlerRef.current) socketRef.current.off('new_post', feedHandlerRef.current);
        inboxHandlerRef.current = null;
        feedHandlerRef.current = null;
      }
    };
  }, []); // Roda 1x — refs garantem valores atuais

  return null;
}
