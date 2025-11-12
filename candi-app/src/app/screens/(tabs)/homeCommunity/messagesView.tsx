import React, { useState, useCallback } from 'react'; // 🔹 Importa 'useCallback'
import { View, Text, FlatList, StatusBar, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'; // 🔹 Importa 'ActivityIndicator' e 'Alert'
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; // 🔹 Importa 'useFocusEffect'
import { AppTheme } from '@/theme';
import HomeBackground from '@/components/HomeBackground';
import MessageCard from '@/components/Card/messageCard';
import SearchInput from '@/components/Inputs/inputSearch';
import MessagesAdd from '@/components/Modals/MessagesAddModal';
import { getInbox, startConversationByEmail } from '@/services/chatService'; // 🔹 IMPORTA O SERVIÇO

// 🔹 MOCK_MESSAGES removido

const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;
// ... (Componentes Styled continuam iguais) ...
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
const CenteredView = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${AppTheme.colors.cardBackground};
`;

export default function MessagesScreen() {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  // 🔹 NOVOS ESTADOS
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 FUNÇÃO PARA CARREGAR O INBOX
  const loadInbox = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const inboxData = await getInbox();
      setConversations(inboxData);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as mensagens.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 CHAMA O 'loadInbox' TODA VEZ QUE A TELA GANHA FOCO
  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [loadInbox])
  );

  const filteredMessages = conversations.filter(
    (msg: any) =>
      msg.other_user_name.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.last_message.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  // 🔹 FUNÇÃO DE ADICIONAR CONVERSA ATUALIZADA
  const handleAddConversation = async (email: string) => {
    try {
      if (!email || !email.includes('@')) {
        Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
        return;
      }
      handleCloseModal();
      // Chama o serviço para criar/encontrar a conversa
      const newConversation = await startConversationByEmail(email);
      
      // Navega para a tela de chat com os dados da nova conversa
      handleOpenChat(
        newConversation.conversation_id,
        newConversation.other_user_name
      );

    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível iniciar a conversa.');
    }
  };

  // 🔹 FUNÇÃO DE ABRIR CHAT ATUALIZADA
  const handleOpenChat = (conversationId: string, userName: string) => {
    router.push({
      pathname: '/screens/community/chatCommunity',
      // Passa os parâmetros necessários para a próxima tela
      params: { conversationId, userName }, 
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

        <MessagesCountText>Mensagens {conversations.length}</MessagesCountText>

        <ListContainer>
          {/* 🔹 LÓGICA DE RENDERIZAÇÃO ATUALIZADA */}
          {isLoading ? (
            <CenteredView>
              <ActivityIndicator size="large" color={AppTheme.colors.primary} />
            </CenteredView>
          ) : error ? (
            <CenteredView>
              <Text style={{color: 'red'}}>{error}</Text>
            </CenteredView>
          ) : (
            <FlatList
              data={filteredMessages}
              keyExtractor={(item: any) => item.conversation_id}
              renderItem={({ item }: { item: any }) => (
                <MessageCard
                  // Mapeia os dados do backend para os props do seu componente
                  userName={item.other_user_name}
                  lastMessage={item.last_message || '...'}
                  time={new Date(item.last_message_timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  unreadCount={item.unread_count}
                  isRead={item.unread_count === 0}
                  onPress={() => handleOpenChat(item.conversation_id, item.other_user_name)}
                />
              )}
              contentContainerStyle={{
                paddingTop: 8,
                paddingBottom: 12,
              }}
              ListEmptyComponent={
                <CenteredView style={{padding: 20}}>
                  <Text style={{color: AppTheme.colors.placeholderText, textAlign: 'center'}}>
                    Nenhuma conversa encontrada. Clique no '+' para iniciar uma.
                  </Text>
                </CenteredView>
              }
            />
          )}
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