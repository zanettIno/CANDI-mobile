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
    const fetch_ = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setProfile(await res.json());
      } catch { }
      finally { setLoading(false); }
    };
    fetch_();
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

  // ── Itens de menu — sem duplicatas ────────────────────────────────────────
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView style={s.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBg}><LoginSignupBackground /></View>
          <View style={s.heroOverlay} />

          <View style={[s.heroContent, { paddingTop: STATUS_TOP + 12 }]}>
            {/* Avatar com botão de editar — toque na foto abre modal */}
            <TouchableOpacity onPress={() => setPhotoModal(true)} activeOpacity={0.85} style={s.avatarWrap}>
              {loading ? (
                <View style={s.avatarPlaceholder}><ActivityIndicator color={AppTheme.colors.tertiary} /></View>
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatar} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Text style={s.avatarInitials}>{(profile?.profile_name || '?').substring(0, 2).toUpperCase()}</Text>
                </View>
              )}
              <View style={s.cameraTag}>
                <MaterialIcons name="camera-alt" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Nome + editar */}
            <View style={s.nameRow}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <Text style={s.heroName}>{profile?.profile_name || '...'}</Text>
                {profile?.profile_nickname ? (
                  <Text style={s.heroNickname}>@{profile.profile_nickname}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => router.push('/screens/profile/settings')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="edit" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={s.editBtnText}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={s.badgePill}>
              <MaterialIcons name="favorite" size={11} color={AppTheme.colors.primary} />
              <Text style={s.badgeText}>Paciente oncológico</Text>
            </View>
          </View>
        </View>

        {/* ── Info resumida ─────────────────────────────────────────────────── */}
        <View style={s.infoStrip}>
          <View style={s.infoItem}>
            <MaterialIcons name="medical-services" size={16} color={AppTheme.colors.tertiary} />
            <Text style={s.infoText} numberOfLines={1}>{cancerName}</Text>
          </View>
          {birthDate ? (
            <View style={s.infoItem}>
              <MaterialIcons name="cake" size={16} color={AppTheme.colors.tertiary} />
              <Text style={s.infoText}>{birthDate}</Text>
            </View>
          ) : null}
          <View style={s.infoItem}>
            <MaterialIcons name="email" size={16} color={AppTheme.colors.tertiary} />
            <Text style={s.infoText} numberOfLines={1}>{profile?.profile_email || '...'}</Text>
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
          <MaterialIcons name="logout" size={18} color="#ef4444" />
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

  hero: { position: 'relative', paddingBottom: 24 },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.12)' },
  heroContent: { alignItems: 'center', gap: 10, zIndex: 1, paddingHorizontal: 20 },

  avatarWrap: { position: 'relative' },
  avatar: { width: 88, height: 88, borderRadius: 18, borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)' },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 18,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarInitials: {
    fontSize: 28, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  cameraTag: {
    position: 'absolute', bottom: -3, right: -3,
    backgroundColor: AppTheme.colors.tertiary,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  nameRow: { alignItems: 'center', gap: 8 },
  heroName: {
    fontSize: 20, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  heroNickname: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#fff', fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: { fontSize: 11.5, color: '#fff', fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  // Info strip
  infoStrip: {
    backgroundColor: AppTheme.colors.cardBackground,
    marginHorizontal: 16, marginTop: -12,
    borderRadius: 14, padding: 14, gap: 8, zIndex: 2,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: {
    flex: 1, fontSize: 13, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  // Menu
  menuCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    marginHorizontal: 16, marginTop: 16,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
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

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fff5f5', borderRadius: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#ef4444', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
});
