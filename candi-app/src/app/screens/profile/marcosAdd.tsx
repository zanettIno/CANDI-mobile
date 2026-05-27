import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, StatusBar, ActivityIndicator, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';
import LoginSignupBackground from '../../../components/LoginSignupBackground';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function MarcosAdd() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', completed: false });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Informe a descrição do marco.');
      return;
    }
    if (!form.date) {
      toast.error('Informe a data do marco.');
      return;
    }
    const parts = form.date.replace(/[^0-9]/g, '/').split('/');
    if (parts.length !== 3 || parts[2]?.length !== 4) {
      toast.error('Data inválida. Use o formato dd/mm/aaaa.');
      return;
    }
    const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/milestones`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: '',
          date: isoDate,
          type: form.completed ? 'fixed' : 'custom',
          position: null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');
      toast.success('Marco registrado!');
      if (router.canGoBack()) router.back();
      else router.replace('/screens/profile/marcosView' as any);
    } catch (e: any) {
      toast.error(e.message || 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.screen}>
        <View style={s.header}>
          <View style={s.headerBg}><LoginSignupBackground /></View>
          <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/profile/marcosView' as any)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Novo Marco</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Intro */}
          <View style={s.introCard}>
            <View style={s.introIconWrap}>
              <MaterialIcons name="flag" size={20} color={AppTheme.colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.introTitle}>Registre sua conquista</Text>
              <Text style={s.introText}>
                Cada etapa da sua jornada merece ser celebrada. Registrar marcos é uma forma de reconhecer o quanto você já avançou.
              </Text>
            </View>
          </View>

          {/* Campos */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Informações do marco</Text>
            <View style={s.card}>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Descrição</Text>
                <TextInput
                  style={s.input}
                  value={form.title}
                  onChangeText={v => setForm(p => ({ ...p, title: v }))}
                  placeholder="Ex: Última quimioterapia do tratamento"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  maxLength={120}
                />
              </View>
              <View style={s.divider} />
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Data do marco</Text>
                <TextInput
                  style={s.input}
                  value={form.date}
                  onChangeText={v => setForm(p => ({ ...p, date: v }))}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={s.divider} />
              <TouchableOpacity
                style={s.toggleRow}
                onPress={() => setForm(p => ({ ...p, completed: !p.completed }))}
                activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Marco já concluído</Text>
                  <Text style={s.toggleSub}>Marque se este evento já aconteceu</Text>
                </View>
                <Switch
                  value={form.completed}
                  onValueChange={v => setForm(p => ({ ...p, completed: v }))}
                  trackColor={{ false: AppTheme.colors.dotsColor, true: AppTheme.colors.tertiary + '88' }}
                  thumbColor={form.completed ? AppTheme.colors.tertiary : '#f4f3f4'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.saveBtnText}>Salvar marco</Text></>}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { height: 100, position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12, zIndex: 1,
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 17, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },

  body: { flex: 1 },

  introCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, margin: 16, marginBottom: 0,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  introIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  introTitle: {
    fontSize: 14, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily, marginBottom: 4,
  },
  introText: {
    fontSize: 13, color: AppTheme.colors.placeholderText, lineHeight: 19,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    marginBottom: 8, paddingLeft: 2,
  },
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 16 },
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 4,
  },
  input: {
    fontSize: 15, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    padding: 0,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  toggleLabel: {
    fontSize: 14.5, fontWeight: '500', color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  toggleSub: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 1,
  },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 14, paddingVertical: 15,
  },
  saveBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '700',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
});
