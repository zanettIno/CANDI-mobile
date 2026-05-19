import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import LoginSignupBackground from '../../../components/LoginSignupBackground';
import { cancerTypes } from '../../../components/Inputs/inputTypeCancer';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/context/NotificationContext';
import { API_BASE_URL } from '../../../constants/api';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function Settings() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [showCancerPicker, setShowCancerPicker] = useState(false);
  const [form, setForm] = useState({
    profile_name: '',
    profile_nickname: '',
    profile_birth_date: '',
    cancer_type_id: 0,
  });

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
      } catch { }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.profile_name.trim()) {
      toast.error('O nome não pode estar vazio.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      let isoDate: string | undefined;
      if (form.profile_birth_date) {
        const parts = form.profile_birth_date.replace(/[^0-9]/g, '/').split('/');
        if (parts.length === 3 && parts[2]?.length === 4) {
          isoDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        }
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
      toast.success('Perfil atualizado!');
      if (router.canGoBack()) router.back();
      else router.replace('/screens/(tabs)/homeProfile');
    } catch (e: any) {
      toast.error(e.message || 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  const selectedCancer = cancerTypes.find(c => c.id === form.cancer_type_id)?.name ?? 'Selecionar';

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.screen}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerBg}><LoginSignupBackground /></View>
          <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeProfile')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.8} style={s.saveHeaderBtn}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.saveHeaderText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Informações pessoais</Text>
            <View style={s.card}>
              <Field label="Nome completo">
                <TextInput
                  style={s.input}
                  value={form.profile_name}
                  onChangeText={v => setForm(p => ({ ...p, profile_name: v }))}
                  placeholder="Seu nome"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  maxLength={80}
                />
              </Field>
              <View style={s.divider} />
              <Field label="Como prefere ser chamado">
                <TextInput
                  style={s.input}
                  value={form.profile_nickname}
                  onChangeText={v => setForm(p => ({ ...p, profile_nickname: v }))}
                  placeholder="Apelido ou @username"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  maxLength={40}
                />
              </Field>
              <View style={s.divider} />
              <Field label="Data de nascimento">
                <TextInput
                  style={s.input}
                  value={form.profile_birth_date}
                  onChangeText={v => setForm(p => ({ ...p, profile_birth_date: v }))}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={AppTheme.colors.placeholderText}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </Field>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Diagnóstico</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.selectRow} onPress={() => setShowCancerPicker(true)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Tipo de câncer</Text>
                  <Text style={[s.selectValue, !form.cancer_type_id && s.selectPlaceholder]}>
                    {selectedCancer}
                  </Text>
                </View>
                <MaterialIcons name="expand-more" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Acesso</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.menuRow} onPress={() => router.push('/screens/profile/contatosView')} activeOpacity={0.7}>
                <View style={s.menuIcon}><MaterialIcons name="contacts" size={20} color={AppTheme.colors.tertiary} /></View>
                <Text style={s.menuLabel}>Contatos de emergência</Text>
                <MaterialIcons name="chevron-right" size={20} color={AppTheme.colors.dotsColor} />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => router.push('/screens/profile/invite')} activeOpacity={0.7}>
                <View style={s.menuIcon}><MaterialIcons name="group-add" size={20} color={AppTheme.colors.tertiary} /></View>
                <Text style={s.menuLabel}>Rede de apoio</Text>
                <MaterialIcons name="chevron-right" size={20} color={AppTheme.colors.dotsColor} />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => router.push('/screens/profile/marcosView')} activeOpacity={0.7}>
                <View style={s.menuIcon}><MaterialIcons name="flag" size={20} color={AppTheme.colors.tertiary} /></View>
                <Text style={s.menuLabel}>Meus marcos</Text>
                <MaterialIcons name="chevron-right" size={20} color={AppTheme.colors.dotsColor} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.saveBtnText}>Salvar alterações</Text></>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Cancer type picker */}
      {showCancerPicker && (
        <View style={s.pickerOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCancerPicker(false)} />
          <View style={s.pickerSheet}>
            <View style={s.pickerHandle} />
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Tipo de câncer</Text>
              <TouchableOpacity onPress={() => setShowCancerPicker(false)}>
                <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
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
              <View style={{ height: 24 }} />
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
  saveHeaderBtn: { paddingHorizontal: 4, minWidth: 48, alignItems: 'flex-end' },
  saveHeaderText: {
    fontSize: 15, fontWeight: '700', color: '#fff',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  body: { flex: 1 },
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
  selectRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  selectValue: {
    fontSize: 15, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  selectPlaceholder: { color: AppTheme.colors.placeholderText },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: {
    flex: 1, fontSize: 14.5, fontWeight: '500',
    color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
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
  pickerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end', zIndex: 999,
  },
  pickerSheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16,
  },
  pickerHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppTheme.colors.dotsColor,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
    marginBottom: 4,
  },
  pickerTitle: {
    fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  pickerItemActive: { backgroundColor: AppTheme.colors.secondary + '40' },
  pickerItemText: {
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  pickerItemTextActive: { color: AppTheme.colors.tertiary, fontWeight: '600' },
});
