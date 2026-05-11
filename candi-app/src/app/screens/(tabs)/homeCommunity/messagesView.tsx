import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { AppTheme } from '@/theme';
import MessageCard from '@/components/Card/messageCard';
import SearchInput from '@/components/Inputs/inputSearch';
import EmptyState from '@/components/EmptyState';
import MessagesAdd from '@/components/Modals/MessagesAddModal';
import { getInbox, startConversationByEmail } from '@/services/chatService';
import { formatTime } from '@/utils/dateFormat';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

export default function MessagesScreen() {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [loadInbox])
  );

  const filteredMessages = conversations.filter(
    (msg: any) =>
      msg.other_user_name.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.last_message?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const handleAddConversation = async (email: string) => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }
    handleCloseModal();
    try {
      const newConversation = await startConversationByEmail(email);
      handleOpenChat(newConversation.conversation_id, newConversation.other_user_name);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível iniciar a conversa.');
    }
  };

  const handleOpenChat = (conversationId: string, userName: string) => {
    router.push({
      pathname: '/screens/community/chatCommunity',
      params: { conversationId, userName },
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon="wifi-off"
          title="Sem conexão"
          subtitle={error}
          actionLabel="Tentar novamente"
          onAction={loadInbox}
        />
      );
    }

    return (
      <FlatList
        data={filteredMessages}
        keyExtractor={(item: any) => item.conversation_id}
        renderItem={({ item }: { item: any }) => (
          <MessageCard
            userName={item.other_user_name}
            lastMessage={item.last_message || '...'}
            time={item.last_message_timestamp ? formatTime(item.last_message_timestamp) : ''}
            unreadCount={item.unread_count}
            isRead={item.unread_count === 0}
            onPress={() => handleOpenChat(item.conversation_id, item.other_user_name)}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="chat-bubble-outline"
            title="Nenhuma conversa"
            subtitle="Toque em + para iniciar uma conversa com outro paciente."
            actionLabel="Nova conversa"
            onAction={handleOpenModal}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header fixo com safe area manual */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + 12 }]}>
        <Text style={styles.title}>MENSAGENS</Text>
        <TouchableOpacity
          onPress={handleOpenModal}
          style={styles.addButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={26} color={AppTheme.colors.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Pesquisar conversas..."
        />
      </View>

      {/* Count */}
      {!isLoading && conversations.length > 0 && (
        <Text style={styles.countText}>
          {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
        </Text>
      )}

      {/* List */}
      <View style={styles.listContainer}>
        {renderContent()}
      </View>

      <MessagesAdd
        visible={isModalVisible}
        onDismiss={handleCloseModal}
        onAddConversation={handleAddConversation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardBackground,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
  },
  title: {
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontWeight: '700',
    color: AppTheme.colors.textColor,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 12,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: AppTheme.colors.cardBackground,
  },
  countText: {
    fontSize: AppTheme.fonts.bodySmall.fontSize,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    color: AppTheme.colors.placeholderText,
    marginTop: 12,
    marginLeft: 20,
    marginBottom: 8,
  },
  listContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.cardBackground,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});
