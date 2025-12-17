// src/app/screens/community/chatCommunity.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme/index';
import { MessageBubble } from '@/components/Bubble/messageBubble';
import { MessageInput } from '@/components/Inputs/inputMessage';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import BackIconButton from '@/components/BackIconButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMessages, sendMessage } from '@/services/chatService'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer'; // 🔹 Importado para decodificação

// Interface de Mensagem do Backend
interface ChatMessage {
  conversation_id: string;
  timestamp: string; // Ex: 2025-01-01T...Z#uuid
  sender_id: string;
  sender_name: string;
  message_content: string;
}

// ... (Estilos Styled-Components aqui) ...
const ScreenContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;
const BackgroundWrapper = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  z-index: 0;
`;
const ContentWrapper = styled(View)`
  flex: 1;
  z-index: 1;
`;
const HeaderContainer = styled(View)`
  height: 120px;
  flex-direction: row;
  align-items: center;
  padding-horizontal: 20px;
  padding-top: ${StatusBar.currentHeight || 48}px;
`;
const UserInfoContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-left: 25px;
`;
const AvatarPlaceholder = styled(View)`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${AppTheme.colors.cardBackground};
  margin-right: 14px;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;
const UserName = styled(Text)`
  font-size: 22px;
  font-weight: 700;
  color: ${AppTheme.colors.textColor};
`;
const MessageListContainer = styled(View)`
  flex: 1;
  padding-horizontal: 16px;
`;
const FooterContainer = styled(View)`
  background-color: ${AppTheme.colors.cardBackground};
  border-top-width: 1px;
  border-top-color: #eee;
  padding-bottom: 10px;
`;
const CenteredView = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
// ... (Fim dos Estilos Styled-Components) ...


// 🔹 LÓGICA DO CHAT 🔹
export const ChatCommunity: React.FC = () => {
  const router = useRouter();
  const { conversationId, userName } = useLocalSearchParams<{ conversationId: string, userName: string }>();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 1. LÓGICA PARA OBTER O ID DO USUÁRIO LOGADO E CARREGAR MENSAGENS 🔹
  const loadChat = useCallback(async (showLoading: boolean = true) => {
    if (!conversationId) {
      Alert.alert('Erro', 'ID da conversa não encontrado.');
      router.back();
      return;
    }
    
    if(showLoading) setIsLoading(true);

    try {
      // 1. Pega o ID do usuário (usando a decodificação do JWT)
      if (!currentUserId) {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            // Decodifica o payload do JWT (parte do meio)
            // Necessita do polyfill de Buffer se estiver no ambiente web/RN
            const payloadBase64 = token.split('.')[1];
            if (Platform.OS === 'web') {
                const payload = JSON.parse(atob(payloadBase64)); // atob para web
                setCurrentUserId(payload.id);
            } else {
                const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString()); // Buffer para RN
                setCurrentUserId(payload.id);
            }
        }
      }
      
      // 2. Busca as mensagens
      const messagesData: ChatMessage[] = await getMessages(conversationId);
      
      // 3. Define as mensagens. O FlatList está "inverted", então a ordem deve ser invertida no estado.
      setMessages(messagesData.reverse()); 

    } catch (err: any) {
      console.error('Erro ao carregar chat:', err);
      if (showLoading) Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      if(showLoading) setIsLoading(false);
    }
  }, [conversationId, currentUserId]);


  // 🔹 SEGUNDO USE EFFECT: POLLING (ATUALIZAÇÃO CONSTANTE) 🔹
  const reloadMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const messagesData: ChatMessage[] = await getMessages(conversationId);
      
      // Checa se o número de mensagens é diferente
      if (messagesData.length !== messages.length) {
          setMessages(messagesData.reverse());
      }
      // Se o tamanho for igual, mas a última mensagem (mais recente) for diferente
      else if (messagesData.length > 0 && messagesData[messagesData.length - 1].timestamp !== messages[0].timestamp) {
          setMessages(messagesData.reverse());
      }

    } catch (err) {
      console.warn("Erro no Polling de mensagens: ", err);
    }
  }, [conversationId, messages.length, messages[0]?.timestamp]);


  // Efeito principal: carrega o chat na abertura
  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // Efeito de Polling: roda a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      reloadMessages(); 
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [reloadMessages]);
  
  // 🔹 FUNÇÃO DE ENVIO DE MENSAGEM 🔹
  const handleSend = useCallback(async () => {
    if (message.trim() && conversationId) {
      const textToSend = message.trim();
      setMessage(''); 
      const senderName = messages[0]?.sender_name || userName || 'Você'; // Tenta pegar o nome
      
      // Adiciona a mensagem imediatamente (otimista)
      const optimisticMessage: ChatMessage = {
          conversation_id: conversationId,
          timestamp: new Date().toISOString() + '#temp', // Temporário
          sender_id: currentUserId || 'local', 
          sender_name: senderName,
          message_content: textToSend,
      };
      setMessages(prev => [optimisticMessage, ...prev]);

      try {
        const newMessage = await sendMessage(conversationId, textToSend);
        
        // Substitui a mensagem temporária pela real no estado
        setMessages(prev => {
            const index = prev.findIndex(m => m.timestamp === optimisticMessage.timestamp);
            if (index > -1) {
                prev[index] = newMessage;
            }
            return [...prev]; // Força a atualização do estado
        });

      } catch (err: any) {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
        setMessages(prev => prev.filter(m => m.timestamp !== optimisticMessage.timestamp)); // Remove a mensagem otimista
        setMessage(textToSend); // Devolve o texto
      }
    }
  }, [message, conversationId, currentUserId, messages]);


  // 🔹 RENDERIZAÇÃO 🔹
  const renderItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble
      message={item.message_content}
      time={new Date(item.timestamp.split('#')[0]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      // 🔹 Lógica: Se o ID do remetente for o seu, é uma bolha enviada.
      isSent={item.sender_id === currentUserId}
    />
  );

  if (isLoading) {
    return (
        <CenteredView>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        </CenteredView>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <BackgroundWrapper>
        <LoginSignupBackground />
      </BackgroundWrapper>
      <ContentWrapper>
        <HeaderContainer>
          
          <BackIconButton 
            color={AppTheme.colors.cardBackground}
            onPress={() => router.back()} 
            top={60}
          />
          
          <UserInfoContainer>
            <AvatarPlaceholder />
            <UserName>{userName || 'Chat'}</UserName>
          </UserInfoContainer>
        </HeaderContainer>

        <MessageListContainer>
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.timestamp} 
            inverted 
            contentContainerStyle={{ paddingVertical: 10 }}
            ListEmptyComponent={
                <CenteredView style={{paddingTop: 50}}>
                    <Text style={{color: AppTheme.colors.placeholderText}}>Inicie a conversa!</Text>
                </CenteredView>
            }
          />
        </MessageListContainer>

        <FooterContainer>
          <MessageInput
            value={message}
            onChangeText={setMessage}
            onSend={handleSend}
          />
        </FooterContainer>
      </ContentWrapper>
    </ScreenContainer>
  );
};

export default ChatCommunity;