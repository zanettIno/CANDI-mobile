import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index'; 

interface groupCardProps {
  groupName: string;
  groupDescription: string;
}

const HeaderContainer = styled(View)`
  padding: 16px;
  background-color: ${AppTheme.colors.cardBackground};
  border-bottom-width: 1px;
  border-bottom-color: ${AppTheme.colors.dotsColor};
`;

const GroupNameText = styled(Text)`
  font-size: ${AppTheme.fonts.titleMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.titleMedium.fontWeight};
  font-family: ${AppTheme.fonts.titleMedium.fontFamily};
  color: ${AppTheme.colors.nameText};
  margin-bottom: 4px;
`;

const GroupDescriptionText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  color: ${AppTheme.colors.roleText};
  line-height: 20px;
`;

export const groupCard: React.FC<groupCardProps> = ({
  groupName,
  groupDescription,
}) => {
  return (
    <HeaderContainer>
      <GroupNameText>{groupName}</GroupNameText>
      <GroupDescriptionText>{groupDescription}</GroupDescriptionText>
    </HeaderContainer>
  );
};

export default groupCard;
