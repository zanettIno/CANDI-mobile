import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import LoginSignupBackground from '../../../components/LoginSignupBackground';
import { cancerTypes } from '../../../components/Inputs/inputTypeCancer';
import { useProfile } from '@/context/ProfileContext';
import { API_BASE_URL } from '../../../constants/api';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function Settings() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    profile_name: '',
    profile_nickname: '',
    profile_birth_date: '',
    cancer_type_id: 0,
  });
  const [showCancerPicker, setShowCancerPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const datePart = data.profile_birth_date?.split('T')[0] ?? '';
          const [y, m, d] = datePart.split('-');
          setForm({
            profile_name: data.profile_name || '',
            profile_nickname: data.profile_nickname || '',
            profile_birth_date: datePart ? `${d}/${m}/${y}` : '',
            cancer_type_id: data.cancer_type_id || 0,
          });
        }
      } catch { /* silencioso */ }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.profile_name.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Converte data de dd/mm/yyyy para yyyy-mm-dd
      let isoDate: string | undefined;
      if (form.profile_birth_date) {
        const parts = form.profile_birth_date.replace(/[^0-9]/g, '/').split('/');
        if (parts.length === 3) isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const body: any = { profile_name: form.profile_name.trim() };
      if (form.profile_nickname) body.profile_nickname = form.profile_nickname.trim();
      if (isoDate) body.profile_birth_date = isoDate;
      if (form.cancer_type_id) body.cancer_type_id = form.cancer_type_id;

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');
      await refreshProfile();
      Alert.alert('Salvo!', 'Perfil atualizado com sucesso.');
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  const selectedCancer = cancerTypes.find(c => c.id === form.cancer_type_id)?.name ?? 'Não informado';

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.screen}>
        {/* Header gradiente */}
        <View style={s.header}>
          <View style={s.heroBg}><LoginSignupBackground /></View>
          <View style={s.heroOverlay} />
          <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.saveBtn}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Informações Pessoais</Text>
            <View style={s.card}>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Nome completo</Text>
                <TextInput
                  style={s.input}
                  value={form.profile_name}
                  onChangeText={v => setForm(p => ({ ...p, profile_name: v }))}
                  placeholder="Seu nome"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  maxLength={80}
                />
              </View>
              <View style={s.divider} />
              <View style={s.field}>
                <Text style={s.fieldLabel}>Apelido / @username</Text>
                <TextInput
                  style={s.input}
                  value={form.profile_nickname}
                  onChangeText={v => setForm(p => ({ ...p, profile_nickname: v }))}
                  placeholder="Como prefere ser chamado"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  maxLength={40}
                />
              </View>
              <View style={s.divider} />
              <View style={s.field}>
                <Text style={s.fieldLabel}>Data de nascimento</Text>
                <TextInput
                  style={s.input}
                  value={form.profile_birth_date}
                  onChangeText={v => setForm(p => ({ ...p, profile_birth_date: v }))}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Diagnóstico</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.field} onPress={() => setShowCancerPicker(true)} activeOpacity={0.7}>
                <Text style={s.fieldLabel}>Tipo de câncer</Text>
                <View style={s.selectRow}>
                  <Text style={[s.input, { color: form.cancer_type_id ? AppTheme.colors.textColor : AppTheme.colors.placeholderText }]}>
                    {selectedCancer}
                  </Text>
                  <MaterialIcons name="expand-more" size={20} color={AppTheme.colors.placeholderText} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <TouchableOpacity style={s.dangerBtn} onPress={async () => {
              Alert.alert('Sair da conta', 'Tem certeza?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sair', style: 'destructive', onPress: async () => {
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                    router.replace('/');
                  }
                },
              ]);
            }} activeOpacity={0.8}>
              <MaterialIcons name="logout" size={18} color="#ef4444" />
              <Text style={s.dangerText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Cancer type picker modal */}
      {showCancerPicker && (
        <View style={s.pickerOverlay}>
          <View style={s.pickerSheet}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Tipo de câncer</Text>
              <TouchableOpacity onPress={() => setShowCancerPicker(false)}>
                <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {cancerTypes.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.pickerItem, form.cancer_type_id === c.id && s.pickerItemActive]}
                  onPress={() => { setForm(p => ({ ...p, cancer_type_id: c.id })); setShowCancerPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.pickerItemText, form.cancer_type_id === c.id && s.pickerItemTextActive]}>
                    {c.name}
                  </Text>
                  {form.cancer_type_id === c.id && (
                    <MaterialIcons name="check" size={18} color={AppTheme.colors.tertiary} />
                  )}
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { height: 100, position: 'relative' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, zIndex: 1, flex: 1,
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  saveBtn: {
    fontSize: 15, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  body: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: {
    fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6,
    color: AppTheme.colors.placeholderText, textTransform: 'uppercase',
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    marginBottom: 8, paddingHorizontal: 2,
  },
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  field: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 4,
  },
  input: {
    fontSize: 15, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily, padding: 0,
  },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 16 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff5f5', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#fecaca',
  },
  dangerText: {
    fontSize: 14, fontWeight: '600', color: '#ef4444',
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  // Cancer picker
  pickerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
    zIndex: 999,
  },
  pickerSheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '60%', paddingHorizontal: 16,
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
    marginBottom: 4,
  },
  pickerTitle: {
    fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  pickerItemActive: { backgroundColor: AppTheme.colors.secondary + '40' },
  pickerItemText: {
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  pickerItemTextActive: { color: AppTheme.colors.tertiary, fontWeight: '600' },
});
