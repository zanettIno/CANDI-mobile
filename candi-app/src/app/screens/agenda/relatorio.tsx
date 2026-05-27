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

// Tipagem para organizar o que vem do seu prompt do Gemini
interface AnalysisState {
  resumoEmpatico: string;
  tendenciaGeral: string;
  observacoesRelevantes: string;
  recomendacoes: string[];
  mensagemAlerta: string;
}

export default function Relatorio() {
  const router = useRouter();
  const toast = useToast();
  const scrollRef = useScrollToTopOnFocus();
  const [userUid, setUserUid] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Agora o estado guarda o objeto completo estruturado
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { 
          const d = await res.json(); 
          setUserUid(d.profile_id); 
        }
      } catch { }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!userUid) return;
    setLoading(true);
    setAnalysis(null); // Limpa o relatório anterior
    
    try {
      const res = await fetch('https://o4qybt43vyqsb6p3uvebkczjqq0rsufl.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userUid }),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        let parsedBody = data;
        if (data && data.body) {
          parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        }

        const ai = parsedBody.ai_analysis;

        if (ai) {
          // Mapeia cirurgicamente cada chave conforme o seu System Prompt do Lambda
          setAnalysis({
            resumoEmpatico: ai.resumo_empatico || '',
            tendenciaGeral: ai.analise_sentimentos?.tendencia_geral || 'Não identificada',
            observacoesRelevantes: ai.analise_sentimentos?.observacoes_relevantes || '',
            recomendacoes: Array.isArray(ai.recomendacoes) ? ai.recomendacoes : [],
            mensagemAlerta: ai.alerta_saude_mental?.mensagem || ''
          });
        } else {
          toast.error('Estrutura de relatório inválida.');
        }
      } else {
        toast.error('Não foi possível gerar o relatório.');
      }
    } catch (error) { 
      console.error(error);
      toast.error('Erro de conexão.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
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
                Nossa IA analisa seus compromissos, sintomas e sentimentos para gerar um resumo do seu tratamento.
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

        {/* --- EXIBIÇÃO DO RELATÓRIO ESTRUTURADO --- */}
        {analysis && !loading ? (
          <View style={{ gap: 14 }}>
            
            {/* Alerta de Saúde Mental (Só renderiza se a IA preencher a mensagem) */}
            {analysis.mensagemAlerta ? (
              <View style={[s.reportCard, { borderColor: '#ffccd5', backgroundColor: '#fff5f5' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name="warning" size={18} color="#d9383a" />
                  <Text style={[s.reportTitle, { color: '#d9383a' }]}>Aviso Importante</Text>
                </View>
                <Text style={[s.reportText, { color: '#b32426' }]}>{analysis.mensagemAlerta}</Text>
              </View>
            ) : null}

            {/* Card Principal: Resumo e Tendência */}
            <View style={s.reportCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.reportTitle}>Resumo Geral</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>{analysis.tendenciaGeral}</Text>
                </View>
              </View>
              <Text style={s.reportText}>{analysis.resumoEmpatico}</Text>
            </View>

            {/* Card de Observações Relevantes */}
            {analysis.observacoesRelevantes ? (
              <View style={s.reportCard}>
                <Text style={s.reportTitle}>Padrões & Observações</Text>
                <Text style={s.reportText}>{analysis.observacoesRelevantes}</Text>
              </View>
            ) : null}

            {/* Card de Recomendações (Mapeia o Array para linhas de texto) */}
            {analysis.recomendacoes.length > 0 ? (
              <View style={s.reportCard}>
                <Text style={s.reportTitle}>Recomendações para Hoje</Text>
                {analysis.recomendacoes.map((item, index) => (
                  <View key={index} style={s.todoLine}>
                    <MaterialIcons name="check-circle-outline" size={16} color={AppTheme.colors.tertiary} style={{ marginTop: 2 }} />
                    <Text style={s.todoText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}

          </View>
        ) : null}

        <TouchableOpacity
          style={[s.btn, (!userUid || loading) && { opacity: 0.5 }]}
          onPress={handleGenerate}
          disabled={!userUid || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="auto-awesome" size={18} color="#fff" />
              <Text style={s.btnText}>{analysis ? 'Gerar novo relatório' : 'Gerar relatório'}</Text>
            </>
          )}
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
  badge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20
  },
  badgeText: {
    fontSize: 11, fontWeight: '600', color: AppTheme.colors.placeholderText, textTransform: 'uppercase'
  },
  todoLine: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2
  },
  todoText: {
    flex: 1, fontSize: 14, color: AppTheme.colors.textColor, lineHeight: 20, fontFamily: AppTheme.fonts.bodyMedium.fontFamily
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 15,
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
});