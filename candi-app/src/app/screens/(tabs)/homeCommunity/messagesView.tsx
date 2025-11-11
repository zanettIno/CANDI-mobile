import React, { useState } from 'react';
import { View, Text, FlatList, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import HomeBackground from '@/components/HomeBackground';
import MessageCard from '@/components/Card/messageCard';
import SearchInput from '@/components/Inputs/inputSearch';
import MessagesAdd from '@/components/Modals/MessagesAddModal';

const MOCK_MESSAGES = [
  { id: '1', userName: "Fernando D'Avila", lastMessage: 'Como vai o tratamento?', time: '22:48', unreadCount: 3, isRead: false },
  { id: '2', userName: 'Heloísa Souza', lastMessage: 'Estou feliz por essa notícia!', time: '16:27', unreadCount: 0, isRead: true },
  { id: '3', userName: 'Lucas Batista', lastMessage: 'Posso ajudar?', time: '16:27', unreadCount: 1, isRead: false },
  { id: '4', userName: 'Nuno Yokoji', lastMessage: 'Eu costumo consultar a doutor...', time: '16:27', unreadCount: 0, isRead: true },
];

const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;

const HeaderContainer = styled(View)`
  padding: 0 16px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const TitleText = styled(Text)`
  font-size: ${AppTheme.fonts.titleLarge.fontSize}px;
  font-family: ${AppTheme.fonts.titleLarge.fontFamily};
  font-weight: ${AppTheme.fonts.titleLarge.fontWeight};
  color: ${AppTheme.colors.textColor};
`;

const AddButton = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
`;

const MessagesCountText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.textColor};
  margin-top: 12px;  
  margin-left: 20px;
  margin-bottom: 16px;
`;

const ListContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.cardBackground};
`;

export default function MessagesScreen() {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const totalMessages = MOCK_MESSAGES.length;

  const filteredMessages = MOCK_MESSAGES.filter(
    (msg) =>
      msg.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const handleAddConversation = (search: string) => {
    console.log('Iniciar conversa com:', search);
    handleCloseModal();
  };

  const handleOpenChat = (userName: string) => {
    router.push({
      pathname: '/screens/community/chatCommunity',
      params: { userName },
    });
  };

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <HomeBackground />

      <View style={{ flex: 1, marginTop: -540, zIndex: 1 }}>
        <HeaderContainer>
          <TitleText>MENSAGENS</TitleText>

          <AddButton onPress={handleOpenModal}>
            <MaterialIcons name="add" size={26} color={AppTheme.colors.textColor} />
          </AddButton>
        </HeaderContainer>

        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Pesquisar"
          />
        </View>

        <MessagesCountText>Mensagens {totalMessages}</MessagesCountText>

        <ListContainer>
          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageCard
                userName={item.userName}
                lastMessage={item.lastMessage}
                time={item.time}
                unreadCount={item.unreadCount}
                isRead={item.isRead}
                onPress={() => handleOpenChat(item.userName)}
              />
            )}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 12,
            }}
          />
        </ListContainer>
      </View>

      <MessagesAdd
        visible={isModalVisible}
        onDismiss={handleCloseModal}
        onAddConversation={handleAddConversation}
      />
    </ScreenContainer>
  );
}
