import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import CCalendar from '@/components/Calendar';
import CANDITopBar from '../../../components/CANDITopBar';
import { useScrollToTop } from '@react-navigation/native';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

interface Event {
  event_id: string;
  name: string;
  date: string;
  time?: string;
  location?: string;
}

interface Symptom { description: string; created_at: string; }
interface Medicine { medicine_id: string; medicine_name: string; dosage?: string; frequency?: string; reminder_time?: string; }

function formatTodayFull() {
  const d = new Date();
  const s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(t?: string) {
  if (!t) return '';
  return t.slice(0, 5);
}

export default function HomeAgenda() {
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [events, setEvents] = React.useState<Event[]>([]);
  const [symptoms, setSymptoms] = React.useState<Symptom[]>([]);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [markedDates, setMarkedDates] = React.useState<Record<string, any>>({});
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) return;

          const [evRes, symRes, medRes] = await Promise.all([
            fetch(`${API_BASE_URL}/calendar/events`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/schedule/symptoms`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/schedule/medicines`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const marks: Record<string, any> = {};

          if (evRes.ok) {
            const raw = await evRes.json();
            const data: Event[] = raw.map((e: any) => ({
              event_id: e.appointment_id,
              name: e.appointment_name,
              date: e.appointment_date,
              time: e.appointment_time,
              location: e.local,
            }));
            setEvents(data);
            data.forEach(e => {
              const d = e.date?.split('T')[0];
              if (d) {
                marks[d] = marks[d] || { dots: [] };
                if (!marks[d].dots.some((dot: any) => dot.key === 'appt')) {
                  marks[d].dots = [...marks[d].dots, { key: 'appt', color: AppTheme.colors.primary }];
                }
              }
            });
          }

          if (symRes.ok) {
            const raw: any[] = await symRes.json();
            setSymptoms(raw);
            raw.forEach((sym: any) => {
              const d = sym.created_at?.split('T')[0];
              if (d) {
                marks[d] = marks[d] || { dots: [] };
                if (!marks[d].dots.some((dot: any) => dot.key === 'sym')) {
                  marks[d].dots = [...marks[d].dots, { key: 'sym', color: AppTheme.colors.tertiary }];
                }
              }
            });
          }

          if (medRes.ok) {
            const raw: any[] = await medRes.json();
            setMedicines(raw);
          }

          setMarkedDates(marks);
        } catch { }
        finally { setLoading(false); }
      };
      load();
    }, [])
  );

  const selectedEvents = events.filter(e => e.date?.split('T')[0] === selectedDate);
  const selectedSymptoms = symptoms.filter(s => s.created_at?.split('T')[0] === selectedDate);
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CANDITopBar />

      {/* Header */}
      <View style={[s.header, { paddingTop: 10 }]}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Agenda</Text>
            <Text style={s.headerSub}>{formatTodayFull()}</Text>
          </View>
          <TouchableOpacity
            style={s.reportBtn}
            onPress={() => router.navigate('/screens/agenda/relatorio')}
            activeOpacity={0.7}>
            <MaterialIcons name="assessment" size={20} color={AppTheme.colors.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Calendário */}
        <View style={s.calendarCard}>
          <CCalendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...(markedDates[selectedDate] || {}),
                selected: true,
              },
            }}
          />
        </View>

        {/* Eventos do dia selecionado */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>
            {selectedDate === today ? 'Hoje' : selectedDate.split('-').reverse().join('/')}
          </Text>
          {(selectedEvents.length + selectedSymptoms.length) > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countText}>{selectedEvents.length + selectedSymptoms.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 16 }} />
        ) : (selectedEvents.length === 0 && selectedSymptoms.length === 0) ? (
          <View style={s.emptyDay}>
            <Text style={s.emptyDayText}>Nenhum registro neste dia</Text>
            <TouchableOpacity
              style={s.addDayBtn}
              onPress={() => router.push('/screens/agenda/compromissosAdd')}
              activeOpacity={0.8}>
              <MaterialIcons name="add" size={14} color={AppTheme.colors.tertiary} />
              <Text style={s.addDayText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.eventList}>
            {selectedEvents.map((e) => (
              <View key={e.event_id} style={s.eventCard}>
                <View style={s.eventTime}>
                  <Text style={s.eventTimeText}>{formatTime(e.time) || '--:--'}</Text>
                </View>
                <View style={s.eventLine} />
                <View style={{ flex: 1 }}>
                  <Text style={s.eventName}>{e.name}</Text>
                  {e.location ? <Text style={s.eventLocation}>{e.location}</Text> : null}
                </View>
              </View>
            ))}
            {selectedSymptoms.map((sym, i) => (
              <View key={`sym-${i}`} style={[s.eventCard, s.eventCardSym]}>
                <View style={[s.eventTime, { alignItems: 'center' }]}>
                  <MaterialIcons name="healing" size={16} color={AppTheme.colors.tertiary} />
                </View>
                <View style={[s.eventLine, { backgroundColor: AppTheme.colors.tertiary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.eventName}>{sym.description}</Text>
                  <Text style={s.eventLocation}>Sintoma registrado</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Medicamentos ativos */}
        {!loading && medicines.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <MaterialIcons name="medication" size={13} color={AppTheme.colors.tertiary} />
              <Text style={s.sectionTitle}>Medicamentos ativos</Text>
              <View style={[s.countBadge, { backgroundColor: AppTheme.colors.secondary }]}>
                <Text style={[s.countText, { color: AppTheme.colors.tertiary }]}>{medicines.length}</Text>
              </View>
            </View>
            <View style={s.eventList}>
              {medicines.map((m) => (
                <TouchableOpacity key={m.medicine_id} style={[s.eventCard, s.medCard]} onPress={() => router.push('/screens/agenda/medicamentosView')} activeOpacity={0.8}>
                  <View style={s.medIconWrap}>
                    <MaterialIcons name="medication" size={18} color={AppTheme.colors.tertiary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.eventName}>{m.medicine_name}</Text>
                    {m.dosage ? <Text style={s.eventLocation}>{m.dosage}{m.frequency ? ` · ${m.frequency}` : ''}</Text> : null}
                    {m.reminder_time && <Text style={s.medReminder}>Lembrete {m.reminder_time}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Ações rápidas */}
        <Text style={s.sectionTitle}>Acesso rápido</Text>
        <View style={s.actionsGrid}>
          <TouchableOpacity style={s.actionCard} onPress={() => router.push('/screens/agenda/compromissosView')} activeOpacity={0.8}>
            <View style={[s.actionIcon, { backgroundColor: AppTheme.colors.secondary }]}>
              <MaterialIcons name="event" size={22} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.actionTitle}>Compromissos</Text>
            <Text style={s.actionSub}>Consultas e exames</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionCard} onPress={() => router.push('/screens/agenda/sintomasView')} activeOpacity={0.8}>
            <View style={[s.actionIcon, { backgroundColor: AppTheme.colors.primary + '40' }]}>
              <MaterialIcons name="healing" size={22} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.actionTitle}>Sintomas</Text>
            <Text style={s.actionSub}>Como você está</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionCard} onPress={() => router.push('/screens/agenda/medicamentosView')} activeOpacity={0.8}>
            <View style={[s.actionIcon, { backgroundColor: AppTheme.colors.secondary }]}>
              <MaterialIcons name="medication" size={22} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.actionTitle}>Medicamentos</Text>
            <Text style={s.actionSub}>Remédios e horários</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionCard} onPress={() => router.navigate('/screens/agenda/relatorio')} activeOpacity={0.8}>
            <View style={[s.actionIcon, { backgroundColor: AppTheme.colors.secondary }]}>
              <MaterialIcons name="assessment" size={22} color={AppTheme.colors.tertiary} />
            </View>
            <Text style={s.actionTitle}>Relatório</Text>
            <Text style={s.actionSub}>Análise de saúde</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/screens/agenda/compromissosAdd')} activeOpacity={0.88}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: AppTheme.colors.background,
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: {
    fontSize: 22, fontWeight: '800', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  headerSub: {
    fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, textTransform: 'capitalize',
  },
  reportBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },

  content: { padding: 16, gap: 12 },

  calendarCard: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    paddingVertical: 4,
  },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 2,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8,
    color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  countBadge: {
    backgroundColor: AppTheme.colors.secondary, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  countText: {
    fontSize: 11, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  emptyDay: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  emptyDayText: {
    fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  addDayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: AppTheme.colors.tertiary,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  addDayText: {
    fontSize: 12, fontWeight: '600', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },

  eventList: { gap: 8 },
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  eventCardSym: {
    borderColor: AppTheme.colors.tertiary + '40',
    backgroundColor: AppTheme.colors.secondary + '30',
  },
  medCard: {
    borderColor: AppTheme.colors.secondary,
    backgroundColor: AppTheme.colors.secondary + '30',
  },
  medIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  medReminder: {
    fontSize: 11, color: AppTheme.colors.tertiary, fontWeight: '600', marginTop: 2,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  eventTime: {
    width: 44, alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 13, fontWeight: '700', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  eventLine: {
    width: 2, height: '100%', backgroundColor: AppTheme.colors.primary,
    borderRadius: 1, minHeight: 32,
  },
  eventName: {
    fontSize: 14, fontWeight: '600', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  eventLocation: {
    fontSize: 12, color: AppTheme.colors.placeholderText, marginTop: 2,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: AppTheme.colors.background,
    borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13.5, fontWeight: '700', color: AppTheme.colors.nameText,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  actionSub: {
    fontSize: 11.5, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily, lineHeight: 16,
  },

  fab: {
    position: 'absolute', bottom: 26, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: AppTheme.colors.tertiary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
});
