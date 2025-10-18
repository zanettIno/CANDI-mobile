import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { AppTheme } from '../../theme';

const moodStates = [
  { emoji: '😞', color: '#d9534f' },
  { emoji: '😐', color: '#f0ad4e' },
  { emoji: '🙂', color: '#5cb85c' },
  { emoji: '😊', color: '#42b6a7' },
  { emoji: '😄', color: '#337ab7' },
];

interface MoodTrackerProps {
  onSave: (data: { moodValue: number; observation: string }) => void;
  isSaving: boolean;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onSave, isSaving }) => {
  const [moodValue, setMoodValue] = React.useState(2);
  const [observation, setObservation] = React.useState('');

  const handlePressSave = () => {
    onSave({ moodValue, observation });
    setMoodValue(2);
    setObservation('');
  };

  const currentMood = moodStates[Math.round(moodValue)];

  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Como você está se sentindo hoje?</Text>
      
      <View style={styles.compactSliderContainer}>
        <View style={[styles.emojiContainer, { borderColor: currentMood.color }]}>
          <Text style={styles.emoji}>{currentMood.emoji}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={moodStates.length - 1}
          step={1}
          value={moodValue}
          onValueChange={setMoodValue}
          minimumTrackTintColor={currentMood.color}
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor={currentMood.color}
          disabled={isSaving}
        />
      </View>

      <TextInput
        mode="outlined"
        value={observation}
        onChangeText={setObservation}
        placeholder="Observação..."
        style={styles.input}
        outlineStyle={styles.inputOutline}
        activeOutlineColor={AppTheme.colors.primary}
        dense
        editable={!isSaving}
      />

      <Button
        mode="contained"
        onPress={handlePressSave}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        disabled={!observation.trim()}
        buttonColor={AppTheme.colors.tertiary}
      >
        {isSaving ? 'Salvando...' : 'Salvar'}
      </Button>

     
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.cardBackground, 
    marginHorizontal: 24, 
    borderRadius: 24, 
    padding: 20,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subtitle: {
    ...AppTheme.fonts.bodyMedium,
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 12,
  },
  compactSliderContainer: {
    alignItems: 'center',
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: AppTheme.colors.background,
  },
  emoji: {
    fontSize: 30,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    marginTop: 12,
    marginBottom: 12,
    fontSize: 14,
    height: 45,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 0,
  },
  button: {
    borderRadius: 12,
    alignSelf: 'center',
    width: '100%',
  },
  buttonLabel: {
    ...AppTheme.fonts.labelLarge,
    fontWeight: '600',
    marginHorizontal: 24,
    color: AppTheme.colors.cardBackground,
  },
});

export default MoodTracker;