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
  border-bottom-color: ${AppTheme.colors.dotsColor}; 
  background-color: ${AppTheme.colors.cardBackground};
`;

const AvatarPlaceholder = styled(View)`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${AppTheme.colors.placeholderBackground};
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled(View)`
  flex: 1;
  justify-content: center;
`;

const NameText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  color: ${AppTheme.colors.nameText};
`;

const SubtitleText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  color: ${AppTheme.colors.roleText};
  margin-top: 2px;
`;


interface ContactCardProps {
  userName: string;
  subtitle?: string;
  onPress: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  userName,
  subtitle,
  onPress,
}) => {
  return (
    <CardContainer onPress={onPress}>
      <AvatarPlaceholder>
        <MaterialIcons name="person" size={30} color={AppTheme.colors.placeholderText} />
      </AvatarPlaceholder>
      
      <ContentContainer>
        <NameText>{userName}</NameText>
        {subtitle && <SubtitleText numberOfLines={1}>{subtitle}</SubtitleText>}
      </ContentContainer>
    </CardContainer>
  );
};

export default ContactCard;
