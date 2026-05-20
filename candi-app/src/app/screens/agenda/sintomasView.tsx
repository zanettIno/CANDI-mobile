import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function SintomasView() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/schedule/symptoms`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSymptoms(data.map((s: any) => ({
            description: s.description,
            date: new Date(s.created_at).toLocaleDateString('pt-BR'),
          })));
        }
      } catch { } finally { setIsLoading(false); }
    };
    load();
  }, []));

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Sintomas</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/screens/agenda/medicamentosView' as any)} activeOpacity={0.7}>
          <Text style={s.tabText}>Medicamentos</Text>
        </TouchableOpacity>
        <View style={[s.tab, s.tabActive]}>
          <Text style={s.tabTextActive}>Sintomas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 40 }} />
        ) : symptoms.length === 0 ? (
          <View style={s.empty}>
            <MaterialIcons name="healing" size={40} color={AppTheme.colors.dotsColor} />
            <Text style={s.emptyTitle}>Nenhum sintoma registrado</Text>
          </View>
        ) : (
          <View style={s.listCard}>
            {symptoms.map((sym, i) => (
              <React.Fragment key={i}>
                <View style={s.symRow}>
                  <View style={s.symIconWrap}>
                    <MaterialIcons name="healing" size={18} color={AppTheme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.symDesc}>{sym.description}</Text>
                    <Text style={s.symDate}>{sym.date}</Text>
                  </View>
                </View>
                {i < symptoms.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => router.push('/screens/agenda/sintomasAdd')} activeOpacity={0.88}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { backgroundColor: AppTheme.colors.primary, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  tabs: {
    flexDirection: 'row', backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: AppTheme.colors.tertiary },
  tabText: { fontSize: 14, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  tabTextActive: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  content: { padding: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  listCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  symRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  symIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.primary + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  symDesc: {
    fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  symDate: {
    fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 1,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 62 },

  fab: {
    position: 'absolute', bottom: 26, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: AppTheme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
