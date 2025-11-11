import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { AppTheme } from '../../../theme';
import { Text } from 'react-native-paper';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api';

interface DiaryEntry {
  date: string;
  content: string;
}

const ViewPassageScreen = () => {
  const [diaryEntry, setDiaryEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetchDiaryEntry = async () => {
        setIsLoading(true);
        
        try {
          // Get date from AsyncStorage
          const date = await AsyncStorage.getItem('selectedDiaryDate');
          console.log('Retrieved date from storage:', date); // Debug log
          
          if (!date) {
            Alert.alert('Erro', 'Data não especificada');
            router.back();
            return;
          }

          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          const endpoint = `${API_BASE_URL}/diary?date=${date}`;
          console.log('Fetching from endpoint:', endpoint); // Debug log

          const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Diário não encontrado");
            }
            throw new Error("Falha ao buscar diário");
          }
          
          const diaryData: DiaryEntry = await response.json();
          setDiaryEntry(diaryData);

          // Formatar título com a data
          try {
            const parsedDate = parseISO(diaryData.date);
            const formattedDate = format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
            setTitle(`Passagem do dia ${formattedDate}`);
          } catch (dateError) {
            console.error("Erro ao formatar data:", dateError);
            setTitle(`Passagem do diário`);
          }
          
          // Clear the stored date after successful fetch
          await AsyncStorage.removeItem('selectedDiaryDate');

        } catch (error: any) {
          console.error("Erro ao buscar diário:", error);
          Alert.alert('Erro', error.message || 'Não foi possível carregar o diário');
          router.back();
        } finally {
          setIsLoading(false);
        }
      };

      fetchDiaryEntry();
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.provider}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          <Text style={styles.loadingText}>Carregando diário...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!diaryEntry) {
    return (
      <SafeAreaProvider style={styles.provider}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Diário não encontrado</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.provider}>
      <View style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.bodyText}>{diaryEntry.content}</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  provider: { 
    flex: 1 
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: AppTheme.colors.background 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 16, 
    paddingTop: 24,
    paddingBottom: 32,
  },
  contentContainer: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: AppTheme.colors.textColor,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    color: AppTheme.colors.error,
  },
  title: {
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    fontSize: AppTheme.fonts.titleLarge.fontSize + 4,
    color: AppTheme.colors.textColor,
    marginBottom: 24,
    fontWeight: '600',
  },
  bodyText: {
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    color: AppTheme.colors.textColor,
    lineHeight: 24,
    textAlign: 'justify',
  },
});

export default ViewPassageScreen;