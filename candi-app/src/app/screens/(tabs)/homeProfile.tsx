import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Image, ActivityIndicator, Alert,
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

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';
const HEADER_H = 220;

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProfile(await res.json());
      } catch { /* silencioso */ }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handlePhotoUpdate = (deleted = false) => {
    if (!profile) return;
    setProfile({ ...profile, profile_picture_last_updated: deleted ? undefined : Date.now() });
    refreshProfile();
  };

  const avatarUri = profile?.profile_id
    ? `${S3_BASE}/${profile.profile_id}.jpg${profile.profile_picture_last_updated ? `?t=${profile.profile_picture_last_updated}` : ''}`
    : undefined;

  const cancerName = profile?.cancer_type_id
    ? cancerTypes.find(c => c.id === profile.cancer_type_id)?.name ?? 'Não informado'
    : 'Não informado';

  let birthDate = 'Não informado';
  if (profile?.profile_birth_date) {
    const part = profile.profile_birth_date.split('T')[0];
    const [y, m, d] = part.split('-');
    birthDate = `${d}/${m}/${y}`;
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userRole']);
          router.replace('/');
        }
      },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Editar perfil', onPress: () => router.push('/screens/profile/settings') },
    { icon: 'camera-alt', label: 'Alterar foto de perfil', onPress: () => setPhotoModal(true) },
    { icon: 'contacts', label: 'Contatos de emergência', onPress: () => router.push('/screens/profile/contatosView') },
    { icon: 'flag', label: 'Meus marcos', onPress: () => router.push('/screens/profile/marcosView') },
    // Disponível apenas para pacientes (não suporte)
    ...(role !== 'support' ? [{ icon: 'group-add', label: 'Rede de apoio', onPress: () => router.push('/screens/profile/invite') }] : []),
    // Apenas admin
    ...(role === 'admin' ? [{ icon: 'shield', label: 'Painel Admin', onPress: () => router.push('/screens/admin') }] : []),
  ];

  const bottomItems = [
    { icon: 'help-outline', label: 'Ajuda', onPress: () => Alert.alert('Ajuda', 'Em breve.') },
    { icon: 'info-outline', label: 'Sobre o CANDI', onPress: () => Alert.alert('CANDI', 'Versão 1.0.0') },
    { icon: 'logout', label: 'Sair da conta', onPress: handleLogout, destructive: true },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero com gradiente ─────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBg}><LoginSignupBackground /></View>
          <View style={s.heroOverlay} />

          {/* Ícone de configurações no topo direito */}
          <TouchableOpacity
            style={[s.settingsBtn, { top: STATUS_TOP + 12 }]}
            onPress={() => router.push('/screens/profile/settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="settings" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          {/* Avatar + info no centro */}
          <View style={s.heroContent}>
            <TouchableOpacity onPress={() => setPhotoModal(true)} activeOpacity={0.85} style={s.avatarWrap}>
              {loading ? (
                <View style={s.avatarPlaceholder}>
                  <ActivityIndicator color={AppTheme.colors.tertiary} />
                </View>
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatar} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Text style={s.avatarInitials}>
                    {(profile?.profile_name || '?').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={s.cameraTag}>
                <MaterialIcons name="camera-alt" size={13} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={s.heroName}>{profile?.profile_name || '...'}</Text>
            {profile?.profile_nickname && (
              <Text style={s.heroNickname}>@{profile.profile_nickname}</Text>
            )}
            <View style={s.badgePill}>
              <MaterialIcons name="favorite" size={12} color={AppTheme.colors.primary} />
              <Text style={s.badgeText}>Paciente oncológico</Text>
            </View>
          </View>
        </View>

        {/* ── Info cards ─────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.infoGrid}>
            <View style={s.infoCard}>
              <MaterialIcons name="medical-services" size={22} color={AppTheme.colors.tertiary} />
              <Text style={s.infoLabel}>Tipo de câncer</Text>
              <Text style={s.infoValue} numberOfLines={2}>{cancerName}</Text>
            </View>
            <View style={s.infoCard}>
              <MaterialIcons name="cake" size={22} color={AppTheme.colors.tertiary} />
              <Text style={s.infoLabel}>Data de nascimento</Text>
              <Text style={s.infoValue}>{birthDate}</Text>
            </View>
          </View>

          <View style={s.emailCard}>
            <MaterialIcons name="email" size={18} color={AppTheme.colors.placeholderText} />
            <Text style={s.emailText}>{profile?.profile_email || '...'}</Text>
          </View>
        </View>

        {/* ── Menu principal ─────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Minha Conta</Text>
          <View style={s.menuCard}>
            {menuItems.map((item, i) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={s.menuRow} onPress={item.onPress} activeOpacity={0.7}>
                  <View style={s.menuIconWrap}>
                    <MaterialIcons name={item.icon as any} size={20} color={AppTheme.colors.tertiary} />
                  </View>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={AppTheme.colors.dotsColor} />
                </TouchableOpacity>
                {i < menuItems.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Rodapé ─────────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Outros</Text>
          <View style={s.menuCard}>
            {bottomItems.map((item, i) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={s.menuRow} onPress={item.onPress} activeOpacity={0.7}>
                  <View style={[s.menuIconWrap, item.destructive && s.menuIconDestructive]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={item.destructive ? '#ef4444' : AppTheme.colors.placeholderText}
                    />
                  </View>
                  <Text style={[s.menuLabel, item.destructive && s.menuLabelDestructive]}>
                    {item.label}
                  </Text>
                  {!item.destructive && (
                    <MaterialIcons name="chevron-right" size={20} color={AppTheme.colors.dotsColor} />
                  )}
                </TouchableOpacity>
                {i < bottomItems.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {profile && (
        <ProfilePictureModal
          visible={photoModal}
          onDismiss={() => setPhotoModal(false)}
          user={profile}
          onPictureUpdate={handlePhotoUpdate}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  scroll: { paddingBottom: 20 },

  // Hero
  hero: {
    height: HEADER_H + 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  settingsBtn: { position: 'absolute', right: 20, zIndex: 10 },
  heroContent: { alignItems: 'center', zIndex: 1 },

  avatarWrap: { marginBottom: 12, position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 20,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 20,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarInitials: {
    fontSize: 32, fontWeight: '700',
    color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  cameraTag: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: AppTheme.colors.tertiary,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  heroName: {
    fontSize: 22, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroNickname: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 12, color: '#fff', fontWeight: '600',
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  // Sections
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.6,
    color: AppTheme.colors.placeholderText,
    textTransform: 'uppercase',
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    marginBottom: 8, paddingHorizontal: 2,
  },

  // Info grid
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  infoCard: {
    flex: 1, backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 14, gap: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  infoLabel: {
    fontSize: 11, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 4,
  },
  infoValue: {
    fontSize: 13, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  emailCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  emailText: {
    fontSize: 13, color: AppTheme.colors.roleText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, flex: 1,
  },

  // Menu card
  menuCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIconDestructive: { backgroundColor: '#fee2e2' },
  menuLabel: {
    flex: 1, fontSize: 14.5, fontWeight: '500',
    color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  menuLabelDestructive: { color: '#ef4444' },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 64 },
});

