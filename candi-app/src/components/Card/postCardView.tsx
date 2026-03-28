/**
 * Post Card View Component
 *
 * Displays a post with:
 * - User info (avatar, name, timestamp)
 * - Post content and image
 * - Interaction buttons (like, comment, share, save)
 * - Comment section (collapsible)
 *
 * Uses design tokens for consistency and accessibility.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
import CommentSection from './CommentSection';
import * as feedService from '@/services/feedService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PostCardViewContainer = styled(View)`
  background-color: ${colors.neutral.white};
  border-radius: ${borderRadius.large}px;
  margin: ${spacing.sm}px ${spacing.base}px;
  border-width: 1px;
  border-color: ${colors.neutral.gray};
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  elevation: 1;
  overflow: hidden;
`;

const PostHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.base}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.light_gray};
`;

const UserInfo = styled(View)`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const UserDetails = styled(View)`
  margin-left: ${spacing.sm}px;
  flex: 1;
`;

const UserName = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
`;

const UserHandleAndTime = styled(Text)`
  font-size: ${typography.sizes.label_medium}px;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs}px;
`;

const PostContentSection = styled(View)`
  padding: ${spacing.base}px;
`;

const PostContent = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  line-height: ${typography.lineHeights.normal * typography.sizes.body_large}px;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md}px;
`;

const PostImage = styled(Image)`
  width: 100%;
  height: 240px;
  border-radius: ${borderRadius.medium}px;
  margin-bottom: ${spacing.md}px;
`;

const PostActionsContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.base}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.light_gray};
`;

const ActionGroup = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.lg}px;
`;

interface ActionButtonProps {
  $active?: boolean;
}

const ActionButton = styled(TouchableOpacity)<ActionButtonProps>`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.xs}px;
  min-height: 48px;
  min-width: 48px;
  justify-content: center;
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.medium}px;
`;

const ActionText = styled(Text)<ActionButtonProps>`
  font-size: ${typography.sizes.label_large}px;
  color: ${props =>
    props.$active ? colors.primary.rosa_full : colors.text.secondary};
  font-weight: ${typography.weights.medium};
`;

const ProfileImage = styled(Image)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.neutral.light_gray};
`;

const OptionsButton = styled(TouchableOpacity)`
  padding: ${spacing.xs}px ${spacing.sm}px;
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
`;

// ============================================================================
// INTERFACES
// ============================================================================

interface PostCardViewProps {
  postId: string;
  userName: string;
  userHandle: string;
  timeAgo: string;
  content: string;
  profileImageKey?: string;
  imageUrl?: string;
  isImage?: boolean;  // Novo: indica se tem imagem
  fileName?: string;   // Novo: nome do arquivo na S3
  likesCount?: number;
  commentsCount?: number;
  onLike?: (postId: string, liked: boolean) => void;
  style?: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PostCardView: React.FC<PostCardViewProps> = ({
  postId,
  userName,
  userHandle,
  timeAgo,
  content,
  profileImageKey,
  imageUrl,
  isImage = false,
  fileName,
  likesCount = 0,
  commentsCount = 0,
  onLike,
  style,
}) => {
  // Gera URL dinâmica se isImage = true
  const getImageUrl = (): string | undefined => {
    if (isImage && fileName) {
      const bucketName = 'candi-file-uploads'; // Mesmo bucket
      const region = 'us-east-1'; // Ou outra região configurada
      return `https://${bucketName}.s3.${region}.amazonaws.com/posts-image/${fileName}`;
    }
    return undefined;
  };

  // Verifica se tem conteúdo de texto (diferente de apenas imagem)
  const hasTextContent = content && content.trim().length > 0;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCountState, setLikesCountState] = useState(likesCount);
  const [commentsCountState, setCommentsCountState] = useState(commentsCount);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load user ID and check if user liked/saved this post
  useEffect(() => {
    loadUserIdAndCheckInteractions();
  }, [postId]);

  const loadUserIdAndCheckInteractions = async () => {
    try {
      const userId = await AsyncStorage.getItem('profile_id');
      if (userId) {
        setCurrentUserId(userId);
        const userLiked = await feedService.checkUserLike(postId);
        const userSaved = await feedService.checkUserSave(postId);
        setIsLiked(userLiked);
        setIsSaved(userSaved);
      }
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  const getAvatarSource = () => {
    if (profileImageKey) {
      return {
        uri: `https://candi-image-uploads.s3.us-east-1.amazonaws.com/profile-images/${profileImageKey}.jpg`,
      };
    }
    return require('../../../assets/default-avatar.jpg');
  };

  const handleToggleLike = async () => {
    if (isLoadingLike) return;

    setIsLoadingLike(true);
    try {
      const result = await feedService.toggleLike(postId);
      setIsLiked(result.liked);
      setLikesCountState(result.likes_count);
      onLike?.(postId, result.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Erro', 'Não foi possível curtir a postagem');
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleToggleSave = async () => {
    if (isLoadingSave) return;

    setIsLoadingSave(true);
    try {
      if (isSaved) {
        await feedService.unsavePost(postId);
        setIsSaved(false);
      } else {
        await feedService.savePost(postId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Erro', 'Não foi possível salvar a postagem');
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCountState(prev => prev + 1);
  };

  const handleCommentDeleted = () => {
    setCommentsCountState(prev => Math.max(prev - 1, 0));
  };

  return (
    <PostCardViewContainer style={style}>
      {/* Header with user info */}
      <PostHeader>
        <UserInfo>
          <ProfileImage source={getAvatarSource()} />
          <UserDetails>
            <UserName numberOfLines={1}>{userName}</UserName>
            <UserHandleAndTime numberOfLines={1}>
              @{userHandle} • {timeAgo}
            </UserHandleAndTime>
          </UserDetails>
        </UserInfo>
        <OptionsButton
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Post options"
        >
          <MaterialIcons name="more-vert" size={24} color={colors.text.secondary} />
        </OptionsButton>
      </PostHeader>

      {/* Post content */}
      <PostContentSection>
        {/* Renderiza texto apenas se houver conteúdo de texto */}
        {hasTextContent && <PostContent>{content}</PostContent>}

        {/* Renderiza imagem apenas se isImage = true */}
        {isImage && getImageUrl() && (
          <PostImage source={{ uri: getImageUrl()! }} resizeMode="cover" />
        )}
      </PostContentSection>

      {/* Action buttons */}
      <PostActionsContainer>
        <ActionGroup>
          {/* Like button */}
          <ActionButton
            onPress={handleToggleLike}
            disabled={isLoadingLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
            accessibilityState={{ disabled: isLoadingLike }}
          >
            {isLoadingLike ? (
              <ActivityIndicator size="small" color={colors.primary.rosa_full} />
            ) : (
              <MaterialIcons
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={24}
                color={isLiked ? colors.primary.rosa_full : colors.text.secondary}
              />
            )}
            {likesCountState > 0 && (
              <ActionText $active={isLiked}>{likesCountState}</ActionText>
            )}
          </ActionButton>

          {/* Comment button */}
          <ActionButton
            onPress={() => setShowComments(!showComments)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Toggle comments"
          >
            <MaterialIcons name="chat-bubble-outline" size={24} color={colors.text.secondary} />
            {commentsCountState > 0 && <ActionText>{commentsCountState}</ActionText>}
          </ActionButton>

          {/* Share button */}
          <ActionButton
            onPress={() =>
              Alert.alert('Compartilhar', 'Funcionalidade de compartilhamento em breve')
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Share post"
          >
            <MaterialIcons name="share" size={24} color={colors.text.secondary} />
          </ActionButton>
        </ActionGroup>

        {/* Save/Bookmark button */}
        <ActionButton
          onPress={handleToggleSave}
          disabled={isLoadingSave}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from saved' : 'Save post'}
          accessibilityState={{ disabled: isLoadingSave }}
        >
          {isLoadingSave ? (
            <ActivityIndicator size="small" color={colors.primary.rosa_full} />
          ) : (
            <MaterialIcons
              name={isSaved ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={isSaved ? colors.primary.rosa_full : colors.text.secondary}
            />
          )}
        </ActionButton>
      </PostActionsContainer>

      {/* Comment section - shown when toggled */}
      {showComments && currentUserId && (
        <CommentSection
          postId={postId}
          currentUserId={currentUserId}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </PostCardViewContainer>
  );
};

export default PostCardView;