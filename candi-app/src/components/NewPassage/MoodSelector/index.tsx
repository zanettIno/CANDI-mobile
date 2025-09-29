import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { AppTheme } from '../../../theme';

interface MoodSelectorProps {
  currentMoodEmoji?: string;
  onPress: () => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMoodEmoji = '🙂', onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{currentMoodEmoji}</Text>
      </View>
      <Text style={styles.label}>HUMOR ATUAL:</Text>
      <Text style={styles.subLabel}>Clique para alterar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.colors.primary, 
    borderRadius: 25,
    paddingVertical: 16,
    paddingBottom: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emojiContainer: {
    position: 'absolute',
    top: -22,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 50,
    padding: 8,
    borderWidth: 4,
    borderColor: AppTheme.colors.primary,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    ...AppTheme.fonts.labelMedium,
    color: AppTheme.colors.tertinaryTextColor,
    marginTop: 20,
  },
  subLabel: {
    ...AppTheme.fonts.bodySmall,
    color: AppTheme.colors.tertinaryTextColor,
  },
});

export default MoodSelector;