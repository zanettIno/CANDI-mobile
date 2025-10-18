import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "expo-router";
import { AppTheme } from "../../../theme";
import { router } from "expo-router";

import SearchNotes from "../../../components/SearchNotes";
import MoodTracker from "../../../components/MoodTracker"; 
import DiaryList from "../../../components/DiaryList";
import NewPassageFAB from "../../../components/NewPassageFAB";

import { AntDesign } from "@expo/vector-icons";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../../../constants/api";

const diaryEntries = [
  { id: "1", title: "Registro de 02/10" },
  { id: "2", title: "Registro de 01/10" },
  { id: "3", title: "Registro de 02/10" },
  { id: "4", title: "Registro de 01/10" },
  { id: "5", title: "Registro de 02/10" },
  { id: "6", title: "Registro de 03/10" },
  { id: "7", title: "Registro de 04/10" },
  { id: "8", title: "Registro de 05/10" },
  { id: "9", title: "Registro de 06/10" },
  { id: "10", title: "Registro de 07/10" },
  { id: "11", title: "Registro de 08/10" },
  { id: "12", title: "Registro de 09/10" },
  { id: "13", title: "Registro de 10/10" },
  { id: "14", title: "Registro de 11/10" },
  { id: "15", title: "Registro de 12/10" },
];

const DiaryScreen = () => {
  const navigation = useNavigation();

  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

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

     <MoodTracker onSave={handleSaveSentiment} isSaving={isSaving} />

      <View style={styles.recordsContainer}>
        <DiaryList entries={diaryEntries} />
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