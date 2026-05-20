/**
 * Entrada de diário do paciente — somente leitura, estética de diário de papel.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { getValidAccessToken } from '../../../services/authService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LINE_H = 32;
const NUM_LINES = 60;

function formatFull(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

export default function SupportDiaryEntry() {
  const { patientId, patientName, date } = useLocalSearchParams<{ patientId: string; patientName: string; date: string }>();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      const load = async () => {
        setLoading(true);
        try {
          // Tenta ler do cache local primeiro
          const cached = await AsyncStorage.getItem(`support_diary_${patientId}`);
          if (cached) {
            const entries: { date: string; content: string }[] = JSON.parse(cached);
            const found = entries.find(e => e.date === date);
            if (found) {
              setContent(found.content || '');
              setLoading(false);
              Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
              return;
            }
          }
          // Fallback: re-fetcha do backend
          const token = await getValidAccessToken();
          const res = await fetch(`${API_BASE_URL}/support/patient/${patientId}/diary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const entries: { date: string; content: string }[] = await res.json();
            await AsyncStorage.setItem(`support_diary_${patientId}`, JSON.stringify(entries));
            const found = entries.find(e => e.date === date);
            setContent(found?.content || '');
          }
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        } catch {
          router.back();
        } finally { setLoading(false); }
      };
      load();
    }, [patientId, date])
  );

  const lineTop = (i: number) => 118 + i * LINE_H;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/support' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={22} color={AppTheme.colors.nameText} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.headerTitle}>{date ? formatFull(date) : 'Passagem'}</Text>
            <Text style={s.headerSub}>{patientName}</Text>
          </View>
          <View style={s.readOnlyBadge}>
            <MaterialIcons name="visibility" size={11} color={AppTheme.colors.tertiary} />
            <Text style={s.readOnlyText}>Leitura</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={AppTheme.colors.tertiary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.sheetOuter} showsVerticalScrollIndicator={false}>
          <Animated.View style={[s.sheet, { opacity: fadeAnim }]}>
            {/* Linhas de papel */}
            {Array.from({ length: NUM_LINES }).map((_, i) => (
              <View key={i} style={[s.line, { top: lineTop(i) }]} />
            ))}
            {/* Margem vertical */}
            <View style={s.margin} />

            <View style={s.innerContent}>
              <Text style={s.dateStrip}>{date ? formatFull(date) : ''}</Text>
              <View style={s.stripLine} />
              <Text style={s.bodyText}>{content}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F0E8' },

  header: {
    backgroundColor: AppTheme.colors.background,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily, textTransform: 'capitalize' },
  headerSub: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  readOnlyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: AppTheme.colors.secondary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  readOnlyText: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  sheetOuter: { padding: 16, paddingBottom: 60 },
  sheet: {
    backgroundColor: '#FEF9EE',
    borderRadius: 4,
    minHeight: 600,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#7A6A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  line: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: '#DDD0B0',
  },
  margin: {
    position: 'absolute', top: 0, bottom: 0, left: 52, width: 1.5,
    backgroundColor: AppTheme.colors.primary + '90',
  },
  innerContent: {
    paddingTop: 20, paddingLeft: 62, paddingRight: 18, paddingBottom: 40,
  },
  dateStrip: {
    fontSize: 12, color: '#8A6A50', fontStyle: 'italic', marginBottom: 4,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, textTransform: 'capitalize',
  },
  stripLine: {
    height: 1, backgroundColor: '#C8B098', marginBottom: 18,
  },
  bodyText: {
    fontSize: 15, lineHeight: LINE_H, color: '#3A2A1A',
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
});
