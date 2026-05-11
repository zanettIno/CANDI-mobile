import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Platform, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import BackIconButton from '@/components/BackIconButton';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
import {
  getGroup, getGroupMembers, getGroupPosts,
  joinGroup, leaveGroup,
  getUserLikedPosts, getMyFavorites,
} from '@/services/communityService';
import { useProfile } from '@/context/ProfileContext';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

interface Post {
  post_id: string; profile_id: string; profile_name: string;
  content: string; file_url?: string; created_at: string;
  like_count?: number; comment_count?: number;
}

type Tab = 'posts' | 'membros';

export default function GroupCommunity() {
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const { profileId: myProfileId } = useProfile();

  const [tab, setTab] = useState<Tab>('posts');
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [favoritedPostIds, setFavoritedPostIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);

  const loadGroup = useCallback(async (silent = false) => {
    if (!groupId) return;
    if (!silent) setLoading(true);
    try {
      const [groupData, postsData, likedIds, favIds] = await Promise.allSettled([
        getGroup(groupId),
        getGroupPosts(groupId),
        getUserLikedPosts(),
        getMyFavorites(),
      ]);

      if (groupData.status === 'fulfilled') setGroup(groupData.value);
      if (postsData.status === 'fulfilled') setPosts(postsData.value);
      if (likedIds.status === 'fulfilled') setLikedPostIds(new Set(likedIds.value as string[]));
      if (favIds.status === 'fulfilled') {
        setFavoritedPostIds(new Set((favIds.value as any[]).map((f: any) => f.post_id)));
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível carregar o grupo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  const loadMembers = useCallback(async () => {
    if (!groupId) return;
    setMembersLoading(true);
    try {
      const data = await getGroupMembers(groupId);
      setMembers(data);
      setIsMember(data.some((m: any) => m.profile_id === myProfileId));
    } catch {}
    finally { setMembersLoading(false); }
  }, [groupId, myProfileId]);

  useEffect(() => {
    loadGroup();
    loadMembers();
  }, []);

  useEffect(() => {
    if (tab === 'membros' && members.length === 0) loadMembers();
  }, [tab]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinGroup(groupId!);
      setIsMember(true);
      setGroup((g: any) => g ? { ...g, member_count: (g.member_count || 1) + 1 } : g);
      loadMembers();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível entrar no grupo.');
    } finally { setJoining(false); }
  };

  const handleLeave = () => {
    Alert.alert('Sair do grupo', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup(groupId!);
            setIsMember(false);
            setGroup((g: any) => g ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g);
            loadMembers();
          } catch (err: any) {
            Alert.alert('Erro', err.message || 'Não foi possível sair do grupo.');
          }
        },
      },
    ]);
  };

  const handleLikeToggle = useCallback((postId: string, liked: boolean) => {
    setLikedPostIds(prev => { const n = new Set(prev); liked ? n.add(postId) : n.delete(postId); return n; });
  }, []);

  const handleFavoriteToggle = useCallback((postId: string, favorited: boolean) => {
    setFavoritedPostIds(prev => { const n = new Set(prev); favorited ? n.add(postId) : n.delete(postId); return n; });
  }, []);

  const isAdmin = members.find((m: any) => m.profile_id === myProfileId)?.role === 'admin';

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fundo colorido do header */}
      <View style={s.headerBg}><LoginSignupBackground /></View>

      {/* Header */}
      <View style={[s.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <BackIconButton color={AppTheme.colors.cardBackground} onPress={() => router.back()} top={0} />
        <View style={s.headerInfo}>
          <View style={s.groupIconHeader}>
            <Text style={s.groupIconText}>{(groupName || group?.name || '?')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle} numberOfLines={1}>{groupName || group?.name || 'Grupo'}</Text>
            <Text style={s.headerSub}>
              {group ? `${group.member_count || 0} membros · ${group.topic || 'GERAL'}` : '...'}
            </Text>
          </View>
        </View>
        {/* Botão entrar/sair */}
        {!isAdmin && (
          <TouchableOpacity
            style={[s.joinBtn, isMember && s.leaveBtn]}
            onPress={isMember ? handleLeave : handleJoin}
            disabled={joining}
            activeOpacity={0.8}
          >
            {joining
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={s.joinBtnText}>{isMember ? 'Sair' : 'Entrar'}</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['posts', 'membros'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)} activeOpacity={0.7}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'posts' ? 'Publicações' : 'Membros'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      {tab === 'posts' ? (
        loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadGroup(true); }}
                colors={[AppTheme.colors.tertiary]} tintColor={AppTheme.colors.tertiary} />
            }
          >
            {isMember && (
              <PostCard subgroup={groupId} onPostSuccess={(p) => setPosts(prev => [p, ...prev])} />
            )}
            {posts.length === 0 ? (
              <EmptyState icon="article"
                title="Nenhuma publicação ainda"
                subtitle={isMember ? 'Seja o primeiro a compartilhar algo neste grupo!' : 'Entre no grupo para publicar.'} />
            ) : posts.map(p => (
              <PostCardView
                key={p.post_id}
                postId={p.post_id}
                userName={p.profile_name}
                userHandle={p.profile_id.substring(0, 8)}
                timeAgo={p.created_at}
                content={p.content}
                fileUrl={p.file_url}
                profileId={p.profile_id}
                initialLikeCount={p.like_count || 0}
                initialCommentCount={p.comment_count || 0}
                initialLiked={likedPostIds.has(p.post_id)}
                initialFavorited={favoritedPostIds.has(p.post_id)}
                onLikeToggle={handleLikeToggle}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        )
      ) : (
        membersLoading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
        ) : (
          <ScrollView contentContainerStyle={s.membersList}>
            {members.map(m => (
              <View key={m.profile_id} style={s.memberRow}>
                <Avatar name={m.member_name || '?'} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.member_name || 'Membro'}</Text>
                  <Text style={s.memberSince}>desde {new Date(m.joined_at).toLocaleDateString('pt-BR')}</Text>
                </View>
                {m.role === 'admin' && (
                  <View style={s.adminBadge}><Text style={s.adminBadgeText}>Admin</Text></View>
                )}
              </View>
            ))}
            {members.length === 0 && (
              <EmptyState icon="people" title="Nenhum membro" subtitle="Seja o primeiro a entrar!" />
            )}
          </ScrollView>
        )
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 130, zIndex: 0 },
  header: {
    height: 130, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, zIndex: 1, gap: 12,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupIconHeader: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 20, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  headerSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    minWidth: 70, alignItems: 'center',
  },
  leaveBtn: { backgroundColor: 'rgba(255,100,100,0.3)', borderColor: 'rgba(255,150,150,0.5)' },
  joinBtnText: {
    color: '#fff', fontWeight: '700', fontSize: 13,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  tab: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: AppTheme.colors.tertiary },
  tabText: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.placeholderText, fontWeight: '500',
  },
  tabTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  membersList: { padding: 16, gap: 12, flexGrow: 1 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  memberName: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: '600', color: AppTheme.colors.nameText,
  },
  memberSince: {
    fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  adminBadgeText: {
    fontSize: 11, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
});
