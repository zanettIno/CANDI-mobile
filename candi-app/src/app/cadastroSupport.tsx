import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert, Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../theme';
import LoginSignupBackground from '../components/LoginSignupBackground';
import { getInviteInfo, registerSupport } from '../services/inviteService';
import { login } from '../services/authService';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const PERM_LABELS: Record<string, string> = {
  agenda: 'Agenda de consultas',
  diary_read: 'Diário de saúde',
  milestones: 'Marcos do tratamento',
};

export default function CadastroSupport() {
  const router = useRouter();
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!invite) { setInviteError('Token de convite não encontrado.'); setLoadingInvite(false); return; }
    getInviteInfo(invite)
      .then(data => { setInviteData(data); setEmail(data.email || ''); })
      .catch(err => setInviteError(err.message || 'Convite inválido ou expirado.'))
      .finally(() => setLoadingInvite(false));
  }, [invite]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !invite) return;
    if (password.length < 6) { Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await registerSupport({ name: name.trim(), email: email.trim(), password, invite_token: invite });
      // Faz login automático
      await login(email.trim(), password);
      router.replace('/screens/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível criar a conta.');
    } finally { setLoading(false); }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.hero}>
        <LoginSignupBackground />
        <View style={[s.heroContent, { paddingTop: STATUS_TOP + 16 }]}>
          <MaterialIcons name="favorite" size={32} color="rgba(255,255,255,0.9)" />
          <Text style={s.heroTitle}>Rede de Apoio</Text>
          <Text style={s.heroSub}>Crie sua conta para acompanhar {inviteData?.patient_name || 'o paciente'}</Text>
        </View>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        {loadingInvite ? (
          <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
        ) : inviteError ? (
          <View style={s.centered}>
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text style={s.errorText}>{inviteError}</Text>
            <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/')}>
              <Text style={s.backBtnText}>Voltar ao início</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Permissões concedidas */}
            <View style={s.card}>
              <Text style={s.cardTitle}>O que você terá acesso</Text>
              {(inviteData?.permissions || []).map((p: string) => (
                <View key={p} style={s.permRow}>
                  <MaterialIcons name="check-circle" size={18} color="#10b981" />
                  <Text style={s.permText}>{PERM_LABELS[p] || p}</Text>
                </View>
              ))}
            </View>

            {/* Formulário */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Criar conta</Text>
              <Text style={s.fieldLabel}>Seu nome</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Como prefere ser chamado" placeholderTextColor={AppTheme.colors.placeholderText} />
              <Text style={s.fieldLabel}>E-mail</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" placeholderTextColor={AppTheme.colors.placeholderText} />
              <Text style={s.fieldLabel}>Senha</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor={AppTheme.colors.placeholderText} />
            </View>

            <TouchableOpacity
              style={[s.submitBtn, (loading || !name || !email || !password) && s.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={loading || !name.trim() || !email.trim() || !password}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={s.submitText}>Criar conta e acessar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 8 }} onPress={() => router.replace('/')}>
              <Text style={{ color: AppTheme.colors.placeholderText, fontSize: 13, fontFamily: AppTheme.fonts.bodySmall.fontFamily }}>
                Já tenho uma conta
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  hero: { height: 180, position: 'relative' },
  heroContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: AppTheme.fonts.bodySmall.fontFamily, textAlign: 'center', paddingHorizontal: 40 },
  body: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  errorText: { fontSize: 15, color: '#ef4444', fontFamily: AppTheme.fonts.bodyMedium.fontFamily, textAlign: 'center' },
  backBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  backBtnText: { color: AppTheme.colors.tertiary, fontSize: 14, fontWeight: '600', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor, gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginBottom: 4 },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permText: { fontSize: 13, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  fieldLabel: { fontSize: 11.5, color: AppTheme.colors.placeholderText, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 15,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
});
