import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StatusBar, ActivityIndicator,
  Alert, Platform, StyleSheet, KeyboardAvoidingView, TouchableOpacity,
} from 'react-native';
import { Socket } from 'socket.io-client';
import { AppTheme } from '../../../theme/index';
import { MessageBubble } from '@/components/Bubble/messageBubble';
import { MessageInput } from '@/components/Inputs/inputMessage';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '@/components/Avatar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMessages, getReadStatus } from '@/services/chatService';
import { initializeSocket } from '@/services/socketService';
import { useChat } from '@/context/ChatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { formatTime } from '@/utils/dateFormat';

interface ChatMessage {
  conversation_id: string;
  timestamp: string;
  sender_id: string;
  sender_name: string;
  message_content: string;
}

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';
const profilePicUri = (id?: string | null) => id ? `${S3_BASE}/${id}.jpg` : undefined;

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
  const insets = useSafeAreaInsets();
  const { conversationId, userName, quickReply } = useLocalSearchParams<{
    conversationId: string;
    userName: string;
    quickReply?: string;
  }>();
  const { setActiveConversationId, triggerInboxRefresh } = useChat();

  const [message, setMessage] = useState(quickReply || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // readUpTo: timestamp até onde o receptor leu as mensagens do remetente
  // Mensagens com timestamp <= readUpTo → 'read'; mais novas → depende de delivery
  const [readUpTo, setReadUpTo] = useState<string | null>(null);
  const [newMsgDelivered, setNewMsgDelivered] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    let mounted = true;

    const init = async () => {
      // 1. Resolve myId
      const myId = await decodeJwtId();
      if (!mounted) return;

      if (myId) {
        setCurrentUserId(myId);
        const parts = conversationId.split('#');
        if (parts.length === 2) {
          otherUserIdRef.current = parts[0] === myId ? parts[1] : parts[0];
        }
      }

      // 2. Carrega histórico + estado de leitura
      try {
        const isGroup = conversationId.startsWith('GROUP#');
        const [history, readStatus] = await Promise.all([
          getMessages(conversationId),
          isGroup
            ? Promise.resolve({ isRead: false, isDelivered: false })
            : getReadStatus(conversationId),
        ]);
        if (mounted) {
          const sorted = [...history].reverse();
          setMessages(sorted);
          // readUpTo vem do servidor — timestamp de quando o receptor leu pela última vez
          setReadUpTo(readStatus.readUpTo);
          setNewMsgDelivered(readStatus.isDelivered);
          triggerInboxRefresh();
        }
      } catch {
        if (mounted) Alert.alert('Erro', 'Não foi possível carregar o histórico.');
      } finally {
        if (mounted) setIsLoading(false);
      }

      // 3. Inicializa socket global (reutiliza se já conectado)
      try {
        const socket = await initializeSocket();
        socketRef.current = socket;

        // Setup listeners
        const handleNewMessage = (msg: ChatMessage) => {
          if (!mounted) return;
          // FILTRO CRÍTICO: só processa mensagens desta conversa
          // Evita que mensagens de grupos ou outros chats apareçam aqui
          if (msg.conversation_id !== conversationId) return;
          setMessages(prev => {
            if (prev.some(m => m.timestamp === msg.timestamp)) return prev;
            return [msg, ...prev];
          });
          if (msg.sender_id !== myId && !conversationId.startsWith('GROUP#')) {
            socket.emit('ack_read', { conversationId });
          }
        };

        const handleTyping = ({ isTyping: typing }: { name: string; isTyping: boolean }) => {
          if (!mounted) return;
          setIsTyping(typing);
        };

        const handleMessagesRead = (data: { conversation_id: string; read_up_to?: string }) => {
          if (!mounted || data.conversation_id !== conversationId) return;
          // Atualiza readUpTo para o timestamp mais recente possível
          const newReadUpTo = data.read_up_to ?? new Date().toISOString();
          setReadUpTo(prev => {
            // Mantém o mais recente dos dois
            if (!prev) return newReadUpTo;
            return newReadUpTo > prev ? newReadUpTo : prev;
          });
        };

        const handleMessageDelivered = ({ conversation_id }: { conversation_id: string }) => {
          if (!mounted || conversation_id !== conversationId) return;
          setNewMsgDelivered(true);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('messages_read', handleMessagesRead);
        socket.on('message_delivered', handleMessageDelivered);

        // mark_read é tratado pelo backend via HTTP (getMessages já notifica o remetente)
        const joinRoom = () => socket.emit('join_conversation', { conversationId });

        if (socket.connected) {
          joinRoom();
        } else {
          socket.once('connect', joinRoom);
        }

        return () => {
          socket.off('new_message', handleNewMessage);
          socket.off('user_typing', handleTyping);
          socket.off('messages_read', handleMessagesRead);
          socket.off('message_delivered', handleMessageDelivered);
          socket.emit('leave_conversation', { conversationId });
        };
      } catch (error) {
        console.error('[Socket] Erro ao inicializar:', error);
        if (mounted) Alert.alert('Erro', 'Falha ao conectar ao chat.');
      }
    };

    let socketCleanup: (() => void) | undefined;
    init().then(fn => { socketCleanup = fn; });

    return () => {
      mounted = false;
      socketCleanup?.(); // remove os listeners do socket corretamente
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
    setNewMsgDelivered(false); // nova mensagem enviada — aguarda entrega
    // readUpTo NÃO muda — mensagens antigas que foram lidas continuam como 'read'
    socketRef.current?.emit('typing', { conversationId, isTyping: false });

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { conversationId, messageContent: textToSend });
    } else {
      // Fallback HTTP quando WS não conectado
      try {
        const { sendMessage } = await import('@/services/chatService');
        const real = await sendMessage(conversationId, textToSend);
        setMessages(prev => [real, ...prev]);
      } catch {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
        setMessage(textToSend);
      }
    }
  }, [message, conversationId]);

  const getDateLabel = (ts: string) => {
    try {
      const d = new Date(ts.split('#')[0]);
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Hoje';
      if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    } catch { return ''; }
  };

  const isSameDay = (ts1: string, ts2: string) => {
    try {
      return new Date(ts1.split('#')[0]).toDateString() === new Date(ts2.split('#')[0]).toDateString();
    } catch { return true; }
  };

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isSent = item.sender_id === currentUserId;
    const prevMsg = messages[index + 1]; // FlatList inverted: index+1 é mensagem mais antiga
    const nextMsg = messages[index - 1]; // index-1 é mensagem mais recente
    const isLastFromSender = !nextMsg || nextMsg.sender_id !== item.sender_id;
    const isFirstFromSender = !prevMsg || prevMsg.sender_id !== item.sender_id;
    const showDateSep = !prevMsg || !isSameDay(item.timestamp, prevMsg.timestamp);
    const tightGroup = prevMsg && prevMsg.sender_id === item.sender_id;

    // Status por mensagem:
    // - Se o receptor leu até readUpTo, qualquer msg com timestamp <= readUpTo → 'read'
    // - Msgs após readUpTo → 'delivered' ou 'sent'
    let itemStatus: 'sent' | 'delivered' | 'read' | undefined;
    if (isSent) {
      if (readUpTo && item.timestamp <= readUpTo) {
        itemStatus = 'read';
      } else if (newMsgDelivered) {
        itemStatus = 'delivered';
      } else {
        itemStatus = 'sent';
      }
    }

    return (
      <>
        {showDateSep && (
          <View style={styles.dateSep}>
            <View style={styles.dateLine} />
            <Text style={styles.dateLabel}>{getDateLabel(item.timestamp)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}
        <View style={[
          styles.messageRow,
          isSent ? styles.rowSent : styles.rowReceived,
          tightGroup ? styles.tight : styles.normal,
        ]}>
          {!isSent && (
            <View style={styles.avatarSlot}>
              {isLastFromSender && (
                // Fallback para o nome do parceiro quando sender_name não está no banco
                <Avatar
                  uri={profilePicUri(item.sender_id)}
                  name={item.sender_name || (isSent ? '' : userName || '')}
                  size={30}
                />
              )}
            </View>
          )}
          <View style={[styles.bubbleWrap, isSent ? styles.bubbleWrapSent : styles.bubbleWrapReceived]}>
            {!isSent && isFirstFromSender && (
              <Text style={styles.senderName}>{item.sender_name}</Text>
            )}
            <MessageBubble
              message={item.message_content}
              time={formatTime(item.timestamp)}
              isSent={isSent}
              msgStatus={itemStatus}
              onPressSharedPost={(p) => router.push({ pathname: '/screens/community/postDetail', params: p })}
            />
          </View>
        </View>
      </>
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={22} color={AppTheme.colors.nameText} />
        </TouchableOpacity>
        <Avatar uri={profilePicUri(otherUserIdRef.current)} name={userName || ''} size={40} />
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
              <View style={styles.typingWrap}>
                <Avatar uri={profilePicUri(otherUserIdRef.current)} name={userName || ''} size={28} />
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
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
  screen: { flex: 1, backgroundColor: '#efeae2' }, // fundo estilo WhatsApp (bege claro)
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#efeae2' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingBottom: 8, gap: 8,
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  userMeta: { flex: 1 },
  userName: {
    fontSize: 15, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: {
    fontSize: 11.5, color: 'rgba(255,255,255,0.85)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  messageList: { flex: 1 },
  flatListContent: { paddingHorizontal: 8, paddingVertical: 10 },

  // Separador de data
  dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, paddingHorizontal: 4 },
  dateLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  dateLabel: {
    fontSize: 11.5, color: '#666', fontWeight: '600',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    paddingHorizontal: 10,
    backgroundColor: '#ddd8d0',
    borderRadius: 10,
    paddingVertical: 3,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  rowSent: { justifyContent: 'flex-end' },
  rowReceived: { justifyContent: 'flex-start' },
  tight: { marginVertical: 1 },
  normal: { marginVertical: 3 },

  avatarSlot: { width: 30, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 2 },
  bubbleWrap: { maxWidth: '80%' },
  bubbleWrapSent: { alignItems: 'flex-end' },
  bubbleWrapReceived: { alignItems: 'flex-start' },
  senderName: {
    fontSize: 11, fontWeight: '600',
    color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    marginBottom: 2, marginLeft: 3,
  },

  // Indicador de digitação
  typingWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    marginBottom: 4, marginLeft: 4,
  },
  typingBubble: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  typingDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AppTheme.colors.placeholderText },

  // Empty
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyChatEmoji: { fontSize: 44 },
  emptyChatText: {
    fontSize: 17, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  emptyChatSub: {
    fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily, textAlign: 'center',
  },

  footer: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
});

export default ChatCommunity;
