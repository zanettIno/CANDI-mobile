/**
 * Diário do paciente — visualização somente leitura para usuário suporte.
 * Mesmo visual que homeDiary mas sem FAB, sem edição, sem criação.
 */
import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { getValidAccessToken } from '../../../services/authService';
import CANDITopBar from '../../../components/CANDITopBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DiaryEntry { date: string; content: string; }

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

function formatShort(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  } catch { return dateStr; }
}

function formatMonthYear(key: string) {
  const [year, month] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SupportDiary() {
  const { patientId, patientName } = useLocalSearchParams<{ patientId: string; patientName: string }>();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = React.useState<DiaryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [monthIndex, setMonthIndex] = React.useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(14)).current;

  const sortEntries = (data: DiaryEntry[]) =>
    [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0); slideAnim.setValue(14);
      const load = async () => {
        setLoading(true);
        try {
          const token = await getValidAccessToken();
          const res = await fetch(`${API_BASE_URL}/support/patient/${patientId}/diary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data: DiaryEntry[] = await res.json();
            const sorted = sortEntries(data);
            setEntries(sorted);
            setMonthIndex(0);
            await AsyncStorage.setItem(`support_diary_${patientId}`, JSON.stringify(sorted));
          }
        } catch { }
        finally {
          setLoading(false);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
          ]).start();
        }
      };
      load();
    }, [patientId])
  );

  const openEntry = async (date: string) => {
    router.push(`/screens/support/diaryEntry?patientId=${patientId}&patientName=${encodeURIComponent(patientName ?? '')}&date=${date}` as any);
  };

  const today = new Date().toISOString().split('T')[0];
  const hasToday = entries.some(e => e.date === today);

  const thisMonth = React.useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return entries.filter(e => e.date.startsWith(key)).length;
  }, [entries]);

  const memory = React.useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    const old = entries.filter(e => new Date(e.date) < cutoff);
    return old.length > 0 ? old[Math.floor(Math.random() * old.length)] : null;
  }, [entries]);

  const grouped = React.useMemo(() => {
    const map: Record<string, DiaryEntry[]> = {};
    entries.forEach(e => {
      const d = new Date(e.date + 'T12:00:00');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.keys(map).sort((a, b) => b.localeCompare(a)).map(k => ({ key: k, items: map[k] }));
  }, [entries]);

  const currentGroup = grouped[monthIndex];
  const canPrev = monthIndex < grouped.length - 1;
  const canNext = monthIndex > 0;

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
            <Text style={s.headerTitle}>Diário</Text>
            <Text style={s.headerSub}>{patientName}</Text>
          </View>
          <View style={s.readOnlyBadge}>
            <MaterialIcons name="visibility" size={11} color={AppTheme.colors.tertiary} />
            <Text style={s.readOnlyText}>Leitura</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 10 }}>

          {!loading && entries.length > 0 && (
            <View style={s.statsRow}>
              <View style={[s.statCard, { flex: 1 }]}>
                <Text style={s.statValue}>{entries.length}</Text>
                <Text style={s.statLabel}>passagens</Text>
              </View>
              <View style={[s.statCard, { flex: 1 }]}>
                <Text style={s.statValue}>{thisMonth}</Text>
                <Text style={s.statLabel}>este mês</Text>
              </View>
            </View>
          )}

          {!loading && memory && (
            <TouchableOpacity style={s.memoryCard} onPress={() => openEntry(memory.date)} activeOpacity={0.82}>
              <View style={s.memoryIconWrap}>
                <MaterialIcons name="auto-stories" size={18} color={AppTheme.colors.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.memoryLabel}>Relembre este dia</Text>
                <Text style={s.memoryDate}>{formatDate(memory.date)}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#C8B89A" />
            </TouchableOpacity>
          )}

          {!loading && hasToday && (
            <TouchableOpacity style={s.todayCard} activeOpacity={0.82} onPress={() => openEntry(today)}>
              <View style={s.todayRow}>
                <View style={s.todayIconWrap}>
                  <MaterialIcons name="menu-book" size={20} color="#c0484a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.todayTitle}>Passagem de hoje</Text>
                  <Text style={s.todaySub}>{formatDate(today)}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#C8B89A" />
              </View>
            </TouchableOpacity>
          )}

          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Registros</Text>
            {entries.length > 0 && (
              <View style={s.countBadge}>
                <Text style={s.countText}>{entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}</Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={s.skeleton}>
              <View style={[s.skeletonLine, { width: '80%' }]} />
              <View style={[s.skeletonLine, { width: '60%', marginTop: 6 }]} />
              <View style={[s.skeletonLine, { width: '70%', marginTop: 6 }]} />
            </View>
          ) : entries.length === 0 ? (
            <View style={s.empty}>
              <MaterialIcons name="book" size={40} color={AppTheme.colors.dotsColor} />
              <Text style={s.emptyTitle}>Sem registros</Text>
              <Text style={s.emptySub}>O paciente ainda não escreveu no diário.</Text>
            </View>
          ) : (
            <View>
              <View style={s.monthNav}>
                <TouchableOpacity style={s.monthNavBtn} onPress={() => canPrev && setMonthIndex(i => i + 1)} activeOpacity={0.7} disabled={!canPrev}>
                  <MaterialIcons name="chevron-left" size={20} color={canPrev ? '#6A5040' : '#C8B89A'} />
                </TouchableOpacity>
                <View style={s.monthNavCenter}>
                  <Text style={s.monthNavTitle}>{currentGroup ? formatMonthYear(currentGroup.key) : ''}</Text>
                  <Text style={s.monthNavCount}>
                    {currentGroup?.items.length ?? 0} {(currentGroup?.items.length ?? 0) === 1 ? 'passagem' : 'passagens'}
                  </Text>
                </View>
                <TouchableOpacity style={s.monthNavBtn} onPress={() => canNext && setMonthIndex(i => i - 1)} activeOpacity={0.7} disabled={!canNext}>
                  <MaterialIcons name="chevron-right" size={20} color={canNext ? '#6A5040' : '#C8B89A'} />
                </TouchableOpacity>
              </View>

              {currentGroup && (
                <View style={s.listCard}>
                  {currentGroup.items.map((entry, i) => (
                    <React.Fragment key={entry.date}>
                      <TouchableOpacity style={s.entryRow} onPress={() => openEntry(entry.date)} activeOpacity={0.7}>
                        <View style={s.entryDateBox}>
                          <Text style={s.entryDateShort}>{formatShort(entry.date)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.entryTitle}>Passagem do dia</Text>
                          <Text style={s.entryDateFull}>{formatDate(entry.date)}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={18} color="#C8B89A" />
                      </TouchableOpacity>
                      {i < currentGroup.items.length - 1 && <View style={s.divider} />}
                    </React.Fragment>
                  ))}
                </View>
              )}

              {grouped.length > 1 && (
                <View style={s.paginationDots}>
                  {grouped.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setMonthIndex(i)} activeOpacity={0.7}>
                      <View style={[s.dot, i === monthIndex && s.dotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </Animated.View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: AppTheme.colors.background,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  headerSub: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  readOnlyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  readOnlyText: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  content: { padding: 16 },

  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    backgroundColor: AppTheme.colors.background, borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleLarge.fontFamily },
  statLabel: { fontSize: 10, color: AppTheme.colors.placeholderText, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  todayCard: {
    backgroundColor: AppTheme.colors.background, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.primary,
  },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayIconWrap: { width: 40, height: 40, borderRadius: 11, backgroundColor: AppTheme.colors.primary + '40', alignItems: 'center', justifyContent: 'center' },
  todayTitle: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  todaySub: { fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  memoryCard: {
    backgroundColor: AppTheme.colors.secondary + '60', borderRadius: 14, padding: 13,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: AppTheme.colors.secondary,
  },
  memoryIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: AppTheme.colors.secondary, alignItems: 'center', justifyContent: 'center' },
  memoryLabel: { fontSize: 13, fontWeight: '700', color: '#1a4a30', fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  memoryDate: { fontSize: 11.5, color: '#3a6a50', marginTop: 1, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 2, marginTop: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#A89878', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  countBadge: { backgroundColor: AppTheme.colors.primary + '30', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: 11, fontWeight: '600', color: '#6A4040', fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  monthNav: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppTheme.colors.background, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  monthNavBtn: { padding: 12 },
  monthNavCenter: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  monthNavTitle: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily, textTransform: 'capitalize' },
  monthNavCount: { fontSize: 11, color: AppTheme.colors.placeholderText, marginTop: 2, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  listCard: { backgroundColor: AppTheme.colors.background, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  entryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  entryDateBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: AppTheme.colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  entryDateShort: { fontSize: 10, fontWeight: '700', color: '#6A4040', fontFamily: AppTheme.fonts.labelSmall.fontFamily, textAlign: 'center', textTransform: 'uppercase' },
  entryTitle: { fontSize: 13.5, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  entryDateFull: { fontSize: 11.5, color: AppTheme.colors.placeholderText, marginTop: 1, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 66 },

  paginationDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D8C8B8' },
  dotActive: { backgroundColor: AppTheme.colors.primary, width: 18 },

  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 32, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, textAlign: 'center', lineHeight: 19, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  skeleton: { backgroundColor: AppTheme.colors.background, borderRadius: 14, padding: 16, gap: 4, borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  skeletonLine: { height: 14, borderRadius: 7, backgroundColor: AppTheme.colors.dotsColor },
});
