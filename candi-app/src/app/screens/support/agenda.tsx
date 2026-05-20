/**
 * Agenda do paciente — visualização somente leitura para usuário suporte.
 * Mesmo visual que homeAgenda mas sem FAB, sem criação.
 */
import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import { getValidAccessToken } from '../../../services/authService';
import CCalendar from '@/components/Calendar';
import CANDITopBar from '../../../components/CANDITopBar';

function formatTime(t?: string) {
  if (!t) return '';
  return t.slice(0, 5);
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch { return dateStr; }
}

export default function SupportAgenda() {
  const { patientId, patientName } = useLocalSearchParams<{ patientId: string; patientName: string }>();
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [medicines, setMedicines] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [markedDates, setMarkedDates] = React.useState<Record<string, any>>({});

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const token = await getValidAccessToken();
          const res = await fetch(`${API_BASE_URL}/support/patient/${patientId}/agenda`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const apps = data.appointments || [];
            const meds = data.medicines || [];
            setAppointments(apps);
            setMedicines(meds);

            const marks: Record<string, any> = {};
            apps.forEach((a: any) => {
              const d = a.appointment_date?.split('T')[0];
              if (d) {
                marks[d] = marks[d] || { dots: [] };
                if (!marks[d].dots.some((dot: any) => dot.key === 'appt')) {
                  marks[d].dots = [...marks[d].dots, { key: 'appt', color: AppTheme.colors.primary }];
                }
              }
            });
            setMarkedDates(marks);
          }
        } catch { }
        finally { setLoading(false); }
      };
      load();
    }, [patientId])
  );

  const today = new Date().toISOString().split('T')[0];
  const selectedAppointments = appointments.filter(a => a.appointment_date?.split('T')[0] === selectedDate);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CANDITopBar patientId={patientId} patientName={patientName} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/support' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={22} color={AppTheme.colors.nameText} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={s.headerTitle}>Agenda</Text>
            <Text style={s.headerSub}>{patientName}</Text>
          </View>
          <View style={s.readOnlyBadge}>
            <MaterialIcons name="visibility" size={11} color={AppTheme.colors.tertiary} />
            <Text style={s.readOnlyText}>Leitura</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        <View style={s.calendarCard}>
          <CCalendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [selectedDate]: { ...(markedDates[selectedDate] || {}), selected: true },
            }}
          />
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>
            {selectedDate === today ? 'Hoje' : selectedDate.split('-').reverse().join('/')}
          </Text>
          {selectedAppointments.length > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countText}>{selectedAppointments.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 16 }} />
        ) : selectedAppointments.length === 0 ? (
          <View style={s.emptyDay}>
            <Text style={s.emptyDayText}>Nenhum compromisso neste dia</Text>
          </View>
        ) : (
          <View style={s.eventList}>
            {selectedAppointments.map((a, i) => (
              <View key={a.appointment_id || i} style={s.eventCard}>
                <View style={s.eventTime}>
                  <Text style={s.eventTimeText}>{formatTime(a.appointment_time) || '--:--'}</Text>
                </View>
                <View style={s.eventLine} />
                <View style={{ flex: 1 }}>
                  <Text style={s.eventName}>{a.appointment_name || a.appointment_type || 'Compromisso'}</Text>
                  {a.local ? <Text style={s.eventLocation}>{a.local}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Medicamentos (sempre visíveis) */}
        {medicines.length > 0 && (
          <>
            <View style={[s.sectionRow, { marginTop: 8 }]}>
              <MaterialIcons name="medication" size={13} color={AppTheme.colors.tertiary} />
              <Text style={s.sectionTitle}>Medicamentos</Text>
              <View style={[s.countBadge, { backgroundColor: AppTheme.colors.secondary }]}>
                <Text style={[s.countText, { color: AppTheme.colors.tertiary }]}>{medicines.length}</Text>
              </View>
            </View>
            <View style={s.medList}>
              {medicines.map((m, i) => (
                <View key={m.medicine_id || i} style={s.medCard}>
                  <View style={s.medIcon}>
                    <MaterialIcons name="medication" size={18} color={AppTheme.colors.tertiary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.medName}>{m.medicine_name}</Text>
                    <Text style={s.medSub}>{m.dosage} · {m.frequency}</Text>
                    {m.reminder_time && (
                      <View style={s.reminderBadge}>
                        <Text style={s.reminderText}>Lembrete {m.reminder_time}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: AppTheme.colors.background,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.titleSmall.fontFamily },
  headerSub: { fontSize: 11, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  readOnlyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: AppTheme.colors.secondary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  readOnlyText: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  content: { padding: 16, gap: 12 },

  calendarCard: {
    backgroundColor: AppTheme.colors.background, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor, paddingVertical: 4,
  },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  countBadge: { backgroundColor: AppTheme.colors.secondary, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countText: { fontSize: 11, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  emptyDay: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppTheme.colors.background, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  emptyDayText: { fontSize: 13, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },

  eventList: { gap: 8 },
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppTheme.colors.background, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  eventTime: { width: 44, alignItems: 'center' },
  eventTimeText: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  eventLine: { width: 2, height: '100%', backgroundColor: AppTheme.colors.primary, borderRadius: 1, minHeight: 32 },
  eventName: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  eventLocation: { fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2, fontFamily: AppTheme.fonts.labelSmall.fontFamily },

  medList: { gap: 8 },
  medCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: AppTheme.colors.secondary + '40', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: AppTheme.colors.secondary,
  },
  medIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: AppTheme.colors.secondary, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  medSub: { fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2, fontFamily: AppTheme.fonts.labelSmall.fontFamily },
  reminderBadge: { marginTop: 4, flexSelf: 'flex-start' } as any,
  reminderText: { fontSize: 11, color: AppTheme.colors.tertiary, fontWeight: '600', fontFamily: AppTheme.fonts.labelSmall.fontFamily },
});
