/**
 * Marcos do paciente — visualização somente leitura para usuário suporte.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { getValidAccessToken } from '../../../services/authService';
import CANDITopBar from '../../../components/CANDITopBar';

interface Milestone {
  milestone_id: string;
  title: string;
  description?: string;
  date: string;
  type: 'fixed' | 'custom';
}

export default function SupportMarcos() {
  const router = useRouter();
  const { patientId, patientName } = useLocalSearchParams<{ patientId: string; patientName: string }>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const progress = useMemo(() => {
    if (!milestones.length) return 0;
    const done = milestones.filter(m => m.type === 'fixed').length;
    return Math.round((done / milestones.length) * 100);
  }, [milestones]);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = await getValidAccessToken();
        const res = await fetch(`${API_BASE_URL}/support/patient/${patientId}/milestones`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMilestones(Array.isArray(data) ? data : (data.milestones || []));
        }
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [patientId]));

  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return isoDate; }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CANDITopBar patientId={patientId} patientName={patientName} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/support' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={22} color={AppTheme.colors.nameText} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.headerTitle}>Marcos do tratamento</Text>
            <Text style={s.headerSub}>{patientName}</Text>
          </View>
          <View style={s.readOnlyBadge}>
            <MaterialIcons name="visibility" size={11} color={AppTheme.colors.tertiary} />
            <Text style={s.readOnlyText}>Leitura</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {progress > 0 && (
          <View style={s.progressCard}>
            <View style={s.progressHeader}>
              <MaterialIcons name="flag" size={16} color={AppTheme.colors.tertiary} />
              <Text style={s.progressLabel}>Progresso geral</Text>
              <Text style={s.progressValue}>{progress}%</Text>
            </View>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progress}%` as any }]} />
            </View>
          </View>
        )}

        <Text style={s.sectionTitle}>Lista de marcos</Text>

        {loading ? (
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} style={{ marginTop: 40 }} />
        ) : milestones.length === 0 ? (
          <View style={s.empty}>
            <MaterialIcons name="flag" size={40} color={AppTheme.colors.dotsColor} />
            <Text style={s.emptyTitle}>Nenhum marco registrado</Text>
            <Text style={s.emptySub}>O paciente ainda não adicionou marcos do tratamento.</Text>
          </View>
        ) : (
          milestones.map(m => (
            <View key={m.milestone_id} style={[s.milestoneCard, m.type === 'fixed' && s.milestoneCardDone]}>
              <View style={[s.milestoneCheck, m.type === 'fixed' && s.milestoneCheckDone]}>
                <MaterialIcons
                  name={m.type === 'fixed' ? 'check' : 'radio-button-unchecked'}
                  size={18}
                  color={m.type === 'fixed' ? '#fff' : AppTheme.colors.dotsColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.milestoneTitle, m.type === 'fixed' && s.milestoneTitleDone]}>{m.title}</Text>
                {m.description ? <Text style={s.milestoneSub}>{m.description}</Text> : null}
                <Text style={s.milestoneDate}>{formatDate(m.date)}</Text>
              </View>
              {m.type === 'fixed' && (
                <View style={s.doneBadge}>
                  <Text style={s.doneText}>Concluído</Text>
                </View>
              )}
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },

  header: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  headerSub: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  readOnlyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: AppTheme.colors.secondary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  readOnlyText: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  content: { padding: 16, gap: 10, paddingBottom: 40 },

  progressCard: {
    backgroundColor: AppTheme.colors.cardBackground, borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  progressValue: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  progressBar: { height: 8, backgroundColor: AppTheme.colors.dotsColor, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: AppTheme.colors.tertiary, borderRadius: 4 },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6,
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, paddingLeft: 2,
  },

  milestoneCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: AppTheme.colors.cardBackground, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  milestoneCardDone: {
    borderColor: AppTheme.colors.tertiary + '40',
    backgroundColor: AppTheme.colors.secondary + '30',
  },
  milestoneCheck: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: AppTheme.colors.dotsColor + '60',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  milestoneCheckDone: { backgroundColor: AppTheme.colors.tertiary },
  milestoneTitle: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  milestoneTitleDone: { color: AppTheme.colors.tertiary },
  milestoneSub: { fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  milestoneDate: { fontSize: 11, color: AppTheme.colors.placeholderText, marginTop: 4, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  doneBadge: {
    backgroundColor: AppTheme.colors.secondary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  doneText: { fontSize: 11, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  empty: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily, textAlign: 'center' },
  emptySub: { fontSize: 13.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily, textAlign: 'center', lineHeight: 20 },
});
