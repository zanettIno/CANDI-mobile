import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { createInvite, getMyInvites, getSupportNetwork, removeSupportMember, revokeInvite } from '@/services/inviteService';
import { useToast } from '@/context/NotificationContext';
import ActionSheet from '@/components/ActionSheet';
import CANDITopBar from '@/components/CANDITopBar';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const PERMISSIONS = [
  { key: 'agenda', label: 'Agenda de consultas', icon: 'event' },
  { key: 'diary_read', label: 'Diário de saúde', icon: 'book' },
  { key: 'milestones', label: 'Marcos do tratamento', icon: 'flag' },
];

export default function InviteScreen() {
  const router = useRouter();
  const toast = useToast();
  const scrollRef = useScrollToTopOnFocus();
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({ agenda: true });
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [removeSheet, setRemoveSheet] = useState<{ type: 'member' | 'invite'; id: string; name: string } | null>(null);

  const loadLists = useCallback(async () => {
    try {
      const [inv, net] = await Promise.all([getMyInvites(), getSupportNetwork()]);
      setInvites(inv);
      setNetwork(net);
    } catch { }
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
      toast.success(`Convite enviado para ${email}!`);
      setEmail('');
      setPermissions({ agenda: true });
      loadLists();
    } catch (err: any) { toast.error(err.message || 'Não foi possível enviar.'); }
    finally { setSending(false); }
  };

  const handleConfirmRemove = async () => {
    if (!removeSheet) return;
    try {
      if (removeSheet.type === 'member') {
        await removeSupportMember(removeSheet.id);
        toast.success('Membro removido da rede de apoio.');
      } else {
        await revokeInvite(removeSheet.id);
        toast.success('Convite revogado.');
      }
      loadLists();
    } catch (e: any) { toast.error(e.message || 'Erro ao remover.'); }
    finally { setRemoveSheet(null); }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CANDITopBar />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Rede de Apoio</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={s.headerSub}>Convide pessoas para acompanhar sua jornada</Text>
      </View>

      <ScrollView ref={scrollRef} style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>

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
              <View style={s.permIconWrap}>
                <MaterialIcons name={p.icon as any} size={16} color={AppTheme.colors.tertiary} />
              </View>
              <Text style={s.permLabel}>{p.label}</Text>
              <Switch
                value={!!permissions[p.key]}
                onValueChange={() => togglePerm(p.key)}
                trackColor={{ false: AppTheme.colors.dotsColor, true: AppTheme.colors.tertiary + '88' }}
                thumbColor={permissions[p.key] ? AppTheme.colors.tertiary : '#f4f3f4'}
              />
            </View>
          ))}
          <TouchableOpacity style={[s.sendBtn, sending && { opacity: 0.6 }]} onPress={handleSend} disabled={sending} activeOpacity={0.85}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> : (
              <><MaterialIcons name="send" size={16} color="#fff" /><Text style={s.sendBtnText}>Enviar convite por e-mail</Text></>
            )}
          </TouchableOpacity>
        </View>

        {/* Rede ativa */}
        {loadingList ? (
          <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 8 }} />
        ) : network.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Rede ativa ({network.length})</Text>
            {network.map((n, i) => (
              <React.Fragment key={n.support_id}>
                <View style={s.memberRow}>
                  <View style={s.memberIconWrap}>
                    <MaterialIcons name="person" size={18} color={AppTheme.colors.tertiary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.memberName}>{n.support_name}</Text>
                    <Text style={s.memberEmail}>{n.support_email}</Text>
                    {n.permissions?.length > 0 && (
                      <Text style={s.memberPerms}>{n.permissions.join(' · ')}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setRemoveSheet({ type: 'member', id: n.support_id, name: n.support_name })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {i < network.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Convites pendentes */}
        {invites.filter(i => !i.used).length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Convites pendentes</Text>
            {invites.filter(i => !i.used).map((i, idx) => (
              <React.Fragment key={i.invite_token}>
                <View style={s.memberRow}>
                  <View style={[s.memberIconWrap, { backgroundColor: '#fef3c7' }]}>
                    <MaterialIcons name="schedule" size={18} color="#f59e0b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.memberName}>{i.email}</Text>
                    {i.permissions?.length > 0 && (
                      <Text style={s.memberPerms}>{i.permissions.join(' · ')}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setRemoveSheet({ type: 'invite', id: i.invite_token, name: i.email })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {idx < invites.filter(x => !x.used).length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

      </ScrollView>

      <ActionSheet
        visible={!!removeSheet}
        title={removeSheet?.type === 'member' ? 'Remover da rede de apoio' : 'Revogar convite'}
        options={[{
          label: removeSheet?.type === 'member' ? `Remover ${removeSheet?.name}` : `Revogar convite de ${removeSheet?.name}`,
          icon: 'delete',
          destructive: true,
          onPress: handleConfirmRemove,
        }]}
        onDismiss={() => setRemoveSheet(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },

  header: {
    backgroundColor: AppTheme.colors.tertiary,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 4,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: {
    textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, paddingBottom: 4,
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
    fontSize: 11, color: AppTheme.colors.placeholderText, textTransform: 'uppercase',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, letterSpacing: 0.6, marginTop: 4,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  permIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  permLabel: { flex: 1, fontSize: 13.5, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 13, marginTop: 4,
  },
  sendBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  memberIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  memberName: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  memberEmail: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  memberPerms: { fontSize: 11, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 1 },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor },
});
