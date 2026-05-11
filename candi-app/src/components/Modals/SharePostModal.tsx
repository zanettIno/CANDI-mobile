import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { AppTheme } from '@/theme';
import Avatar from '@/components/Avatar';
import { getInbox } from '@/services/chatService';
import { sharePostToChat } from '@/services/communityService';
import { MaterialIcons } from '@expo/vector-icons';

interface SharePostModalProps {
  visible: boolean;
  postId: string;
  postContent: string;
  onDismiss: () => void;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  visible,
  postId,
  postContent,
  onDismiss,
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharing, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    getInbox()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setIsLoading(false));
  }, [visible]);

  const handleShare = async (conversationId: string, userName: string) => {
    setSharingId(conversationId);
    try {
      await sharePostToChat(postId, conversationId);
      Alert.alert('Compartilhado!', `Post enviado para ${userName}.`);
      onDismiss();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível compartilhar.');
    } finally {
      setSharingId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Compartilhar com...</Text>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </View>

        {/* Preview do conteúdo */}
        <View style={styles.postPreview}>
          <Text style={styles.postPreviewText} numberOfLines={2}>{postContent}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={AppTheme.colors.tertiary}
            style={{ marginVertical: 32 }}
          />
        ) : conversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item: any) => item.conversation_id}
            renderItem={({ item }: { item: any }) => {
              const isSending = sharing === item.conversation_id;
              return (
                <TouchableOpacity
                  style={styles.conversationItem}
                  onPress={() => handleShare(item.conversation_id, item.other_user_name)}
                  disabled={!!sharing}
                  activeOpacity={0.7}
                >
                  <Avatar name={item.other_user_name} size={44} />
                  <Text style={styles.conversationName} numberOfLines={1}>
                    {item.other_user_name}
                  </Text>
                  {isSending ? (
                    <ActivityIndicator size="small" color={AppTheme.colors.tertiary} />
                  ) : (
                    <MaterialIcons name="send" size={20} color={AppTheme.colors.tertiary} />
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: AppTheme.colors.dotsColor,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: AppTheme.fonts.titleSmall.fontFamily,
    fontSize: AppTheme.fonts.titleSmall.fontSize,
    color: AppTheme.colors.textColor,
  },
  postPreview: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.colors.tertiary,
  },
  postPreviewText: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    fontStyle: 'italic',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
    gap: 12,
  },
  conversationName: {
    flex: 1,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.nameText,
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
});

export default SharePostModal;
