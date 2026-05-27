import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { AppTheme } from '@/theme';
import Avatar from '@/components/Avatar';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';
const profilePicUri = (id?: string | null) => id ? `${S3_BASE}/${id}.jpg` : undefined;
import { getInbox } from '@/services/chatService';
import { sharePostToChat, getMyGroups } from '@/services/communityService';
import { MaterialIcons } from '@expo/vector-icons';

interface SharePostModalProps {
  visible: boolean;
  postId: string;
  postContent: string;
  onDismiss: () => void;
}

type ListItem =
  | { kind: 'header'; label: string }
  | { kind: 'target'; id: string; name: string; isGroup: boolean; userId?: string };

export const SharePostModal: React.FC<SharePostModalProps> = ({
  visible, postId, postContent, onDismiss,
}) => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    Promise.all([getInbox().catch(() => []), getMyGroups().catch(() => [])])
      .then(([inbox, myGroups]) => {
        const list: ListItem[] = [];

        const dms = (inbox as any[]);
        const activeGroups = (myGroups as any[]).filter(g =>
          ['admin', 'co-leader', 'member'].includes(g.role)
        );

        if (dms.length > 0) {
          list.push({ kind: 'header', label: 'Conversas' });
          dms.forEach(c => list.push({ kind: 'target', id: c.conversation_id, name: c.other_user_name || 'Conversa', isGroup: false, userId: c.other_user_id }));
        }
        if (activeGroups.length > 0) {
          list.push({ kind: 'header', label: 'Grupos' });
          activeGroups.forEach(g => list.push({ kind: 'target', id: `GROUP#${g.group_id}`, name: g.group_name || g.name || 'Grupo', isGroup: true }));
        }

        setItems(list);
      })
      .finally(() => setIsLoading(false));
  }, [visible]);

  const handleShare = async (id: string, name: string) => {
    setSharingId(id);
    try {
      await sharePostToChat(postId, id);
      Alert.alert('Compartilhado!', `Post enviado para ${name}.`);
      onDismiss();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível compartilhar.');
    } finally {
      setSharingId(null);
    }
  };

  const hasTargets = items.some(i => i.kind === 'target');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Compartilhar com...</Text>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </View>

        <View style={styles.postPreview}>
          <Text style={styles.postPreviewText} numberOfLines={2}>{postContent}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} style={{ marginVertical: 32 }} />
        ) : !hasTargets ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma conversa ou grupo encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, i) => item.kind === 'header' ? `h-${item.label}` : item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              if (item.kind === 'header') {
                return <Text style={styles.sectionLabel}>{item.label}</Text>;
              }
              const isSending = sharingId === item.id;
              return (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleShare(item.id, item.name)}
                  disabled={!!sharingId}
                  activeOpacity={0.7}
                >
                  {item.isGroup
                    ? <View style={styles.groupIcon}><MaterialIcons name="group" size={20} color={AppTheme.colors.tertiary} /></View>
                    : <Avatar uri={profilePicUri(item.userId)} name={item.name} size={44} />
                  }
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  {isSending
                    ? <ActivityIndicator size="small" color={AppTheme.colors.tertiary} />
                    : <MaterialIcons name="send" size={20} color={AppTheme.colors.tertiary} />
                  }
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 12, maxHeight: '75%',
  },
  handle: { width: 40, height: 4, backgroundColor: AppTheme.colors.dotsColor, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: AppTheme.fonts.titleSmall.fontFamily, fontSize: AppTheme.fonts.titleSmall.fontSize, color: AppTheme.colors.textColor },
  postPreview: {
    backgroundColor: AppTheme.colors.background, borderRadius: 10, padding: 12,
    marginBottom: 12, borderLeftWidth: 3, borderLeftColor: AppTheme.colors.tertiary,
  },
  postPreviewText: { fontFamily: AppTheme.fonts.bodyMedium.fontFamily, fontSize: AppTheme.fonts.bodyMedium.fontSize, color: AppTheme.colors.placeholderText, fontStyle: 'italic' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, textTransform: 'uppercase',
    letterSpacing: 0.5, marginTop: 12, marginBottom: 4, paddingHorizontal: 2,
  },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor, gap: 12 },
  groupIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppTheme.colors.secondary, alignItems: 'center', justifyContent: 'center' },
  itemName: { flex: 1, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, fontSize: AppTheme.fonts.bodyMedium.fontSize, color: AppTheme.colors.nameText },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
});

export default SharePostModal;
