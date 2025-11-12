import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme'; 
import CheckpointCard from '@/components/Card/CheckpointCard'; 
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 
import BackIconButton from '@/components/BackIconButton';
import { AddMilestoneButton } from '@/components/Buttons/addCheckpointButton';

interface Milestone {
  milestone_id: string;
  profile_id: string;
  title: string;
  description: string;
  date: string;
  type: 'fixed' | 'custom';
  position: number | null;
  created_at: string;
}

interface MilestonesResponse {
  milestones: Milestone[];
  progress: number;
}

export default function MarcosView() {
  const router = useRouter();
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar milestones do backend
  const fetchMilestones = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está autenticado.');
        router.push('/screens/(auth)/login' as any);
        return;
      }

      const endpoint = `${API_BASE_URL}/milestones`;
      
      console.log('Buscando milestones...'); // Debug

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: MilestonesResponse = await response.json();
        console.log('Milestones recebidas:', data); // Debug
        
        setMilestones(data.milestones || []);
        setProgress(data.progress || 0);
      } else {
        const errorData = await response.json();
        console.error('Erro ao buscar milestones:', errorData);
        Alert.alert('Erro', errorData.message || 'Não foi possível carregar os marcos.');
      }
    } catch (error) {
      console.error('Erro de conexão ao buscar milestones:', error);
      Alert.alert('Erro', 'Ocorreu um erro de rede. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Atualizar lista quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      fetchMilestones();
    }, [fetchMilestones])
  );

  // Formatar data ISO para dd/MM/yyyy
  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // Deletar milestone
  const handleDelete = async (milestone_id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este marco?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              
              if (!token) {
                Alert.alert('Erro', 'Você não está autenticado.');
                return;
              }

              const endpoint = `${API_BASE_URL}/milestones/${milestone_id}`;
              
              const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Sucesso', 'Marco excluído com sucesso!');
                fetchMilestones(); // Recarrega a lista
              } else {
                const errorData = await response.json();
                Alert.alert('Erro', errorData.message || 'Não foi possível excluir o marco.');
              }
            } catch (error) {
              console.error('Erro ao excluir milestone:', error);
              Alert.alert('Erro', 'Ocorreu um erro de rede. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // Editar milestone (redireciona para tela de edição)
  const handleEdit = (milestone_id: string) => {
    router.push(`/screens/profile/marcosEdit?id=${milestone_id}` as any);
  };

  // Marcar como completo (se você adicionar esse campo no backend)
  const handleMarkAsCompleted = async (milestone_id: string) => {
    Alert.alert('Info', 'Funcionalidade de marcar como completo será implementada em breve.');
    // TODO: Implementar endpoint PATCH /milestones/:id no backend
  };

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
              onPress={() => router.push("/screens/(tabs)/home")}
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

          {/* Mostrar progresso */}
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Progresso: {progress}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          )}

          <AddMilestoneButton 
            onPress={() => router.push('screens/profile/marcosAdd' as any)} 
            style={styles.addButton} 
          />

          <ScrollView style={styles.cardsContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
            ) : milestones.length > 0 ? (
              milestones.map((milestone) => (
                <CheckpointCard
                  key={milestone.milestone_id}
                  name={milestone.title}
                  date={formatDate(milestone.date)}
                  isCompleted={milestone.type === 'fixed'} // Marcos fixos são considerados completos
                  observation={milestone.description || 'Sem observações'}
                  onEdit={() => handleEdit(milestone.milestone_id)}
                  onMarkAsCompleted={() => handleMarkAsCompleted(milestone.milestone_id)}
                  onDelete={() => handleDelete(milestone.milestone_id)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.noAppointmentsText}>Nenhum marco registrado.</Text>
                <Text style={styles.emptySubtext}>
                  Comece adicionando seu primeiro marco do tratamento!
                </Text>
              </View>
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
    top: 40,
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
  listTitle: {
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontWeight: AppTheme.fonts.titleLarge.fontWeight,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    color: AppTheme.colors.nameText,
    marginBottom: 15,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.nameText,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: AppTheme.colors.placeholderBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 4,
  },
  addButton: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  cardsContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 40,
  },
  noAppointmentsText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.colors.nameText,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: AppTheme.colors.placeholderText,
  },
});