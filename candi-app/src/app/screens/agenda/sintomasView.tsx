import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme/index'; 
import SymptomCard from '../../../components/Card/SymptomCard'; 
import AddButton from '../../../components/Buttons/AddButton';
import BackIconButton from '@/components/BackIconButton';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 

interface ApiSymptom {
  symptoms_id: string;
  description: string;
  created_at: string;
}

export default function SintomasView() {
  const router = useRouter();
  
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchSymptomsForUser = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!userResponse.ok) throw new Error("Falha ao buscar usuário");
          const userData = await userResponse.json();
          const userEmail = userData.profile_email;

          if (!userEmail) throw new Error("E-mail do usuário não encontrado");

          const symptomsResponse = await fetch(`${API_BASE_URL}/schedule/symptoms/${userEmail}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!symptomsResponse.ok) throw new Error("Falha ao buscar sintomas");
          
          const symptomsData: ApiSymptom[] = await symptomsResponse.json();
          symptomsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          const formattedSymptoms = symptomsData.map(symptom => ({
            symptoms: symptom.description,
            date: new Date(symptom.created_at).toLocaleDateString('pt-BR'),
            reminderStatus: 'Ativo', 
            otherInfo: 'Sim',      
          
          setSymptoms(formattedSymptoms);

        } catch (error) {
          console.error("Erro no processo de busca de sintomas:", error);
          setSymptoms([]); 
        } finally {
          setIsLoading(false);
        }
      };

      fetchSymptomsForUser();
    }, [])
  );


  const handleOptionsPress = () => console.log('Options pressed');
  const handleReminderPress = () => console.log('Reminder pressed');
  const handleOtherInfoPress = () => console.log('Other info pressed');

  return (
    <PaperProvider theme={AppTheme}>
      <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.headerBackgroundRed} />
            <View style={styles.statusBar}>
                <BackIconButton 
                color={AppTheme.colors.cardBackground} 
                bottom={-30} 
                left={-10} 
                onPress={() => router.push("/screens/(tabs)/homeAgenda")} 
                />
            </View>
        </View>

        <View style={styles.contentCard}>
            <View style={styles.tabsContainer}>
                <TouchableOpacity style={styles.inactiveTab} onPress={() => router.push("/screens/agenda/medicamentosView")}>
                    <Text style={styles.inactiveTabText}>Medicamentos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.activeTab}>
                    <Text style={styles.activeTabText}>Sintomas</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.listTitle}>LISTA DE SINTOMAS</Text>

            <AddButton text="Adicionar sintoma" onPress={() => router.push('/screens/agenda/sintomasAdd')} style={styles.addButton} />

            <ScrollView style={styles.cardsContainer}>
                {isLoading ? (
                <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
                ) : symptoms.length > 0 ? (
                symptoms.map((symptom, index) => (
                    <SymptomCard
                        key={index}
                        symptoms={symptom.symptoms}
                        date={symptom.date}
                        reminderStatus={symptom.reminderStatus as 'Ativo' | 'Inativo'}
                        otherInfo={symptom.otherInfo as 'Sim' | 'Não'}
                        onOptionsPress={handleOptionsPress}
                        onReminderPress={handleReminderPress}
                        onOtherInfoPress={handleOtherInfoPress}
                    />
                ))
                ) : (
                <Text style={styles.noSymptomsText}>Nenhum sintoma registado.</Text>
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
    noSymptomsText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: AppTheme.colors.placeholderText,
    }
});