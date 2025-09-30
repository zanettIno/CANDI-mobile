import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

const moodStates = [
  { emoji: "😞", label: "Muito Triste" },
  { emoji: "😐", label: "Triste" },
  { emoji: "🙂", label: "Normal" },
  { emoji: "😊", label: "Alegre" },
  { emoji: "😄", label: "Muito Feliz" },
];

const DiaryScreen = () => {
  const navigation = useNavigation();

  const handleFabPress = () => {
    router.push("/screens/diary/passagemAdd");
  };

  const handleHeartPress = () => {
    router.push("/screens/diary/sentimentosAdd");
  };

  const handleSaveSentiment = (data: {
    moodValue: number;
    observation: string;
  }) => {
    const mood = moodStates[Math.round(data.moodValue)];
    console.log("Sentimento Salvo:", {
      humor: mood.label,
      observacao: data.observation,
    });

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
