import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { AppTheme } from '../../../theme'; 

const moodStates = [
  { emoji: '😞', color: '#d9534f', label: 'Muito Triste' },
  { emoji: '😐', color: '#f0ad4e', label: 'Triste' },
  { emoji: '🙂', color: '#5cb85c', label: 'Normal' },
  { emoji: '😊', color: '#42b6a7', label: 'Feliz' },
  { emoji: '😄', color: '#337ab7', label: 'Muito Feliz' },
];

interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const MoodSlider: React.FC<MoodSliderProps> = ({ value, onValueChange }) => {
  const currentMood = moodStates[Math.round(value)];

  return (
    <View style={styles.container}>
      <View style={[styles.emojiContainer, { borderColor: currentMood.color }]}>
        <Text style={styles.emoji}>{currentMood.emoji}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={moodStates.length - 1}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={currentMood.color}
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor={currentMood.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: AppTheme.colors.cardBackground, 
  },
  emoji: {
    fontSize: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default MoodSlider;