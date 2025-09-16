import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { AppTheme } from '../../theme'; 

const MoodTracker: React.FC = () => {
  const [moodValue, setMoodValue] = React.useState(2); 
  const [observation, setObservation] = React.useState('');

  const handleSave = () => {
    console.log({
      mood: moodValue,
      observation: observation,
    });
    setMoodValue(2);
    setObservation('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Como você está se sentindo hoje?</Text>
      
      <View style={styles.sliderContainer}>
        <MaterialIcons name="sentiment-very-dissatisfied" size={28} color={AppTheme.colors.tertiary} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={4}
          step={1}
          value={moodValue}
          onValueChange={setMoodValue}
          minimumTrackTintColor={AppTheme.colors.secondary} 
          maximumTrackTintColor="#E0E0E0" 
          thumbTintColor={AppTheme.colors.secondary} 
        />
        <MaterialIcons name="sentiment-very-satisfied" size={28} color={AppTheme.colors.tertiary} />
      </View>
      
      <TextInput
        label="Observação"
        value={observation}
        onChangeText={setObservation}
        mode="flat"
        style={styles.input}
        underlineColor={AppTheme.colors.tertiary}
        activeUnderlineColor={AppTheme.colors.primary}
        // placeholder="Escreva um pouco sobre seu sentimento..."
      />

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        Salvar sentimento
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.tertiary,
    padding: 20,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    ...AppTheme.fonts.titleMedium,
    color: AppTheme.colors.textColor,
    textAlign: 'center',
    marginBottom: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  button: {
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: AppTheme.roundness, 
    elevation: 0,
    alignSelf: 'center',
  },
  buttonText: {
    ...AppTheme.fonts.labelLarge,
    color: AppTheme.colors.cardBackground,
  },
});

export default MoodTracker;