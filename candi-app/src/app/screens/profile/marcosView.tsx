import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme'; 
import CheckpointCard from '@/components/Card/CheckpointCard'; 
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 
import BackIconButton from '@/components/BackIconButton';
import { AddMilestoneButton } from '@/components/Buttons/addCheckpointButton';

// Interface adaptada para Marcos
interface ApiCheckpoint {
  checkpoint_id: string;
  checkpoint_name: string;
  due_date: string; // Data prevista
  is_completed: boolean; // Novo campo para o status de conclusão
  observation: string;
  created_at: string;
}

export default function MarcosView() {
  const router = useRouter();
  
  // MOCKS para visualizar os cards
  const mockCheckpoints = [
    {
      id: '1',
      name: 'Primeira quimioterapia',
      date: '10/10/2025',
      isCompleted: true,
      observation: 'Tudo correu bem',
    },
    {
      id: '2',
      name: 'Segunda quimioterapia',
      date: '17/10/2025',
      isCompleted: false,
      observation: 'Preparar documentos',
    },
    {
      id: '3',
      name: 'Consulta de retorno',
      date: '24/10/2025',
      isCompleted: false,
      observation: 'Paciente não compareceu',
    },
  ];

  const [checkpoints, setCheckpoints] = useState<any[]>(mockCheckpoints);
  const [isLoading, setIsLoading] = useState(false); // falso para exibir imediatamente os mocks

  // Funções de ação dos cards
  const handleEdit = (id: string) => console.log('Edit pressed for:', id);
  const handleMarkAsCompleted = (id: string) => console.log('Mark as completed pressed for:', id);
  const handleDelete = (id: string) => console.log('Delete pressed for:', id);

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
                    <Text style={styles.activeTabText}>Marcos</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.listTitle}>LISTA DE MARCOS</Text>

            <AddMilestoneButton onPress={() => router.push('screens/profile/marcosAdd' as any)} style={styles.addButton} />

            <ScrollView style={styles.cardsContainer}>
                {isLoading ? (
                  <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
                ) : checkpoints.length > 0 ? (
                  checkpoints.map((checkpoint) => (
                    <CheckpointCard
                        key={checkpoint.id}
                        name={checkpoint.name}
                        date={checkpoint.date}
                        isCompleted={checkpoint.isCompleted}
                        observation={checkpoint.observation}
                        onEdit={() => handleEdit(checkpoint.id)}
                        onMarkAsCompleted={() => handleMarkAsCompleted(checkpoint.id)}
                        onDelete={() => handleDelete(checkpoint.id)}
                    />
                  ))
                ) : (
                  <Text style={styles.noAppointmentsText}>Nenhum marco registado.</Text>
                )}
            </ScrollView>
        </View>
      </View>
    </PaperProvider>
  );
}

// Reutilizando os estilos originais
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
