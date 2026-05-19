import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import { createInvite, getMyInvites, getSupportNetwork } from '@/services/inviteService';
import { useToast } from '@/context/NotificationContext';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const PERMISSIONS = [
  { key: 'agenda', label: 'Agenda de consultas', icon: 'event' },
  { key: 'diary_read', label: 'Diário de saúde', icon: 'book' },
  { key: 'milestones', label: 'Marcos do tratamento', icon: 'flag' },
];

export default function InviteScreen() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({ agenda: true });
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadLists = useCallback(async () => {
    try {
      const [inv, net] = await Promise.all([getMyInvites(), getSupportNetwork()]);
      setInvites(inv);
      setNetwork(net);
    } catch { /* silencioso */ }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { loadLists(); }, []);

  const togglePerm = (key: string) => setPermissions(p => ({ ...p, [key]: !p[key] }));

  const handleSend = async () => {
    if (!email.includes('@')) { toast.error('E-mail inválido.'); return; }
    const selectedPerms = Object.entries(permissions).filter(([, v]) => v).map(([k]) => k);
    if (!selectedPerms.length) { toast.error('Selecione ao menos uma permissão.'); return; }
    setSending(true);
    try {
      await createInvite({ email: email.trim(), permissions: selectedPerms });
      toast.success(`Convite enviado para ${email}!`, 'Convite enviado');
      setEmail('');
      setPermissions({ agenda: true });
      loadLists();
    } catch (err: any) { toast.error(err.message || 'Não foi possível enviar o convite.'); }
    finally { setSending(false); }
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
          <Text style={s.headerTitle}>Rede de Apoio</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={s.headerSub}>Convide pessoas para acompanhar sua jornada</Text>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>

        {/* Formulário de convite */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Enviar convite</Text>
          <Text style={s.label}>E-mail do convidado</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
            placeholderTextColor={AppTheme.colors.placeholderText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={s.label}>O que ele pode ver</Text>
          {PERMISSIONS.map(p => (
            <View key={p.key} style={s.permRow}>
              <MaterialIcons name={p.icon as any} size={20} color={AppTheme.colors.tertiary} />
              <Text style={s.permLabel}>{p.label}</Text>
              <Switch
                value={!!permissions[p.key]}
                onValueChange={() => togglePerm(p.key)}
                trackColor={{ false: AppTheme.colors.dotsColor, true: AppTheme.colors.secondary }}
                thumbColor={permissions[p.key] ? AppTheme.colors.tertiary : '#f4f3f4'}
              />
            </View>
          ))}
          <TouchableOpacity style={[s.sendBtn, sending && s.sendBtnDisabled]} onPress={handleSend} disabled={sending} activeOpacity={0.85}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <MaterialIcons name="send" size={18} color="#fff" />
                <Text style={s.sendBtnText}>Enviar convite por e-mail</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Rede ativa */}
        {network.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Rede ativa ({network.length})</Text>
            {network.map(n => (
              <View key={n.support_id} style={s.memberRow}>
                <View style={s.memberIconWrap}>
                  <MaterialIcons name="person" size={20} color={AppTheme.colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{n.support_name}</Text>
                  <Text style={s.memberEmail}>{n.support_email}</Text>
                  <Text style={s.memberPerms}>{(n.permissions || []).join(', ')}</Text>
                </View>
                <View style={s.activeBadge}><Text style={s.activeBadgeText}>Ativo</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* Convites pendentes */}
        {invites.filter(i => !i.used).length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Convites pendentes</Text>
            {invites.filter(i => !i.used).map(i => (
              <View key={i.invite_token} style={s.memberRow}>
                <View style={[s.memberIconWrap, { backgroundColor: '#fef3c7' }]}>
                  <MaterialIcons name="schedule" size={20} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{i.email}</Text>
                  <Text style={s.memberPerms}>{(i.permissions || []).join(', ')}</Text>
                </View>
                <Text style={s.pendingText}>Pendente</Text>
              </View>
            ))}
          </View>
        )}

        {loadingList && <ActivityIndicator color={AppTheme.colors.tertiary} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 4, zIndex: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: {
    color: 'rgba(255,255,255,0.8)', fontSize: 13, paddingHorizontal: 20, paddingBottom: 16, zIndex: 1,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  body: { flex: 1 },
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor, gap: 8,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginBottom: 4,
  },
  label: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText, textTransform: 'uppercase',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, letterSpacing: 0.5, marginTop: 4,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  permLabel: { flex: 1, fontSize: 14, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 13, marginTop: 4,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  memberIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  memberName: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  memberEmail: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  memberPerms: { fontSize: 11, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  activeBadge: { backgroundColor: '#d1fae5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#10b981', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  pendingText: { fontSize: 11, color: '#f59e0b', fontWeight: '600', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
});
