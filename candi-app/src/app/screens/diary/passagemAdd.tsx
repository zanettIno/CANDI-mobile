import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Platform, StatusBar, ActivityIndicator, KeyboardAvoidingView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const LINE_H = 32;
const NUM_LINES = 60;

function formatFull(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

export default function PassagemAdd() {
  const toast = useToast();
  const params = useLocalSearchParams<{ date?: string }>();
  const [selectedDate] = useState(params.date ?? new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const check = async () => {
      setChecking(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/diary?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const d = await res.json(); setContent(d.content || ''); setIsEditing(true); }
        else { setContent(''); setIsEditing(false); }
      } catch { setIsEditing(false); }
      finally {
        setChecking(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
    };
    check();
  }, [selectedDate]);

  const handleSave = async () => {
    if (!content.trim()) { toast.error('Escreva algo antes de salvar.'); return; }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/diary`, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, content: content.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');
      toast.success(isEditing ? 'Passagem atualizada.' : 'Passagem salva.');
      if (router.canGoBack()) router.back();
      else router.replace('/screens/(tabs)/homeDiary' as any);
    } catch (e: any) { toast.error(e.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={s.screen}>

        <View style={[s.header, { paddingTop: STATUS_TOP + 8 }]}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeDiary' as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.5 }]}
            onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Salvar</Text>}
          </TouchableOpacity>
        </View>

        {checking ? (
          <View style={s.loader}><ActivityIndicator color={AppTheme.colors.tertiary} /></View>
        ) : (
          <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView
                contentContainerStyle={s.page}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                {/* Folha com linhas */}
                <View style={s.sheet}>

                  {/* Linhas horizontais */}
                  {Array.from({ length: NUM_LINES }).map((_, i) => (
                    <View key={i} style={[s.ruleLine, { top: 82 + i * LINE_H }]} />
                  ))}

                  {/* Linha de margem vertical */}
                  <View style={s.marginLine} />

                  {/* Data no topo da folha */}
                  <View style={s.dateRow}>
                    <View style={s.dateAccent} />
                    <Text style={s.dateText}>{formatFull(selectedDate)}</Text>
                  </View>
                  <View style={s.dateDivider} />

                  {/* Área de escrita */}
                  <TextInput
                    style={s.input}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Escreva aqui o que está sentindo..."
                    placeholderTextColor="#C8B89A"
                    multiline
                    textAlignVertical="top"
                    autoFocus={!isEditing}
                    selectionColor={AppTheme.colors.primary}
                  />
                </View>

              </ScrollView>

              <View style={s.footer}>
                <Text style={s.charCount}>
                  {content.length > 0 ? `${content.length} caracteres` : ''}
                </Text>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </>
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
  saveBtn: {
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 9, paddingHorizontal: 14, paddingVertical: 6,
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.labelMedium.fontFamily },

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
    paddingBottom: 32,
  },

  ruleLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: '#DDD0B0',
  },

  marginLine: {
    position: 'absolute',
    top: 0, bottom: 0,
    left: 52,
    width: 1,
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

  input: {
    flex: 1, minHeight: 480,
    fontSize: 16, color: '#2D2010',
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    lineHeight: LINE_H,
    paddingHorizontal: 16,
    paddingLeft: 64,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E0D8C8',
    backgroundColor: '#F5F0E8',
  },
  charCount: {
    fontSize: 12, color: '#A89878',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
});
