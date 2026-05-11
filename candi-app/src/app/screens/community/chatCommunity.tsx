import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getUserId = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return null;
    const payloadB64 = token.split('.')[1];
    const decoded = Platform.OS === 'web'
      ? JSON.parse(atob(payloadB64))
      : JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    return decoded.id;
  };

  // Carrega histórico inicial via REST
  const loadHistory = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const [id, history] = await Promise.all([getUserId(), getMessages(conversationId)]);
      if (id) setCurrentUserId(id);
      setMessages([...history].reverse());
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Conecta ao Socket.io
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
      });

      socket.on('disconnect', () => setIsConnected(false));

      socket.on('new_message', (msg: ChatMessage) => {
        setMessages(prev => {
          // Remove mensagem otimista correspondente (pelo conteúdo + sender)
          const withoutOptimistic = prev.filter(
            m => !(m.timestamp.includes('#temp') && m.message_content === msg.message_content),
          );
          // Adiciona a real ao topo (lista invertida)
          return [msg, ...withoutOptimistic];
        });
      });

      socket.on('user_typing', ({ name, isTyping: typing }: { name: string; isTyping: boolean }) => {
        setIsTyping(typing);
        setTypingUser(name);
      });

      socket.on('error', (err: any) => {
        console.warn('[Socket error]', err);
      });

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

  useEffect(() => {
    loadHistory();
  }, []);

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

    // Para o indicador de digitação
    socketRef.current?.emit('typing', { conversationId, isTyping: false });

    // Mensagem otimista
    const optimistic: ChatMessage = {
      conversation_id: conversationId,
      timestamp: `${new Date().toISOString()}#temp-${Date.now()}`,
      sender_id: currentUserId || 'local',
      sender_name: userName || 'Você',
      message_content: textToSend,
    };
    setMessages(prev => [optimistic, ...prev]);

    if (socketRef.current?.connected) {
      // Envia via Socket — o gateway persiste e emite 'new_message'
      socketRef.current.emit('send_message', {
        conversationId,
        messageContent: textToSend,
      });
    } else {
      // Fallback REST se socket desconectado
      try {
        const { sendMessage } = await import('@/services/chatService');
        const real = await sendMessage(conversationId, textToSend);
        setMessages(prev => {
          const idx = prev.findIndex(m => m.timestamp === optimistic.timestamp);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = real;
            return updated;
          }
          return prev;
        });
      } catch {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
        setMessages(prev => prev.filter(m => m.timestamp !== optimistic.timestamp));
        setMessage(textToSend);
      }
    }
  }, [message, conversationId, currentUserId, userName]);

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble
      message={item.message_content}
      time={formatTime(item.timestamp)}
      isSent={item.sender_id === currentUserId}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
        <Text style={styles.loadingText}>Carregando conversa...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fundo colorido do header */}
      <View style={styles.headerBg}>
        <LoginSignupBackground />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <BackIconButton color={AppTheme.colors.cardBackground} onPress={() => router.back()} top={0} />
        <View style={styles.userInfo}>
          <Avatar name={userName || '?'} size={44} />
          <View style={styles.userMeta}>
            <Text style={styles.userName} numberOfLines={1}>{userName || 'Chat'}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: isConnected ? '#4ade80' : '#aaa' }]} />
              <Text style={styles.userStatus}>{isConnected ? 'online' : 'reconectando...'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mensagens */}
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
              <View style={styles.typingRow}>
                <Text style={styles.typingText}>{typingUser} está digitando...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>Inicie a conversa! 👋</Text>
            </View>
          }
        />
      </View>

      {/* Input */}
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
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
  },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 130, zIndex: 0 },
  header: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
    gap: 12,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 8 },
  userMeta: { marginLeft: 12, flex: 1 },
  userName: {
    fontSize: 18, fontWeight: '700',
    color: AppTheme.colors.cardBackground,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  userStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  messageList: { flex: 1, paddingHorizontal: 12 },
  flatListContent: { paddingVertical: 10 },
  typingRow: { paddingHorizontal: 8, paddingBottom: 6 },
  typingText: {
    fontSize: 12,
    color: AppTheme.colors.placeholderText,
    fontStyle: 'italic',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyChatText: {
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
  },
  footer: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.dotsColor,
  },
});

export default ChatCommunity;
