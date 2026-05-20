import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme';
import { API_BASE_URL } from '../../../constants/api';
import MedicineCard from '../../../components/Card/MedicineCard';
import ActionSheet from '@/components/ActionSheet';
import { useToast } from '@/context/NotificationContext';
import { useScrollToTop } from '@react-navigation/native';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function MedicamentosView() {
  const router = useRouter();
  const toast = useToast();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteSheet, setDeleteSheet] = useState<{ id: string; name: string } | null>(null);
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/schedule/medicines`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setMedicines(data.map((m: any) => ({
            id: m.medicine_id,
            name: m.medicine_name, dosage: m.medicine_dosage,
            frequency: m.medicine_posology,
            startDate: new Date(m.created_at).toLocaleDateString('pt-BR'),
            endDate: m.medicine_period,
            reminderTime: m.reminder_time || null,
          })));
        }
      } catch { } finally { setIsLoading(false); }
    };
    load();
  }, []));

  const handleDelete = async () => {
    if (!deleteSheet) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/schedule/medicines/${deleteSheet.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Medicamento excluído.');
      setMedicines(m => m.filter(x => x.id !== deleteSheet.id));
    } catch { toast.error('Não foi possível excluir.'); }
    finally { setDeleteSheet(null); }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[s.header, { paddingTop: STATUS_TOP }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/screens/(tabs)/homeAgenda' as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color="#1a4a30" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Medicamentos</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <View style={[s.tab, s.tabActive]}>
          <Text style={s.tabTextActive}>Medicamentos</Text>
        </View>
        <TouchableOpacity style={s.tab} onPress={() => router.replace('/screens/agenda/sintomasView' as any)} activeOpacity={0.7}>
          <Text style={s.tabText}>Sintomas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={AppTheme.colors.tertiary} style={{ marginTop: 40 }} />
        ) : medicines.length === 0 ? (
          <View style={s.empty}>
            <MaterialIcons name="medication" size={40} color={AppTheme.colors.dotsColor} />
            <Text style={s.emptyTitle}>Nenhum medicamento registrado</Text>
          </View>
        ) : (
          medicines.map((m, i) => (
            <MedicineCard key={i} name={m.name} dosage={m.dosage} frequency={m.frequency} startDate={m.startDate} endDate={m.endDate} reminderTime={m.reminderTime} onOptionsPress={() => setDeleteSheet({ id: m.id, name: m.name })} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => router.push('/screens/agenda/medicamentosAdd')} activeOpacity={0.88}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <ActionSheet
        visible={!!deleteSheet}
        title="Excluir medicamento"
        options={[{ label: `Excluir ${deleteSheet?.name}`, icon: 'delete', destructive: true, onPress: handleDelete }]}
        onDismiss={() => setDeleteSheet(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { backgroundColor: AppTheme.colors.secondary, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a4a30', fontFamily: AppTheme.fonts.titleMedium.fontFamily },
  tabs: {
    flexDirection: 'row', backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: AppTheme.colors.tertiary },
  tabText: { fontSize: 14, color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  tabTextActive: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.tertiary, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  content: { padding: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.nameText, fontFamily: AppTheme.fonts.labelMedium.fontFamily },
  fab: {
    position: 'absolute', bottom: 26, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#2a8a5a',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2a8a5a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
