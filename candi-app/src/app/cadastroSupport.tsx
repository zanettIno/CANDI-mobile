import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppTheme } from '../theme';
import LoginSignupBackground from '../components/LoginSignupBackground';
import { getInviteInfo, registerSupport } from '../services/inviteService';
import { login } from '../services/authService';
import { useToast } from '@/context/NotificationContext';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const RELATIONSHIPS = [
  { value: 'familiar', label: 'Familiar' },
  { value: 'conjuge', label: 'Cônjuge / Parceiro(a)' },
  { value: 'amigo', label: 'Amigo(a)' },
  { value: 'cuidador', label: 'Cuidador(a)' },
  { value: 'outro', label: 'Outro' },
];

const PERM_LABELS: Record<string, string> = {
  agenda: 'Agenda de consultas',
  diary_read: 'Diário de saúde',
  milestones: 'Marcos do tratamento',
};

export default function CadastroSupport() {
  const router = useRouter();
  const toast = useToast();
  const { invite } = useLocalSearchParams<{ invite?: string }>();

  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!invite) { setInviteError('Token de convite não encontrado.'); setLoadingInvite(false); return; }
    getInviteInfo(invite)
      .then(data => { setInviteData(data); setEmail(data.email || ''); })
      .catch(err => setInviteError(err.message || 'Convite inválido ou expirado.'))
      .finally(() => setLoadingInvite(false));
  }, [invite]);

  const handleRegister = async () => {
    if (!name.trim()) { toast.error('Informe seu nome.'); return; }
    if (!phone.trim()) { toast.error('Informe seu telefone.'); return; }
    if (!email.trim()) { toast.error('Informe seu e-mail.'); return; }
    if (password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (!relationship) { toast.error('Selecione sua relação com o paciente.'); return; }
    if (!invite) return;

    setLoading(true);
    try {
      await registerSupport({ name: name.trim(), phone: phone.trim(), email: email.trim(), password, invite_token: invite, relationship });
      await login(email.trim(), password);
      toast.success('Conta criada! Bem-vindo(a).');
      router.replace('/screens/(tabs)/home');
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível criar a conta.');
    } finally { setLoading(false); }
  };

  if (loadingInvite) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
      </View>
    );
  }

  if (inviteError) {
    return (
      <View style={s.loadingScreen}>
        <MaterialIcons name="error-outline" size={52} color="#ef4444" />
        <Text style={s.errorTitle}>Convite inválido</Text>
        <Text style={s.errorSub}>{inviteError}</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/')}>
          <Text style={s.backBtnText}>Ir para o login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={s.header}>
        <LoginSignupBackground />
        <View style={[s.headerContent, { paddingTop: STATUS_TOP + 10 }]}>
          <MaterialIcons name="favorite" size={28} color="rgba(255,255,255,0.9)" />
          <Text style={s.headerTitle}>Rede de Apoio</Text>
          <Text style={s.headerSub}>
            {inviteData?.patient_name
              ? `Convite de ${inviteData.patient_name}`
              : 'Criar conta de acompanhante'}
          </Text>
        </View>
      </View>

      <ScrollView style={s.body} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Permissões concedidas */}
        {inviteData?.permissions?.length > 0 && (
          <View style={s.permCard}>
            <Text style={s.permTitle}>Você poderá acompanhar</Text>
            {inviteData.permissions.map((p: string) => (
              <View key={p} style={s.permRow}>
                <MaterialIcons name="check-circle" size={16} color="#10b981" />
                <Text style={s.permText}>{PERM_LABELS[p] || p}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Formulário */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Seus dados</Text>

          <Text style={s.label}>Nome completo *</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Como você se chama"
            placeholderTextColor={AppTheme.colors.placeholderText}
            autoCapitalize="words"
          />

          <Text style={s.label}>Telefone *</Text>
          <TextInput
            style={s.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            placeholderTextColor={AppTheme.colors.placeholderText}
            keyboardType="phone-pad"
            maxLength={16}
          />

          <Text style={s.label}>E-mail *</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={AppTheme.colors.placeholderText}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={s.label}>Senha *</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={AppTheme.colors.placeholderText}
            secureTextEntry
          />
        </View>

        {/* Relação com o paciente */}
        <View style={s.card}>
          <Text style={s.cardTitle}>
            Sua relação com {inviteData?.patient_name || 'o paciente'}
          </Text>
          <View style={s.relationGrid}>
            {RELATIONSHIPS.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[s.relationChip, relationship === r.value && s.relationChipActive]}
                onPress={() => setRelationship(r.value)}
                activeOpacity={0.7}
              >
                <Text style={[s.relationChipText, relationship === r.value && s.relationChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[s.submitBtn, (loading || !name || !phone || !email || !password || !relationship) && s.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={loading || !name.trim() || !phone.trim() || !email.trim() || !password || !relationship}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={s.submitText}>Criar conta e acessar</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.loginLink} onPress={() => router.replace('/')}>
          <Text style={s.loginLinkText}>Já tenho uma conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: AppTheme.colors.background },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#ef4444', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  errorSub: { fontSize: 14, color: AppTheme.colors.placeholderText, textAlign: 'center', fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  backBtn: { marginTop: 8 },
  backBtnText: { color: AppTheme.colors.tertiary, fontSize: 14, fontWeight: '600', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

  header: { height: 160, position: 'relative' },
  headerContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 6 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  body: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  permCard: {
    backgroundColor: '#ecfdf5', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#6ee7b7', gap: 8,
  },
  permTitle: { fontSize: 13, fontWeight: '700', color: '#065f46', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permText: { fontSize: 13, color: '#065f46', fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor, gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginBottom: 4 },
  label: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 6,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },

  relationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  relationChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1.5, borderColor: AppTheme.colors.dotsColor,
  },
  relationChipActive: {
    backgroundColor: AppTheme.colors.secondary,
    borderColor: AppTheme.colors.tertiary,
  },
  relationChipText: {
    fontSize: 13, fontWeight: '500', color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  relationChipTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 15,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { color: AppTheme.colors.placeholderText, fontSize: 13, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
});
