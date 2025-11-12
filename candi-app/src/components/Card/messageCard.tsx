import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme'; 


const CardContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${AppTheme.colors.dotsColor}; /* Linha separadora sutil */
  background-color: ${AppTheme.colors.cardBackground};
`;

const AvatarPlaceholder = styled(View)`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${AppTheme.colors.placeholderBackground};
  margin-right: 12px;
`;

const ContentContainer = styled(View)`
  flex: 1;
  justify-content: center;
`;

const NameText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.nameText};
`;

const LastMessageText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  color: ${AppTheme.colors.roleText};
  margin-top: 2px;
`;

const InfoContainer = styled(View)`
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  margin-left: 8px;
`;

const TimeText = styled(Text)`
  font-size: ${AppTheme.fonts.bodySmall.fontSize}px;
  color: ${AppTheme.colors.roleText};
`;

const UnreadBadge = styled(View)<{ isUnread: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${props => props.isUnread ? AppTheme.colors.secondary : 'transparent'}; 
  align-items: center;
  justify-content: center;
  margin-top: 4px;
`;

const UnreadCountText = styled(Text)`
  font-size: ${AppTheme.fonts.bodySmall.fontSize}px;
  font-weight: bold;
  color: ${AppTheme.colors.cardBackground}; 
`;


interface MessageCardProps {
  userName: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isRead?: boolean;
  onPress: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  userName,
  lastMessage,
  time,
  unreadCount,
  isRead = false,
  onPress,
}) => {
  const isUnread = (unreadCount && unreadCount > 0) || !isRead;

  return (
    <CardContainer onPress={onPress}>
      <AvatarPlaceholder />
      
      <ContentContainer>
        <NameText>{userName}</NameText>
        <LastMessageText numberOfLines={1}>{lastMessage}</LastMessageText>
      </ContentContainer>

      <InfoContainer>
        <TimeText>{time}</TimeText>
        
        <UnreadBadge isUnread={isUnread}>
          {unreadCount ? (
            <UnreadCountText>{unreadCount}</UnreadCountText>
          ) : isRead ? (
            <MaterialIcons name="done" size={16} color={AppTheme.colors.secondary} />
          ) : (
            <MaterialIcons name="done" size={16} color={AppTheme.colors.roleText} />
          )}
        </UnreadBadge>
      </InfoContainer>
    </CardContainer>
  );
};

export default MessageCard;
