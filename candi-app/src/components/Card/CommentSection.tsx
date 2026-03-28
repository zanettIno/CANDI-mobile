/**
 * Comment Section Component
 *
 * Displays list of comments for a post and allows adding new comments.
 * Handles loading states, errors, and real-time updates.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import CommentInput from '@/components/Inputs/CommentInput';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
import * as feedService from '@/services/feedService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Comment {
  comment_id: string;
  post_id: string;
  profile_id: string;
  profile_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  /** Post ID for loading comments */
  postId: string;

  /** Current user ID for delete permissions */
  currentUserId?: string;

  /** Callback when comment is added */
  onCommentAdded?: (comment: Comment) => void;

  /** Callback when comment is deleted */
  onCommentDeleted?: (commentId: string) => void;

  /** Custom styles */
  style?: any;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(View)`
  border-top-width: 1px;
  border-top-color: ${colors.neutral.gray};
  background-color: ${colors.neutral.white};
`;

const CommentsList = styled(FlatList)`
  max-height: 400px;
`;

const CommentItem = styled(View)`
  padding: ${spacing.base}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.light_gray};
  flex-direction: row;
  gap: ${spacing.sm}px;
`;

const CommentContent = styled(View)`
  flex: 1;
`;

const CommentAuthor = styled(Text)`
  font-size: ${typography.sizes.label_large}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
`;

const CommentTime = styled(Text)`
  font-size: ${typography.sizes.label_medium}px;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs}px;
`;

const CommentText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  color: ${colors.text.primary};
  margin-top: ${spacing.xs}px;
  line-height: ${typography.lineHeights.normal * typography.sizes.body_large}px;
`;

const DeleteButton = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border-radius: 22px;
`;

const EmptyContainer = styled(View)`
  padding: ${spacing.lg}px;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const LoadingContainer = styled(View)`
  padding: ${spacing.lg}px;
  align-items: center;
  justify-content: center;
`;

const ErrorContainer = styled(View)`
  padding: ${spacing.lg}px;
  background-color: #fff3cd;
  border-radius: ${borderRadius.medium}px;
  align-items: center;
`;

const ErrorText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  color: #856404;
  text-align: center;
`;

// ============================================================================
// COMPONENT
// ============================================================================

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  currentUserId,
  onCommentAdded,
  onCommentDeleted,
  style,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments on mount and when postId changes
  useEffect(() => {
    loadComments();
  }, [postId]);

  // Load current user ID if not provided
  useEffect(() => {
    if (!currentUserId) {
      loadCurrentUserId();
    }
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('profile_id');
      if (!userId) {
        setError('Não foi possível carregar seu ID de usuário');
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedComments = await feedService.getComments(postId);
      setComments(loadedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Erro ao carregar comentários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const newComment = await feedService.addComment(postId, content);
      setComments([newComment, ...comments]); // Add to top
      onCommentAdded?.(newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert(
        'Erro',
        'Não foi possível adicionar o comentário. Tente novamente.',
      );
      throw error; // Re-throw for CommentInput to handle
    }
  };

  const handleDeleteComment = async (commentId: string, authorId: string) => {
    // Verify user is author
    if (authorId !== currentUserId) {
      Alert.alert('Erro', 'Você não pode deletar comentários de outros usuários');
      return;
    }

    Alert.alert(
      'Deletar comentário?',
      'Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await feedService.deleteComment(commentId);
              setComments(comments.filter(c => c.comment_id !== commentId));
              onCommentDeleted?.(commentId);
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Erro', 'Não foi possível deletar o comentário');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diffInMinutes < 1) return 'agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h atrás`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d atrás`;

      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem>
      <CommentContent>
        <CommentAuthor>{item.profile_name}</CommentAuthor>
        <CommentTime>{formatTime(item.created_at)}</CommentTime>
        <CommentText>{item.content}</CommentText>
      </CommentContent>

      {currentUserId === item.profile_id && (
        <DeleteButton
          onPress={() => handleDeleteComment(item.comment_id, item.profile_id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Delete comment"
        >
          <MaterialIcons name="delete" size={24} color={colors.states.error} />
        </DeleteButton>
      )}
    </CommentItem>
  );

  return (
    <Container style={style}>
      {isLoading ? (
        <LoadingContainer>
          <ActivityIndicator size="small" color={colors.primary.rosa_full} />
          <Text style={{ marginTop: spacing.sm, color: colors.text.secondary }}>
            Carregando comentários...
          </Text>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      ) : comments.length === 0 ? (
        <EmptyContainer>
          <EmptyText>Nenhum comentário ainda.\nSeja o primeiro a comentar!</EmptyText>
        </EmptyContainer>
      ) : (
        <CommentsList
          data={comments}
          keyExtractor={item => item.comment_id}
          renderItem={renderComment}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingBottom: spacing.base,
          }}
        />
      )}

      <CommentInput
        onSubmit={handleAddComment}
        placeholder="Deixe seu comentário..."
        maxLength={500}
      />
    </Container>
  );
};

export default CommentSection;
