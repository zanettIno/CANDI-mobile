/**
 * App da Rede de Apoio — somente visualização do que o paciente autorizou.
 * Header mostra o avatar do paciente acompanhado (não o próprio avatar do suporte).
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import { useProfile } from '@/context/ProfileContext';
import CANDITopBar from '@/components/CANDITopBar';

const PERM_META: Record<string, { icon: string; label: string; color: string; route: string }> = {
  agenda:     { icon: 'event',  label: 'Agenda', color: AppTheme.colors.tertiary, route: 'agenda' },
  diary_read: { icon: 'book',   label: 'Diário',  color: '#8b5cf6',               route: 'diary'  },
  milestones: { icon: 'flag',   label: 'Marcos',  color: '#f59e0b',               route: 'marcos' },
};

export default function SupportHome() {
  const router = useRouter();
  const { linkedPatients, selectedPatient, setSelectedPatient, profileName } = useProfile();

  const currentPatient = selectedPatient ?? linkedPatients[0] ?? null;
  const permissions: string[] = currentPatient?.permissions ?? [];
  const pid = currentPatient?.profile_id ?? null;
  const pName = currentPatient?.profile_name ?? currentPatient?.patient_name ?? '';

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userRole']);
    router.replace('/');
  };

  const goToSection = (perm: string) => {
    const meta = PERM_META[perm];
    if (!meta || !pid) return;
    router.push(`/screens/support/${meta.route}?patientId=${pid}&patientName=${encodeURIComponent(pName)}` as any);
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* TopBar com avatar do paciente */}
      <CANDITopBar patientId={pid} patientName={pName} />

      {/* Sub-header */}
      <View style={s.subHeader}>
        <View style={{ width: 32 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>Acompanhamento</Text>
          {currentPatient && (
            <Text style={s.headerSub}>{pName}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={s.readOnlyTag}>
        <MaterialIcons name="visibility" size={11} color={AppTheme.colors.tertiary} />
        <Text style={s.readOnlyText}>Modo visualização — sem edição</Text>
      </View>

      {currentPatient === null && linkedPatients.length === 0 ? (
        <View style={s.centered}>
          <MaterialIcons name="people-outline" size={52} color={AppTheme.colors.dotsColor} />
          <Text style={s.emptyTitle}>Sem pacientes vinculados</Text>
          <Text style={s.emptySub}>Aguarde o convite de um paciente.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scrollContent}>
          <Text style={s.greeting}>Olá, {profileName}</Text>
          <Text style={s.greetingSub}>
            Acompanhando {pName}
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
                    onPress={() => setSelectedPatient(p)}
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
                    onPress={() => goToSection(perm)}
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
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  subHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: { fontSize: 12, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  readOnlyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'center', paddingVertical: 6,
    backgroundColor: AppTheme.colors.secondary,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  readOnlyText: { fontSize: 11, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily, fontWeight: '600' },

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

  empty: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, textAlign: 'center', fontFamily: AppTheme.fonts.bodySmall.fontFamily },
});
