import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppTheme } from '../../theme';

interface SymptomCardProps {
  symptoms: string;
  date: string;
  reminderStatus: 'Ativo' | 'Inativo';
  otherInfo: 'Sim' | 'Não';
  onOptionsPress: () => void;
  onReminderPress: () => void;
  onOtherInfoPress: () => void;
  style?: ViewStyle;
}

const SymptomCard: React.FC<SymptomCardProps> = ({
  symptoms,
  date,
  reminderStatus,
  otherInfo,
  onOptionsPress,
  onReminderPress,
  onOtherInfoPress,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.symptomInfo}>
          <Text style={styles.symptomsText}>Sintomas: {symptoms}</Text>
          <Text style={styles.dateText}>Dia: {date}</Text>
        </View>
        <TouchableOpacity 
          style={styles.optionsButton} 
          onPress={onOptionsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.optionsIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            reminderStatus === 'Ativo' ? styles.activeButton : styles.inactiveButton
          ]}
          onPress={onReminderPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            Lembrete: {reminderStatus}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            otherInfo === 'Sim' ? styles.activeButton : styles.inactiveButton
          ]}
          onPress={onOtherInfoPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            Outros: {otherInfo}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: AppTheme.colors.placeholderBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomsText: {
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    fontWeight: AppTheme.fonts.bodyLarge.fontWeight,
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    color: AppTheme.colors.textColor,
    marginBottom: 8,
  },
  dateText: {
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: AppTheme.fonts.bodyMedium.fontWeight,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.placeholderText,
  },
  optionsButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginLeft: 12,
  },
  optionsIcon: {
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  activeButton: {
    backgroundColor: AppTheme.colors.tertiary,
  },
  inactiveButton: {
    backgroundColor: AppTheme.colors.placeholderBackground,
  },
  actionButtonText: {
    color: AppTheme.colors.cardBackground, 
    fontSize: AppTheme.fonts.labelMedium.fontSize,
    fontWeight: AppTheme.fonts.labelMedium.fontWeight,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    textAlign: 'center',
  },
});

export default SymptomCard;

