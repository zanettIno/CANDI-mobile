import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import LoginSignupBackground from '../../../components/LoginSignupBackground';
import ProfilePictureModal from '../../../components/Modals/ProfilePictureModal';
import { cancerTypes } from '../../../components/Inputs/inputTypeCancer';
import { useProfile } from '@/context/ProfileContext';
import { API_BASE_URL } from '../../../constants/api';
import ActionSheet from '@/components/ActionSheet';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

interface UserProfile {
  profile_id: string;
  profile_name: string;
  profile_email: string;
  profile_nickname?: string;
  profile_birth_date?: string;
  cancer_type_id?: number;
  profile_picture_last_updated?: number;
}

export default function HomeProfile() {
  const router = useRouter();
  const { refreshProfile, role } = useProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState(false);
  const [logoutSheet, setLogoutSheet] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setProfile(await res.json());
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handlePhotoUpdate = (deleted = false) => {
    if (!profile) return;
    setProfile({ ...profile, profile_picture_last_updated: deleted ? undefined : Date.now() });
    refreshProfile();
  };

  const doLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userRole']);
    router.replace('/');
  };

  const avatarUri = profile?.profile_id
    ? `${S3_BASE}/${profile.profile_id}.jpg${profile.profile_picture_last_updated ? `?t=${profile.profile_picture_last_updated}` : ''}`
    : undefined;

  const cancerName = profile?.cancer_type_id
    ? cancerTypes.find(c => c.id === profile.cancer_type_id)?.name ?? 'Não informado'
    : 'Não informado';

  let birthDate = '';
  if (profile?.profile_birth_date) {
    const part = profile.profile_birth_date.split('T')[0];
    const [y, m, d] = part.split('-');
    birthDate = `${d}/${m}/${y}`;
  }

  const menuItems = [
    ...(role !== 'support' ? [
      { icon: 'group-add', label: 'Rede de Apoio', sub: 'Gerencie quem acompanha você', onPress: () => router.push('/screens/profile/invite') },
      { icon: 'flag', label: 'Meus Marcos', sub: 'Conquistas do tratamento', onPress: () => router.push('/screens/profile/marcosView') },
    ] : []),
    ...(role === 'admin' ? [
      { icon: 'shield', label: 'Painel Admin', sub: 'Moderação e administração', onPress: () => router.push('/screens/admin') },
    ] : []),
    { icon: 'help-outline', label: 'Ajuda', sub: 'Perguntas frequentes e suporte', onPress: () => router.push('/screens/profile/help') },
    { icon: 'info-outline', label: 'Sobre o CANDI', sub: 'Missão, versão e equipe', onPress: () => router.push('/screens/profile/about') },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView style={s.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Hero com ondas ────────────────────────────────────────────────── */}
        <View style={s.hero}>
          {/* Ondas naturais — sem overlay escuro, cores CANDI visíveis */}
          <View style={s.wavesBg}>
            <LoginSignupBackground />
          </View>

          {/* Conteúdo do hero */}
          <View style={[s.heroContent, { paddingTop: STATUS_TOP + 16 }]}>
            {/* Avatar — toca pra trocar a foto */}
            <TouchableOpacity onPress={() => setPhotoModal(true)} activeOpacity={0.88} style={s.avatarWrap}>
              {loading ? (
                <View style={s.avatarRing}>
                  <View style={s.avatarPlaceholder}><ActivityIndicator color={AppTheme.colors.tertiary} /></View>
                </View>
              ) : avatarUri ? (
                <View style={s.avatarRing}>
                  <Image source={{ uri: avatarUri }} style={s.avatar} />
                </View>
              ) : (
                <View style={s.avatarRing}>
                  <View style={s.avatarPlaceholder}>
                    <Text style={s.avatarInitials}>{(profile?.profile_name || '?').substring(0, 2).toUpperCase()}</Text>
                  </View>
                </View>
              )}
              {/* Tag da câmera */}
              <View style={s.cameraTag}>
                <MaterialIcons name="camera-alt" size={11} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Nome + apelido */}
            <Text style={s.heroName}>{profile?.profile_name || '...'}</Text>
            {profile?.profile_nickname ? (
              <Text style={s.heroNickname}>@{profile.profile_nickname}</Text>
            ) : null}

            {/* Badge papel */}
            <View style={s.roleBadge}>
              <MaterialIcons name="favorite" size={11} color={AppTheme.colors.primary} />
              <Text style={s.roleBadgeText}>Paciente oncológico</Text>
            </View>

            {/* Botão de editar perfil */}
            <TouchableOpacity style={s.editBtn} onPress={() => router.push('/screens/profile/settings')} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={14} color={AppTheme.colors.tertiary} />
              <Text style={s.editBtnText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Info cards — grid 2 colunas ──────────────────────────────────── */}
        <View style={s.infoSection}>
          <View style={s.infoGrid}>
            <View style={s.infoCard}>
              <View style={s.infoIconWrap}>
                <MaterialIcons name="medical-services" size={20} color={AppTheme.colors.tertiary} />
              </View>
              <Text style={s.infoLabel}>Tipo de câncer</Text>
              <Text style={s.infoValue} numberOfLines={2}>{cancerName}</Text>
            </View>
            <View style={s.infoCard}>
              <View style={s.infoIconWrap}>
                <MaterialIcons name="cake" size={20} color={AppTheme.colors.tertiary} />
              </View>
              <Text style={s.infoLabel}>Nascimento</Text>
              <Text style={s.infoValue}>{birthDate || 'Não informado'}</Text>
            </View>
          </View>

          {/* E-mail — linha completa */}
          <View style={s.emailCard}>
            <View style={s.infoIconWrap}>
              <MaterialIcons name="email" size={18} color={AppTheme.colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>E-mail</Text>
              <Text style={s.infoValue} numberOfLines={1}>{profile?.profile_email || '...'}</Text>
            </View>
          </View>
        </View>

        {/* ── Menu ─────────────────────────────────────────────────────────── */}
        <View style={s.menuCard}>
          {menuItems.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={s.menuRow} onPress={item.onPress} activeOpacity={0.7}>
                <View style={s.menuIcon}>
                  <MaterialIcons name={item.icon as any} size={20} color={AppTheme.colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  {item.sub ? <Text style={s.menuSub}>{item.sub}</Text> : null}
                </View>
                <MaterialIcons name="chevron-right" size={20} color={AppTheme.colors.dotsColor} />
              </TouchableOpacity>
              {i < menuItems.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Sair ─────────────────────────────────────────────────────────── */}
        <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutSheet(true)} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={17} color="#ef4444" />
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

      </ScrollView>

      {profile && (
        <ProfilePictureModal
          visible={photoModal}
          onDismiss={() => setPhotoModal(false)}
          user={profile}
          onPictureUpdate={handlePhotoUpdate}
        />
      )}

      <ActionSheet
        visible={logoutSheet}
        title="Sair da conta"
        options={[{ label: 'Confirmar saída', icon: 'logout', destructive: true, onPress: doLogout }]}
        onDismiss={() => setLogoutSheet(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },

  // ── Hero ────────────────────────────────────────────────────────────────
  hero: { height: 300, position: 'relative' },
  wavesBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // SEM overlay escuro — as ondas pink/mint ficam visíveis e coloridas
  heroContent: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-start',
    gap: 6, paddingHorizontal: 20, zIndex: 2,
  },

  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatarRing: {
    padding: 3, borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
  },
  avatar: { width: 96, height: 96, borderRadius: 20 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 20,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 30, fontWeight: '800', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  cameraTag: {
    position: 'absolute', bottom: -2, right: -2,
    backgroundColor: AppTheme.colors.tertiary,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },

  heroName: {
    fontSize: 22, fontWeight: '800', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    textAlign: 'center',
  },
  heroNickname: {
    fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,196,196,0.35)',
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: AppTheme.colors.primary,
  },
  roleBadgeText: {
    fontSize: 12, color: '#b53b3b', fontWeight: '600',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  editBtnText: {
    fontSize: 13, fontWeight: '600', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  // ── Info cards ───────────────────────────────────────────────────────────
  infoSection: { paddingHorizontal: 16, gap: 10, marginTop: 2 },
  infoGrid: { flexDirection: 'row', gap: 10 },
  infoCard: {
    flex: 1, backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 14, gap: 6,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  emailCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 13.5, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  // ── Menu ─────────────────────────────────────────────────────────────────
  menuCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    marginHorizontal: 16, marginTop: 16,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14.5, fontWeight: '500', color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  menuSub: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 1,
  },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 64 },

  // ── Logout ───────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fff5f5', borderRadius: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#ef4444', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
});
