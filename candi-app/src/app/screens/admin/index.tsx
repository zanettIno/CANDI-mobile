import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Platform, StatusBar, ActivityIndicator,
  TextInput, Alert, Modal, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import {
  getAdminStats, getAllReportedPosts, getBannedUsers, getAdmins,
  approvePost, removePost, unbanUser, createAdmin, deleteAdmin,
  updateMyCredentials,
} from '@/services/adminService';
import { useToast } from '@/context/NotificationContext';
import { useProfile } from '@/context/ProfileContext';
import { API_BASE_URL } from '@/constants/api';

const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

type Tab = 'dashboard' | 'reports' | 'users' | 'admins' | 'settings';

const REASON_LABELS: Record<string, string> = {
  inappropriate: 'Conteúdo inapropriado',
  spam: 'Spam',
  hate: 'Discurso de ódio',
  misinformation: 'Desinformação médica',
  other: 'Outro',
};

export default function AdminPanel() {
  const router = useRouter();
  const toast = useToast();
  const { profileId, profileName } = useProfile();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({ suspended_posts: 0, banned_users: 0, total_reports: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [s, p, u, a] = await Promise.all([
        getAdminStats(),
        getAllReportedPosts(), // todos com pelo menos 1 denúncia
        getBannedUsers(),
        getAdmins(),
      ]);
      setStats(s);
      setPosts(p);
      setUsers(u);
      setAdmins(a);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadAll(); }, []);
  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const handleApprove = async (postId: string) => {
    try {
      await approvePost(postId);
      setPosts(p => p.filter(x => x.post_id !== postId));
      toast.success('Publicação restaurada e aprovada.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemove = async (postId: string) => {
    try {
      const res = await removePost(postId);
      setPosts(p => p.filter(x => x.post_id !== postId));
      if (res.author_banned) { toast.warning('Usuário banido automaticamente.'); loadAll(); }
      else toast.success('Publicação removida.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      setUsers(u => u.filter(x => x.profile_id !== userId));
      toast.success('Usuário desbanido.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPwd) { toast.error('Preencha todos os campos.'); return; }
    setCreatingAdmin(true);
    try {
      await createAdmin({ name: newAdminName, email: newAdminEmail, password: newAdminPwd });
      toast.success(`Admin criado.`);
      setShowCreateAdmin(false);
      setNewAdminName(''); setNewAdminEmail(''); setNewAdminPwd('');
      loadAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setCreatingAdmin(false); }
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    Alert.alert('Excluir admin', `Excluir "${adminName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await deleteAdmin(adminId);
          setAdmins(a => a.filter(x => x.profile_id !== adminId));
          toast.success('Admin excluído.');
        } catch (e: any) { toast.error(e.message); }
      }},
    ]);
  };

  const handleSaveCreds = async () => {
    if (!currentPwd) { toast.error('Informe a senha atual.'); return; }
    if (!newEmail && !newPwd) { toast.error('Informe o novo e-mail ou nova senha.'); return; }
    setSavingCreds(true);
    try {
      await updateMyCredentials({ email: newEmail || undefined, password: newPwd || undefined, current_password: currentPwd });
      toast.success('Credenciais atualizadas!');
      setCurrentPwd(''); setNewEmail(''); setNewPwd('');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingCreds(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userRole']);
        router.replace('/');
      }},
    ]);
  };

  const TABS: { key: Tab; icon: any; label: string; badge?: number }[] = [
    { key: 'dashboard', icon: 'dashboard', label: 'Visão Geral' },
    { key: 'reports', icon: 'flag', label: 'Denúncias', badge: posts.length },
    { key: 'users', icon: 'block', label: 'Banidos', badge: users.length },
    { key: 'admins', icon: 'manage-accounts', label: 'Admins' },
    { key: 'settings', icon: 'settings', label: 'Conta' },
  ];

  // ── Renders ────────────────────────────────────────────────────────────────

  const renderDashboard = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />} contentContainerStyle={s.scrollContent}>

      <View style={s.statsGrid}>
        {[
          { label: 'Posts denunciados', value: posts.length, icon: 'flag', color: '#f59e0b', tab: 'reports' as Tab },
          { label: 'Usuários banidos', value: users.length, icon: 'block', color: '#ef4444', tab: 'users' as Tab },
          { label: 'Total denúncias', value: stats.total_reports, icon: 'report', color: AppTheme.colors.tertiary, tab: 'reports' as Tab },
        ].map(card => (
          <TouchableOpacity key={card.label} style={s.statCard} onPress={() => setTab(card.tab)} activeOpacity={0.8}>
            <View style={[s.statIcon, { backgroundColor: card.color + '18' }]}>
              <MaterialIcons name={card.icon as any} size={22} color={card.color} />
            </View>
            <Text style={s.statValue}>{card.value}</Text>
            <Text style={s.statLabel}>{card.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {posts.filter(p => p.reports?.length >= 3 && p.status === 'suspended').length > 0 && (
        <View style={s.alertCard}>
          <MaterialIcons name="warning" size={18} color="#f59e0b" />
          <Text style={s.alertText}>
            {posts.filter(p => p.reports?.length >= 3).length} post(s) com 3+ denúncias aguardando revisão
          </Text>
          <TouchableOpacity onPress={() => setTab('reports')}>
            <Text style={s.alertLink}>Ver</Text>
          </TouchableOpacity>
        </View>
      )}

      {posts.length === 0 && users.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="verified-user" size={56} color={AppTheme.colors.secondary} />
          <Text style={s.emptyTitle}>Comunidade saudável</Text>
          <Text style={s.emptySub}>Nenhuma denúncia ou banimento pendente.</Text>
        </View>
      ) : (
        <View style={s.quickList}>
          {posts.slice(0, 3).map(p => (
            <TouchableOpacity key={p.post_id} style={s.quickItem} onPress={() => setTab('reports')} activeOpacity={0.8}>
              <View style={[s.quickBadge, { backgroundColor: p.reports?.length >= 3 ? '#fee2e2' : '#fef9c3' }]}>
                <Text style={[s.quickBadgeNum, { color: p.reports?.length >= 3 ? '#ef4444' : '#d97706' }]}>
                  {p.reports?.length}
                </Text>
              </View>
              <Text style={s.quickItemText} numberOfLines={1}>{p.content}</Text>
              <MaterialIcons name="chevron-right" size={18} color={AppTheme.colors.placeholderText} />
            </TouchableOpacity>
          ))}
          {posts.length > 3 && (
            <TouchableOpacity onPress={() => setTab('reports')} style={s.viewMore}>
              <Text style={s.viewMoreText}>Ver todas as {posts.length} denúncias</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />} contentContainerStyle={s.scrollContent}>
      {posts.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="check-circle" size={52} color="#10b981" />
          <Text style={s.emptyTitle}>Nenhuma denúncia</Text>
          <Text style={s.emptySub}>Nenhum post foi denunciado ainda.</Text>
        </View>
      ) : posts.map(p => {
        const isSuspended = p.status === 'suspended';
        const reportCount = p.reports?.length || 0;
        const isExpanded = expandedPost === p.post_id;

        return (
          <View key={p.post_id} style={[s.postCard, isSuspended && s.postCardSuspended]}>

            {/* Banner suspenso */}
            {isSuspended && (
              <View style={s.suspendedBanner}>
                <MaterialIcons name="pause-circle" size={13} color="#ef4444" />
                <Text style={s.suspendedText}>Suspenso — oculto de todos os usuários</Text>
              </View>
            )}

            {/* Header do post — igual ao feed */}
            <View style={s.postHeader}>
              <View style={s.postAuthorWrap}>
                <View style={s.postAvatar}>
                  <Text style={s.postAvatarText}>
                    {(p.profile_name || 'U').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={s.postAuthorName}>{p.profile_name || 'Usuário'}</Text>
                  <Text style={s.postTime}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              </View>
              {/* Badge de denúncias */}
              <View style={[s.countBadge,
                reportCount >= 3 ? s.countBadgeHigh : reportCount >= 2 ? s.countBadgeMed : s.countBadgeLow
              ]}>
                <MaterialIcons name="flag" size={11}
                  color={reportCount >= 3 ? '#ef4444' : reportCount >= 2 ? '#f59e0b' : '#6b7280'} />
                <Text style={[s.countBadgeText,
                  { color: reportCount >= 3 ? '#ef4444' : reportCount >= 2 ? '#f59e0b' : '#6b7280' }
                ]}>
                  {reportCount} {reportCount === 1 ? 'denúncia' : 'denúncias'}
                </Text>
              </View>
            </View>

            {/* Conteúdo do post */}
            {p.content ? <Text style={s.postContent}>{p.content}</Text> : null}

            {/* Imagem do post — igual ao feed */}
            {p.file_url ? (
              <Image
                source={{ uri: p.file_url }}
                style={s.postImage}
                resizeMode="cover"
              />
            ) : null}

            {/* Motivos expandíveis */}
            <TouchableOpacity onPress={() => setExpandedPost(isExpanded ? null : p.post_id)} style={s.reasonToggle} activeOpacity={0.7}>
              <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={15} color={AppTheme.colors.placeholderText} />
              <Text style={s.reasonToggleText}>
                {isExpanded ? 'Ocultar motivos' : `Ver ${reportCount} motivo${reportCount !== 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={s.reasonList}>
                {(p.reports || []).map((r: any, i: number) => (
                  <View key={i} style={s.reasonItem}>
                    <View style={s.reasonDot} />
                    <Text style={s.reasonText}>{REASON_LABELS[r.reason] || r.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ações admin */}
            <View style={s.cardActions}>
              <TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(p.post_id)} activeOpacity={0.8}>
                <MaterialIcons name="check" size={15} color="#10b981" />
                <Text style={s.approveTxt}>Aprovar post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.removeBtn} onPress={() => handleRemove(p.post_id)} activeOpacity={0.8}>
                <MaterialIcons name="delete-outline" size={15} color="#ef4444" />
                <Text style={s.removeTxt}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />} contentContainerStyle={s.scrollContent}>
      {users.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="people" size={52} color="#10b981" />
          <Text style={s.emptyTitle}>Nenhum usuário banido</Text>
          <Text style={s.emptySub}>Todos os usuários estão ativos.</Text>
        </View>
      ) : users.map(u => (
        <View key={u.profile_id} style={s.card}>
          <View style={s.cardTopRow}>
            <Text style={s.cardAuthor}>{u.profile_name}</Text>
            <View style={s.bannedBadge}>
              <MaterialIcons name="block" size={12} color="#ef4444" />
              <Text style={s.bannedBadgeText}>Banido</Text>
            </View>
          </View>
          <Text style={s.cardMeta}>{u.profile_email}</Text>
          <Text style={s.cardMeta}>{u.banned_posts_count} posts removidos {u.banned_at ? `· ${new Date(u.banned_at).toLocaleDateString('pt-BR')}` : ''}</Text>
          <TouchableOpacity style={s.approveBtn} onPress={() => handleUnban(u.profile_id)} activeOpacity={0.8}>
            <MaterialIcons name="person-add" size={15} color="#10b981" />
            <Text style={s.approveTxt}>Desbanir</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderAdmins = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />} contentContainerStyle={s.scrollContent}>
      <TouchableOpacity style={s.createBtn} onPress={() => setShowCreateAdmin(true)} activeOpacity={0.85}>
        <MaterialIcons name="person-add" size={18} color="#fff" />
        <Text style={s.createBtnText}>Criar novo admin</Text>
      </TouchableOpacity>
      {admins.map(a => (
        <View key={a.profile_id} style={s.card}>
          <View style={s.cardTopRow}>
            <View style={s.authorWrap}>
              <MaterialIcons name="shield" size={15} color={AppTheme.colors.tertiary} />
              <Text style={s.cardAuthor}>{a.profile_name}</Text>
              {a.is_superadmin && <View style={s.superBadge}><Text style={s.superBadgeText}>SUPER</Text></View>}
            </View>
            {a.profile_id !== profileId && !a.is_superadmin && (
              <TouchableOpacity onPress={() => handleDeleteAdmin(a.profile_id, a.profile_name)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.cardMeta}>{a.profile_email}</Text>
          {a.created_at && <Text style={s.cardMeta}>Criado em {new Date(a.created_at).toLocaleDateString('pt-BR')}</Text>}
        </View>
      ))}
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView contentContainerStyle={s.scrollContent}>
      <View style={s.card}>
        <Text style={s.cardSectionTitle}>Alterar credenciais</Text>
        <Text style={s.fieldLabel}>Senha atual</Text>
        <TextInput style={s.input} value={currentPwd} onChangeText={setCurrentPwd} secureTextEntry placeholder="Senha atual" placeholderTextColor={AppTheme.colors.placeholderText} />
        <Text style={s.fieldLabel}>Novo e-mail (opcional)</Text>
        <TextInput style={s.input} value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" placeholder="novo@email.com" placeholderTextColor={AppTheme.colors.placeholderText} />
        <Text style={s.fieldLabel}>Nova senha (opcional)</Text>
        <TextInput style={s.input} value={newPwd} onChangeText={setNewPwd} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor={AppTheme.colors.placeholderText} />
        <TouchableOpacity style={[s.saveBtn, savingCreds && s.btnDisabled]} onPress={handleSaveCreds} disabled={savingCreds} activeOpacity={0.85}>
          {savingCreds ? <ActivityIndicator color="#fff" size="small" /> : (
            <><MaterialIcons name="save" size={17} color="#fff" /><Text style={s.saveBtnText}>Salvar alterações</Text></>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={17} color="#ef4444" />
        <Text style={s.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) return <View style={s.loadingScreen}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header sem back button — admin não tem para onde voltar */}
      <View style={[s.header, { paddingTop: TOP }]}>
        <View style={s.headerLeft}>
          <MaterialIcons name="shield" size={22} color={AppTheme.colors.tertiary} />
          <Text style={s.headerTitle}>Painel Admin</Text>
        </View>
        <View style={s.headerRight}>
          {(posts.length + users.length) > 0 && (
            <View style={s.headerBadge}>
              <Text style={s.headerBadgeText}>{posts.length + users.length}</Text>
            </View>
          )}
          <Text style={s.headerEmail}>CANDI</Text>
        </View>
      </View>

      {/* Content */}
      <View style={s.content}>
        {tab === 'dashboard' && renderDashboard()}
        {tab === 'reports' && renderReports()}
        {tab === 'users' && renderUsers()}
        {tab === 'admins' && renderAdmins()}
        {tab === 'settings' && renderSettings()}
      </View>

      {/* Bottom nav */}
      <View style={s.bottomNav}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={s.navItem} onPress={() => setTab(t.key)} activeOpacity={0.7}>
            <View style={s.navIconWrap}>
              <MaterialIcons name={t.icon} size={22} color={tab === t.key ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText} />
              {t.badge && t.badge > 0 ? (
                <View style={s.navBadge}><Text style={s.navBadgeText}>{t.badge > 99 ? '99+' : t.badge}</Text></View>
              ) : null}
            </View>
            <Text style={[s.navLabel, tab === t.key && s.navLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal criar admin */}
      <Modal visible={showCreateAdmin} transparent animationType="slide" onRequestClose={() => setShowCreateAdmin(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Criar novo admin</Text>
              <TouchableOpacity onPress={() => setShowCreateAdmin(false)}>
                <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>Nome</Text>
            <TextInput style={s.input} value={newAdminName} onChangeText={setNewAdminName} placeholder="Nome do admin" placeholderTextColor={AppTheme.colors.placeholderText} />
            <Text style={s.fieldLabel}>E-mail</Text>
            <TextInput style={s.input} value={newAdminEmail} onChangeText={setNewAdminEmail} keyboardType="email-address" autoCapitalize="none" placeholder="admin@email.com" placeholderTextColor={AppTheme.colors.placeholderText} />
            <Text style={s.fieldLabel}>Senha</Text>
            <TextInput style={s.input} value={newAdminPwd} onChangeText={setNewAdminPwd} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor={AppTheme.colors.placeholderText} />
            <TouchableOpacity style={[s.saveBtn, creatingAdmin && s.btnDisabled]} onPress={handleCreateAdmin} disabled={creatingAdmin} activeOpacity={0.85}>
              {creatingAdmin ? <ActivityIndicator color="#fff" size="small" /> : (
                <><MaterialIcons name="person-add" size={17} color="#fff" /><Text style={s.saveBtnText}>Criar admin</Text></>
              )}
            </TouchableOpacity>
            <View style={{ height: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppTheme.colors.background },

  // Header limpo sem gradiente
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBadge: {
    backgroundColor: '#ef4444', borderRadius: 10, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  headerEmail: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 16, gap: 10 },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, backgroundColor: AppTheme.colors.cardBackground, borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  statIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  statLabel: { fontSize: 9.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, textAlign: 'center' },

  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fffbeb', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  alertText: { flex: 1, fontSize: 13, color: '#92400e', fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  alertLink: { fontSize: 13, fontWeight: '700', color: '#d97706', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  quickList: { gap: 6 },
  quickItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppTheme.colors.cardBackground, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  quickBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickBadgeNum: { fontSize: 13, fontWeight: '800', fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  quickItemText: { flex: 1, fontSize: 13, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  viewMore: { alignItems: 'center', paddingVertical: 8 },
  viewMoreText: { fontSize: 13, color: AppTheme.colors.tertiary, fontWeight: '600', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  // Post card — visual igual ao feed
  postCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    marginBottom: 0,
  },
  postCardSuspended: { borderColor: '#fecaca' },
  postHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, paddingBottom: 8,
  },
  postAuthorWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 14, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleSmall.fontFamily,
  },
  postAuthorName: {
    fontSize: 13.5, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  postTime: {
    fontSize: 11, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  postContent: {
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    lineHeight: 20, paddingHorizontal: 12, paddingBottom: 10,
  },
  postImage: {
    width: '100%', height: 200,
    backgroundColor: AppTheme.colors.background,
  },

  // Cards
  card: {
    backgroundColor: AppTheme.colors.cardBackground, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor, gap: 8,
  },
  cardSuspended: { borderColor: '#fecaca', backgroundColor: '#fff5f5' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  authorWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  cardAuthor: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  cardContent: { fontSize: 13.5, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, lineHeight: 19 },
  cardMeta: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  cardSectionTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },

  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  countBadgeHigh: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  countBadgeMed: { backgroundColor: '#fef9c3', borderColor: '#fde047' },
  countBadgeLow: { backgroundColor: AppTheme.colors.background, borderColor: AppTheme.colors.dotsColor },
  countBadgeText: { fontSize: 11, fontWeight: '700', fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  suspendedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  suspendedText: { fontSize: 11.5, color: '#dc2626', fontFamily: AppTheme.fonts.labelSmall.fontFamily, fontWeight: '600' },

  mediaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mediaText: { fontSize: 12, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  reasonToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
  },
  reasonToggleText: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  reasonList: { gap: 4, paddingLeft: 12, paddingBottom: 8 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reasonDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: AppTheme.colors.tertiary },
  reasonText: { fontSize: 12.5, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  bannedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#fca5a5' },
  bannedBadgeText: { fontSize: 11, fontWeight: '700', color: '#ef4444', fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  superBadge: { backgroundColor: AppTheme.colors.tertiary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  superBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', fontFamily: AppTheme.fonts.labelSmall.fontFamily, letterSpacing: 0.5 },

  cardActions: {
    flexDirection: 'row', gap: 8,
    padding: 12,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
  },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#6ee7b7' },
  removeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  approveTxt: { fontSize: 13, fontWeight: '700', color: '#10b981', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  removeTxt: { fontSize: 13, fontWeight: '700', color: '#ef4444', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 13 },
  createBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },

  // Settings
  fieldLabel: { fontSize: 11.5, color: AppTheme.colors.placeholderText, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 6 },
  input: { backgroundColor: AppTheme.colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 13, marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 13, backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#ef4444', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  // Bottom nav
  bottomNav: { flexDirection: 'row', backgroundColor: AppTheme.colors.cardBackground, borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor, paddingBottom: Platform.OS === 'ios' ? 20 : 6, paddingTop: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIconWrap: { position: 'relative' },
  navLabel: { fontSize: 9.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  navLabelActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },
  navBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 15, height: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  navBadgeText: { color: '#fff', fontSize: 8.5, fontWeight: '800' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: AppTheme.colors.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: AppTheme.colors.dotsColor, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor, marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
});
