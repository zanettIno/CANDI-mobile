import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import Avatar from '@/components/Avatar';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

interface MessageCardProps {
  userName: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isRead?: boolean;
  otherUserId?: string; // ID do outro participante para buscar foto de perfil
  onPress: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  userName,
  lastMessage,
  time,
  unreadCount,
  isRead = false,
  otherUserId,
  onPress,
}) => {
  const hasUnread = (unreadCount && unreadCount > 0) || !isRead;
  const avatarUri = otherUserId ? `${S3_BASE}/${otherUserId}.jpg` : undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar uri={avatarUri} name={userName} size={50} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, hasUnread && styles.nameBold]} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.lastMessageBold]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>

          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount && unreadCount > 0 ? Math.min(unreadCount, 99) : '●'}
              </Text>
            </View>
          ) : (
            <MaterialIcons name="done-all" size={16} color={AppTheme.colors.tertiary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
    backgroundColor: AppTheme.colors.cardBackground,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    flex: 1,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.nameText,
    marginRight: 8,
  },
  nameBold: { fontWeight: '700' },
  lastMessage: {
    flex: 1,
    fontSize: AppTheme.fonts.bodySmall.fontSize,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    color: AppTheme.colors.roleText,
    marginRight: 8,
  },
  lastMessageBold: {
    fontWeight: '600',
    color: AppTheme.colors.textColor,
  },
  time: {
    fontSize: AppTheme.fonts.labelSmall.fontSize,
    color: AppTheme.colors.roleText,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppTheme.colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.cardBackground,
  },
});

export default MessageCard;
