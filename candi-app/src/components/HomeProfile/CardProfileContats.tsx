import * as React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

const CardContainerContats = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: white;
  border-radius: 15px;
  padding: 16px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  margin-bottom: 12px;
`;

const AvatarImage = styled(Image)`
  width: 80px;
  height: 80px;
  border-radius: 15px;
  border-width: 2px;
  border-color: white;
  margin-right: 16px;
`;

const InfoWrapper = styled(View)`
  flex: 1;
`;

const Name = styled(Text)`
  font-weight: bold;
  font-size: 16px;
  color: ${AppTheme.colors.nameText};
`;

const Relation = styled(Text)`
  color: ${AppTheme.colors.textColor};
  font-size: 14px;
  margin-top: 4px;
`;

const Phone = styled(Text)`
  color: ${AppTheme.colors.placeholderText};
  font-size: 13px;
  margin-top: 2px;
`;

const ActionsRow = styled(View)`
  flex-direction: row;
  margin-top: 12px;
  margin-left:118px;
`;

const IconButton = styled(TouchableOpacity)`
  margin-right: 10px;
`;

export const ProfileCard = ({
  name,
  relation,
  phone,
  avatarUri,
  onEditPress,
  onDeletePress,
}: {
  name: string;
  relation: string;
  phone: string;
  avatarUri?: string;
  onEditPress: () => void;
  onDeletePress: () => void;
}) => {
  return (
    <CardContainerContats>
      {/* 📷 Avatar */}
      {avatarUri ? (
        <AvatarImage source={{ uri: avatarUri }} resizeMode="cover" />
      ) : (
        <AvatarImage source={require('../../../assets/images/icon.png')} />
      )}

      {/* Infos + ações */}
      <InfoWrapper>
        <Name>{name}</Name>
        <Relation>{relation}</Relation>
        <Phone>{phone}</Phone>

        <ActionsRow>
          <IconButton onPress={onEditPress}>
            <Feather name="edit-2" size={20} color="black" />
          </IconButton>
          <IconButton onPress={onDeletePress}>
            <Feather name="trash" size={20} color="black" />
          </IconButton>
        </ActionsRow>
      </InfoWrapper>
    </CardContainerContats>
  );
};
