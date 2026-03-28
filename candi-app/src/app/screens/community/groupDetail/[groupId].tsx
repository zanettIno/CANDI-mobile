/**
 * Group Detail Screen
 *
 * Displays:
 * - Group information (name, description, member count)
 * - Posts in the group
 * - Join/Leave button
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
import Button from '@/components/Buttons/Button';
import PostCardView from '@/components/Card/postCardView';
import * as groupService from '@/services/groupService';
import * as feedService from '@/services/feedService';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.neutral.light_gray};
`;

const HeaderContainer = styled(View)`
  background-color: ${colors.primary.rosa_full};
  padding: ${spacing.lg}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled(TouchableOpacity)`
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
`;

const GroupInfo = styled(View)`
  flex: 1;
  margin-left: ${spacing.base}px;
`;

const GroupName = styled(Text)`
  font-size: ${typography.sizes.title_large}px;
  font-weight: ${typography.weights.bold};
  font-family: ${typography.fonts.heading};
  color: ${colors.neutral.white};
`;

const GroupStats = styled(Text)`
  font-size: ${typography.sizes.label_large}px;
  color: ${colors.neutral.form_field};
  margin-top: ${spacing.xs}px;
`;

const ContentContainer = styled(View)`
  flex: 1;
`;

const GroupDescription = styled(View)`
  background-color: ${colors.neutral.white};
  padding: ${spacing.base}px;
  margin: ${spacing.base}px;
  border-radius: ${borderRadius.medium}px;
`;

const DescriptionText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  color: ${colors.text.primary};
  line-height: ${typography.lineHeights.normal * typography.sizes.body_large}px;
`;

const PostsSection = styled(View)`
  flex: 1;
  margin-top: ${spacing.base}px;
`;

const SectionTitle = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  margin-left: ${spacing.base}px;
  margin-top: ${spacing.base}px;
  margin-bottom: ${spacing.sm}px;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;

const EmptyText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const ActionContainer = styled(View)`
  padding: ${spacing.base}px;
  gap: ${spacing.base}px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<groupService.Group | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      const groupData = await groupService.getGroupById(groupId);
      const groupPosts = await feedService.getPosts('Feed'); // Will add group filter
      const memberStatus = await groupService.checkMembership(groupId);

      setGroup(groupData);
      setPosts(groupPosts.Items || []);
      setIsMember(memberStatus);
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Erro', 'Não foi possível carregar o grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!groupId) return;

    setIsJoining(true);
    try {
      if (isMember) {
        await groupService.leaveGroup(groupId);
        setIsMember(false);
        Alert.alert('Sucesso', 'Você saiu do grupo');
      } else {
        await groupService.joinGroup(groupId);
        setIsMember(true);
        Alert.alert('Sucesso', 'Você entrou no grupo!');
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      Alert.alert('Erro', 'Não foi possível processar sua solicitação');
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  if (isLoading || !group) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color={colors.primary.rosa_full} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <HeaderContainer>
        <BackButton
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.neutral.white} />
        </BackButton>
        <GroupInfo>
          <GroupName numberOfLines={2}>{group.group_name}</GroupName>
          <GroupStats>{group.member_count} membros</GroupStats>
        </GroupInfo>
      </HeaderContainer>

      {/* Content */}
      <ContentContainer>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={posts.length > 0}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        >
          {/* Group Description */}
          {group.description && (
            <GroupDescription>
              <DescriptionText>{group.description}</DescriptionText>
            </GroupDescription>
          )}

          {/* Posts */}
          <SectionTitle>Publicações</SectionTitle>

          {posts.length === 0 ? (
            <EmptyContainer>
              <MaterialIcons name="article" size={48} color={colors.text.secondary} />
              <EmptyText style={{ marginTop: spacing.base }}>
                Nenhuma publicação neste grupo ainda
              </EmptyText>
            </EmptyContainer>
          ) : (
            <View>
              {posts.map(post => (
                <PostCardView
                  key={post.post_id}
                  postId={post.post_id}
                  userName={post.profile_name}
                  userHandle={post.profile_email?.split('@')[0] || 'usuario'}
                  timeAgo={formatDate(post.created_at)}
                  content={post.content}
                  imageUrl={post.file_url}
                  likesCount={post.likes_count || 0}
                  commentsCount={post.comments_count || 0}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </ContentContainer>

      {/* Action Button */}
      <ActionContainer>
        <Button
          title={isMember ? 'Sair do Grupo' : 'Entrar no Grupo'}
          onPress={handleJoinLeave}
          disabled={isJoining}
          loading={isJoining}
          variant={isMember ? 'outline' : 'primary'}
        />
      </ActionContainer>
    </Container>
  );
}
