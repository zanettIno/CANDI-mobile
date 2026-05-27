import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, StatusBar, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import BackIconButton from '@/components/BackIconButton';
import PostCardView from '@/components/Card/postCardView';
import { ScrollView } from 'react-native';
import { getUserLikedPosts, getMyFavorites } from '@/services/communityService';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

// Busca um post pelo ID via AllPostsGSI (já existe o endpoint /feed/posts?postId não existe,
// mas podemos reusar getPosts e filtrar — ou melhor: criar endpoint específico.
// Solução pragmática: carregar o post a partir dos dados que já vêm no __POST__ payload,
// que foi passado via params, e complementar com like/fav do usuário.
export default function PostDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    postId: string;
    authorName?: string;
    content?: string;
    fileUrl?: string;
    createdAt?: string;
    profileId?: string;
  }>();

  const { postId, authorName, content, fileUrl, createdAt, profileId } = params;

  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [favoritedPostIds, setFavoritedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserLikedPosts().catch(() => []), getMyFavorites().catch(() => [])])
      .then(([liked, favs]) => {
        setLikedPostIds(new Set(liked as string[]));
        setFavoritedPostIds(new Set((favs as any[]).map(f => f.post_id)));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.headerBg}><LoginSignupBackground /></View>
      <View style={[s.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <BackIconButton color={AppTheme.colors.cardBackground} onPress={() => router.back()} top={0} />
        <Text style={s.headerTitle}>Publicação</Text>
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <PostCardView
            postId={postId}
            userName={authorName || 'Usuário'}
            userHandle={(profileId || postId || '').substring(0, 8)}
            timeAgo={createdAt || new Date().toISOString()}
            content={content || ''}
            fileUrl={fileUrl || undefined}
            profileId={profileId}
            initialLiked={likedPostIds.has(postId)}
            initialFavorited={favoritedPostIds.has(postId)}
          />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 0 },
  header: { height: 100, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, zIndex: 1, gap: 12 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
