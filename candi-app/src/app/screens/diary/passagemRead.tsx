import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import ActionSheet from '@/components/ActionSheet';
import { useToast } from '@/context/NotificationContext';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const LINE_H = 32;
const NUM_LINES = 60;

function formatFull(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

export default function PassagemRead() {
  const toast = useToast();
  const scrollRef = useScrollToTopOnFocus();
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteSheet, setDeleteSheet] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      const load = async () => {
        setLoading(true);
        try {
          const storedDate = await AsyncStorage.getItem('selectedDiaryDate');
          if (!storedDate) { router.back(); return; }
          setDate(storedDate);
          const token = await AsyncStorage.getItem('accessToken');
          const res = await fetch(`${API_BASE_URL}/diary?date=${storedDate}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          setContent(data.content || '');
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        } catch {
          toast.error('Não foi possível carregar a passagem.');
          router.back();
        } finally { setLoading(false); }
      };
      load();
    }, [])
  );

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/diary?date=${date}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Passagem excluída.');
      if (router.canGoBack()) router.back();
    } catch { toast.error('Não foi possível excluir.'); }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={[s.header, { paddingTop: STATUS_TOP + 8 }]}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeDiary' as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={22} color={AppTheme.colors.placeholderText} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/screens/diary/passagemAdd' as any, params: { date } })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={s.editBtn}>
          <MaterialIcons name="edit" size={16} color={AppTheme.colors.tertiary} />
          <Text style={s.editBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDeleteSheet(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginLeft: 8 }}>
          <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loader}><ActivityIndicator color={AppTheme.colors.tertiary} size="large" /></View>
      ) : (
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          <ScrollView ref={scrollRef} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>

            <View style={s.sheet}>
              {Array.from({ length: NUM_LINES }).map((_, i) => (
                <View key={i} style={[s.ruleLine, { top: 82 + i * LINE_H }]} />
              ))}
              <View style={s.marginLine} />

              <View style={s.dateRow}>
                <View style={s.dateAccent} />
                <Text style={s.dateText}>{formatFull(date)}</Text>
              </View>
              <View style={s.dateDivider} />

              <Text style={s.body}>{content}</Text>

              <View style={s.footerNote}>
                <MaterialIcons name="lock" size={11} color="#B0A080" />
                <Text style={s.footerNoteText}>Visível apenas para você</Text>
              </View>
            </View>

          </ScrollView>
        </Animated.View>
      )}

      <ActionSheet
        visible={deleteSheet}
        title="Excluir passagem"
        options={[{ label: 'Confirmar exclusão', icon: 'delete', destructive: true, onPress: handleDelete }]}
        onDismiss={() => setDeleteSheet(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F0E8' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#E0D8C8',
    backgroundColor: '#F5F0E8',
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: AppTheme.colors.tertiary,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  editBtnText: {
    fontSize: 13, fontWeight: '600', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  page: { flexGrow: 1, padding: 16, paddingBottom: 24 },

  sheet: {
    flex: 1,
    backgroundColor: '#FEF9EE',
    borderRadius: 4,
    minHeight: 600,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#8A7A60',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    paddingBottom: 40,
  },

  ruleLine: {
    position: 'absolute', left: 0, right: 0,
    height: 1, backgroundColor: '#DDD0B0',
  },
  marginLine: {
    position: 'absolute', top: 0, bottom: 0,
    left: 52, width: 1,
    backgroundColor: AppTheme.colors.primary + '90',
  },

  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  dateAccent: {
    width: 3, height: 16, borderRadius: 2,
    backgroundColor: AppTheme.colors.primary,
  },
  dateText: {
    fontSize: 12.5, color: '#8A7A60',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    textTransform: 'capitalize', letterSpacing: 0.2,
  },
  dateDivider: {
    height: 1, backgroundColor: '#DDD0B0',
    marginHorizontal: 16, marginBottom: 0,
  },

  body: {
    fontSize: 16, color: '#2D2010',
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    lineHeight: LINE_H,
    paddingHorizontal: 16,
    paddingLeft: 64,
    paddingTop: 8,
  },

  footerNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    marginTop: 32, marginBottom: 8,
  },
  footerNoteText: {
    fontSize: 11, color: '#B0A080',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
});
