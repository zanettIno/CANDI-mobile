import * as React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

const CardContainer = styled(View)`
  position: absolute;
  top: -40px; 
  left: 20px;
  right: 20px;
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;


const AvatarWrapper = styled(View)`
  margin-top: -70px; 
  z-index: 10;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled(Image)`
  width: 110px;
  height: 110px;
  border-radius: 15px;
  border-width: 4px;
  border-color: white;
  elevation: 6;
  z-index: 10;
`;

const SectionContainer = styled(View)`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
 margin-top: -35px;
 z-index: 20;
`;

const InfoContainer = styled(View)`
  margin-top: 15px;
  align-items: center;
`;

const Name = styled(Text)`
  font-weight: bold;
  font-size: 18px;
  color: ${AppTheme.colors.nameText};
`;

const Username = styled(Text)`
  color: ${AppTheme.colors.placeholderText};
  font-size: 14px;
  margin-top: 2px;
`;

const UserType = styled(Text)`
  color: ${AppTheme.colors.textColor};
  font-size: 14px;
  margin-top: 8px;
`;

export const ProfileCard = ({
  name,
  username,
  userType,
  avatarUri,
  onFirePress,
  onBrushPress,
}: {
  name: string;
  username: string;
  userType: string;
  avatarUri?: string;
  onFirePress: () => void;
  onBrushPress: () => void;
}) => {
  return (
    <CardContainer>
      <AvatarWrapper>
        {avatarUri ? (
          <AvatarImage source={{ uri: avatarUri }} resizeMode="cover" />
        ) : (
          <AvatarImage source={require('../../../assets/default-avatar.jpg')} />
        )}
      </AvatarWrapper>

      {/* Botões */}
      <SectionContainer>
        <TouchableOpacity onPress={onFirePress}>
          <Feather name="zap" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onBrushPress}>
          <Feather name="edit-2" size={24} color="black" />
        </TouchableOpacity>
      </SectionContainer>

      <InfoContainer>
        <Name>{name}</Name>
        <Username>{username}</Username>
        <UserType>{userType}</UserType>
      </InfoContainer>
    </CardContainer>
  );
};
