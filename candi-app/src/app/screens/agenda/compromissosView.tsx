import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import AppointmentCard from '../../../components/Card/AppointmentCard';
import { useScrollToTop } from '@react-navigation/native';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function CompromissosView() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);

  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    const load = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/calendar/events`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.map((a: any) => {
            const [y, m, d] = a.appointment_date.split('-');
            return { id: a.appointment_id, name: a.appointment_name, date: `${d}/${m}/${y}`, time: a.appointment_time, location: a.local, observation: a.observation };
          }));
        }
      } catch { } finally { setIsLoading(false); }
    };
    load();
  }, []));

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Compromissos</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 40 }} />
        ) : appointments.length === 0 ? (
          <View style={s.empty}>
            <MaterialIcons name="event" size={40} color={AppTheme.colors.dotsColor} />
            <Text style={s.emptyTitle}>Nenhum compromisso registrado</Text>
            <Text style={s.emptySub}>Adicione consultas e exames pelo botão abaixo.</Text>
          </View>
        ) : (
          appointments.map(a => (
            <AppointmentCard key={a.id} name={a.name} date={a.date} time={a.time} location={a.location} observation={a.observation} onOptionsPress={() => {}} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => router.push('/screens/agenda/compromissosAdd')} activeOpacity={0.88}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { backgroundColor: AppTheme.colors.primary, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  content: { padding: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  emptySub: { fontSize: 13, color: AppTheme.colors.placeholderText, textAlign: 'center', fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  fab: {
    position: 'absolute', bottom: 26, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: AppTheme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
