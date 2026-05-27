import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';
import LoginSignupBackground from '../../../components/LoginSignupBackground';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const SYMPTOMS = ['Enjoo', 'Dor de cabeça', 'Febre', 'Tontura', 'Náusea', 'Dor abdominal', 'Fadiga', 'Insônia', 'Falta de apetite', 'Dor no corpo'];

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

export default function SintomasAdd() {
  const router = useRouter();
  const toast = useToast();

  const [selected, setSelected] = React.useState('');
  const [other, setOther] = React.useState('');
  const [date, setDate] = React.useState(todayFormatted());
  const [saving, setSaving] = React.useState(false);
  const [showPicker, setShowPicker] = React.useState(false);

  const handleSave = async () => {
    const parts = [];
    if (selected) parts.push(selected);
    if (other.trim()) parts.push(other.trim());
    const description = parts.join(', ');
    if (!description) { toast.error('Selecione ou descreva um sintoma.'); return; }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/schedule/symptoms`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');
      toast.success('Sintoma registrado!');
      if (router.canGoBack()) router.back();
    } catch (e: any) { toast.error(e.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  const valid = !!selected || !!other.trim();

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.screen}>
        <View style={s.header}>
          <View style={s.headerBg}><LoginSignupBackground /></View>
          <View style={[s.headerRow, { paddingTop: STATUS_TOP + 8 }]}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Registrar Sintoma</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving || !valid} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[s.saveText, !valid && { opacity: 0.4 }]}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Sintoma</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.selectRow} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Sintoma detectado</Text>
                  <Text style={[s.selectValue, !selected && s.placeholder]}>{selected || 'Selecionar sintoma'}</Text>
                </View>
                <MaterialIcons name="expand-more" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
              <View style={s.divider} />
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Outro sintoma</Text>
                <TextInput style={s.input} value={other} onChangeText={setOther} placeholder="Descreva se não estiver na lista" placeholderTextColor={AppTheme.colors.placeholderText} />
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Data</Text>
            <View style={s.card}>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Data do sintoma</Text>
                <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="dd/mm/aaaa" placeholderTextColor={AppTheme.colors.placeholderText} keyboardType="numeric" maxLength={10} />
              </View>
            </View>
          </View>

          <View style={s.section}>
            <TouchableOpacity style={[s.saveBtn, (!valid || saving) && { opacity: 0.5 }]} onPress={handleSave} disabled={!valid || saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.saveBtnText}>Registrar sintoma</Text></>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {showPicker && (
        <View style={s.pickerOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPicker(false)} />
          <View style={s.pickerSheet}>
            <View style={s.pickerHandle} />
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Sintoma</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}><MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {SYMPTOMS.map(sym => (
                <TouchableOpacity key={sym} style={[s.pickerItem, selected === sym && s.pickerItemActive]} onPress={() => { setSelected(sym); setShowPicker(false); }} activeOpacity={0.7}>
                  <Text style={[s.pickerItemText, selected === sym && s.pickerItemTextActive]}>{sym}</Text>
                  {selected === sym && <MaterialIcons name="check" size={18} color={AppTheme.colors.tertiary} />}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, zIndex: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  body: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 8, paddingLeft: 2 },
  card: { backgroundColor: AppTheme.colors.cardBackground, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: AppTheme.colors.dotsColor },
  divider: { height: 1, backgroundColor: AppTheme.colors.dotsColor, marginLeft: 16 },
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: { fontSize: 11.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 4 },
  input: { fontSize: 15, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily, padding: 0 },
  selectRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  selectValue: { fontSize: 15, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  placeholder: { color: AppTheme.colors.placeholderText },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 15 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 999 },
  pickerSheet: { backgroundColor: AppTheme.colors.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16 },
  pickerHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: AppTheme.colors.dotsColor, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor, marginBottom: 4 },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor },
  pickerItemActive: { backgroundColor: AppTheme.colors.secondary + '40' },
  pickerItemText: { fontSize: 14, color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  pickerItemTextActive: { color: AppTheme.colors.tertiary, fontWeight: '600' },
});
