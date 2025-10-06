import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme/index'; 
import MedicineCard from '../../../components/Card/MedicineCard'; 
import AddButton from '../../../components/Buttons/AddButton';
import BackIconButton from '@/components/BackIconButton';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api';

interface ApiMedicine {
  medicine_id: string;
  medicine_name: string;
  medicine_dosage: string;
  medicine_posology: string;
  medicine_period: string;
  created_at: string;
}

export default function MedicamentosView() {
  const router = useRouter();
  
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchMedicinesForUser = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          // A URL agora é mais simples, o backend identifica o usuário pelo token
          const endpoint = `${API_BASE_URL}/schedule/medicines`;

          const medicinesResponse = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!medicinesResponse.ok) throw new Error("Falha ao buscar medicamentos");
          
          const medicinesData: ApiMedicine[] = await medicinesResponse.json();

          const formattedMedicines = medicinesData.map(med => ({
            name: med.medicine_name,
            dosage: med.medicine_dosage,
            frequency: med.medicine_posology,
            startDate: new Date(med.created_at).toLocaleDateString('pt-BR'),
            endDate: med.medicine_period,
          }));
          
          setMedicines(formattedMedicines);

        } catch (error) {
          console.error("Erro no processo de busca de medicamentos:", error);
          setMedicines([]); 
        } finally {
          setIsLoading(false);
        }
      };

      fetchMedicinesForUser();
    }, [])
  );

  const handleOptionsPress = () => {
    console.log('Options pressed');
  };

  return (
    <PaperProvider theme={AppTheme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerBackgroundGreen} />
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
              <Text style={styles.activeTabText}>Medicamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveTab} onPress={() => router.push("/screens/agenda/sintomasView")}>
              <Text style={styles.inactiveTabText}>Sintomas</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>LISTA DE MEDICAMENTOS</Text>

          <AddButton text="Adicionar medicamento" onPress={() => router.push('/screens/agenda/medicamentosAdd')} style={styles.addButton} />

          <ScrollView style={styles.cardsContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={AppTheme.colors.secondary} style={{ marginTop: 50 }} />
            ) : medicines.length > 0 ? (
              medicines.map((medicine, index) => (
                <MedicineCard
                  key={index}
                  name={medicine.name}
                  dosage={medicine.dosage}
                  frequency={medicine.frequency}
                  startDate={medicine.startDate}
                  endDate={medicine.endDate}
                  onOptionsPress={handleOptionsPress}
                />
              ))
            ) : (
              <Text style={styles.noItemsText}>Nenhum medicamento registado.</Text>
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
  headerBackgroundGreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: AppTheme.colors.secondary,
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
  noItemsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: AppTheme.colors.placeholderText,
  }
});