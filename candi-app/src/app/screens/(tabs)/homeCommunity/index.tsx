import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { SearchInput } from '@/components/Inputs/inputSearch';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import MessageCard from '@/components/Card/messageCard';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
import GroupAddModal from '@/components/Modals/GroupAddModal';
import MessagesAdd from '@/components/Modals/MessagesAddModal';
import { useRouter, useFocusEffect } from 'expo-router';
import { getPosts } from '@/services/feedService';
import { listGroups, getMyGroups, joinGroup, createGroup, getUserLikedPosts, getMyFavorites, getMyFavoritedPosts } from '@/services/communityService';
import { getInbox, startConversationByEmail } from '@/services/chatService';
import { useProfile } from '@/context/ProfileContext';
import { formatTime } from '@/utils/dateFormat';

type Section = 'feed' | 'grupos' | 'mensagens' | 'favoritos';

interface Post {
  post_id: string; profile_id: string; profile_name: string;
  content: string; file_url?: string; created_at: string; topic: string;
  like_count?: number; comment_count?: number;
}
interface Group {
  group_id: string; name: string; description: string;
  topic: string; member_count: number; created_at: string;
}

export default function CommunityScreen() {
  const router = useRouter();
  const { avatarUri, profileName } = useProfile();
  const [section, setSection] = React.useState<Section>('feed');

  // Feed
  const [search, setSearch] = React.useState('');
  const [activeHashtag, setActiveHashtag] = React.useState<string | null>(null);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = React.useState(true);
  const [feedRefreshing, setFeedRefreshing] = React.useState(false);
  const [feedError, setFeedError] = React.useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = React.useState<Set<string>>(new Set());
  const [favoritedPostIds, setFavoritedPostIds] = React.useState<Set<string>>(new Set());

  // Favoritos tab
  const [favoritedPosts, setFavoritedPosts] = React.useState<Post[]>([]);
  const [favoritesLoading, setFavoritesLoading] = React.useState(false);
  const [favoritesError, setFavoritesError] = React.useState<string | null>(null);

  // Groups
  const [groupSearch, setGroupSearch] = React.useState('');
  const [groupTab, setGroupTab] = React.useState<'todos' | 'meus'>('todos');
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [myGroupIds, setMyGroupIds] = React.useState<Set<string>>(new Set());
  const [groupsLoading, setGroupsLoading] = React.useState(false);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [groupModal, setGroupModal] = React.useState(false);

  // Messages
  const [msgSearch, setMsgSearch] = React.useState('');
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [msgsLoading, setMsgsLoading] = React.useState(false);
  const [msgsError, setMsgsError] = React.useState('');
  const [msgModal, setMsgModal] = React.useState(false);

  // ── Feed ────────────────────────────────────────────────────────────────────
  const fetchPosts = React.useCallback(async (hashtag?: string, silent = false) => {
    if (!silent) setFeedLoading(true);
    setFeedError(null);
    try {
      const [fetchedPosts, likedIds, favIds] = await Promise.allSettled([
        getPosts(hashtag),
        getUserLikedPosts(),
        getMyFavorites(),
      ]);
      if (fetchedPosts.status === 'fulfilled') setPosts(fetchedPosts.value);
      else setPosts([]);
      if (likedIds.status === 'fulfilled') {
        setLikedPostIds(new Set(likedIds.value as string[]));
      }
      if (favIds.status === 'fulfilled') {
        setFavoritedPostIds(new Set((favIds.value as any[]).map((f: any) => f.post_id)));
      }
      if (fetchedPosts.status === 'rejected') {
        const err = fetchedPosts.reason;
        const isAuth = err.message?.toLowerCase().includes('token');
        setFeedError(isAuth ? 'Sessão expirada. Faça login novamente.' : (err.message || 'Erro ao carregar.'));
      }
    } finally { setFeedLoading(false); setFeedRefreshing(false); }
  }, []);

  useFocusEffect(React.useCallback(() => { fetchPosts(activeHashtag || undefined); }, [activeHashtag]));

  // When hashtag filter changes, reload
  React.useEffect(() => { fetchPosts(activeHashtag || undefined); }, [activeHashtag]);

  const handleSearchSubmit = () => {
    const trimmed = search.trim();
    if (trimmed.startsWith('#') && trimmed.length > 1) {
      setActiveHashtag(trimmed);
    } else if (trimmed === '') {
      setActiveHashtag(null);
    }
  };

  const handleLikeToggle = React.useCallback((postId: string, liked: boolean) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      liked ? next.add(postId) : next.delete(postId);
      return next;
    });
  }, []);

  const handleFavoriteToggle = React.useCallback((postId: string, favorited: boolean) => {
    setFavoritedPostIds(prev => {
      const next = new Set(prev);
      favorited ? next.add(postId) : next.delete(postId);
      return next;
    });
  }, []);

  // Local filter only when no hashtag active and text doesn't start with #
  const filteredPosts = activeHashtag
    ? posts
    : posts.filter(p =>
        !search.trim() ||
        search.startsWith('#') ||
        p.profile_name.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase())
      );

  // ── Groups ──────────────────────────────────────────────────────────────────
  const loadGroups = React.useCallback(async () => {
    setGroupsLoading(true);
    try {
      const [all, mine] = await Promise.all([listGroups(), getMyGroups()]);
      setGroups(all);
      setMyGroupIds(new Set(mine.map((m: any) => m.group_id)));
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível carregar os grupos.');
    } finally { setGroupsLoading(false); }
  }, []);

  React.useEffect(() => { if (section === 'grupos') loadGroups(); }, [section]);

  const handleJoin = async (groupId: string) => {
    setJoiningId(groupId);
    try {
      await joinGroup(groupId);
      setMyGroupIds(prev => new Set([...prev, groupId]));
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível entrar no grupo.');
    } finally { setJoiningId(null); }
  };

  const handleCreateGroup = async (data: { name: string; description: string; topic: string }) => {
    try {
      const g = await createGroup(data);
      setGroups(prev => [g, ...prev]);
      setMyGroupIds(prev => new Set([...prev, g.group_id]));
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível criar o grupo.');
      throw err;
    }
  };

  const displayedGroups = groups.filter(g => {
    const m = g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      (g.description || '').toLowerCase().includes(groupSearch.toLowerCase());
    return groupTab === 'meus' ? m && myGroupIds.has(g.group_id) : m;
  });

  // ── Messages ─────────────────────────────────────────────────────────────────
  const loadInbox = React.useCallback(async () => {
    setMsgsLoading(true); setMsgsError('');
    try { setConversations(await getInbox()); }
    catch (err: any) { setMsgsError(err.message || 'Erro ao carregar.'); }
    finally { setMsgsLoading(false); }
  }, []);

  React.useEffect(() => { if (section === 'mensagens') loadInbox(); }, [section]);

  // ── Favoritos ────────────────────────────────────────────────────────────────
  const loadFavorites = React.useCallback(async () => {
    setFavoritesLoading(true); setFavoritesError(null);
    try { setFavoritedPosts(await getMyFavoritedPosts()); }
    catch (err: any) { setFavoritesError(err.message || 'Erro ao carregar.'); }
    finally { setFavoritesLoading(false); }
  }, []);

  React.useEffect(() => { if (section === 'favoritos') loadFavorites(); }, [section]);

  const handleNewConversation = async (email: string) => {
    if (!email.includes('@')) { Alert.alert('Erro', 'Email inválido.'); return; }
    setMsgModal(false);
    try {
      const c = await startConversationByEmail(email);
      router.push({ pathname: '/screens/community/chatCommunity', params: { conversationId: c.conversation_id, userName: c.other_user_name } });
    } catch (err: any) { Alert.alert('Erro', err.message); }
  };

  const filteredConvs = conversations.filter(c =>
    c.other_user_name?.toLowerCase().includes(msgSearch.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(msgSearch.toLowerCase())
  );

  // ── Render sections ──────────────────────────────────────────────────────────
  const renderFavorites = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={favoritesLoading}
          onRefresh={loadFavorites}
          colors={[AppTheme.colors.tertiary]}
          tintColor={AppTheme.colors.tertiary}
        />
      }
    >
      {favoritesLoading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
        </View>
      ) : favoritesError ? (
        <EmptyState icon="wifi-off" title="Erro ao carregar" subtitle={favoritesError}
          actionLabel="Tentar novamente" onAction={loadFavorites} />
      ) : favoritedPosts.length === 0 ? (
        <EmptyState icon="bookmark-border" title="Nenhum post salvo"
          subtitle="Salve posts tocando no ícone de marcador." />
      ) : favoritedPosts.map(p => (
        <PostCardView key={p.post_id} postId={p.post_id} userName={p.profile_name}
          userHandle={p.profile_id.substring(0, 8)} timeAgo={p.created_at}
          content={p.content} fileUrl={p.file_url} profileId={p.profile_id}
          initialLikeCount={p.like_count || 0}
          initialCommentCount={p.comment_count || 0}
          initialLiked={likedPostIds.has(p.post_id)}
          initialFavorited={favoritedPostIds.has(p.post_id)}
          onLikeToggle={handleLikeToggle}
          onFavoriteToggle={handleFavoriteToggle} />
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderFeed = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={feedRefreshing}
          onRefresh={() => { setFeedRefreshing(true); fetchPosts(activeHashtag || undefined, true); }}
          colors={[AppTheme.colors.tertiary]}
          tintColor={AppTheme.colors.tertiary}
        />
      }
    >
      {/* Search / hashtag bar */}
      <View style={s.feedSearch}>
        <View style={s.searchRow}>
          <MaterialIcons name="search" size={18} color={AppTheme.colors.placeholderText} style={{ marginRight: 6 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Pesquisar ou #hashtag..."
            placeholderTextColor={AppTheme.colors.placeholderText}
            value={search}
            onChangeText={text => {
              setSearch(text);
              if (text.trim() === '') setActiveHashtag(null);
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setActiveHashtag(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={16} color={AppTheme.colors.placeholderText} />
            </TouchableOpacity>
          )}
        </View>
        {/* Active hashtag chip */}
        {activeHashtag && (
          <View style={s.hashtagChipRow}>
            <View style={s.hashtagChip}>
              <Text style={s.hashtagChipText}>{activeHashtag}</Text>
              <TouchableOpacity onPress={() => { setActiveHashtag(null); setSearch(''); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <MaterialIcons name="close" size={14} color={AppTheme.colors.tertiary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <PostCard onPostSuccess={(p: Post) => {
        if (!activeHashtag) setPosts(prev => [p, ...prev]);
      }} />

      {feedLoading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
        </View>
      ) : feedError ? (
        <EmptyState icon="wifi-off" title="Erro ao carregar" subtitle={feedError}
          actionLabel="Tentar novamente" onAction={() => fetchPosts(activeHashtag || undefined)} />
      ) : filteredPosts.length === 0 ? (
        <EmptyState icon="article"
          title={activeHashtag ? `Nenhum post com ${activeHashtag}` : 'Nenhuma postagem ainda'}
          subtitle={activeHashtag ? 'Tente outra hashtag.' : 'Seja o primeiro a compartilhar algo!'} />
      ) : filteredPosts.map(p => (
        <PostCardView key={p.post_id} postId={p.post_id} userName={p.profile_name}
          userHandle={p.profile_id.substring(0, 8)} timeAgo={p.created_at}
          content={p.content} fileUrl={p.file_url} profileId={p.profile_id}
          initialLikeCount={p.like_count || 0}
          initialCommentCount={p.comment_count || 0}
          initialLiked={likedPostIds.has(p.post_id)}
          initialFavorited={favoritedPostIds.has(p.post_id)}
          onLikeToggle={handleLikeToggle}
          onFavoriteToggle={handleFavoriteToggle} />
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderGroups = () => (
    <View style={{ flex: 1 }}>
      <View style={s.sectionSearch}>
        <SearchInput value={groupSearch} onChangeText={setGroupSearch} placeholder="Buscar grupos..." />
      </View>
      <View style={s.subRow}>
        {(['todos', 'meus'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.subTab, groupTab === t && s.subTabActive]} onPress={() => setGroupTab(t)} activeOpacity={0.7}>
            <Text style={[s.subTabText, groupTab === t && s.subTabTextActive]}>
              {t === 'todos' ? 'Todos' : `Meus${myGroupIds.size > 0 ? ` (${myGroupIds.size})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.createBtn} onPress={() => setGroupModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <MaterialIcons name="add" size={20} color={AppTheme.colors.tertiary} />
          <Text style={s.createBtnText}>Criar</Text>
        </TouchableOpacity>
      </View>
      {groupsLoading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
      ) : (
        <FlatList data={displayedGroups} keyExtractor={i => i.group_id}
          contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 10 }}
          renderItem={({ item }) => {
            const isMember = myGroupIds.has(item.group_id);
            return (
              <TouchableOpacity
                style={s.groupCard}
                activeOpacity={0.85}
                onPress={() => router.push({
                  pathname: '/screens/community/groupCommunity',
                  params: { groupId: item.group_id, groupName: item.name },
                })}
              >
                <View style={s.groupRow}>
                  <View style={s.groupIcon}><Text style={s.groupIconText}>{item.name[0].toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.groupName} numberOfLines={1}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MaterialIcons name="people" size={12} color={AppTheme.colors.placeholderText} />
                      <Text style={s.groupMeta}>{item.member_count || 1} membros</Text>
                      <View style={s.topicBadge}><Text style={s.topicText}>{item.topic}</Text></View>
                    </View>
                  </View>
                  <TouchableOpacity style={[s.joinBtn, isMember && s.joinBtnMember]}
                    onPress={(e) => { e.stopPropagation?.(); !isMember && handleJoin(item.group_id); }}
                    disabled={isMember || joiningId === item.group_id} activeOpacity={0.8}>
                    {joiningId === item.group_id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={[s.joinBtnText, isMember && s.joinBtnTextMember]}>{isMember ? 'Ver' : 'Entrar'}</Text>}
                  </TouchableOpacity>
                </View>
                {item.description ? <Text style={s.groupDesc} numberOfLines={2}>{item.description}</Text> : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState icon="groups"
              title={groupTab === 'meus' ? 'Você não faz parte de nenhum grupo' : 'Nenhum grupo encontrado'}
              subtitle={groupTab === 'meus' ? 'Explore e entre em grupos.' : 'Crie o primeiro grupo!'}
              actionLabel={groupTab === 'meus' ? 'Explorar' : 'Criar grupo'}
              onAction={() => groupTab === 'meus' ? setGroupTab('todos') : setGroupModal(true)} />
          } />
      )}
      <GroupAddModal visible={groupModal} onDismiss={() => setGroupModal(false)} onCreateGroup={handleCreateGroup} />
    </View>
  );

  const renderMessages = () => (
    <View style={{ flex: 1 }}>
      <View style={s.sectionSearch}>
        <SearchInput value={msgSearch} onChangeText={setMsgSearch} placeholder="Pesquisar conversas..." />
      </View>
      {msgsLoading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
      ) : msgsError ? (
        <EmptyState icon="wifi-off" title="Sem conexão" subtitle={msgsError} actionLabel="Tentar novamente" onAction={loadInbox} />
      ) : (
        <FlatList data={filteredConvs} keyExtractor={(i: any) => i.conversation_id}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }: any) => (
            <MessageCard userName={item.other_user_name} lastMessage={item.last_message || '...'}
              time={item.last_message_timestamp ? formatTime(item.last_message_timestamp) : ''}
              unreadCount={item.unread_count} isRead={item.unread_count === 0}
              onPress={() => router.push({ pathname: '/screens/community/chatCommunity', params: { conversationId: item.conversation_id, userName: item.other_user_name } })} />
          )}
          ListEmptyComponent={
            <EmptyState icon="chat-bubble-outline" title="Nenhuma conversa"
              subtitle="Toque em + para iniciar uma conversa."
              actionLabel="Nova conversa" onAction={() => setMsgModal(true)} />
          } />
      )}
      <MessagesAdd visible={msgModal} onDismiss={() => setMsgModal(false)} onAddConversation={handleNewConversation} />
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.push('/screens/homeProfile')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Avatar uri={avatarUri || undefined} name={profileName} size={34} />
        </TouchableOpacity>
        <Image source={require('../../../../../assets/images/original.png')} style={s.logo} />
        {section === 'mensagens' ? (
          <TouchableOpacity onPress={() => setMsgModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <MaterialIcons name="add" size={26} color={AppTheme.colors.tertiary} />
          </TouchableOpacity>
        ) : <View style={{ width: 34 }} />}
      </View>

      {/* Section tabs */}
      <View style={s.sectionTabs}>
        {([
          { key: 'feed', label: 'Feed', icon: 'dynamic-feed' },
          { key: 'grupos', label: 'Grupos', icon: 'groups' },
          { key: 'mensagens', label: 'Mensagens', icon: 'chat-bubble-outline' },
          { key: 'favoritos', label: 'Salvos', icon: 'bookmark-border' },
        ] as { key: Section; label: string; icon: any }[]).map(tab => {
          const active = section === tab.key;
          return (
            <TouchableOpacity key={tab.key} onPress={() => setSection(tab.key)}
              style={[s.sectionTab, active && s.sectionTabActive]} activeOpacity={0.7}>
              <MaterialIcons name={tab.icon} size={18} color={active ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText} />
              <Text style={[s.sectionTabText, active && s.sectionTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {section === 'feed' && renderFeed()}
      {section === 'grupos' && renderGroups()}
      {section === 'mensagens' && renderMessages()}
      {section === 'favoritos' && renderFavorites()}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.colors.background },
  topBar: {
    backgroundColor: AppTheme.colors.cardBackground,
    paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  logo: { width: 110, height: 44, resizeMode: 'contain' },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  sectionTab: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, paddingVertical: 8,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  sectionTabActive: { borderBottomColor: AppTheme.colors.tertiary },
  sectionTabText: { fontSize: 10, fontFamily: AppTheme.fonts.labelMedium.fontFamily, fontWeight: '500', color: AppTheme.colors.placeholderText },
  sectionTabTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },

  // Feed search
  feedSearch: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, backgroundColor: AppTheme.colors.cardBackground, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  searchInput: {
    flex: 1, fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.textColor, padding: 0,
  },
  hashtagChipRow: { flexDirection: 'row', marginTop: 8, marginBottom: 2 },
  hashtagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  hashtagChipText: {
    fontSize: 13, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  // Shared
  sectionSearch: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: AppTheme.colors.cardBackground, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  subRow: { flexDirection: 'row', backgroundColor: AppTheme.colors.cardBackground, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor, alignItems: 'center' },
  subTab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  subTabActive: { borderBottomColor: AppTheme.colors.tertiary },
  subTabText: { fontFamily: AppTheme.fonts.bodyMedium.fontFamily, fontSize: AppTheme.fonts.bodyMedium.fontSize, color: AppTheme.colors.placeholderText, fontWeight: '500' },
  subTabTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 14, paddingVertical: 11 },
  createBtnText: { fontSize: 12, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  // Groups
  groupCard: { backgroundColor: AppTheme.colors.cardBackground, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: AppTheme.colors.secondary, alignItems: 'center', justifyContent: 'center' },
  groupIconText: { fontSize: 20, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  groupName: { fontFamily: AppTheme.fonts.bodyMedium.fontFamily, fontSize: AppTheme.fonts.bodyMedium.fontSize, fontWeight: '700', color: AppTheme.colors.nameText },
  groupMeta: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  topicBadge: { marginLeft: 4, backgroundColor: AppTheme.colors.placeholderBackground, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  topicText: { fontSize: 10, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, fontWeight: '600' },
  joinBtn: { backgroundColor: AppTheme.colors.tertiary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, minWidth: 60, alignItems: 'center', minHeight: 32, justifyContent: 'center' },
  joinBtnMember: { backgroundColor: AppTheme.colors.secondary },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  joinBtnTextMember: { color: AppTheme.colors.tertiary },
  groupDesc: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor, fontFamily: AppTheme.fonts.bodySmall.fontFamily, fontSize: AppTheme.fonts.bodySmall.fontSize, color: AppTheme.colors.roleText, lineHeight: 18 },
});
