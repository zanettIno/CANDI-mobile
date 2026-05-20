import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Platform, StatusBar,
  FlatList, TextInput, KeyboardAvoidingView, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Socket } from 'socket.io-client';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import BackIconButton from '@/components/BackIconButton';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
import { MessageBubble } from '@/components/Bubble/messageBubble';
import { MessageInput } from '@/components/Inputs/inputMessage';
import {
  getGroup, getGroupMembers, getGroupPosts,
  joinGroup, leaveGroup, updateGroup, deleteGroup,
  getUserLikedPosts, getMyFavorites,
  getMyMemberStatus, getPendingRequests, handleJoinRequest,
  removeMember, updateMemberRole, deleteGroupPost, uploadGroupImage,
} from '@/services/communityService';
import GroupEditModal from '@/components/Modals/GroupEditModal';
import ActionSheet, { ActionSheetOption } from '@/components/ActionSheet';
import { getMessages, sendMessage as sendChatMessage } from '@/services/chatService';
import { initializeSocket } from '@/services/socketService';
// @ts-ignore – authService is a JS file without type declarations
import { getValidAccessToken } from '@/services/authService';
import { useProfile } from '@/context/ProfileContext';
import { useChat } from '@/context/ChatContext';
import { useNotification, useToast } from '@/context/NotificationContext';
import { formatTime, formatRelativeDate } from '@/utils/dateFormat';
import { API_BASE_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';
const profilePicUri = (id?: string | null) => id ? `${S3_BASE}/${id}.jpg` : undefined;
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
  const { setActiveConversationId } = useChat();
  const { showNotification } = useNotification();
  const toast = useToast();

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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [actionSheet, setActionSheet] = useState<{ visible: boolean; title?: string; options: ActionSheetOption[] }>({ visible: false, options: [] });

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatText, setChatText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  // Grupos não têm read receipts — status simples de entrega (sem flags de leitura)
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
      if (postsData.status === 'fulfilled') {
        const raw = postsData.value as any;
        setPosts(Array.isArray(raw) ? raw : (raw?.items ?? []));
      }
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

  // Marca conversa de grupo como ativa quando no tab chat
  useEffect(() => {
    if (tab === 'chat' && isMember) {
      setActiveConversationId(convId);
    } else {
      setActiveConversationId(null);
    }
    return () => setActiveConversationId(null);
  }, [tab, isMember, convId]);

  // ── Kick WebSocket — escuta remoção do grupo em tempo real ───────────────────
  useEffect(() => {
    if (!groupId) return;
    let mounted = true;
    let kickCleanup: (() => void) | undefined;

    const setupKickListener = async () => {
      try {
        const socket = await initializeSocket();
        if (!mounted) return;

        const handleKicked = (data: { group_id: string }) => {
          if (!mounted || data.group_id !== groupId) return;
          // Navega de volta para a comunidade e mostra notificação banner
          router.replace('/screens/(tabs)/homeCommunity');
          setTimeout(() => {
            showNotification({
              title: 'Removido do grupo',
              message: 'Você foi removido deste grupo pelo administrador.',
              type: 'warning',
              duration: 6000,
            });
          }, 300); // aguarda a navegação completar
        };

        socket.on('kicked_from_group', handleKicked);
        kickCleanup = () => socket.off('kicked_from_group', handleKicked);
      } catch {}
    };

    setupKickListener().then(fn => { kickCleanup = fn ?? kickCleanup; });

    return () => {
      mounted = false;
      kickCleanup?.();
    };
  }, [groupId]);

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

      try {
        const socket = await initializeSocket();
        socketRef.current = socket;
        setIsConnected(socket.connected);

        const handleNewMessage = (msg: ChatMessage) => {
          if (!mounted) return;
          // FILTRO CRÍTICO: só processa mensagens deste grupo
          if (msg.conversation_id !== convId) return;
          setChatMessages(prev => {
            if (prev.some(m => m.timestamp === msg.timestamp)) return prev;
            return [msg, ...prev];
          });
        };

        const handleOnlineUsers = (data: { online: string[] }) => {
          if (!mounted) return;
          setOnlineUsers(new Set(data.online));
        };

        const handleUserOnline = (data: { profile_id: string }) => {
          if (!mounted) return;
          setOnlineUsers(prev => new Set([...prev, data.profile_id]));
        };

        const handleUserOffline = (data: { profile_id: string }) => {
          if (!mounted) return;
          setOnlineUsers(prev => {
            const n = new Set(prev);
            n.delete(data.profile_id);
            return n;
          });
        };

        socket.on('new_message', handleNewMessage);
        socket.on('online_users', handleOnlineUsers);
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);

        if (socket.connected) {
          socket.emit('join_conversation', { conversationId: convId });
        } else {
          socket.once('connect', () => {
            socket.emit('join_conversation', { conversationId: convId });
          });
        }

        return () => {
          socket.off('new_message', handleNewMessage);
          socket.off('online_users', handleOnlineUsers);
          socket.off('user_online', handleUserOnline);
          socket.off('user_offline', handleUserOffline);
          socket.emit('leave_conversation', { conversationId: convId });
        };
      } catch (error) {
        console.error('[Socket] Erro ao inicializar:', error);
        if (mounted) Alert.alert('Erro', 'Falha ao conectar ao chat.');
      }
    };

    let socketCleanup: (() => void) | undefined;
    initChat().then(fn => { socketCleanup = fn; });

    return () => {
      mounted = false;
      socketCleanup?.(); // remove os listeners do socket corretamente
    };
  }, [tab, isMember, currentUserId]);

  const handleSendChat = useCallback(async () => {
    if (!chatText.trim()) return;
    const text = chatText.trim();
    setChatText('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { conversationId: convId, messageContent: text });
    } else {
      try {
        const real = await sendChatMessage(convId, text);
        setChatMessages(prev => [real, ...prev]);
      } catch {
        setChatText(text);
      }
    }
  }, [chatText, convId]);

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
      if (newRole === 'pending') {
        toast.info('Solicitação enviada! Aguarde a aprovação do administrador.', 'Solicitação');
      } else {
        toast.success('Você entrou no grupo!', 'Bem-vindo!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível entrar no grupo.');
    } finally { setJoining(false); }
  };

  const handleLeave = () => {
    showSheet('Sair do grupo', [
      { label: 'Confirmar saída', icon: 'logout', destructive: true, onPress: async () => {
        try {
          await leaveGroup(groupId!);
          setMyRole('none');
          setGroup((g: any) => g ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g);
          toast.info('Você saiu do grupo.');
        } catch (err: any) { toast.error(err.message || 'Não foi possível sair.'); }
      }},
    ]);
  };

  const handleApprove = async (m: Member) => {
    try {
      await handleJoinRequest(groupId!, m.profile_id, 'approve');
      setPendingReqs(prev => prev.filter(r => r.profile_id !== m.profile_id));
      setGroup((g: any) => g ? { ...g, member_count: (g.member_count || 0) + 1 } : g);
      loadMembers();
      toast.success(`${m.member_name} aprovado!`);
    } catch (err: any) { toast.error(err.message || 'Não foi possível aprovar.'); }
  };

  const handleReject = async (m: Member) => {
    try {
      await handleJoinRequest(groupId!, m.profile_id, 'reject');
      setPendingReqs(prev => prev.filter(r => r.profile_id !== m.profile_id));
      toast.info('Solicitação recusada.');
    } catch (err: any) { toast.error(err.message || 'Não foi possível recusar.'); }
  };

  const handleRemoveMember = (m: Member) => {
    showSheet(`Remover ${m.member_name}?`, [
      { label: 'Confirmar remoção', icon: 'person-remove', destructive: true, onPress: async () => {
        try {
          await removeMember(groupId!, m.profile_id);
          setMembers(prev => prev.filter(x => x.profile_id !== m.profile_id));
          setGroup((g: any) => g ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g);
          toast.success(`${m.member_name} removido do grupo.`);
        } catch (err: any) { toast.error(err.message || 'Não foi possível remover.'); }
      }},
    ]);
  };

  const handleRoleUpdate = (m: Member) => {
    if (!isAdmin) return;
    const isCoLeader = m.role === 'co-leader';
    showSheet(m.member_name, [
      {
        label: isCoLeader ? 'Rebaixar para membro' : 'Nomear co-líder',
        icon: isCoLeader ? 'person' : 'star',
        onPress: async () => {
          try {
            await updateMemberRole(groupId!, m.profile_id, isCoLeader ? 'member' : 'co-leader');
            setMembers(prev => prev.map(x =>
              x.profile_id === m.profile_id ? { ...x, role: isCoLeader ? 'member' : 'co-leader' } : x
            ));
            toast.success(isCoLeader ? 'Papel atualizado para membro.' : `${m.member_name} é co-líder!`);
          } catch (err: any) { toast.error(err.message || 'Não foi possível atualizar.'); }
        },
      },
    ]);
  };

  const showSheet = (title: string, options: ActionSheetOption[]) =>
    setActionSheet({ visible: true, title, options });

  const hideSheet = () => setActionSheet(prev => ({ ...prev, visible: false }));

  const handleEditGroup = () => {
    if (!isAdmin) return;
    setEditModalVisible(true);
  };

  const handleSaveGroupEdit = async (data: { name?: string; description?: string; topic?: string }) => {
    const updated = await updateGroup(groupId!, data);
    setGroup(updated);
    toast.success('Grupo atualizado com sucesso!');
  };

  const handleUploadGroupImage = async (
    file: { uri: string; name: string; type: string },
    type: 'photo' | 'banner',
  ) => {
    const updated = await uploadGroupImage(groupId!, file, type);
    setGroup(updated);
    toast.success(type === 'banner' ? 'Banner atualizado!' : 'Foto do grupo atualizada!');
  };

  const handleDeleteGroup = () => {
    showSheet(`Excluir "${group?.name || 'grupo'}"?`, [
      {
        label: 'Confirmar exclusão (irreversível)',
        icon: 'delete-forever',
        destructive: true,
        onPress: async () => {
          try {
            await deleteGroup(groupId!);
            router.back();
          } catch (err: any) { Alert.alert('Erro', err.message); }
        },
      },
    ]);
  };

  const handleDeletePost = (post: Post) => {
    showSheet('Remover publicação do grupo?', [
      {
        label: 'Confirmar remoção',
        icon: 'delete-outline',
        destructive: true,
        onPress: async () => {
          try {
            await deleteGroupPost(groupId!, post.post_id);
            setPosts(prev => prev.filter(p => p.post_id !== post.post_id));
          } catch (err: any) { Alert.alert('Erro', err.message); }
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
        <Avatar uri={profilePicUri(m.profile_id)} name={m.member_name} size={42} />
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
              const opts: ActionSheetOption[] = [];
              if (canPromote) opts.push({
                label: m.role === 'co-leader' ? 'Rebaixar para membro' : 'Nomear co-líder',
                icon: m.role === 'co-leader' ? 'person' : 'star',
                onPress: () => handleRoleUpdate(m),
              });
              if (canRemove) opts.push({
                label: 'Remover do grupo',
                icon: 'person-remove',
                destructive: true,
                onPress: () => handleRemoveMember(m),
              });
              showSheet(m.member_name, opts);
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
      <Avatar uri={profilePicUri(m.profile_id)} name={m.member_name} size={42} />
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

  const getDateLabel = (ts: string) => {
    try {
      const d = new Date(ts.split('#')[0]);
      const today = new Date(); const y = new Date(today); y.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Hoje';
      if (d.toDateString() === y.toDateString()) return 'Ontem';
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    } catch { return ''; }
  };

  const isSameDay = (ts1: string, ts2: string) => {
    try { return new Date(ts1.split('#')[0]).toDateString() === new Date(ts2.split('#')[0]).toDateString(); }
    catch { return true; }
  };

  const renderChatItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isSent = item.sender_id === currentUserId;
    const prev = chatMessages[index + 1]; // mais antiga (FlatList invertida)
    const next = chatMessages[index - 1]; // mais recente
    const isLastFromSender = !next || next.sender_id !== item.sender_id;
    const isFirstFromSender = !prev || prev.sender_id !== item.sender_id;
    const showDateSep = !prev || !isSameDay(item.timestamp, prev.timestamp);
    const tight = prev && prev.sender_id === item.sender_id;

    return (
      <>
        {showDateSep && (
          <View style={s.dateSep}>
            <View style={s.dateLine} />
            <Text style={s.dateLabel}>{getDateLabel(item.timestamp)}</Text>
            <View style={s.dateLine} />
          </View>
        )}
        <View style={[
          s.chatRow,
          isSent ? s.chatRowSent : s.chatRowReceived,
          tight ? { marginVertical: 1 } : { marginVertical: 3 },
        ]}>
          {!isSent && (
            <View style={s.chatAvatarSlot}>
              {isLastFromSender && (
                <Avatar uri={profilePicUri(item.sender_id)} name={item.sender_name} size={28} />
              )}
            </View>
          )}
          <View style={{ maxWidth: '80%' }}>
            {!isSent && isFirstFromSender && (
              <Text style={s.chatSenderName}>{item.sender_name}</Text>
            )}
            <MessageBubble
              message={item.message_content}
              time={formatTime(item.timestamp)}
              isSent={isSent}
              onPressSharedPost={(p) => router.push({ pathname: '/screens/community/postDetail', params: p })}
            />
          </View>
        </View>
      </>
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
              userHandle={p.profile_nickname || p.profile_name} timeAgo={p.created_at}
              content={p.content} fileUrl={p.file_url} profileId={p.profile_id}
              initialLikeCount={p.like_count || 0} initialCommentCount={p.comment_count || 0}
              initialLiked={likedPostIds.has(p.post_id)} initialFavorited={favoritedPostIds.has(p.post_id)}
              onLikeToggle={handleLikeToggle} onFavoriteToggle={handleFavoriteToggle}
              onAdminDelete={isMod && p.profile_id !== myProfileId ? () => handleDeletePost(p) : undefined}
              onDelete={(id) => setPosts(prev => prev.filter(x => x.post_id !== id))}
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
      <KeyboardAvoidingView style={s.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
        <MessageInput
          value={chatText}
          onChangeText={setChatText}
          onSend={handleSendChat}
          placeholder="Mensagem no grupo..."
        />
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
      {/* Fundo: banner do grupo ou gradiente padrão */}
      <View style={s.headerBg}>
        {group?.banner_url ? (
          <Image source={{ uri: group.banner_url }} style={s.bannerImg} resizeMode="cover" />
        ) : (
          <LoginSignupBackground />
        )}
        <View style={s.bannerOverlay} />
      </View>

      <View style={[s.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <BackIconButton color={AppTheme.colors.cardBackground} onPress={() => router.back()} top={0} />
        <View style={s.headerInfo}>
          {/* Foto do grupo ou inicial */}
          {group?.photo_url ? (
            <Image source={{ uri: group.photo_url }} style={s.groupPhoto} />
          ) : (
            <View style={s.groupIcon}>
              <Text style={s.groupIconText}>{(groupName || group?.name || '?')[0].toUpperCase()}</Text>
            </View>
          )}
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
            onPress={() => showSheet(group?.name || 'Grupo', [
              { label: 'Editar grupo', icon: 'edit', onPress: handleEditGroup },
              { label: 'Excluir grupo', icon: 'delete-outline', destructive: true, onPress: handleDeleteGroup },
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

      {isAdmin && (
        <GroupEditModal
          visible={editModalVisible}
          groupId={groupId!}
          initialName={group?.name || ''}
          initialDescription={group?.description || ''}
          initialTopic={group?.topic || 'GERAL'}
          initialPhotoUrl={group?.photo_url}
          initialBannerUrl={group?.banner_url}
          onDismiss={() => setEditModalVisible(false)}
          onSave={handleSaveGroupEdit}
          onUploadImage={handleUploadGroupImage}
        />
      )}

      <ActionSheet
        visible={actionSheet.visible}
        title={actionSheet.title}
        options={actionSheet.options}
        onDismiss={hideSheet}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 130, zIndex: 0 },
  header: { height: 130, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, zIndex: 1, gap: 10 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  groupPhoto: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
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
  chatContainer: { flex: 1, backgroundColor: '#efeae2' },
  chatList: { paddingHorizontal: 8, paddingVertical: 10 },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  chatRowSent: { justifyContent: 'flex-end' },
  chatRowReceived: { justifyContent: 'flex-start' },
  dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 4 },
  dateLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  dateLabel: {
    fontSize: 11.5, color: '#666', fontWeight: '600',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    paddingHorizontal: 10, backgroundColor: '#ddd8d0',
    borderRadius: 10, paddingVertical: 3,
  },
  chatAvatarSlot: { width: 30, alignItems: 'center', justifyContent: 'flex-end' },
  chatSenderName: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 2, marginLeft: 4 },
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
