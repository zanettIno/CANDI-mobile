import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function Relatorio() {
  const router = useRouter();
  const toast = useToast();
  const scrollRef = useScrollToTopOnFocus();
  const [userUid, setUserUid] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setUserUid(d.profile_id); }
      } catch { }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!userUid) return;
    setLoading(true);
    try {
      const res = await fetch('https://aruaf5hme7.execute-api.us-east-1.amazonaws.com/prod/ia/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userUid }),
      });
      if (res.ok) {
        const data = await res.json();
        const body = typeof data.body === 'string' ? JSON.parse(data.body) : data;
        setAnalysis(body.ai_analysis || '');
      } else {
        toast.error('Não foi possível gerar o relatório.');
      }
    } catch { toast.error('Erro de conexão.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Relatório de Saúde</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={s.headerSub}>Análise gerada por IA com seus dados</Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {!analysis && !loading && (
          <View style={s.introCard}>
            <View style={s.introIconWrap}>
              <MaterialIcons name="assessment" size={24} color={AppTheme.colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.introTitle}>Relatório personalizado</Text>
              <Text style={s.introText}>
                Nossa IA analisa seus compromissos, sintomas e medicamentos para gerar um resumo do seu tratamento.
              </Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
            <Text style={s.loadingText}>Gerando seu relatório...</Text>
          </View>
        )}

        {analysis ? (
          <View style={s.reportCard}>
            <Text style={s.reportTitle}>Análise</Text>
            <Text style={s.reportText}>{analysis}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[s.btn, (!userUid || loading) && { opacity: 0.5 }]}
          onPress={handleGenerate}
          disabled={!userUid || loading}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <><MaterialIcons name="auto-awesome" size={18} color="#fff" /><Text style={s.btnText}>{analysis ? 'Gerar novo relatório' : 'Gerar relatório'}</Text></>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { backgroundColor: AppTheme.colors.tertiary, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  headerSub: { textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: AppTheme.fonts.bodySmall.fontFamily, paddingBottom: 4 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  introCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  introIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  introTitle: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginBottom: 4 },
  introText: { fontSize: 13, color: AppTheme.colors.placeholderText, lineHeight: 19, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  reportCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  reportTitle: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  reportText: { fontSize: 14, color: AppTheme.colors.textColor, lineHeight: 22, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 15,
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
});
