import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StatusBar, ActivityIndicator,
  Alert, Platform, StyleSheet, KeyboardAvoidingView,
  TouchableOpacity, Image,
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
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserIdRef = useRef<string | null>(null);

  const getUserId = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return null;
    const payloadB64 = token.split('.')[1];
    const decoded = Platform.OS === 'web'
      ? JSON.parse(atob(payloadB64))
      : JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    return decoded.id;
  };

  // Extrai o ID do outro usuário do conversationId (formato: "uuid1#uuid2")
  const extractOtherUserId = (myId: string, convId: string): string | null => {
    const parts = convId.split('#');
    if (parts.length !== 2) return null;
    return parts[0] === myId ? parts[1] : parts[0];
  };

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const [id, history] = await Promise.all([getUserId(), getMessages(conversationId)]);
      if (id) {
        setCurrentUserId(id);
        otherUserIdRef.current = extractOtherUserId(id, conversationId);
      }
      setMessages([...history].reverse());
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const connect = async () => {
      const token = await getValidAccessToken();

      const socket = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join_conversation', { conversationId });
        socket.emit('get_online_users');
      });

      socket.on('disconnect', () => setIsConnected(false));

      socket.on('new_message', (msg: ChatMessage) => {
        setMessages(prev => {
          const withoutOptimistic = prev.filter(
            m => !(m.timestamp.includes('#temp') && m.message_content === msg.message_content && m.sender_id === msg.sender_id),
          );
          // Evita duplicata se a mensagem já existe
          if (withoutOptimistic.some(m => m.timestamp === msg.timestamp)) return withoutOptimistic;
          return [msg, ...withoutOptimistic];
        });
      });

      // Presença
      socket.on('online_users', ({ online }: { online: string[] }) => {
        const set = new Set(online);
        setOnlineUsers(set);
        if (otherUserIdRef.current) setIsOtherOnline(set.has(otherUserIdRef.current));
      });

      socket.on('user_online', ({ profile_id }: { profile_id: string }) => {
        setOnlineUsers(prev => new Set([...prev, profile_id]));
        if (otherUserIdRef.current === profile_id) setIsOtherOnline(true);
      });

      socket.on('user_offline', ({ profile_id }: { profile_id: string }) => {
        setOnlineUsers(prev => { const n = new Set(prev); n.delete(profile_id); return n; });
        if (otherUserIdRef.current === profile_id) setIsOtherOnline(false);
      });

      socket.on('user_typing', ({ name, isTyping: typing }: { name: string; isTyping: boolean }) => {
        setIsTyping(typing);
        setTypingUser(name);
      });

      socket.on('error', (err: any) => console.warn('[Socket error]', err));

      socketRef.current = socket;
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_conversation', { conversationId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId]);

  // Atualiza isOtherOnline quando otherUserIdRef é resolvido
  useEffect(() => {
    if (otherUserIdRef.current) {
      setIsOtherOnline(onlineUsers.has(otherUserIdRef.current));
    }
  }, [currentUserId]);

  useEffect(() => { loadHistory(); }, []);

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
      socketRef.current.emit('send_message', { conversationId, messageContent: textToSend });
    } else {
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
    const showName = !isSent && (!prev || prev.sender_id !== item.sender_id);
    const showAvatar = !isSent && (index === 0 || messages[index - 1]?.sender_id !== item.sender_id);

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
          <View style={styles.statusRow}>
            <View style={[styles.dot, {
              backgroundColor: isOtherOnline ? '#4ade80' : 'rgba(255,255,255,0.4)',
            }]} />
            <Text style={styles.statusText}>
              {isConnected
                ? (isOtherOnline ? 'online agora' : 'offline')
                : 'reconectando...'}
            </Text>
          </View>
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
