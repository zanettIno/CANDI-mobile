/**
 * Post Creation Card Component
 *
 * Allows users to create new posts with:
 * - Text content
 * - Image upload from gallery
 * - Topic selection
 * - Loading state during submission
 *
 * Uses design tokens and ImagePicker for photo selection.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
import Button from '@/components/Buttons/Button';
import { createPost } from '@/services/feedService';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PostCreationCardContainer = styled(View)`
  background-color: ${colors.neutral.white};
  border-radius: ${borderRadius.large}px;
  padding: ${spacing.base}px;
  margin: ${spacing.base}px;
  shadow-color: ${colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const PostCreationHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.base}px;
  padding-bottom: ${spacing.base}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.light_gray};
`;

const PostCreationTitleGroup = styled(View)`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const PostCreationTitle = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  margin-left: ${spacing.sm}px;
`;

const PostCreationSubtitle = styled(Text)`
  font-size: ${typography.sizes.label_medium}px;
  color: ${colors.text.secondary};
  margin-left: ${spacing.sm}px;
  margin-top: ${spacing.xs}px;
`;

const PostCreationInput = styled(TextInput)`
  background-color: ${colors.neutral.form_field};
  border-radius: ${borderRadius.medium}px;
  padding: ${spacing.base}px;
  min-height: 100px;
  max-height: 200px;
  font-size: ${typography.sizes.body_large}px;
  font-family: ${typography.fonts.body};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.base}px;
`;

const ImagePreviewContainer = styled(View)`
  margin-bottom: ${spacing.base}px;
  background-color: ${colors.neutral.light_gray};
  border-radius: ${borderRadius.medium}px;
  padding: ${spacing.md}px;
  align-items: center;
`;

const PreviewImage = styled(Image)`
  width: 100%;
  height: 200px;
  border-radius: ${borderRadius.medium}px;
  margin-bottom: ${spacing.sm}px;
`;

const ImageSizeText = styled(Text)`
  font-size: ${typography.sizes.label_medium}px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const ClearImageButton = styled(TouchableOpacity)`
  margin-top: ${spacing.sm}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  background-color: ${colors.states.error};
  border-radius: ${borderRadius.medium}px;
`;

const ClearImageText = styled(Text)`
  font-size: ${typography.sizes.label_large}px;
  color: ${colors.neutral.white};
  font-weight: ${typography.weights.bold};
  text-align: center;
`;

const PostCreationFooter = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.base}px;
`;

const PostCreationIcons = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.base}px;
`;

const IconButton = styled(TouchableOpacity)`
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
  border-radius: ${borderRadius.medium}px;
`;

const PlaceholderIcon = styled(View)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.primary.rosa_full};
  align-items: center;
  justify-content: center;
`;

// ============================================================================
// INTERFACES
// ============================================================================

interface PostCardProps {
  activeTopic: string;
  onPostSuccess: (post: any) => void;
}

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PostCard: React.FC<PostCardProps> = ({ activeTopic, onPostSuccess }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleImagePick = async () => {
    try {
      // Request permission
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Por favor, permita acesso à galeria para anexar fotos'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          name: asset.fileName || 'photo.jpg',
          type: asset.type === 'image' ? 'image/jpeg' : 'image/png',
          size: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
  };

  const handlePublish = async () => {
    if (content.trim().length === 0) {
      Alert.alert('Atenção', 'A postagem não pode ser vazia');
      return;
    }

    setIsLoading(true);

    const topic = activeTopic === 'Feed' ? 'GERAL' : activeTopic;

    try {
      const { post } = await createPost(
        content.trim(),
        topic,
        selectedImage
          ? {
              uri: selectedImage.uri,
              name: selectedImage.name,
              type: selectedImage.type,
            }
          : undefined
      );

      // Clear form
      setContent('');
      setSelectedImage(null);
      onPostSuccess(post);

      Alert.alert('Sucesso', 'Postagem publicada com sucesso!');
    } catch (err: any) {
      console.error('Error publishing post:', err);
      Alert.alert('Erro', err.message || 'Não foi possível publicar a postagem');
    } finally {
      setIsLoading(false);
    }
  };

  const isPublishDisabled = isLoading || content.trim().length === 0;
  const imageSizeInMB = selectedImage?.size ? (selectedImage.size / (1024 * 1024)).toFixed(2) : '0';

  return (
    <PostCreationCardContainer>
      {/* Header */}
      <PostCreationHeader>
        <PostCreationTitleGroup>
          <PlaceholderIcon>
            <MaterialIcons name="edit" size={20} color={colors.neutral.white} />
          </PlaceholderIcon>
          <View style={{ flex: 1 }}>
            <PostCreationTitle>O que deseja compartilhar?</PostCreationTitle>
            <PostCreationSubtitle>#{activeTopic}</PostCreationSubtitle>
          </View>
        </PostCreationTitleGroup>
      </PostCreationHeader>

      {/* Content Input */}
      <PostCreationInput
        placeholder="Escreva sua mensagem (máximo 500 caracteres)"
        placeholderTextColor={colors.text.placeholder}
        multiline
        value={content}
        onChangeText={setContent}
        editable={!isLoading}
        maxLength={500}
        accessibilityLabel="Post content"
      />

      {/* Image Preview */}
      {selectedImage && (
        <ImagePreviewContainer>
          <PreviewImage source={{ uri: selectedImage.uri }} resizeMode="cover" />
          <ImageSizeText>{imageSizeInMB} MB</ImageSizeText>
          <ClearImageButton onPress={handleClearImage} disabled={isLoading}>
            <ClearImageText>Remover imagem</ClearImageText>
          </ClearImageButton>
        </ImagePreviewContainer>
      )}

      {/* Footer with Actions and Publish */}
      <PostCreationFooter>
        <PostCreationIcons>
          <IconButton
            onPress={handleImagePick}
            disabled={isLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
          >
            <MaterialIcons
              name="photo-library"
              size={24}
              color={selectedImage ? colors.primary.rosa_full : colors.text.secondary}
            />
          </IconButton>
        </PostCreationIcons>

        <Button
          title={isLoading ? 'Publicando...' : 'Publicar'}
          onPress={handlePublish}
          disabled={isPublishDisabled}
          loading={isLoading}
          variant="primary"
        />
      </PostCreationFooter>
    </PostCreationCardContainer>
  );
};

export default PostCard;