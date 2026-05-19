/**
 * App da Rede de Apoio — somente visualização do que o paciente autorizou.
 * Sem interação, sem escrita, sem abas do app de paciente.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import LoginSignupBackground from '@/components/LoginSignupBackground';
import { useProfile } from '@/context/ProfileContext';
import { API_BASE_URL } from '@/constants/api';
import { getValidAccessToken } from '@/services/authService';

const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const S3 = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

const PERM_META: Record<string, { icon: string; label: string; color: string }> = {
  agenda: { icon: 'event', label: 'Agenda', color: AppTheme.colors.tertiary },
  diary_read: { icon: 'book', label: 'Diário', color: '#8b5cf6' },
  milestones: { icon: 'flag', label: 'Marcos', color: '#f59e0b' },
};

const fetchSupport = async (path: string) => {
  const token = await getValidAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Erro');
  return res.json();
};

export default function SupportHome() {
  const router = useRouter();
  const { linkedPatients, selectedPatient, setSelectedPatient, profileName } = useProfile();

  const [section, setSection] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentPatient = selectedPatient ?? linkedPatients[0] ?? null;
  const permissions: string[] = currentPatient?.permissions ?? [];

  const loadSection = useCallback(async (perm: string, silent = false) => {
    if (!currentPatient) return;
    if (!silent) setLoading(true);
    setData(null);
    try {
      const pid = currentPatient.profile_id;
      let result: any = null;
      if (perm === 'agenda') result = await fetchSupport(`/support/patient/${pid}/agenda`);
      else if (perm === 'milestones') result = await fetchSupport(`/support/patient/${pid}/milestones`);
      else if (perm === 'diary_read') result = await fetchSupport(`/support/patient/${pid}/diary`);
      setData(result);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally { setLoading(false); setRefreshing(false); }
  }, [currentPatient]);

  useEffect(() => {
    if (section) loadSection(section);
  }, [section, currentPatient]);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userRole']);
    router.replace('/');
  };

  const renderContent = () => {
    if (!section) {
      // Home: lista de seções permitidas
      return (
        <ScrollView contentContainerStyle={s.scrollContent}>
          <Text style={s.greeting}>Olá, {profileName}</Text>
          <Text style={s.greetingSub}>
            Você está acompanhando {currentPatient?.profile_name || currentPatient?.patient_name || 'o paciente'}
          </Text>

          {/* Seletor de paciente se tiver mais de 1 */}
          {linkedPatients.length > 1 && (
            <View style={s.patientSelector}>
              <Text style={s.patientSelectorLabel}>Paciente</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {linkedPatients.map(p => (
                  <TouchableOpacity
                    key={p.profile_id}
                    style={[s.patientChip, (selectedPatient?.profile_id ?? linkedPatients[0]?.profile_id) === p.profile_id && s.patientChipActive]}
                    onPress={() => { setSelectedPatient(p); setSection(null); setData(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.patientChipText, (selectedPatient?.profile_id ?? linkedPatients[0]?.profile_id) === p.profile_id && s.patientChipTextActive]}>
                      {p.profile_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {permissions.length === 0 ? (
            <View style={s.empty}>
              <MaterialIcons name="lock" size={48} color={AppTheme.colors.dotsColor} />
              <Text style={s.emptyTitle}>Sem permissões</Text>
              <Text style={s.emptySub}>O paciente ainda não liberou nenhuma visualização para você.</Text>
            </View>
          ) : (
            <View style={s.permGrid}>
              {permissions.map(perm => {
                const meta = PERM_META[perm];
                if (!meta) return null;
                return (
                  <TouchableOpacity
                    key={perm}
                    style={s.permCard}
                    onPress={() => setSection(perm)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.permIcon, { backgroundColor: meta.color + '20' }]}>
                      <MaterialIcons name={meta.icon as any} size={28} color={meta.color} />
                    </View>
                    <Text style={s.permLabel}>{meta.label}</Text>
                    <View style={s.viewOnlyTag}>
                      <MaterialIcons name="visibility" size={10} color={AppTheme.colors.placeholderText} />
                      <Text style={s.viewOnlyText}>Somente leitura</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      );
    }

    // Seção específica
    const meta = PERM_META[section];
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSection(section, true); }} tintColor={AppTheme.colors.tertiary} />}
        contentContainerStyle={s.scrollContent}
      >
        {loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={AppTheme.colors.tertiary} /></View>
        ) : section === 'agenda' && data ? (
          <>
            {data.appointments?.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Consultas</Text>
                {data.appointments.map((a: any) => (
                  <View key={a.appointment_id} style={s.itemCard}>
                    <MaterialIcons name="event" size={18} color={AppTheme.colors.tertiary} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemTitle}>{a.appointment_type || 'Consulta'}</Text>
                      <Text style={s.itemSub}>{a.appointment_date} {a.appointment_time}</Text>
                      {a.appointment_local && <Text style={s.itemSub}>{a.appointment_local}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}
            {data.medicines?.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Medicamentos</Text>
                {data.medicines.map((m: any) => (
                  <View key={m.medicine_id} style={s.itemCard}>
                    <MaterialIcons name="medication" size={18} color="#8b5cf6" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemTitle}>{m.medicine_name}</Text>
                      <Text style={s.itemSub}>{m.dosage} · {m.frequency}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {!data.appointments?.length && !data.medicines?.length && (
              <View style={s.empty}>
                <MaterialIcons name="event-available" size={48} color={AppTheme.colors.secondary} />
                <Text style={s.emptyTitle}>Agenda vazia</Text>
                <Text style={s.emptySub}>Nenhum compromisso registrado ainda.</Text>
              </View>
            )}
          </>
        ) : section === 'milestones' && data ? (
          <>
            {(!data || data.length === 0) ? (
              <View style={s.empty}>
                <MaterialIcons name="flag" size={48} color={AppTheme.colors.secondary} />
                <Text style={s.emptyTitle}>Sem marcos</Text>
                <Text style={s.emptySub}>Nenhum marco do tratamento registrado.</Text>
              </View>
            ) : data.map((m: any) => (
              <View key={m.milestone_id} style={s.itemCard}>
                <MaterialIcons name="flag" size={18} color="#f59e0b" />
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{m.title}</Text>
                  {m.description && <Text style={s.itemSub}>{m.description}</Text>}
                  <Text style={s.itemSub}>{m.date ? new Date(m.date).toLocaleDateString('pt-BR') : ''}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={s.empty}>
            <MaterialIcons name="info" size={48} color={AppTheme.colors.secondary} />
            <Text style={s.emptySub}>Sem dados disponíveis no momento.</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerBg}><LoginSignupBackground /></View>
        <View style={[s.headerRow, { paddingTop: TOP + 8 }]}>
          {section ? (
            <TouchableOpacity onPress={() => { setSection(null); setData(null); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.headerTitle}>
              {section ? PERM_META[section]?.label : 'Acompanhamento'}
            </Text>
            {!section && currentPatient && (
              <Text style={s.headerSub}>{currentPatient.profile_name ?? currentPatient.patient_name}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="logout" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
        {/* Tag somente leitura */}
        <View style={s.readOnlyTag}>
          <MaterialIcons name="visibility" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={s.readOnlyText}>Modo visualização — sem edição</Text>
        </View>
      </View>

      {/* Conteúdo */}
      {currentPatient === null && linkedPatients.length === 0 ? (
        <View style={s.centered}>
          <MaterialIcons name="people-outline" size={52} color={AppTheme.colors.dotsColor} />
          <Text style={s.emptyTitle}>Sem pacientes vinculados</Text>
          <Text style={s.emptySub}>Aguarde o convite de um paciente.</Text>
        </View>
      ) : renderContent()}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingBottom: 6, zIndex: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  readOnlyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'center', paddingBottom: 10, zIndex: 1,
  },
  readOnlyText: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },

  greeting: { fontSize: 22, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  greetingSub: { fontSize: 14, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },

  patientSelector: { gap: 8 },
  patientSelectorLabel: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700',
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  patientChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: AppTheme.colors.cardBackground,
    borderWidth: 1.5, borderColor: AppTheme.colors.dotsColor,
  },
  patientChipActive: { borderColor: AppTheme.colors.tertiary, backgroundColor: AppTheme.colors.secondary },
  patientChipText: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  patientChipTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },

  permGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  permCard: {
    width: '47%', backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, gap: 8, alignItems: 'center',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  permIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  permLabel: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  viewOnlyTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewOnlyText: { fontSize: 10, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  itemCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: AppTheme.colors.cardBackground, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  itemTitle: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  itemSub: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, textAlign: 'center', fontFamily: AppTheme.fonts.bodySmall.fontFamily },
});
