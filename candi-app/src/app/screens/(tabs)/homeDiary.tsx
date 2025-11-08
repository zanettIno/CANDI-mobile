import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "expo-router";
import { AppTheme } from "../../../theme";
import { router } from "expo-router";

import SearchNotes from "../../../components/SearchNotes";
import MoodTracker from "../../../components/MoodTracker"; 
import DiaryList from "../../../components/DiaryList";
import NewPassageFAB from "../../../components/NewPassageFAB";

import { AntDesign } from "@expo/vector-icons";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../../../constants/api";

interface DiaryEntry {
  date: string;
  content: string;
}

const DiaryScreen = () => {
  const navigation = useNavigation();

  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [diaryEntries, setDiaryEntries] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error("Não autenticado");

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserEmail(userData.profile_email);
        } else {
          console.error("Falha ao buscar dados do usuário na tela do diário.");
        }
      } catch (error) {
        console.error("Erro de conexão ao buscar dados do usuário:", error);
      }
    };
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchDiariesForUser = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          const endpoint = `${API_BASE_URL}/diary/list`;

          const diariesResponse = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!diariesResponse.ok) throw new Error("Falha ao buscar diários");
          
          const diariesData: DiaryEntry[] = await diariesResponse.json();

          // Formatar os diários para o formato esperado pelo DiaryList
          const formattedDiaries = diariesData.map((diary, index) => ({
            id: String(index + 1),
            title: `Registro de ${new Date(diary.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            })}`,
            date: diary.date, // Pass the original date string for API calls
            content: diary.content,
          }));
          
          setDiaryEntries(formattedDiaries);

        } catch (error) {
          console.error("Erro no processo de busca de diários:", error);
          setDiaryEntries([]); 
        } finally {
          setIsLoading(false);
        }
      };

      fetchDiariesForUser();
    }, [])
  );

  const handleFabPress = () => {
    router.push("/screens/diary/passagemAdd");
  };

  const handleHeartPress = () => {
    router.push("/screens/diary/sentimentosAdd");
  };

  const handleSaveSentiment = async (data: {
    moodValue: number;
    observation: string;
  }) => {
    if (!userEmail) {
      Alert.alert("Erro", "Informações de usuário não carregadas. Tente novamente em instantes.");
      return;
    }
    if (!data.observation.trim()) {
      Alert.alert("Atenção", "Por favor, adicione uma observação para salvar seu sentimento.");
      return;
    }

    setIsSaving(true);
    
    const happinessScore = data.moodValue + 1;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/journal/feelings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          happiness: happinessScore,
          observation: data.observation,
        }),
      });

      if (response.ok) {
        Alert.alert("Sucesso!", "Seu sentimento foi salvo no diário.");
      } else {
        const errorData = await response.json();
        Alert.alert("Erro", errorData.message || "Não foi possível salvar seu sentimento.");
      }
    } catch (error) {
      console.error("Erro ao salvar sentimento:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topIcons}>
        <TouchableOpacity onPress={handleHeartPress}>
          <AntDesign name="heart" size={26} color="#FFC4C4" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Seu diário!</Text>
        <Text style={styles.subtitle}>
          Não se preocupe, suas notas estão seguras e são visíveis apenas para você.
        </Text>
      </View>

      <SearchNotes />

      <MoodTracker onSave={handleSaveSentiment} />

      <View style={styles.recordsContainer}>
        <DiaryList entries={diaryEntries}/>
      </View>

      <NewPassageFAB onPress={handleFabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  topIcons: {
    position: "absolute",
    top: '10%',
    right: '6%',
    zIndex: 5,
  },
  header: {
    paddingTop: '16%',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  title: {
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    fontSize: AppTheme.fonts.titleLarge.fontSize + 8,
    color: AppTheme.colors.textColor,
    marginBottom: 4,
  },
  subtitle: {
    ...AppTheme.fonts.bodyLarge,
    color: AppTheme.colors.textColor,
    opacity: 0.7,
    marginBottom: 12,
    marginTop: '-2%'
  },
  recordsContainer: {
    flex: 1, 
    marginTop: 8,
  },
});

export default DiaryScreen;