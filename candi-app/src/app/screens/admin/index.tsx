import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import { getSuspendedPosts, getBannedUsers, approvePost, removePost, unbanUser } from '@/services/adminService';
import { useToast } from '@/context/NotificationContext';
import { formatRelativeDate } from '@/utils/dateFormat';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<'posts' | 'users'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([getSuspendedPosts(), getBannedUsers()]);
      setPosts(p);
      setUsers(u);
    } catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleApprove = async (postId: string) => {
    try {
      await approvePost(postId);
      setPosts(prev => prev.filter(p => p.post_id !== postId));
      toast.success('Publicação restaurada e aprovada.');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRemove = async (postId: string) => {
    try {
      const res = await removePost(postId);
      setPosts(prev => prev.filter(p => p.post_id !== postId));
      if (res.author_banned) toast.warning(`Usuário banido (${res.banned_posts_count} posts removidos).`);
      else toast.success('Publicação removida.');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      setUsers(prev => prev.filter(u => u.profile_id !== userId));
      toast.success('Usuário desbanido.');
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.header}>
        <View style={s.headerBg}><LoginSignupBackground /></View>
        <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Painel Admin</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={s.badge}><Text style={s.badgeText}>{posts.length}</Text></View>
            <MaterialIcons name="shield" size={22} color="#fff" />
          </View>
        </View>
        {/* Tabs */}
        <View style={s.tabs}>
          {(['posts', 'users'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)} activeOpacity={0.7}>
              <MaterialIcons
                name={t === 'posts' ? 'flag' : 'block'}
                size={16}
                color={tab === t ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t === 'posts' ? `Posts suspensos (${posts.length})` : `Banidos (${users.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
      ) : (
        <ScrollView
          style={s.body}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={AppTheme.colors.tertiary} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        >
          {tab === 'posts' && (
            posts.length === 0 ? (
              <View style={s.empty}>
                <MaterialIcons name="check-circle" size={48} color={AppTheme.colors.secondary} />
                <Text style={s.emptyText}>Nenhum post suspenso</Text>
              </View>
            ) : posts.map(p => (
              <View key={p.post_id} style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.cardAuthor}>{p.profile_name || 'Usuário'}</Text>
                  <Text style={s.cardTime}>{formatRelativeDate(p.created_at)}</Text>
                </View>
                <Text style={s.cardContent} numberOfLines={4}>{p.content}</Text>
                <View style={s.cardMeta}>
                  <MaterialIcons name="flag" size={14} color="#ef4444" />
                  <Text style={s.cardMetaText}>{p.report_count || 3} denúncias</Text>
                </View>
                <View style={s.actions}>
                  <TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(p.post_id)} activeOpacity={0.8}>
                    <MaterialIcons name="check" size={16} color="#10b981" />
                    <Text style={[s.actionText, { color: '#10b981' }]}>Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.removeBtn} onPress={() => handleRemove(p.post_id)} activeOpacity={0.8}>
                    <MaterialIcons name="delete-outline" size={16} color="#ef4444" />
                    <Text style={[s.actionText, { color: '#ef4444' }]}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {tab === 'users' && (
            users.length === 0 ? (
              <View style={s.empty}>
                <MaterialIcons name="people" size={48} color={AppTheme.colors.secondary} />
                <Text style={s.emptyText}>Nenhum usuário banido</Text>
              </View>
            ) : users.map(u => (
              <View key={u.profile_id} style={s.card}>
                <Text style={s.cardAuthor}>{u.profile_name}</Text>
                <Text style={s.cardContent}>{u.profile_email}</Text>
                <View style={s.cardMeta}>
                  <MaterialIcons name="block" size={14} color="#ef4444" />
                  <Text style={s.cardMetaText}>{u.banned_posts_count} posts removidos · Banido em {formatRelativeDate(u.banned_at)}</Text>
                </View>
                <TouchableOpacity style={s.approveBtn} onPress={() => handleUnban(u.profile_id)} activeOpacity={0.8}>
                  <MaterialIcons name="person-add" size={16} color="#10b981" />
                  <Text style={[s.actionText, { color: '#10b981' }]}>Desbanir</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 8, zIndex: 1,
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  badge: {
    backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8, zIndex: 1 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  body: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAuthor: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  cardTime: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  cardContent: { fontSize: 13, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodySmall.fontFamily, lineHeight: 19 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: '#ef4444', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  actions: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#6ee7b7',
  },
  removeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5',
  },
  actionText: { fontSize: 13, fontWeight: '700', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
});
