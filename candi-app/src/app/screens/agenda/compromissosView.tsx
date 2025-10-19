import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme'; 
import AppointmentCard from '../../../components/Card/AppointmentCard'; 
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 
import BackIconButton from '@/components/BackIconButton';
import { AddAppointmentButton } from '@/components/Buttons/AppointmentButton';

interface ApiAppointment {
  appointment_id: string;
  appointment_name: string;
  appointment_date: string;
  appointment_time: string;
  local: string;
  observation: string;
  created_at: string;
}

export default function CompromissosView() {
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchAppointmentsForUser = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          // ALTERADO: A rota agora é mais simples e segura
          const endpoint = `${API_BASE_URL}/calendar/events`;

          const appointmentsResponse = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!appointmentsResponse.ok) throw new Error("Falha ao buscar compromissos");
          
          const appointmentsData: ApiAppointment[] = await appointmentsResponse.json();

          const formattedAppointments = appointmentsData.map(appointment => {
            const [year, month, day] = appointment.appointment_date.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            return {
              id: appointment.appointment_id,
              name: appointment.appointment_name,
              date: formattedDate,
              time: appointment.appointment_time,
              location: appointment.local,
              observation: appointment.observation,
            }
          });

          setAppointments(formattedAppointments);
        
        } catch (error) {
          console.error("Erro no processo de busca de compromissos:", error);
          setAppointments([]); 
        } finally {
          setIsLoading(false);
        }
      };

      fetchAppointmentsForUser();
    }, [])
  );

  const handleOptionsPress = () => console.log('Options pressed');

  return (
    <PaperProvider theme={AppTheme}>
      <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.headerBackgroundRed} />
            <View style={styles.statusBar}>
                <BackIconButton 
                  color={AppTheme.colors.cardBackground} 
                  bottom={-80} 
                  left={-10} 
                  onPress={() => router.push("/screens/(tabs)/homeAgenda")} 
                />
            </View>
        </View>

        <View style={styles.contentCard}>
            <View style={styles.tabsContainer}>
                <TouchableOpacity style={styles.activeTab}>
                    <Text style={styles.activeTabText}>Compromissos</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.listTitle}>LISTA DE COMPROMISSOS</Text>

            <AddAppointmentButton onPress={() => router.push('screens/agenda/compromissosAdd' as any)} style={styles.addButton} />

            <ScrollView style={styles.cardsContainer}>
                {isLoading ? (
                <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
                ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id} 
                        name={appointment.name}
                        date={appointment.date}
                        time={appointment.time}
                        location={appointment.location}
                        observation={appointment.observation}
                        onOptionsPress={handleOptionsPress}
                    />
                ))
                ) : (
                <Text style={styles.noAppointmentsText}>Nenhum compromisso registado.</Text>
                )}
            </ScrollView>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppTheme.colors.background,
    },
    header: {
      height: 150, 
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 20,
    },
    headerBackgroundRed: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 150,
      backgroundColor: AppTheme.colors.primary,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    statusBar: {
      position: 'absolute',
      top: 10,
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    contentCard: {
      flex: 1,
      backgroundColor: AppTheme.colors.cardBackground,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      marginTop: -60,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: AppTheme.colors.placeholderBackground,
    },
    activeTab: {
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderBottomColor: AppTheme.colors.tertiary,
    },
    activeTabText: {
      fontSize: AppTheme.fonts.bodyLarge.fontSize,
      fontWeight: AppTheme.fonts.bodyLarge.fontWeight,
      fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
      color: AppTheme.colors.tertiary,
    },
    inactiveTab: {
      paddingVertical: 10,
    },
    inactiveTabText: {
      fontSize: AppTheme.fonts.bodyLarge.fontSize,
      fontWeight: AppTheme.fonts.bodyLarge.fontWeight,
      fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
      color: AppTheme.colors.placeholderText,
    },
    listTitle: {
      fontSize: AppTheme.fonts.titleLarge.fontSize,
      fontWeight: AppTheme.fonts.titleLarge.fontWeight,
      fontFamily: AppTheme.fonts.titleLarge.fontFamily,
      color: AppTheme.colors.nameText,
      marginBottom: 15,
      textAlign: 'center',
    },
    addButton: {
      marginBottom: 20,
      alignSelf: 'center',
    },
    cardsContainer: {
      flex: 1,
    },
    noAppointmentsText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: AppTheme.colors.placeholderText,
    }
});