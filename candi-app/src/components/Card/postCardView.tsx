import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme'; 


const PostCardViewContainer = styled(View)`
  background-color: ${AppTheme.colors.cardBackground};
  border-radius: 16px;
  padding: 16px;
  margin: 8px 16px;
  border-width: 1px;
  border-color: ${AppTheme.colors.dotsColor};
  shadow-color: ${AppTheme.colors.shadow};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

const ReadPostHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const UserInfo = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const UserDetails = styled(View)`
  margin-left: 8px;
`;

const UserName = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.nameText};
`;

const UserHandleAndTime = styled(Text)`
  font-size: ${AppTheme.fonts.bodySmall.fontSize}px;
  color: ${AppTheme.colors.placeholderText};
`;

const PostContent = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  line-height: 20px;
  color: ${AppTheme.colors.textColor};
  margin-bottom: 16px;
`;

const PostActions = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ActionIcons = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 24px;
`;

const ProfilePlaceholderIcon = styled(View)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${AppTheme.colors.placeholderBackground};
  align-items: center;
  justify-content: center;
`;

interface PostCardViewProps {
  userName: string;
  userHandle: string;
  timeAgo: string;
  content: string;
}

export const PostCardView: React.FC<PostCardViewProps> = ({ userName, userHandle, timeAgo, content }) => {
  return (
    <PostCardViewContainer>
      <ReadPostHeader>
        <UserInfo>
          <ProfilePlaceholderIcon>
            <MaterialIcons name="person" size={24} color={AppTheme.colors.placeholderText} />
          </ProfilePlaceholderIcon>
          <UserDetails>
            <UserName>{userName}</UserName>
            <UserHandleAndTime>@{userHandle} • {timeAgo}</UserHandleAndTime>
          </UserDetails>
        </UserInfo>
        <MaterialIcons name="more-vert" size={24} color={AppTheme.colors.placeholderText} />
      </ReadPostHeader>

      <PostContent>{content}</PostContent>

      <PostActions>
        <ActionIcons>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={24} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="chat-bubble-outline" size={24} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="share" size={24} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </ActionIcons>
        <TouchableOpacity>
          <MaterialIcons name="bookmark" size={24} color={AppTheme.colors.placeholderText} />
        </TouchableOpacity>
      </PostActions>
    </PostCardViewContainer>
  );
};

export default PostCardView;
