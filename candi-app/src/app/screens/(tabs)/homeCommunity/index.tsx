/**
 * Community Screen (Main Feed)
 *
 * Displays posts from selected topic/tab with:
 * - Topic tab selection
 * - Search functionality
 * - Post creation card
 * - Post list with proper accessibility
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { spacing, colors, typography } from '@/theme/tokens';
import { AppTheme } from '@/theme';
import Input from '@/components/Inputs/Input';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import { getPosts } from '@/services/feedService';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface Post {
  post_id: string;
  profile_id: string;
  profile_name: string;
  content: string;
  file_url?: string;
  created_at: string;
  topic: string;
  likes_count?: number;
  comments_count?: number;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.neutral.light_gray};
`;

const TopBar = styled(View)`
  background-color: ${colors.neutral.white};
  padding: ${spacing.base}px ${spacing.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.gray};
`;

const ProfileButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
`;

const SearchInputWrapper = styled(View)`
  padding: ${spacing.sm}px ${spacing.base}px;
  background-color: ${colors.neutral.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.light_gray};
`;

const TabsContainer = styled(View)`
  background-color: ${colors.neutral.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.gray};
`;

const TabButton = styled(TouchableOpacity)<{ $isActive: boolean }>`
  padding-vertical: ${spacing.md}px;
  margin-right: ${spacing.lg}px;
  border-bottom-width: ${props => (props.$isActive ? 3 : 0)}px;
  border-bottom-color: ${props =>
    props.$isActive ? colors.secondary.blue : 'transparent'};
  min-height: 48px;
  justify-content: center;
`;

const TabText = styled(Text)<{ $isActive: boolean }>`
  font-family: ${typography.fonts.body_medium};
  font-size: ${typography.sizes.body_large}px;
  font-weight: ${typography.weights.medium};
  color: ${props =>
    props.$isActive ? colors.secondary.blue : colors.text.secondary};
`;

const ContentContainer = styled(View)`
  flex: 1;
  background-color: ${colors.neutral.light_gray};
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorText = styled(Text)`
  text-align: center;
  color: ${colors.states.error};
  font-size: ${typography.sizes.body_large}px;
  margin-top: ${spacing.lg}px;
`;

const EmptyText = styled(Text)`
  text-align: center;
  color: ${colors.text.secondary};
  font-size: ${typography.sizes.body_large}px;
  margin-top: ${spacing.lg}px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

const tabs = ['Feed', 'Quimio', 'Câncer', 'Câncer SP', 'Controle', 'Leucemia', 'Diagnóstico', 'Pós-Tratamento', 'Bem-estar'];

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Feed');
  const [searchValue, setSearchValue] = useState('');
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPosts(topic);
      setDisplayedPosts(data);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as postagens');
      setDisplayedPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts(activeTab);
    }, [activeTab, fetchPosts])
  );

  const handlePostCreated = (newPost: Post) => {
    if (activeTab === 'Feed' || activeTab.toUpperCase() === newPost.topic) {
      setDisplayedPosts(prev => [newPost, ...prev]);
    }
  };

  const filteredPosts = displayedPosts.filter(
    post =>
      post.profile_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      post.content.toLowerCase().includes(searchValue.toLowerCase())
  );

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'agora';
      if (diffInHours < 24) return `${diffInHours}h atrás`;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <PaperProvider theme={AppTheme}>
      <Container>
        {/* Top Bar */}
        <TopBar>
          <ProfileButton
            onPress={() => router.push('/screens/homeProfile')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go to profile"
          >
            <MaterialIcons name="person" size={24} color={colors.secondary.blue} />
          </ProfileButton>

          <Image
            source={require('../../../../../assets/images/original.png')}
            style={{ width: 120, height: 50, resizeMode: 'contain' }}
            accessibilityLabel="CANDI Logo"
          />

          <View style={{ width: 48 }} />
        </TopBar>

        {/* Search */}
        <SearchInputWrapper>
          <Input
            label="Buscar posts..."
            value={searchValue}
            onChangeText={setSearchValue}
            icon="search"
          />
        </SearchInputWrapper>

        {/* Tabs */}
        <TabsContainer>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.base }}
            keyboardShouldPersistTaps="handled"
          >
            {tabs.map(tab => (
              <TabButton
                key={tab}
                onPress={() => setActiveTab(tab)}
                $isActive={activeTab === tab}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                accessibilityRole="tab"
                accessibilitySelected={activeTab === tab}
                accessibilityLabel={`${tab} tab`}
              >
                <TabText $isActive={activeTab === tab}>{tab}</TabText>
              </TabButton>
            ))}
          </ScrollView>
        </TabsContainer>

        {/* Content */}
        <ContentContainer>
          {isLoading ? (
            <LoadingContainer>
              <ActivityIndicator size="large" color={colors.primary.rosa_full} />
            </LoadingContainer>
          ) : (
            <FlatList
              data={filteredPosts}
              keyExtractor={item => item.post_id}
              renderItem={({ item }) => (
                <PostCardView
                  postId={item.post_id}
                  userName={item.profile_name}
                  userHandle={item.profile_id.substring(0, 8)}
                  timeAgo={formatTime(item.created_at)}
                  content={item.content}
                  imageUrl={item.file_url}
                  likesCount={item.likes_count || 0}
                  commentsCount={item.comments_count || 0}
                />
              )}
              ListHeaderComponent={
                <PostCard activeTopic={activeTab} onPostSuccess={handlePostCreated} />
              }
              ListEmptyComponent={
                error ? (
                  <ErrorText>{error}</ErrorText>
                ) : (
                  <EmptyText>Nenhuma postagem encontrada nesta categoria</EmptyText>
                )
              }
              contentContainerStyle={{
                paddingBottom: spacing.xxl,
              }}
              scrollEnabled
              scrollIndicatorInsets={{ bottom: 60 }}
              keyboardShouldPersistTaps="handled"
              accessibilityRole="list"
            />
          )}
        </ContentContainer>
      </Container>
    </PaperProvider>
  );
}