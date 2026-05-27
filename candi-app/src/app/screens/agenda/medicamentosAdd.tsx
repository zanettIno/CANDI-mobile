import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';
import { scheduleMedicineNotification } from '@/services/notifications';
import LoginSignupBackground from '../../../components/LoginSignupBackground';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={fieldWrapStyle}>
    <Text style={fieldLabelStyle}>{label}</Text>
    {children}
  </View>
);
const fieldWrapStyle = { paddingHorizontal: 16, paddingVertical: 12 } as const;
const fieldLabelStyle = { fontSize: 11.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 4 } as const;

const FREQUENCIES = ['1x ao dia', '2x ao dia', '3x ao dia', 'A cada 8h', 'A cada 12h', 'Conforme necessário'];

export default function MedicamentosAdd() {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = React.useState('');
  const [dosage, setDosage] = React.useState('');
  const [frequency, setFrequency] = React.useState('');
  const [period, setPeriod] = React.useState('');
  const [observation, setObservation] = React.useState('');
  const [reminderTime, setReminderTime] = React.useState('');
  const [enableReminder, setEnableReminder] = React.useState(false);
  const [showFreqPicker, setShowFreqPicker] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!name.trim() || !dosage.trim()) {
      toast.error('Nome e dosagem são obrigatórios.');
      return;
    }
    if (enableReminder && !reminderTime.match(/^\d{2}:\d{2}$/)) {
      toast.error('Informe o horário do lembrete no formato HH:MM.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/schedule/medicines`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicine_name: name.trim(),
          medicine_dosage: dosage.trim(),
          medicine_posology: frequency,
          medicine_period: period.trim(),
          medicine_obs: observation.trim(),
          reminder_time: enableReminder ? reminderTime : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');

      // Agenda notificação diária se habilitado
      if (enableReminder && reminderTime) {
        const [h, m] = reminderTime.split(':').map(Number);
        await scheduleMedicineNotification(name.trim(), dosage.trim(), h, m);
      }

      toast.success('Medicamento registrado!');
      if (router.canGoBack()) router.back();
    } catch (e: any) { toast.error(e.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  const valid = !!name.trim() && !!dosage.trim();

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
            <Text style={s.headerTitle}>Novo Medicamento</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving || !valid} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[s.saveText, !valid && { opacity: 0.4 }]}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Medicamento</Text>
            <View style={s.card}>
              <Field label="Nome *">
                <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Ex: Metformina" placeholderTextColor={AppTheme.colors.placeholderText} />
              </Field>
              <View style={s.divider} />
              <Field label="Dosagem *">
                <TextInput style={s.input} value={dosage} onChangeText={setDosage} placeholder="Ex: 500 mg" placeholderTextColor={AppTheme.colors.placeholderText} />
              </Field>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Uso</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.selectRow} onPress={() => setShowFreqPicker(true)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Frequência</Text>
                  <Text style={[s.selectValue, !frequency && s.placeholder]}>{frequency || 'Selecionar'}</Text>
                </View>
                <MaterialIcons name="expand-more" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
              <View style={s.divider} />
              <Field label="Período">
                <TextInput style={s.input} value={period} onChangeText={setPeriod} placeholder="Ex: Por 30 dias" placeholderTextColor={AppTheme.colors.placeholderText} />
              </Field>
              <View style={s.divider} />
              <Field label="Observação">
                <TextInput style={s.input} value={observation} onChangeText={setObservation} placeholder="Ex: Tomar em jejum" placeholderTextColor={AppTheme.colors.placeholderText} />
              </Field>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Lembrete</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.toggleRow} onPress={() => setEnableReminder(v => !v)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Ativar lembrete diário</Text>
                  <Text style={s.toggleSub}>Receba uma notificação no horário do remédio</Text>
                </View>
                <Switch
                  value={enableReminder}
                  onValueChange={setEnableReminder}
                  trackColor={{ false: AppTheme.colors.dotsColor, true: AppTheme.colors.tertiary + '88' }}
                  thumbColor={enableReminder ? AppTheme.colors.tertiary : '#f4f3f4'}
                />
              </TouchableOpacity>
              {enableReminder && (
                <>
                  <View style={s.divider} />
                  <Field label="Horário do lembrete">
                    <TextInput
                      style={s.input}
                      value={reminderTime}
                      onChangeText={setReminderTime}
                      placeholder="HH:MM  (ex: 08:00)"
                      placeholderTextColor={AppTheme.colors.placeholderText}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </Field>
                  <View style={s.notifHint}>
                    <MaterialIcons name="notifications-active" size={13} color={AppTheme.colors.tertiary} />
                    <Text style={s.notifHintText}>Você será notificado todos os dias nesse horário.</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={s.section}>
            <TouchableOpacity style={[s.saveBtn, (!valid || saving) && { opacity: 0.5 }]} onPress={handleSave} disabled={!valid || saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.saveBtnText}>Salvar medicamento</Text></>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Picker de frequência */}
      {showFreqPicker && (
        <View style={s.pickerOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowFreqPicker(false)} />
          <View style={s.pickerSheet}>
            <View style={s.pickerHandle} />
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Frequência</Text>
              <TouchableOpacity onPress={() => setShowFreqPicker(false)}>
                <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
              </TouchableOpacity>
            </View>
            {FREQUENCIES.map(f => (
              <TouchableOpacity key={f} style={[s.pickerItem, frequency === f && s.pickerItemActive]} onPress={() => { setFrequency(f); setShowFreqPicker(false); }} activeOpacity={0.7}>
                <Text style={[s.pickerItemText, frequency === f && s.pickerItemTextActive]}>{f}</Text>
                {frequency === f && <MaterialIcons name="check" size={18} color={AppTheme.colors.tertiary} />}
              </TouchableOpacity>
            ))}
            <View style={{ height: 24 }} />
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
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  toggleLabel: { fontSize: 14.5, fontWeight: '500', color: AppTheme.colors.textColor, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  toggleSub: { fontSize: 11.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginTop: 1 },
  notifHint: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  notifHintText: { fontSize: 12, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily, flex: 1 },
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
