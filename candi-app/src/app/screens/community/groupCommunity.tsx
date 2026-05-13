import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Platform, StatusBar,
  FlatList, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import BackIconButton from '@/components/BackIconButton';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
import { MessageBubble } from '@/components/Bubble/messageBubble';
import {
  getGroup, getGroupMembers, getGroupPosts,
  joinGroup, leaveGroup, updateGroup, deleteGroup,
  getUserLikedPosts, getMyFavorites,
  getMyMemberStatus, getPendingRequests, handleJoinRequest,
  removeMember, updateMemberRole, deleteGroupPost,
} from '@/services/communityService';
import { getMessages, sendMessage as sendChatMessage } from '@/services/chatService';
// @ts-ignore – authService is a JS file without type declarations
import { getValidAccessToken } from '@/services/authService';
import { useProfile } from '@/context/ProfileContext';
import { useNotification } from '@/context/NotificationContext';
import { formatTime, formatRelativeDate } from '@/utils/dateFormat';
import { API_BASE_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const SOCKET_URL = API_BASE_URL.replace('/api', '');

type MemberRole = 'admin' | 'co-leader' | 'member' | 'pending' | 'none';
type Tab = 'posts' | 'chat' | 'membros';

interface Post {
  post_id: string; profile_id: string; profile_name: string;
  content: string; file_url?: string; created_at: string;
  like_count?: number; comment_count?: number;
}
interface Member {
  profile_id: string; member_name: string; role: MemberRole; joined_at: string;
}
interface ChatMessage {
  conversation_id: string; timestamp: string;
  sender_id: string; sender_name: string; message_content: string;
}

// conversationId do chat de grupo: prefixo fixo + groupId
const groupConvId = (groupId: string) => `GROUP#${groupId}`;

export default function GroupCommunity() {
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const { profileId: myProfileId, profileName: myName } = useProfile();
  const { showNotification } = useNotification();

  const [tab, setTab] = useState<Tab>('posts');
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingReqs, setPendingReqs] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [favoritedPostIds, setFavoritedPostIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [myRole, setMyRole] = useState<MemberRole>('none');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatText, setChatText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMember = ['admin', 'co-leader', 'member'].includes(myRole);
  const isMod = ['admin', 'co-leader'].includes(myRole);
  const isAdmin = myRole === 'admin';
  const convId = groupConvId(groupId!);

  // ── Carrega dados principais ────────────────────────────────────────────────
  const loadGroup = useCallback(async (silent = false) => {
    if (!groupId) return;
    if (!silent) setLoading(true);
    try {
      const [groupData, postsData, likedIds, favIds, statusData] = await Promise.allSettled([
        getGroup(groupId),
        getGroupPosts(groupId),
        getUserLikedPosts(),
        getMyFavorites(),
        getMyMemberStatus(groupId),
      ]);
      if (groupData.status === 'fulfilled') setGroup(groupData.value);
      if (postsData.status === 'fulfilled') setPosts(postsData.value);
      if (likedIds.status === 'fulfilled') setLikedPostIds(new Set(likedIds.value as string[]));
      if (favIds.status === 'fulfilled')
        setFavoritedPostIds(new Set((favIds.value as any[]).map((f: any) => f.post_id)));
      if (statusData.status === 'fulfilled')
        setMyRole((statusData.value as any).status as MemberRole);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível carregar o grupo.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [groupId]);

  const loadMembers = useCallback(async () => {
    if (!groupId) return;
    setMembersLoading(true);
    try {
      const data = await getGroupMembers(groupId);
      setMembers(data.filter((m: Member) => m.role !== 'pending'));
    } catch {}
    finally { setMembersLoading(false); }
  }, [groupId]);

  const loadPendingRequests = useCallback(async () => {
    if (!groupId || !isMod) return;
    try { setPendingReqs(await getPendingRequests(groupId)); } catch {}
  }, [groupId, isMod]);

  useEffect(() => { loadGroup(); }, []);
  useEffect(() => { if (isMod) loadPendingRequests(); }, [myRole]);
  useEffect(() => { if (tab === 'membros') { loadMembers(); if (isMod) loadPendingRequests(); } }, [tab]);

  // ── Chat WebSocket ───────────────────────────────────────────────────────────
  const getUserId = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return null;
    const p = token.split('.')[1];
    const decoded = Platform.OS === 'web' ? JSON.parse(atob(p)) : JSON.parse(Buffer.from(p, 'base64').toString());
    return decoded.id;
  };

  useEffect(() => {
    if (tab !== 'chat' || !isMember) return;

    let mounted = true;

    const initChat = async () => {
      setChatLoading(true);
      const [uid, history] = await Promise.all([getUserId(), getMessages(convId).catch(() => [])]);
      if (!mounted) return;
      if (uid) setCurrentUserId(uid);
      setChatMessages([...history].reverse());
      setChatLoading(false);

      const token = await getValidAccessToken();
      const socket = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 10000,
        reconnectionAttempts: Infinity,
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log('[Socket] Conectado ao servidor');
        setIsConnected(true);
        socket.emit('join_conversation', { conversationId: convId });
      });
      socket.on('disconnect', (reason) => {
        console.log('[Socket] Desconectado:', reason);
        setIsConnected(false);
      });
      socket.on('error', (err) => {
        console.error('[Socket] Erro:', err);
      });
      socket.on('connect_error', (err) => {
        console.error('[Socket] Erro de conexão:', err);
      });
      socket.on('new_message', (msg: ChatMessage) => {
        if (!mounted) return;
        setChatMessages(prev => {
          const without = prev.filter(m => !(m.timestamp.includes('#temp') && m.message_content === msg.message_content && m.sender_id === msg.sender_id));
          if (without.some(m => m.timestamp === msg.timestamp)) return without;
          return [msg, ...without];
        });
        // Show notification if message is from someone else
        if (msg.sender_id !== currentUserId) {
          showNotification({
            title: msg.sender_name,
            message: msg.message_content,
            type: 'info',
            duration: 4000,
          });
        }
      });

      socket.on('online_users', (data: { online: string[] }) => {
        if (!mounted) return;
        setOnlineUsers(new Set(data.online));
      });

      socket.on('user_online', (data: { profile_id: string }) => {
        if (!mounted) return;
        setOnlineUsers(prev => new Set([...prev, data.profile_id]));
      });

      socket.on('user_offline', (data: { profile_id: string }) => {
        if (!mounted) return;
        setOnlineUsers(prev => {
          const n = new Set(prev);
          n.delete(data.profile_id);
          return n;
        });
      });

      socketRef.current = socket;
    };

    initChat();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leave_conversation', { conversationId: convId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [tab, isMember]);

  const handleSendChat = useCallback(async () => {
    if (!chatText.trim()) return;
    const text = chatText.trim();
    setChatText('');

    const optimistic: ChatMessage = {
      conversation_id: convId,
      timestamp: `${new Date().toISOString()}#temp-${Date.now()}`,
      sender_id: currentUserId || 'local',
      sender_name: myName || 'Você',
      message_content: text,
    };
    setChatMessages(prev => [optimistic, ...prev]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { conversationId: convId, messageContent: text });
    } else {
      try {
        const real = await sendChatMessage(convId, text);
        setChatMessages(prev => {
          const idx = prev.findIndex(m => m.timestamp === optimistic.timestamp);
          if (idx > -1) { const u = [...prev]; u[idx] = real; return u; }
          return prev;
        });
      } catch {
        setChatMessages(prev => prev.filter(m => m.timestamp !== optimistic.timestamp));
        setChatText(text);
      }
    }
  }, [chatText, convId, currentUserId, myName]);

  // ── Ações de grupo ──────────────────────────────────────────────────────────
  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await joinGroup(groupId!);
      const newRole: MemberRole = (res as any).status === 'pending' ? 'pending' : 'member';
      setMyRole(newRole);
      if (newRole === 'member') {
        setGroup((g: any) => g ? { ...g, member_count: (g.member_count || 0) + 1 } : g);
      }
      Alert.alert(newRole === 'pending' ? 'Solicitação enviada!' : 'Bem-vindo!',
        newRole === 'pending' ? 'Aguarde a aprovação do administrador.' : 'Você entrou no grupo.');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally { setJoining(false); }
  };

  const handleLeave = () => {
    Alert.alert('Sair do grupo', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        try {
          await leaveGroup(groupId!);
          setMyRole('none');
          setGroup((g: any) => g ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g);
        } catch (err: any) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const handleApprove = async (m: Member) => {
    try {
      await handleJoinRequest(groupId!, m.profile_id, 'approve');
      setPendingReqs(prev => prev.filter(r => r.profile_id !== m.profile_id));
      setGroup((g: any) => g ? { ...g, member_count: (g.member_count || 0) + 1 } : g);
      loadMembers();
    } catch (err: any) { Alert.alert('Erro', err.message); }
  };

  const handleReject = async (m: Member) => {
    try {
      await handleJoinRequest(groupId!, m.profile_id, 'reject');
      setPendingReqs(prev => prev.filter(r => r.profile_id !== m.profile_id));
    } catch (err: any) { Alert.alert('Erro', err.message); }
  };

  const handleRemoveMember = (m: Member) => {
    Alert.alert('Remover membro', `Remover ${m.member_name} do grupo?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          await removeMember(groupId!, m.profile_id);
          setMembers(prev => prev.filter(x => x.profile_id !== m.profile_id));
          setGroup((g: any) => g ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g);
        } catch (err: any) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const handleRoleUpdate = (m: Member) => {
    if (!isAdmin) return;
    const isCoLeader = m.role === 'co-leader';
    Alert.alert(
      isCoLeader ? 'Rebaixar membro' : 'Nomear co-líder',
      isCoLeader ? `Remover ${m.member_name} de co-líder?` : `Nomear ${m.member_name} como co-líder?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: async () => {
          try {
            await updateMemberRole(groupId!, m.profile_id, isCoLeader ? 'member' : 'co-leader');
            setMembers(prev => prev.map(x =>
              x.profile_id === m.profile_id ? { ...x, role: isCoLeader ? 'member' : 'co-leader' } : x
            ));
          } catch (err: any) { Alert.alert('Erro', err.message); }
        }},
      ]
    );
  };

  const handleEditGroup = () => {
    if (!isAdmin) return;
    const editName = group?.name || '';
    const editDesc = group?.description || '';
    const editTopic = group?.topic || 'GERAL';

    Alert.prompt(
      'Editar grupo',
      'Nome do grupo:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: async (newName?: string) => {
          if (!newName?.trim()) { Alert.alert('Erro', 'Nome não pode estar vazio'); return; }
          try {
            const updated = await updateGroup(groupId!, { name: newName.trim(), description: editDesc, topic: editTopic });
            setGroup(updated);
            Alert.alert('Sucesso', 'Grupo atualizado');
          } catch (err: any) { Alert.alert('Erro', err.message); }
        }},
      ],
      'plain-text',
      editName
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Excluir grupo',
      `Tem certeza que deseja excluir "${group?.name || 'este grupo'}"? Esta ação é irreversível.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await deleteGroup(groupId!);
            router.back();
          } catch (err: any) { Alert.alert('Erro', err.message); }
        }},
      ]
    );
  };

  const handleDeletePost = (post: Post) => {
    Alert.alert('Remover publicação', 'Remover esta publicação do grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          await deleteGroupPost(groupId!, post.post_id);
          setPosts(prev => prev.filter(p => p.post_id !== post.post_id));
        } catch (err: any) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const handleLikeToggle = useCallback((postId: string, liked: boolean) => {
    setLikedPostIds(prev => { const n = new Set(prev); liked ? n.add(postId) : n.delete(postId); return n; });
  }, []);

  const handleFavoriteToggle = useCallback((postId: string, favorited: boolean) => {
    setFavoritedPostIds(prev => { const n = new Set(prev); favorited ? n.add(postId) : n.delete(postId); return n; });
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  const roleBadge = (role: MemberRole) => {
    if (role === 'admin') return { label: 'Admin', color: AppTheme.colors.tertiary, bg: AppTheme.colors.secondary };
    if (role === 'co-leader') return { label: 'Co-líder', color: '#f59e0b', bg: '#fef3c7' };
    return null;
  };

  const renderMember = ({ item: m }: { item: Member }) => {
    const badge = roleBadge(m.role);
    const isMe = m.profile_id === myProfileId;
    const targetIsAdmin = m.role === 'admin';
    const isOnline = onlineUsers.has(m.profile_id);

    const targetIsCoLeader = m.role === 'co-leader';
    // Admin pode promover/rebaixar co-líder e remover qualquer um (exceto si mesmo e outro admin)
    // Co-líder pode remover membros comuns (não admin, não outro co-líder, não si mesmo)
    const canPromote = isAdmin && !isMe && !targetIsAdmin;
    const canRemove = isMod && !isMe && !targetIsAdmin && !(isMod && !isAdmin && targetIsCoLeader);
    const showMenu = canPromote || canRemove;

    return (
      <View style={s.memberRow}>
        <Avatar name={m.member_name} size={42} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={[s.onlineIndicator, { backgroundColor: isOnline ? '#10b981' : '#9ca3af' }]} />
            <Text style={s.memberName}>{m.member_name}</Text>
          </View>
          <Text style={s.memberSince}>desde {new Date(m.joined_at).toLocaleDateString('pt-BR')}</Text>
        </View>
        {badge && (
          <View style={[s.badge, { backgroundColor: badge.bg }]}>
            <Text style={[s.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        )}
        {showMenu && (
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              const options: any[] = [];
              if (canPromote) {
                options.push({
                  text: m.role === 'co-leader' ? 'Rebaixar para membro' : 'Nomear co-líder',
                  onPress: () => handleRoleUpdate(m),
                });
              }
              if (canRemove) {
                options.push({
                  text: 'Remover do grupo',
                  style: 'destructive',
                  onPress: () => handleRemoveMember(m),
                });
              }
              options.push({ text: 'Cancelar', style: 'cancel' });
              Alert.alert(m.member_name, 'O que deseja fazer?', options);
            }}
          >
            <MaterialIcons name="more-vert" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPending = ({ item: m }: { item: Member }) => (
    <View style={[s.memberRow, s.pendingRow]}>
      <Avatar name={m.member_name} size={42} />
      <View style={{ flex: 1 }}>
        <Text style={s.memberName}>{m.member_name}</Text>
        <Text style={s.memberSince}>Aguardando aprovação</Text>
      </View>
      <TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(m)}>
        <MaterialIcons name="check" size={18} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={s.rejectBtn} onPress={() => handleReject(m)}>
        <MaterialIcons name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderChatItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isSent = item.sender_id === currentUserId;
    const prev = chatMessages[index + 1];
    const showAvatar = !isSent && (!prev || prev.sender_id !== item.sender_id);
    const showName = !isSent && showAvatar;
    return (
      <View style={[s.chatRow, isSent ? s.chatRowSent : s.chatRowReceived]}>
        {!isSent && <View style={s.chatAvatarSlot}>{showAvatar && <Avatar name={item.sender_name} size={28} />}</View>}
        <View style={{ maxWidth: '78%' }}>
          {showName && <Text style={s.chatSenderName}>{item.sender_name}</Text>}
          <MessageBubble
            message={item.message_content}
            time={formatTime(item.timestamp)}
            isSent={isSent}
            onPressSharedPost={(p) => router.push({ pathname: '/screens/community/postDetail', params: p })}
          />
        </View>
      </View>
    );
  };

  // ── Conteúdo por aba ────────────────────────────────────────────────────────
  const renderPosts = () => (
    loading ? <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View> : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadGroup(true); }}
            colors={[AppTheme.colors.tertiary]} tintColor={AppTheme.colors.tertiary} />
        }
      >
        {isMember && <PostCard subgroup={groupId} onPostSuccess={(p) => setPosts(prev => [p, ...prev])} />}
        {posts.length === 0
          ? <EmptyState icon="article" title="Nenhuma publicação ainda"
              subtitle={isMember ? 'Seja o primeiro a compartilhar!' : 'Entre no grupo para ver publicações.'} />
          : posts.map(p => (
            <PostCardView
              key={p.post_id}
              postId={p.post_id} userName={p.profile_name}
              userHandle={p.profile_id.substring(0, 8)} timeAgo={p.created_at}
              content={p.content} fileUrl={p.file_url} profileId={p.profile_id}
              initialLikeCount={p.like_count || 0} initialCommentCount={p.comment_count || 0}
              initialLiked={likedPostIds.has(p.post_id)} initialFavorited={favoritedPostIds.has(p.post_id)}
              onLikeToggle={handleLikeToggle} onFavoriteToggle={handleFavoriteToggle}
              onAdminDelete={isMod ? () => handleDeletePost(p) : undefined}
              canDeleteAnyComment={isMod}
              groupId={groupId}
            />
          ))
        }
        <View style={{ height: 24 }} />
      </ScrollView>
    )
  );

  const renderChat = () => {
    if (!isMember) {
      return <EmptyState icon="chat-bubble-outline" title="Entre no grupo" subtitle="Apenas membros podem usar o chat." />;
    }
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {chatLoading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
        ) : (
          <FlatList
            data={chatMessages}
            renderItem={renderChatItem}
            keyExtractor={m => m.timestamp}
            inverted
            contentContainerStyle={s.chatList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.centered}>
                <Text style={s.emptyChat}>Nenhuma mensagem ainda. Diga olá! 👋</Text>
              </View>
            }
          />
        )}
        <View style={s.chatInputBar}>
          <TextInput
            style={s.chatInput}
            value={chatText}
            onChangeText={setChatText}
            placeholder="Mensagem no grupo..."
            placeholderTextColor={AppTheme.colors.placeholderText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSendChat}
          />
          <TouchableOpacity style={s.chatSendBtn} onPress={handleSendChat} disabled={!chatText.trim()}>
            <MaterialIcons name="send" size={20} color={chatText.trim() ? '#fff' : 'rgba(255,255,255,0.4)'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderMembers = () => (
    membersLoading ? <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View> : (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}>
        {/* Solicitações pendentes (só mods veem) */}
        {isMod && pendingReqs.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <MaterialIcons name="pending" size={16} color={AppTheme.colors.tertiary} />
              <Text style={s.sectionTitle}>Solicitações ({pendingReqs.length})</Text>
            </View>
            {pendingReqs.map(m => (
              <View key={m.profile_id}>{renderPending({ item: m } as any)}</View>
            ))}
            <View style={s.divider} />
          </>
        )}

        <View style={s.sectionHeader}>
          <MaterialIcons name="people" size={16} color={AppTheme.colors.placeholderText} />
          <Text style={s.sectionTitle}>{members.length} membro{members.length !== 1 ? 's' : ''}</Text>
        </View>
        {members.map(m => (
          <View key={m.profile_id}>{renderMember({ item: m } as any)}</View>
        ))}
        {members.length === 0 && <EmptyState icon="people" title="Nenhum membro" subtitle="Seja o primeiro!" />}
      </ScrollView>
    )
  );

  // ── UI principal ─────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'posts', label: 'Publicações', icon: 'article' },
    { key: 'chat', label: 'Chat', icon: 'chat-bubble-outline' },
    { key: 'membros', label: 'Membros', icon: 'people' },
  ];

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.headerBg}><LoginSignupBackground /></View>

      <View style={[s.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <BackIconButton color={AppTheme.colors.cardBackground} onPress={() => router.back()} top={0} />
        <View style={s.headerInfo}>
          <View style={s.groupIcon}>
            <Text style={s.groupIconText}>{(groupName || group?.name || '?')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle} numberOfLines={1}>{groupName || group?.name || 'Grupo'}</Text>
            <Text style={s.headerSub}>
              {group ? `${group.member_count || 0} membros · ${group.topic || 'GERAL'}` : '...'}
            </Text>
          </View>
        </View>

        {myRole === 'none' && (
          <TouchableOpacity style={s.joinBtn} onPress={handleJoin} disabled={joining} activeOpacity={0.8}>
            {joining ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={s.joinBtnText}>Entrar</Text>}
          </TouchableOpacity>
        )}
        {myRole === 'pending' && (
          <View style={[s.joinBtn, s.pendingBtn]}>
            <Text style={s.joinBtnText}>Pendente</Text>
          </View>
        )}
        {myRole === 'member' && (
          <TouchableOpacity style={[s.joinBtn, s.leaveBtn]} onPress={handleLeave} activeOpacity={0.8}>
            <Text style={s.joinBtnText}>Sair</Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => Alert.alert(group?.name || 'Grupo', 'Ações do administrador', [
              { text: 'Editar grupo', onPress: handleEditGroup },
              { text: 'Excluir grupo', style: 'destructive', onPress: handleDeleteGroup },
              { text: 'Cancelar', style: 'cancel' },
            ])}
          >
            <MaterialIcons name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {isMod && pendingReqs.length > 0 && (
          <View style={s.pendingBadge}><Text style={s.pendingBadgeText}>{pendingReqs.length}</Text></View>
        )}
      </View>

      <View style={s.tabs}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]} onPress={() => setTab(t.key)} activeOpacity={0.7}>
            <MaterialIcons name={t.icon} size={16} color={tab === t.key ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText} />
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'posts' && renderPosts()}
      {tab === 'chat' && renderChat()}
      {tab === 'membros' && renderMembers()}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 130, zIndex: 0 },
  header: { height: 130, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, zIndex: 1, gap: 10 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  groupIconText: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginTop: 2 },
  joinBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', minWidth: 68, alignItems: 'center' },
  leaveBtn: { backgroundColor: 'rgba(255,80,80,0.35)', borderColor: 'rgba(255,150,150,0.5)' },
  pendingBtn: { backgroundColor: 'rgba(245,158,11,0.35)', borderColor: 'rgba(253,211,77,0.5)' },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  pendingBadge: { position: 'absolute', top: STATUS_BAR_HEIGHT + 4, right: 12, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  pendingBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  tabs: { flexDirection: 'row', backgroundColor: AppTheme.colors.cardBackground, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 3 },
  tabActive: { borderBottomColor: AppTheme.colors.tertiary },
  tabText: { fontFamily: AppTheme.fonts.labelSmall.fontFamily, fontSize: 10, color: AppTheme.colors.placeholderText, fontWeight: '500' },
  tabTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },

  // Chat
  chatList: { paddingHorizontal: 12, paddingVertical: 10 },
  chatRow: { flexDirection: 'row', marginVertical: 2, alignItems: 'flex-end', gap: 6 },
  chatRowSent: { justifyContent: 'flex-end' },
  chatRowReceived: { justifyContent: 'flex-start' },
  chatAvatarSlot: { width: 30, alignItems: 'center', justifyContent: 'flex-end' },
  chatSenderName: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 2, marginLeft: 4 },
  chatInputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: AppTheme.colors.cardBackground, borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chatInput: { flex: 1, backgroundColor: AppTheme.colors.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: AppTheme.fonts.bodyMedium.fontSize, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, color: AppTheme.colors.textColor, maxHeight: 100, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  chatSendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppTheme.colors.tertiary, alignItems: 'center', justifyContent: 'center' },
  emptyChat: { color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, fontSize: 15 },

  // Members
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginVertical: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: AppTheme.colors.cardBackground, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  pendingRow: { borderColor: '#fde68a', backgroundColor: '#fffbeb' },
  memberName: { fontFamily: AppTheme.fonts.bodyMedium.fontFamily, fontSize: AppTheme.fonts.bodyMedium.fontSize, fontWeight: '600', color: AppTheme.colors.nameText },
  memberSince: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginTop: 2 },
  onlineIndicator: { width: 8, height: 8, borderRadius: 4 },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  approveBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
});
