import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const MOODS = [
  { score: 1, emoji: '😞', label: 'Muito triste' },
  { score: 2, emoji: '😐', label: 'Triste' },
  { score: 3, emoji: '🙂', label: 'Normal' },
  { score: 4, emoji: '😊', label: 'Alegre' },
  { score: 5, emoji: '😄', label: 'Muito feliz' },
];

interface Feeling { feeling_id: string; happiness: number; observation: string; created_at: string; }

export default function SentimentosAdd() {
  const toast = useToast();
  const scrollRef = useScrollToTopOnFocus();
  const [mood, setMood] = useState(3);
  const [observation, setObservation] = useState('');
  const [saving, setSaving] = useState(false);
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const PAGE_SIZE = 10;
  const visible = feelings.slice(0, page * PAGE_SIZE);
  const hasMore = feelings.length > page * PAGE_SIZE;

  const fetchFeelings = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/journal/feelings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFeelings(await res.json());
    } catch { }
    finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 360, useNativeDriver: true }).start();
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fadeAnim.setValue(0);
    setPage(1);
    fetchFeelings();
  }, [fetchFeelings]));

  const handleSave = async () => {
    if (!observation.trim()) {
      toast.error('Conta um pouco sobre o que você está sentindo.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/journal/feelings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ happiness: mood, observation: observation.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');
      toast.success('Sentimento registrado.');
      setObservation('');
      setMood(3);
      await fetchFeelings();
    } catch (e: any) { toast.error(e.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  const selected = MOODS.find(m => m.score === mood)!;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const lastMonth = feelings.filter(f => new Date(f.created_at) >= thirtyDaysAgo);
  const avgScore = lastMonth.length > 0
    ? lastMonth.reduce((s, f) => s + f.happiness, 0) / lastMonth.length
    : null;
  const moodCounts = MOODS.map(m => ({
    ...m, count: lastMonth.filter(f => f.happiness === m.score).length,
  }));
  const maxCount = Math.max(...moodCounts.map(m => m.count), 1);
  const dominant = avgScore !== null
    ? MOODS.find(m => m.score === Math.round(avgScore))!
    : null;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeDiary' as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Sentimentos</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={s.headerSub}>Como você está se sentindo agora?</Text>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>

          {/* Humor atual */}
          <View style={s.moodCard}>
            <View style={s.moodSelected}>
              <Text style={s.moodSelectedEmoji}>{selected.emoji}</Text>
              <Text style={s.moodSelectedLabel}>{selected.label}</Text>
            </View>
            <View style={s.moodRow}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.score}
                  style={[s.moodBtn, mood === m.score && s.moodBtnActive]}
                  onPress={() => setMood(m.score)}
                  activeOpacity={0.7}>
                  <Text style={s.moodEmoji}>{m.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Observação */}
          <Text style={s.sectionTitle}>O que está te fazendo sentir assim?</Text>
          <View style={s.inputCard}>
            <TextInput
              style={s.input}
              value={observation}
              onChangeText={setObservation}
              placeholder="Pode escrever aqui, sem julgamentos..."
              placeholderTextColor={AppTheme.colors.placeholderText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              selectionColor={AppTheme.colors.tertiary}
            />
          </View>

          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.saveBtnText}>Registrar sentimento</Text></>}
          </TouchableOpacity>

          {/* Relatório do último mês */}
          {!loading && lastMonth.length > 0 && (
            <View style={s.reportCard}>
              <Text style={s.reportTitle}>Resumo do último mês</Text>
              <Text style={s.reportSub}>{lastMonth.length} {lastMonth.length === 1 ? 'registro' : 'registros'} nos últimos 30 dias</Text>

              {dominant && (
                <View style={s.reportHighlight}>
                  <Text style={s.reportHighlightEmoji}>{dominant.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.reportHighlightLabel}>Humor predominante</Text>
                    <Text style={s.reportHighlightValue}>{dominant.label}</Text>
                  </View>
                  <View style={s.reportScoreWrap}>
                    <Text style={s.reportScore}>{avgScore!.toFixed(1)}</Text>
                    <Text style={s.reportScoreLabel}>média</Text>
                  </View>
                </View>
              )}

              <View style={s.reportBars}>
                {moodCounts.map(m => {
                  const fillH = maxCount > 0 ? Math.round((m.count / maxCount) * 52) : 0;
                  const fillColor = m.score <= 2 ? AppTheme.colors.primary
                    : m.score === 3 ? AppTheme.colors.dotsColor
                    : AppTheme.colors.secondary;
                  return (
                    <View key={m.score} style={s.reportBarItem}>
                      <View style={s.reportBarTrack}>
                        <View style={[s.reportBarFill, { height: fillH, backgroundColor: fillColor }]} />
                      </View>
                      <Text style={s.reportBarEmoji}>{m.emoji}</Text>
                      <Text style={s.reportBarCount}>{m.count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Histórico */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>Histórico</Text>
            <View style={s.dividerLine} />
          </View>

          {loading ? (
            <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 16 }} />
          ) : feelings.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Nenhum registro ainda</Text>
              <Text style={s.emptySub}>Seus sentimentos registrados aparecerão aqui.</Text>
            </View>
          ) : (
            <View>
              <View style={s.listCard}>
                {visible.map((f, i) => {
                  const m = MOODS.find(x => x.score === f.happiness) ?? MOODS[2];
                  return (
                    <View key={f.feeling_id}>
                      <View style={s.feelingRow}>
                        <Text style={s.feelingEmoji}>{m.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={s.feelingTop}>
                            <Text style={s.feelingLabel}>{m.label}</Text>
                            <Text style={s.feelingDate}>{new Date(f.created_at).toLocaleDateString('pt-BR')}</Text>
                          </View>
                          {f.observation
                            ? <Text style={s.feelingObs} numberOfLines={2}>{f.observation}</Text>
                            : null}
                        </View>
                      </View>
                      {i < visible.length - 1 && <View style={s.itemDivider} />}
                    </View>
                  );
                })}
              </View>
              {hasMore && (
                <TouchableOpacity style={s.loadMoreBtn} onPress={() => setPage(p => p + 1)} activeOpacity={0.8}>
                  <Text style={s.loadMoreText}>Ver mais {Math.min(PAGE_SIZE, feelings.length - page * PAGE_SIZE)} registros</Text>
                  <MaterialIcons name="expand-more" size={18} color={AppTheme.colors.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          )}

        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F0E8' },

  header: {
    backgroundColor: AppTheme.colors.tertiary,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 4,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: {
    textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, paddingBottom: 4,
  },

  content: { padding: 16 },

  moodCard: {
    backgroundColor: '#FEF9EE',
    borderRadius: 16, padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#E0D8C8',
    alignItems: 'center',
  },
  moodSelected: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodSelectedEmoji: { fontSize: 28 },
  moodSelectedLabel: {
    fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  moodRow: { flexDirection: 'row', gap: 8 },
  moodBtn: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F0E8',
    borderWidth: 1, borderColor: '#E0D8C8',
  },
  moodBtnActive: {
    backgroundColor: AppTheme.colors.secondary,
    borderColor: AppTheme.colors.tertiary,
    borderWidth: 2,
  },
  moodEmoji: { fontSize: 24 },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6,
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    paddingLeft: 2,
  },

  inputCard: {
    backgroundColor: '#FEF9EE',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E0D8C8',
  },
  input: {
    fontSize: 14.5, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    minHeight: 90, padding: 0, lineHeight: 22,
  },

  saveBtn: {
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.labelLarge.fontFamily },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0D8C8' },
  dividerText: {
    fontSize: 11, color: AppTheme.colors.placeholderText, textTransform: 'uppercase',
    letterSpacing: 0.8, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  listCard: {
    backgroundColor: '#FEF9EE', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E0D8C8',
  },
  feelingRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  feelingEmoji: { fontSize: 26, lineHeight: 32 },
  feelingTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  feelingLabel: {
    fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  feelingDate: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  feelingObs: {
    fontSize: 13, color: AppTheme.colors.textColor, lineHeight: 19,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  itemDivider: { height: 1, backgroundColor: '#E8E0D0', marginLeft: 52 },

  reportCard: {
    backgroundColor: '#FEF9EE',
    borderRadius: 16, padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#E0D8C8',
  },
  reportTitle: {
    fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  reportSub: {
    fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: -8,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  reportHighlight: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F5F0E8', borderRadius: 12, padding: 12,
  },
  reportHighlightEmoji: { fontSize: 28 },
  reportHighlightLabel: {
    fontSize: 11, color: AppTheme.colors.placeholderText, textTransform: 'uppercase',
    letterSpacing: 0.5, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  reportHighlightValue: {
    fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginTop: 2,
  },
  reportScoreWrap: { alignItems: 'center' },
  reportScore: {
    fontSize: 22, fontWeight: '800', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  reportScoreLabel: {
    fontSize: 10, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, textTransform: 'uppercase',
  },
  reportBars: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
    height: 80, paddingTop: 8,
  },
  reportBarItem: { alignItems: 'center', gap: 4, flex: 1 },
  reportBarTrack: {
    width: 24, height: 52, backgroundColor: '#E8E0D0',
    borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end',
  },
  reportBarFill: { width: '100%', borderRadius: 6 },
  reportBarEmoji: { fontSize: 14 },
  reportBarCount: {
    fontSize: 10, fontWeight: '600', color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#E0D8C8',
    backgroundColor: '#FEF9EE',
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    marginTop: -1,
  },
  loadMoreText: {
    fontSize: 13, fontWeight: '600', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  empty: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
});
