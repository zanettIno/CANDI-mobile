import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import CheckpointCard from '@/components/Card/CheckpointCard';
import ActionSheet from '@/components/ActionSheet';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

interface Milestone {
  milestone_id: string;
  profile_id: string;
  title: string;
  description: string;
  date: string;
  type: 'fixed' | 'custom';
  position: number | null;
  created_at: string;
}

export default function MarcosView() {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const progress = useMemo(() => {
    if (!milestones.length) return 0;
    const done = milestones.filter(m => m.type === 'fixed').length;
    return Math.round((done / milestones.length) * 100);
  }, [milestones]);
  const [deleteSheet, setDeleteSheet] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/milestones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
      }
    } catch { }
    finally { setIsLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchMilestones(); }, [fetchMilestones]));

  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return isoDate; }
  };

  const doDelete = async (milestone_id: string) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/milestones/${milestone_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchMilestones();
    } catch { }
  };

  const toggleCompleted = async (m: Milestone) => {
    const newType = m.type === 'fixed' ? 'custom' : 'fixed';
    setMilestones(prev => prev.map(x => x.milestone_id === m.milestone_id ? { ...x, type: newType } : x));
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/milestones/${m.milestone_id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType }),
      });
    } catch {
      setMilestones(prev => prev.map(x => x.milestone_id === m.milestone_id ? { ...x, type: m.type } : x));
    }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeProfile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Meus Marcos</Text>
          <TouchableOpacity
            onPress={() => router.push('screens/profile/marcosAdd' as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={s.headerSub}>Conquistas do seu tratamento</Text>
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

        {isLoading ? (
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} style={{ marginTop: 40 }} />
        ) : milestones.length > 0 ? (
          milestones.map(m => (
            <CheckpointCard
              key={m.milestone_id}
              name={m.title}
              date={formatDate(m.date)}
              isCompleted={m.type === 'fixed'}
              observation={m.description || 'Sem observações'}
              onEdit={() => {
                const datePart = m.date?.split('T')[0] ?? '';
                const [y, mo, d] = datePart.split('-');
                const dateFormatted = datePart ? `${d}/${mo}/${y}` : '';
                router.push(`/screens/profile/marcosEdit?id=${m.milestone_id}&title=${encodeURIComponent(m.title)}&date=${encodeURIComponent(dateFormatted)}&completed=${m.type === 'fixed' ? '1' : '0'}` as any);
              }}
              onMarkAsCompleted={() => toggleCompleted(m)}
              onDelete={() => setDeleteSheet(m.milestone_id)}
            />
          ))
        ) : (
          <View style={s.empty}>
            <MaterialIcons name="flag" size={40} color={AppTheme.colors.dotsColor} />
            <Text style={s.emptyTitle}>Nenhum marco registrado</Text>
            <Text style={s.emptySub}>Comece adicionando seu primeiro marco do tratamento!</Text>
          </View>
        )}

      </ScrollView>

      <ActionSheet
        visible={!!deleteSheet}
        title="Excluir marco"
        options={[{
          label: 'Confirmar exclusão',
          icon: 'delete',
          destructive: true,
          onPress: () => deleteSheet && doDelete(deleteSheet),
        }]}
        onDismiss={() => setDeleteSheet(null)}
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
    paddingBottom: 4, paddingTop: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: {
    textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, paddingBottom: 14,
  },

  content: { padding: 16, paddingBottom: 40, gap: 10 },

  progressCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressLabel: {
    flex: 1, fontSize: 13, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  progressValue: {
    fontSize: 13, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  progressBar: {
    height: 8, backgroundColor: AppTheme.colors.dotsColor,
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: AppTheme.colors.tertiary, borderRadius: 4,
  },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6,
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    marginTop: 4, paddingLeft: 2,
  },

  empty: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40, gap: 12 },
  emptyTitle: {
    fontSize: 16, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily, textAlign: 'center',
  },
  emptySub: {
    fontSize: 13.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, textAlign: 'center', lineHeight: 20,
  },
});
