import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppTheme } from '../../../theme';
import { router } from 'expo-router';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

import SearchNotes from '../../../components/SearchNotes';
import MoodTracker from '../../../components/MoodTracker';
import DiaryList from '../../../components/DiaryList';
import NewPassageFAB from '../../../components/NewPassageFAB';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api';

interface DiaryEntry {
  date: string;
  content: string;
}

const DiaryScreen = () => {
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [diaryEntries, setDiaryEntries] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('Não autenticado');

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserEmail(userData.profile_email);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchDiaries = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error('Não autenticado');

          const response = await fetch(`${API_BASE_URL}/diary/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Falha ao buscar diários');

          const data: DiaryEntry[] = await response.json();

          const formatted = data.map((diary, index) => ({
            id: String(index + 1),
            title: `Registro de ${new Date(diary.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })}`,
            date: diary.date,
            content: diary.content,
          }));

          setDiaryEntries(formatted);
        } catch (error) {
          console.error('Erro ao buscar diários:', error);
          setDiaryEntries([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDiaries();
    }, [])
  );

  const handleSaveSentiment = async (data: { moodValue: number; observation: string }) => {
    if (!userEmail) {
      Alert.alert('Aguarde', 'Informações de usuário ainda carregando. Tente em instantes.');
      return;
    }
    if (!data.observation.trim()) {
      Alert.alert('Atenção', 'Adicione uma observação para salvar seu sentimento.');
      return;
    }

    setIsSaving(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/journal/feelings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          happiness: data.moodValue + 1,
          observation: data.observation,
        }),
      });

      if (response.ok) {
        Alert.alert('Salvo!', 'Seu sentimento foi registrado.');
      } else {
        const err = await response.json();
        Alert.alert('Erro', err.message || 'Não foi possível salvar.');
      }
    } catch {
      Alert.alert('Erro de rede', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Botão de sentimentos — canto superior direito */}
      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => router.push('/screens/diary/sentimentosAdd')}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <AntDesign name="heart" size={22} color={AppTheme.colors.primary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Seu diário</Text>
          <Text style={styles.subtitle}>
            Suas anotações são privadas e visíveis apenas para você.
          </Text>
        </View>

        {/* Busca */}
        <View style={styles.searchWrapper}>
          <SearchNotes />
        </View>

        {/* Mood Tracker */}
        <MoodTracker onSave={handleSaveSentiment} isSaving={isSaving} />

        {/* Lista de entradas */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>Registros</Text>
            {diaryEntries.length > 0 && (
              <Text style={styles.recordsCount}>{diaryEntries.length}</Text>
            )}
          </View>
          <DiaryList entries={diaryEntries} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <NewPassageFAB onPress={() => router.push('/screens/diary/passagemAdd')} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  heartButton: {
    position: 'absolute',
    top: '10%',
    right: '6%',
    zIndex: 10,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    paddingTop: '16%',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  title: {
    fontFamily: AppTheme.fonts.headlineSmall.fontFamily,
    fontSize: AppTheme.fonts.headlineSmall.fontSize,
    color: AppTheme.colors.textColor,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    lineHeight: 20,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  recordsSection: {
    marginTop: 8,
  },
  recordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
    gap: 8,
  },
  recordsTitle: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    color: AppTheme.colors.textColor,
  },
  recordsCount: {
    backgroundColor: AppTheme.colors.placeholderBackground,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    fontWeight: '600',
    overflow: 'hidden',
  },
});

export default DiaryScreen;
