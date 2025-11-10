import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme/index'; 

const PostCreationCardContainer = styled(View)`
  /* Cor rosa claro para o fundo do card, usando a cor primary do tema */
  background-color: ${AppTheme.colors.primary}; 
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  shadow-color: ${AppTheme.colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const PostCreationHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const PostCreationTitleGroup = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const PostCreationTitle = styled(Text)`
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  color: ${AppTheme.colors.textColor};
  margin-left: 8px;
`;

const PostCreationSubtitle = styled(Text)`
  font-size: ${AppTheme.fonts.bodySmall.fontSize}px;
  color: ${AppTheme.colors.placeholderText};
  margin-left: 8px;
`;

const PostCreationInput = styled(TextInput)`
  background-color: ${AppTheme.colors.cardBackground}; /* Fundo branco para o input */
  border-radius: 8px;
  padding: 12px;
  min-height: 80px;
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  color: ${AppTheme.colors.textColor};
  text-align-vertical: top; /* Para Android */
`;

const PostCreationFooter = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const PostCreationIcons = styled(View)`
  flex-direction: row;
  gap: 16px;
`;

const PublishButton = styled(TouchableOpacity)`
  padding: 8px 16px;
  border-left-width: 1px;
  border-left-color: ${AppTheme.colors.dotsColor};
  margin-left: 16px;
`;

const PublishButtonText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.textColor};
`;

const PlaceholderIcon = styled(View)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  /* Usando uma cor mais escura para o ícone de placeholder, como o secondary */
  background-color: ${AppTheme.colors.secondary}; 
  align-items: center;
  justify-content: center;
`;


export const PostCard = () => {
  return (
    <PostCreationCardContainer>
      <PostCreationHeader>
        <PostCreationTitleGroup>
          <PlaceholderIcon>
            <MaterialIcons name="image" size={20} color={AppTheme.colors.cardBackground} />
          </PlaceholderIcon>
          <View>
            <PostCreationTitle>O que deseja escrever hoje?</PostCreationTitle>
            <PostCreationSubtitle>@seu_usuario</PostCreationSubtitle>
          </View>
        </PostCreationTitleGroup>
        <MaterialIcons name="more-vert" size={24} color={AppTheme.colors.placeholderText} />
      </PostCreationHeader>

      <PostCreationInput
        placeholder="Escreva sua mensagem"
        placeholderTextColor={AppTheme.colors.placeholderText}
        multiline
      />

      <PostCreationFooter>
        <PostCreationIcons>
          <TouchableOpacity>
            <MaterialIcons name="photo-camera" size={24} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="attach-file" size={24} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="bookmark-border" size={24} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </PostCreationIcons>

        <PublishButton>
          <PublishButtonText>Publicar</PublishButtonText>
        </PublishButton>
      </PostCreationFooter>
    </PostCreationCardContainer>
  );
};

export default PostCard;
