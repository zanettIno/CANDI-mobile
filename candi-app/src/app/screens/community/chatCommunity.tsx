import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StatusBar, ActivityIndicator,
  Alert, Platform, StyleSheet, KeyboardAvoidingView,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { AppTheme } from '../../../theme/index';
import { MessageBubble } from '@/components/Bubble/messageBubble';
import { MessageInput } from '@/components/Inputs/inputMessage';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import BackIconButton from '@/components/BackIconButton';
import Avatar from '@/components/Avatar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMessages } from '@/services/chatService';
// @ts-ignore – authService is a JS file without type declarations
import { getValidAccessToken } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { API_BASE_URL } from '@/constants/api';
import { formatTime } from '@/utils/dateFormat';

interface ChatMessage {
  conversation_id: string;
  timestamp: string;
  sender_id: string;
  sender_name: string;
  message_content: string;
}

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const SOCKET_URL = API_BASE_URL.replace('/api', '');

const decodeJwtId = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) return null;
  const p = token.split('.')[1];
  const decoded = Platform.OS === 'web'
    ? JSON.parse(atob(p))
    : JSON.parse(Buffer.from(p, 'base64').toString());
  return decoded.id ?? null;
};

export const ChatCommunity: React.FC = () => {
  const router = useRouter();
  const { conversationId, userName } = useLocalSearchParams<{
    conversationId: string;
    userName: string;
  }>();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    let mounted = true;

    const init = async () => {
      // 1. Resolve myId e otherUserId antes de qualquer coisa
      const myId = await decodeJwtId();
      if (!mounted) return;

      if (myId) {
        setCurrentUserId(myId);
        const parts = conversationId.split('#');
        if (parts.length === 2) {
          otherUserIdRef.current = parts[0] === myId ? parts[1] : parts[0];
        }
      }

      // 2. Carrega histórico
      try {
        const history = await getMessages(conversationId);
        if (mounted) setMessages([...history].reverse());
      } catch {
        if (mounted) Alert.alert('Erro', 'Não foi possível carregar o histórico.');
      } finally {
        if (mounted) setIsLoading(false);
      }

      // 3. Conecta socket (já tem otherUserIdRef resolvido)
      const token = await getValidAccessToken();
      if (!mounted) return;

      const socket = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 10000,
        reconnectionAttempts: Infinity,
        timeout: 10000,
      });

      socket.on('connect', () => {
        if (!mounted) return;
        console.log('[Socket] Conectado ao servidor');
        socket.emit('join_conversation', { conversationId });
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Desconectado:', reason);
      });

      socket.on('error', (err) => {
        console.error('[Socket] Erro:', err);
      });

      socket.on('connect_error', (err) => {
        console.error('[Socket] Erro de conexão:', err);
      });

      socket.on('new_message', (msg: ChatMessage) => {
        if (!mounted) return;
        console.log('[Socket] Mensagem recebida:', msg.message_content, 'de', msg.sender_id);
        setMessages(prev => {
          const without = prev.filter(
            m => !(m.timestamp.includes('#temp') && m.message_content === msg.message_content && m.sender_id === msg.sender_id),
          );
          if (without.some(m => m.timestamp === msg.timestamp)) return without;
          return [msg, ...without];
        });
      });


      socket.on('user_typing', ({ isTyping: typing }: { name: string; isTyping: boolean }) => {
        if (!mounted) return;
        setIsTyping(typing);
      });

      socket.on('error', (err: any) => console.warn('[Socket error]', err));

      socketRef.current = socket;
    };

    init();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leave_conversation', { conversationId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId]);

  const handleTypingEvent = useCallback((text: string) => {
    setMessage(text);
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit('typing', { conversationId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { conversationId, isTyping: false });
    }, 1500);
  }, [conversationId]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || !conversationId) return;
    const textToSend = message.trim();
    setMessage('');
    socketRef.current?.emit('typing', { conversationId, isTyping: false });

    const optimistic: ChatMessage = {
      conversation_id: conversationId,
      timestamp: `${new Date().toISOString()}#temp-${Date.now()}`,
      sender_id: currentUserId || 'local',
      sender_name: 'Você',
      message_content: textToSend,
    };
    setMessages(prev => [optimistic, ...prev]);

    if (socketRef.current?.connected) {
      console.log('[Socket] Enviando mensagem via socket:', textToSend);
      socketRef.current.emit('send_message', { conversationId, messageContent: textToSend });
    } else {
      console.log('[Socket] Socket não conectado. Estado:', {
        socket: !!socketRef.current,
        connected: socketRef.current?.connected,
        id: socketRef.current?.id,
      });
      console.log('[Socket] Usando API fallback');
      try {
        const { sendMessage } = await import('@/services/chatService');
        const real = await sendMessage(conversationId, textToSend);
        setMessages(prev => {
          const idx = prev.findIndex(m => m.timestamp === optimistic.timestamp);
          if (idx > -1) { const u = [...prev]; u[idx] = real; return u; }
          return prev;
        });
      } catch {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
        setMessages(prev => prev.filter(m => m.timestamp !== optimistic.timestamp));
        setMessage(textToSend);
      }
    }
  }, [message, conversationId, currentUserId]);

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isSent = item.sender_id === currentUserId;
    const isOptimistic = item.timestamp.includes('#temp');
    const prev = messages[index + 1];
    const showAvatar = !isSent && (index === 0 || messages[index - 1]?.sender_id !== item.sender_id);
    const showName = !isSent && (!prev || prev.sender_id !== item.sender_id);

    return (
      <View style={[styles.messageRow, isSent ? styles.rowSent : styles.rowReceived]}>
        {!isSent && (
          <View style={styles.avatarSlot}>
            {showAvatar && <Avatar name={item.sender_name || '?'} size={30} />}
          </View>
        )}
        <View style={[styles.bubbleWrap, isSent ? styles.bubbleWrapSent : styles.bubbleWrapReceived]}>
          {showName && <Text style={styles.senderName}>{item.sender_name}</Text>}
          <MessageBubble
            message={item.message_content}
            time={formatTime(item.timestamp)}
            isSent={isSent}
            onPressSharedPost={(p) => router.push({ pathname: '/screens/community/postDetail', params: p })}
          />
          {isSent && isOptimistic && (
            <Text style={styles.sending}>enviando...</Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.headerBg}><LoginSignupBackground /></View>

      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <BackIconButton color={AppTheme.colors.cardBackground} onPress={() => router.back()} top={0} />
        <Avatar name={userName || '?'} size={42} />
        <View style={styles.userMeta}>
          <Text style={styles.userName} numberOfLines={1}>{userName || 'Chat'}</Text>
        </View>
      </View>

      <View style={styles.messageList}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.timestamp}
          inverted
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isTyping ? (
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}>👋</Text>
              <Text style={styles.emptyChatText}>Inicie a conversa!</Text>
              <Text style={styles.emptyChatSub}>Diga olá para {userName}</Text>
            </View>
          }
        />
      </View>

      <View style={styles.footer}>
        <MessageInput
          value={message}
          onChangeText={handleTypingEvent}
          onSend={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppTheme.colors.background },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 0 },
  header: {
    height: 120, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, zIndex: 1, gap: 10,
  },
  userMeta: { flex: 1 },
  userName: {
    fontSize: 17, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: {
    fontSize: 12, color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  messageList: { flex: 1 },
  flatListContent: { paddingHorizontal: 12, paddingVertical: 12 },

  messageRow: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-end',
    gap: 6,
  },
  rowSent: { justifyContent: 'flex-end' },
  rowReceived: { justifyContent: 'flex-start' },
  avatarSlot: { width: 32, alignItems: 'center', justifyContent: 'flex-end' },
  bubbleWrap: { maxWidth: '78%' },
  bubbleWrapSent: { alignItems: 'flex-end' },
  bubbleWrapReceived: { alignItems: 'flex-start' },
  senderName: {
    fontSize: 11, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    marginBottom: 2, marginLeft: 4,
  },
  sending: {
    fontSize: 10, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    marginTop: 2,
  },

  typingBubble: {
    alignSelf: 'flex-start',
    marginLeft: 38,
    marginBottom: 6,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: AppTheme.colors.placeholderText,
  },

  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyChatEmoji: { fontSize: 40 },
  emptyChatText: {
    fontSize: 18, fontWeight: '700',
    color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  emptyChatSub: {
    fontSize: 14, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },

  footer: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
  },
});

export default ChatCommunity;
