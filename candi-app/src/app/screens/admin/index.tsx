import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Platform, StatusBar, ActivityIndicator,
  TextInput, Alert, Modal, Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import {
  getAdminStats, getSuspendedPosts, getBannedUsers, getAdmins,
  approvePost, removePost, unbanUser, createAdmin, deleteAdmin,
  updateMyCredentials,
} from '@/services/adminService';
import { useToast } from '@/context/NotificationContext';
import { useProfile } from '@/context/ProfileContext';

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

  // Data
  const [stats, setStats] = useState({ suspended_posts: 0, banned_users: 0, total_reports: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  // Create admin modal
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Expanded post (to show reports)
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [s, p, u, a] = await Promise.all([
        getAdminStats(),
        getSuspendedPosts(),
        getBannedUsers(),
        getAdmins(),
      ]);
      setStats(s);
      setPosts(p);
      setUsers(u);
      setAdmins(a);
    } catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadAll(); }, []);

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  // ── Actions ─────────────────────────────────────────────────────────────

  const handleApprove = async (postId: string) => {
    try {
      await approvePost(postId);
      setPosts(p => p.filter(x => x.post_id !== postId));
      setStats(s => ({ ...s, suspended_posts: Math.max(0, s.suspended_posts - 1) }));
      toast.success('Publicação restaurada e aprovada.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemove = async (postId: string) => {
    try {
      const res = await removePost(postId);
      setPosts(p => p.filter(x => x.post_id !== postId));
      setStats(s => ({ ...s, suspended_posts: Math.max(0, s.suspended_posts - 1) }));
      if (res.author_banned) { toast.warning('Usuário banido automaticamente (3 posts removidos).'); loadAll(); }
      else toast.success('Publicação removida permanentemente.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      setUsers(u => u.filter(x => x.profile_id !== userId));
      setStats(s => ({ ...s, banned_users: Math.max(0, s.banned_users - 1) }));
      toast.success('Usuário desbanido com sucesso.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPwd) { toast.error('Preencha todos os campos.'); return; }
    setCreatingAdmin(true);
    try {
      await createAdmin({ name: newAdminName, email: newAdminEmail, password: newAdminPwd });
      toast.success(`Admin "${newAdminName}" criado.`);
      setShowCreateAdmin(false);
      setNewAdminName(''); setNewAdminEmail(''); setNewAdminPwd('');
      loadAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setCreatingAdmin(false); }
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    Alert.alert('Excluir admin', `Excluir a conta de "${adminName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await deleteAdmin(adminId);
          setAdmins(a => a.filter(x => x.profile_id !== adminId));
          toast.success(`Admin "${adminName}" excluído.`);
        } catch (e: any) { toast.error(e.message); }
      }},
    ]);
  };

  const handleSaveCreds = async () => {
    if (!currentPwd) { toast.error('Informe a senha atual.'); return; }
    if (!newEmail && !newPwd) { toast.error('Informe o novo e-mail ou senha.'); return; }
    setSavingCreds(true);
    try {
      await updateMyCredentials({ email: newEmail || undefined, password: newPwd || undefined, current_password: currentPwd });
      toast.success('Credenciais atualizadas!');
      setCurrentPwd(''); setNewEmail(''); setNewPwd('');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingCreds(false); }
  };

  // ── Tabs config ───────────────────────────────────────────────────────────

  const TABS: { key: Tab; icon: any; label: string; badge?: number }[] = [
    { key: 'dashboard', icon: 'dashboard', label: 'Início' },
    { key: 'reports', icon: 'flag', label: 'Denúncias', badge: posts.length },
    { key: 'users', icon: 'block', label: 'Banidos', badge: users.length },
    { key: 'admins', icon: 'manage-accounts', label: 'Admins' },
    { key: 'settings', icon: 'settings', label: 'Config' },
  ];

  // ── Render sections ───────────────────────────────────────────────────────

  const renderDashboard = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />}
      contentContainerStyle={s.scrollContent}>
      <Text style={s.greeting}>Olá, {profileName} 👋</Text>
      <Text style={s.greetingSub}>Painel de administração CANDI</Text>

      <View style={s.statsRow}>
        {[
          { label: 'Posts suspensos', value: stats.suspended_posts, icon: 'flag', color: '#f59e0b' },
          { label: 'Usuários banidos', value: stats.banned_users, icon: 'block', color: '#ef4444' },
          { label: 'Total denúncias', value: stats.total_reports, icon: 'report', color: AppTheme.colors.tertiary },
        ].map(card => (
          <View key={card.label} style={s.statCard}>
            <View style={[s.statIcon, { backgroundColor: card.color + '20' }]}>
              <MaterialIcons name={card.icon as any} size={22} color={card.color} />
            </View>
            <Text style={s.statValue}>{card.value}</Text>
            <Text style={s.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {posts.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Aguardando revisão</Text>
          <Text style={s.sectionSub}>{posts.length} post{posts.length !== 1 ? 's' : ''} com 3+ denúncias</Text>
          <TouchableOpacity style={s.quickAction} onPress={() => setTab('reports')} activeOpacity={0.8}>
            <MaterialIcons name="flag" size={18} color="#fff" />
            <Text style={s.quickActionText}>Ver posts suspensos</Text>
            <MaterialIcons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      )}

      {users.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Usuários banidos</Text>
          <Text style={s.sectionSub}>{users.length} conta{users.length !== 1 ? 's' : ''} suspensa{users.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity style={[s.quickAction, { backgroundColor: '#ef4444' }]} onPress={() => setTab('users')} activeOpacity={0.8}>
            <MaterialIcons name="block" size={18} color="#fff" />
            <Text style={s.quickActionText}>Gerenciar usuários banidos</Text>
            <MaterialIcons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      )}

      {posts.length === 0 && users.length === 0 && (
        <View style={s.allClear}>
          <MaterialIcons name="check-circle" size={56} color="#10b981" />
          <Text style={s.allClearTitle}>Tudo em ordem!</Text>
          <Text style={s.allClearSub}>Nenhum post suspenso ou usuário banido.</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />}
      contentContainerStyle={s.scrollContent}>
      {posts.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="check-circle" size={52} color="#10b981" />
          <Text style={s.emptyTitle}>Nenhum post suspenso</Text>
          <Text style={s.emptySub}>Todos os posts estão ok.</Text>
        </View>
      ) : posts.map(p => (
        <View key={p.post_id} style={s.card}>
          <View style={s.cardTopRow}>
            <View style={s.authorWrap}>
              <MaterialIcons name="person" size={16} color={AppTheme.colors.placeholderText} />
              <Text style={s.cardAuthor}>{p.profile_name || 'Usuário'}</Text>
            </View>
            <View style={s.reportBadge}>
              <MaterialIcons name="flag" size={13} color="#ef4444" />
              <Text style={s.reportBadgeText}>{p.reports?.length || p.report_count || 0} denúncias</Text>
            </View>
          </View>

          <Text style={s.cardContent}>{p.content}</Text>
          {p.file_url && <Text style={s.cardMedia}>📷 Tem imagem/mídia</Text>}

          {/* Motivos das denúncias */}
          <TouchableOpacity onPress={() => setExpandedPost(expandedPost === p.post_id ? null : p.post_id)} style={s.reportToggle} activeOpacity={0.7}>
            <MaterialIcons name={expandedPost === p.post_id ? 'expand-less' : 'expand-more'} size={18} color={AppTheme.colors.placeholderText} />
            <Text style={s.reportToggleText}>Ver motivos das denúncias</Text>
          </TouchableOpacity>

          {expandedPost === p.post_id && (p.reports || []).map((r: any, i: number) => (
            <View key={i} style={s.reportItem}>
              <MaterialIcons name="flag" size={14} color="#f59e0b" />
              <Text style={s.reportReason}>{REASON_LABELS[r.reason] || r.reason}</Text>
            </View>
          ))}

          <View style={s.cardActions}>
            <TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(p.post_id)} activeOpacity={0.8}>
              <MaterialIcons name="check" size={16} color="#10b981" />
              <Text style={[s.actionBtnText, { color: '#10b981' }]}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.removeBtn} onPress={() => handleRemove(p.post_id)} activeOpacity={0.8}>
              <MaterialIcons name="delete-outline" size={16} color="#ef4444" />
              <Text style={[s.actionBtnText, { color: '#ef4444' }]}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />}
      contentContainerStyle={s.scrollContent}>
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
            <View style={[s.reportBadge, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
              <MaterialIcons name="block" size={13} color="#ef4444" />
              <Text style={[s.reportBadgeText, { color: '#ef4444' }]}>Banido</Text>
            </View>
          </View>
          <Text style={s.cardMeta}>{u.profile_email}</Text>
          <Text style={s.cardMeta}>{u.banned_posts_count} posts removidos · Banido em {u.banned_at ? new Date(u.banned_at).toLocaleDateString('pt-BR') : '-'}</Text>
          <TouchableOpacity style={s.approveBtn} onPress={() => handleUnban(u.profile_id)} activeOpacity={0.8}>
            <MaterialIcons name="person-add" size={16} color="#10b981" />
            <Text style={[s.actionBtnText, { color: '#10b981' }]}>Desbanir</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderAdmins = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.tertiary} />}
      contentContainerStyle={s.scrollContent}>
      <TouchableOpacity style={s.addAdminBtn} onPress={() => setShowCreateAdmin(true)} activeOpacity={0.85}>
        <MaterialIcons name="person-add" size={18} color="#fff" />
        <Text style={s.addAdminBtnText}>Criar novo admin</Text>
      </TouchableOpacity>

      {admins.map(a => (
        <View key={a.profile_id} style={s.card}>
          <View style={s.cardTopRow}>
            <View style={s.authorWrap}>
              <MaterialIcons name="shield" size={16} color={AppTheme.colors.tertiary} />
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
        <Text style={s.settingsTitle}>Alterar credenciais</Text>
        <Text style={s.settingsLabel}>Senha atual *</Text>
        <TextInput style={s.input} value={currentPwd} onChangeText={setCurrentPwd} secureTextEntry placeholder="Senha atual" placeholderTextColor={AppTheme.colors.placeholderText} />
        <Text style={s.settingsLabel}>Novo e-mail (opcional)</Text>
        <TextInput style={s.input} value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" placeholder="novo@email.com" placeholderTextColor={AppTheme.colors.placeholderText} />
        <Text style={s.settingsLabel}>Nova senha (opcional)</Text>
        <TextInput style={s.input} value={newPwd} onChangeText={setNewPwd} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor={AppTheme.colors.placeholderText} />
        <TouchableOpacity
          style={[s.saveBtn, savingCreds && { opacity: 0.6 }]}
          onPress={handleSaveCreds}
          disabled={savingCreds}
          activeOpacity={0.85}
        >
          {savingCreds ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <MaterialIcons name="save" size={18} color="#fff" />
              <Text style={s.saveBtnText}>Salvar alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (loading) return <View style={s.loadingScreen}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerBg}><LoginSignupBackground /></View>
        <View style={[s.headerRow, { paddingTop: TOP + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>Painel Admin</Text>
            <Text style={s.headerSub}>{TABS.find(t => t.key === tab)?.label}</Text>
          </View>
          {stats.suspended_posts + stats.banned_users > 0 && (
            <View style={s.alertBadge}>
              <Text style={s.alertBadgeText}>{stats.suspended_posts + stats.banned_users}</Text>
            </View>
          )}
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

      {/* Bottom tab bar */}
      <View style={s.bottomTabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={s.bottomTab} onPress={() => setTab(t.key)} activeOpacity={0.7}>
            <View style={{ position: 'relative' }}>
              <MaterialIcons name={t.icon} size={24} color={tab === t.key ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText} />
              {t.badge && t.badge > 0 ? (
                <View style={s.tabBadge}><Text style={s.tabBadgeText}>{t.badge > 99 ? '99+' : t.badge}</Text></View>
              ) : null}
            </View>
            <Text style={[s.bottomTabText, tab === t.key && s.bottomTabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal: criar admin */}
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
            <Text style={s.settingsLabel}>Nome</Text>
            <TextInput style={s.input} value={newAdminName} onChangeText={setNewAdminName} placeholder="Nome do admin" placeholderTextColor={AppTheme.colors.placeholderText} />
            <Text style={s.settingsLabel}>E-mail</Text>
            <TextInput style={s.input} value={newAdminEmail} onChangeText={setNewAdminEmail} keyboardType="email-address" autoCapitalize="none" placeholder="admin@email.com" placeholderTextColor={AppTheme.colors.placeholderText} />
            <Text style={s.settingsLabel}>Senha</Text>
            <TextInput style={s.input} value={newAdminPwd} onChangeText={setNewAdminPwd} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor={AppTheme.colors.placeholderText} />
            <TouchableOpacity style={[s.saveBtn, creatingAdmin && { opacity: 0.6 }]} onPress={handleCreateAdmin} disabled={creatingAdmin} activeOpacity={0.85}>
              {creatingAdmin ? <ActivityIndicator color="#fff" size="small" /> : (
                <><MaterialIcons name="person-add" size={18} color="#fff" /><Text style={s.saveBtnText}>Criar admin</Text></>
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
  header: { position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginTop: 1 },
  alertBadge: { backgroundColor: '#ef4444', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  alertBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20, gap: 12 },

  // Dashboard
  greeting: { fontSize: 22, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  greetingSub: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14, padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: 24, fontWeight: '800', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  statLabel: { fontSize: 10, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, textAlign: 'center' },
  section: { gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  sectionSub: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  quickAction: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, padding: 14,
  },
  quickActionText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  allClear: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  allClearTitle: { fontSize: 18, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  allClearSub: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  // Posts/Users/Admins cards
  card: {
    backgroundColor: AppTheme.colors.cardBackground, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  authorWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  cardAuthor: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  cardContent: { fontSize: 13.5, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, lineHeight: 19 },
  cardMeta: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  cardMedia: { fontSize: 12, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  reportBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#fecaca',
  },
  reportBadgeText: { fontSize: 11, fontWeight: '700', color: '#ef4444', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  reportToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  reportToggleText: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  reportItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 },
  reportReason: { fontSize: 12, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  cardActions: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 10, borderRadius: 10, backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#6ee7b7',
  },
  removeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 10, borderRadius: 10, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5',
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  superBadge: { backgroundColor: AppTheme.colors.tertiary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  superBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', fontFamily: AppTheme.fonts.labelSmall.fontFamily, letterSpacing: 0.5 },
  addAdminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 13,
  },
  addAdminBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },

  // Settings
  settingsTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginBottom: 4 },
  settingsLabel: { fontSize: 11.5, color: AppTheme.colors.placeholderText, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 8 },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 13, marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },

  // Bottom tabs
  bottomTabs: {
    flexDirection: 'row', backgroundColor: AppTheme.colors.cardBackground,
    borderTopWidth: 1, borderTopColor: AppTheme.colors.dotsColor,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 8,
  },
  bottomTab: { flex: 1, alignItems: 'center', gap: 3 },
  bottomTabText: { fontSize: 10, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  bottomTabTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },
  tabBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Empty states
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: AppTheme.colors.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: AppTheme.colors.dotsColor, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor },
  modalTitle: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
});
