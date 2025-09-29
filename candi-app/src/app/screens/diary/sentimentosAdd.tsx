import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '../../../theme';
import MoodSlider from '../../../components/Sentiments/MoodSlider';
import SentimentCard from '../../../components/Sentiments/SentimentCard';

const moodStates = [
    { emoji: '😞', label: 'Muito Triste' },
    { emoji: '😐', label: 'Triste' },
    { emoji: '🙂', label: 'Normal' },
    { emoji: '😊', label: 'Alegre' },
    { emoji: '😄', label: 'Muito Feliz' },
];
const mockSentimentsData = [
    { id: '1', emoji: '😊', emotion: 'Alegre', observation: 'Senti mais energia hoje', date: '28/09/2025' },
    { id: '2', emoji: '😐', emotion: 'Tristeza', observation: 'Me senti triste', date: '27/09/2025' },
    { id: '3', emoji: '😄', emotion: 'Muito Feliz', observation: 'Comemorei um marco no meu tratamento', date: '26/09/2025' },
];

const AddSentimentScreen = () => {
  const navigation = useNavigation();

  const [moodValue, setMoodValue] = useState(3);
  const [observation, setObservation] = useState('');
  const [sentiments, setSentiments] = useState(mockSentimentsData);

  const handleSaveFeeling = () => {  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.contentCard}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
        >
            <IconButton
              icon="chevron-left"
              iconColor={AppTheme.colors.primary}
              size={32}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            
            <View style={styles.header}>
              <Text style={styles.title}>SEUS SENTIMENTOS</Text>
              <Text style={styles.subtitle}>Insira um novo sentimento para o dia de hoje</Text>
            </View>

            <MoodSlider value={moodValue} onValueChange={setMoodValue} />

            <Text style={styles.label}>Observação</Text>
            <TextInput
              mode="outlined"
              value={observation}
              onChangeText={setObservation}
              placeholder="Descreva o que sentiu..."
              style={styles.input}
              outlineStyle={styles.inputOutline}
              activeOutlineColor={AppTheme.colors.primary}
            />

            <Button
              mode="contained"
              onPress={handleSaveFeeling}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              buttonColor={AppTheme.colors.tertiary}
            >
              Salvar Sentimento
            </Button>

            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>LISTA DE SENTIMENTOS</Text>
                {sentiments.map(item => (
                    <SentimentCard 
                        key={item.id}
                        {...item}
                    />
                ))}
            </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFC4C4',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    position: 'absolute', 
    top: 15,
    left: 10,
    zIndex: 1, 
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40, 
  },
  title: {
    ...AppTheme.fonts.headlineSmall,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
  },
  subtitle: {
    ...AppTheme.fonts.bodyMedium,
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  label: {
    ...AppTheme.fonts.titleSmall,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F7F7F7',
    marginBottom: 20,
  },
  inputOutline: {
      borderRadius: 16,
      borderWidth: 0,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 32,
  },
  buttonLabel: {
    ...AppTheme.fonts.labelLarge,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 16,
  },
  listTitle: {
    ...AppTheme.fonts.titleMedium,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
    marginBottom: 8,
  }
});

export default AddSentimentScreen;