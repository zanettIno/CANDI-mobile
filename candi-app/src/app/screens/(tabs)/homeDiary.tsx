import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import CANDITopBar from '../../../components/CANDITopBar';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const CACHE_KEY = 'diary_entries_cache';

const PHRASES = [
  'Como está o seu coração hoje?',
  'Este espaço é só seu, sem julgamentos.',
  'Escreva o que está sentindo.',
  'Suas palavras têm valor.',
  'Aqui você pode ser você mesmo.',
  'O que você está carregando hoje?',
  'Cada registro é um passo da sua jornada.',
];

interface DiaryEntry { date: string; }

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

function formatTodayFull() {
  const d = new Date();
  const s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DiaryScreen() {
  const [entries, setEntries] = React.useState<DiaryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [monthIndex, setMonthIndex] = React.useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(14)).current;
  const phrase = React.useMemo(() => PHRASES[new Date().getDay() % PHRASES.length], []);

  const sortEntries = (data: DiaryEntry[]) =>
    [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const animateIn = () => Animated.parallel([
    Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
  ]).start();

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0); slideAnim.setValue(14);

      const load = async () => {
        // 1. Cache imediato — sem spinner
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            setEntries(sortEntries(JSON.parse(cached)));
            setMonthIndex(0);
            setLoading(false);
            animateIn();
          }
        } catch { }

        // 2. Atualiza em background
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) return;
          const res = await fetch(`${API_BASE_URL}/diary/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setEntries(sortEntries(data));
            setMonthIndex(0);
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
        } catch { }
        finally { setLoading(false); animateIn(); }
      };

      load();
    }, [])
  );

  const openEntry = async (date: string) => {
    await AsyncStorage.setItem('selectedDiaryDate', date);
    router.push('/screens/diary/passagemRead');
  };

  const today = new Date().toISOString().split('T')[0];
  const hasToday = entries.some(e => e.date === today);

  // Streak: dias consecutivos com entrada
  const streak = React.useMemo(() => {
    let count = 0;
    const d = new Date();
    // se não tem entrada hoje ainda, começa de ontem
    if (!hasToday) d.setDate(d.getDate() - 1);
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (entries.some(e => e.date === key)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [entries, hasToday]);

  // Memória: entrada mais antiga com mais de 7 dias
  const memory = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const old = entries.filter(e => new Date(e.date) < cutoff);
    return old.length > 0 ? old[Math.floor(Math.random() * old.length)] : null;
  }, [entries]);

  // Entradas deste mês
  const thisMonth = React.useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return entries.filter(e => e.date.startsWith(key)).length;
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
      <CANDITopBar />

      {/* Header rosa sólido */}
      <View style={s.header}>
        <View style={[s.headerContent, { paddingTop: 8 }]}>
          <View style={s.headerTopRow}>
            <View>
              <Text style={s.headerLabel}>Meu Diário</Text>
              <Text style={s.headerDate}>{formatTodayFull()}</Text>
            </View>
            <TouchableOpacity
              style={s.heartBtn}
              onPress={() => router.push('/screens/diary/sentimentosAdd')}
              activeOpacity={0.75}>
              <MaterialIcons name="favorite" size={15} color={AppTheme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 10 }}>

          {/* Card sentimentos — verde menta */}
          <TouchableOpacity style={s.feelingsCard} onPress={() => router.push('/screens/diary/sentimentosAdd')} activeOpacity={0.82}>
            <View style={s.feelingsRow}>
              <View style={s.feelingsIconWrap}>
                <MaterialIcons name="favorite-border" size={20} color="#1a6a45" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.feelingsTitle}>Como você está?</Text>
                <Text style={s.feelingsSub}>Registre seu humor agora</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#70B890" />
            </View>
          </TouchableOpacity>

          {/* Stats + Streak */}
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

          {/* Memória */}
          {!loading && memory && (
            <TouchableOpacity
              style={s.memoryCard}
              onPress={() => openEntry(memory.date)}
              activeOpacity={0.82}>
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

          {/* Hoje — entre memória e registros */}
          {!loading && (
            <TouchableOpacity
              style={s.todayCard}
              activeOpacity={0.82}
              onPress={() => hasToday ? openEntry(today) : router.push('/screens/diary/passagemAdd')}>
              <View style={s.todayRow}>
                <View style={s.todayIconWrap}>
                  <MaterialIcons name={hasToday ? 'menu-book' : 'edit'} size={20} color="#c0484a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.todayTitle}>{hasToday ? 'Passagem de hoje' : 'Escrever hoje'}</Text>
                  <Text style={s.todaySub}>{formatDate(today)}</Text>
                </View>
                <MaterialIcons name={hasToday ? 'chevron-right' : 'add'} size={20} color="#C8B89A" />
              </View>
            </TouchableOpacity>
          )}

          {/* Registros */}
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Registros</Text>
            {entries.length > 0 && (
              <View style={s.countBadge}>
                <Text style={s.countText}>{entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}</Text>
              </View>
            )}
          </View>

          {loading && entries.length === 0 ? (
            <View style={s.skeleton}>
              <View style={[s.skeletonLine, { width: '80%' }]} />
              <View style={[s.skeletonLine, { width: '60%', marginTop: 6 }]} />
              <View style={[s.skeletonLine, { width: '70%', marginTop: 6 }]} />
            </View>
          ) : entries.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Ainda sem registros</Text>
              <Text style={s.emptySub}>
                Cada passagem que você escrever ficará guardada aqui com carinho.
              </Text>
            </View>
          ) : (
            <View>
              <View style={s.monthNav}>
                <TouchableOpacity
                  style={s.monthNavBtn}
                  onPress={() => canPrev && setMonthIndex(i => i + 1)}
                  activeOpacity={0.7}
                  disabled={!canPrev}>
                  <MaterialIcons name="chevron-left" size={20} color={canPrev ? '#6A5040' : '#C8B89A'} />
                </TouchableOpacity>
                <View style={s.monthNavCenter}>
                  <Text style={s.monthNavTitle}>{currentGroup ? formatMonthYear(currentGroup.key) : ''}</Text>
                  <Text style={s.monthNavCount}>
                    {currentGroup?.items.length ?? 0} {(currentGroup?.items.length ?? 0) === 1 ? 'passagem' : 'passagens'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.monthNavBtn}
                  onPress={() => canNext && setMonthIndex(i => i - 1)}
                  activeOpacity={0.7}
                  disabled={!canNext}>
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
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => router.push('/screens/diary/passagemAdd')} activeOpacity={0.88}>
        <MaterialIcons name="edit" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  // ── Header padrão CANDI ───────────────────────────────────────────────
  header: {
    backgroundColor: AppTheme.colors.background,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  headerContent: {
    paddingHorizontal: 20, paddingBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  streakPillText: {
    fontSize: 11, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  heartBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: AppTheme.colors.cardBackground,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  headerLabel: {
    fontSize: 20, fontWeight: '800', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily, letterSpacing: -0.3,
  },
  headerDate: {
    fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 1,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, textTransform: 'capitalize',
  },

  content: { padding: 16 },

  // ── Card hoje ─────────────────────────────────────────────────────────
  todayCard: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.primary,
    shadowColor: '#B07070',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayIconWrap: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: AppTheme.colors.primary + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  todayTitle: {
    fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  todaySub: {
    fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  // ── Card sentimentos (verde) ──────────────────────────────────────────
  feelingsCard: {
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#A8D8C0',
  },
  feelingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feelingsIconWrap: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  feelingsTitle: {
    fontSize: 14, fontWeight: '700', color: '#1a4a30',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  feelingsSub: {
    fontSize: 12, color: '#3a7a58', marginTop: 1,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  // ── Stats ─────────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  statValue: {
    fontSize: 22, fontWeight: '800', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  statLabel: {
    fontSize: 10, color: AppTheme.colors.placeholderText, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  streakCard: {
    backgroundColor: AppTheme.colors.primary + '25',
    borderColor: AppTheme.colors.primary,
  },
  streakValue: {
    fontSize: 22, fontWeight: '800', color: '#6A2020',
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  streakLabel: {
    fontSize: 10, color: '#8A4040', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, textAlign: 'center',
  },

  // ── Memória ───────────────────────────────────────────────────────────
  memoryCard: {
    backgroundColor: AppTheme.colors.secondary + '60',
    borderRadius: 14, padding: 13,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: AppTheme.colors.secondary,
  },
  memoryIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  memoryLabel: {
    fontSize: 13, fontWeight: '700', color: '#1a4a30',
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  memoryDate: {
    fontSize: 11.5, color: '#3a6a50', marginTop: 1,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  // ── Seção registros ───────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingLeft: 2, marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8,
    color: '#A89878', fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  countBadge: {
    backgroundColor: AppTheme.colors.primary + '30',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: {
    fontSize: 11, fontWeight: '600', color: '#6A4040',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  // ── Navegador de mês ──────────────────────────────────────────────────
  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
    borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  monthNavBtn: { padding: 12 },
  monthNavCenter: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  monthNavTitle: {
    fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily, textTransform: 'capitalize',
  },
  monthNavCount: {
    fontSize: 11, color: AppTheme.colors.placeholderText, marginTop: 2,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  // ── Lista de entradas ─────────────────────────────────────────────────
  listCard: {
    backgroundColor: AppTheme.colors.background, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, gap: 12,
  },
  entryRowToday: { backgroundColor: AppTheme.colors.primary + '18' },
  entryDateBoxToday: { backgroundColor: AppTheme.colors.primary },
  entryDateShortToday: { color: '#4A1A1A', fontSize: 9 },
  entryDateBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: AppTheme.colors.primary + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  entryDateShort: {
    fontSize: 10, fontWeight: '700', color: '#6A4040',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    textAlign: 'center', textTransform: 'uppercase',
  },
  entryTitle: {
    fontSize: 13.5, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  entryDateFull: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText, marginTop: 1,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 66 },

  // ── Dots paginação ────────────────────────────────────────────────────
  paginationDots: {
    flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D8C8B8' },
  dotActive: { backgroundColor: AppTheme.colors.primary, width: 18 },

  // ── Empty / FAB ───────────────────────────────────────────────────────
  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 32, gap: 6 },
  emptyTitle: {
    fontSize: 15, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  emptySub: {
    fontSize: 13, color: AppTheme.colors.placeholderText, textAlign: 'center', lineHeight: 19,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  skeleton: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 14, padding: 16, gap: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  skeletonLine: {
    height: 14, borderRadius: 7,
    backgroundColor: AppTheme.colors.dotsColor,
  },

  fab: {
    position: 'absolute', bottom: 26, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
});
