import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { useToast } from '@/context/NotificationContext';
import { scheduleAppointmentNotification } from '@/services/notifications';

// Fora do componente — evita remontagem a cada render
const Field = ({ label, style: fieldStyle, children }: { label: string; style?: any; children: React.ReactNode }) => (
  <View style={[{ paddingHorizontal: 16, paddingVertical: 12 }, fieldStyle]}>
    <Text style={{ fontSize: 11.5, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily, marginBottom: 4 }}>{label}</Text>
    {children}
  </View>
);

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function CompromissosAdd() {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState<Date | undefined>();
  const [time, setTime] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [observation, setObservation] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);

  const handleSave = async () => {
    if (!name.trim() || !date || !time || !location.trim()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const formattedDate = date.toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/calendar/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_name: name.trim(),
          appointment_date: formattedDate,
          appointment_time: time,
          local: location.trim(),
          observation: observation.trim(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erro');

      // Agenda notificação 1h antes
      await scheduleAppointmentNotification(name.trim(), formattedDate, time);

      toast.success('Compromisso registrado!');
      if (router.canGoBack()) router.back();
    } catch (e: any) { toast.error(e.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  const dateLabel = date ? date.toLocaleDateString('pt-BR') : '';
  const valid = !!name.trim() && !!date && !!time && !!location.trim();

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.screen}>
        <View style={[s.header, { paddingTop: STATUS_TOP + 8 }]}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Novo Compromisso</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Informações</Text>
            <View style={s.card}>
              <Field label="Compromisso *">
                <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Ex: Consulta oncológica" placeholderTextColor={AppTheme.colors.placeholderText} />
              </Field>
              <View style={s.divider} />
              <Field label="Local *">
                <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="Ex: Hospital São Paulo" placeholderTextColor={AppTheme.colors.placeholderText} />
              </Field>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Data e hora</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.selectRow} onPress={() => setShowDate(true)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Data *</Text>
                  <Text style={[s.selectValue, !dateLabel && s.placeholder]}>{dateLabel || 'Selecionar data'}</Text>
                </View>
                <MaterialIcons name="calendar-today" size={20} color={AppTheme.colors.tertiary} />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.selectRow} onPress={() => setShowTime(true)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Hora *</Text>
                  <Text style={[s.selectValue, !time && s.placeholder]}>{time || 'Selecionar hora'}</Text>
                </View>
                <MaterialIcons name="access-time" size={20} color={AppTheme.colors.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Observações</Text>
            <View style={s.card}>
              <Field label="Observação">
                <TextInput style={[s.input, { minHeight: 60 }]} value={observation} onChangeText={setObservation} placeholder="Ex: Levar exames dos últimos 6 meses" placeholderTextColor={AppTheme.colors.placeholderText} multiline textAlignVertical="top" />
              </Field>
            </View>
          </View>

          {/* Aviso de notificação */}
          {valid && (
            <View style={s.notifHint}>
              <MaterialIcons name="notifications-active" size={14} color={AppTheme.colors.tertiary} />
              <Text style={s.notifHintText}>Você receberá um lembrete 1 hora antes do compromisso.</Text>
            </View>
          )}

          <View style={s.section}>
            <TouchableOpacity style={[s.saveBtn, (!valid || saving) && { opacity: 0.5 }]} onPress={handleSave} disabled={!valid || saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.saveBtnText}>Salvar compromisso</Text></>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <DatePickerModal locale="pt" mode="single" visible={showDate} onDismiss={() => setShowDate(false)} date={date} onConfirm={({ date: d }) => { setShowDate(false); if (d) setDate(d); }} saveLabel="Salvar" label="Selecione a data" />
      <TimePickerModal visible={showTime} onDismiss={() => setShowTime(false)} onConfirm={({ hours, minutes }) => { setShowTime(false); setTime(`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`); }} hours={9} minutes={0} locale="pt" label="Selecione o horário" cancelLabel="Cancelar" confirmLabel="Salvar" />
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { backgroundColor: AppTheme.colors.tertiary, paddingHorizontal: 20, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 },
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
  notifHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 18, marginTop: 4 },
  notifHintText: { fontSize: 12, color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily, flex: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 15 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
});
