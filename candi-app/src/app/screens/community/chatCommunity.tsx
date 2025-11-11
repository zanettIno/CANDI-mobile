import React, { useState, useCallback } from 'react';

import { View, Text, FlatList, StatusBar } from 'react-native';

import styled from 'styled-components/native';

import { AppTheme } from '../../../theme/index';

import { MessageBubble } from '@/components/Bubble/messageBubble';

import { MessageInput } from '@/components/Inputs/inputMessage';

import LoginSignupBackground from '@/components/LoginSignupBackground';

import BackIconButton from '@/components/BackIconButton';

import { useRouter } from 'expo-router';



const MOCK_MESSAGES = [

  { id: '1', text: 'Posso ajudar?', time: '22:48', isSent: false },

  { id: '2', text: 'O que você faz para se sentir melhor?', time: '22:48', isSent: true },

  { id: '3', text: 'Preciso de sua opinião.', time: '22:49', isSent: true },

  { id: '4', text: 'Eu uso o diário do Candi!', time: '22:48', isSent: false },

  { id: '5', text: 'Testa também, acho que você pode gostar.', time: '22:48', isSent: false },

];



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

  margin-left: 14px;

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



export const ChatCommunity: React.FC = () => {

  const router = useRouter();

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState(MOCK_MESSAGES);



  const handleSend = useCallback(() => {

    if (message.trim()) {

      const newMessage = {

        id: Date.now().toString(),

        text: message.trim(),

        time: new Date().toLocaleTimeString('pt-BR', {

          hour: '2-digit',

          minute: '2-digit',

        }),

        isSent: true,

      };

      setMessages(prev => [newMessage, ...prev]);

      setMessage('');

    }

  }, [message]);



  const renderItem = ({ item }) => (

    <MessageBubble message={item.text} time={item.time} isSent={item.isSent} />

  );



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

          />

          <UserInfoContainer>

            <AvatarPlaceholder />

            <UserName>Lucas Batista</UserName>

          </UserInfoContainer>

        </HeaderContainer>



        <MessageListContainer>

          <FlatList

            data={messages}

            renderItem={renderItem}

            keyExtractor={item => item.id}

            inverted

            contentContainerStyle={{ paddingVertical: 10 }}

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