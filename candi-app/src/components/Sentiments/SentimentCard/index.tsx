import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme';

interface SentimentCardProps {
  emoji: string;
  emotion: string;
  observation: string;
  date: string;
}

const SentimentCard: React.FC<SentimentCardProps> = ({ emoji, emotion, observation, date }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.emotionText}>Emoção: {emotion}</Text>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <Text style={styles.observationText}>Observação: {observation}</Text>
      <Text style={styles.dateText}>Data: {date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionText: {
    ...AppTheme.fonts.bodyLarge,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
  },
  emoji: {
    fontSize: 28,
  },
  observationText: {
    ...AppTheme.fonts.bodyMedium,
    color: AppTheme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  dateText: {
    ...AppTheme.fonts.bodySmall,
    color: AppTheme.colors.onSurfaceVariant,
  },
});

export default SentimentCard;