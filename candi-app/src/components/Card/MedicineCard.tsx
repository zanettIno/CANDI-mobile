import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppTheme } from '../../theme';

interface MedicineCardProps {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  onOptionsPress: () => void;
  style?: ViewStyle;
}

const MedicineCard: React.FC<MedicineCardProps> = ({
  name,
  dosage,
  frequency,
  startDate,
  endDate,
  onOptionsPress,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.medicationName}>{name}</Text>
        <TouchableOpacity 
          style={styles.optionsButton} 
          onPress={onOptionsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.optionsIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.details}>
        <View style={styles.dosageFrequency}>
          <Text style={styles.dosage}>{dosage}</Text>
          <Text style={styles.frequency}>{frequency}</Text>
        </View>
        
        <View style={styles.dates}>
          <Text style={styles.date}>{startDate}</Text>
          <Text style={styles.date}>{endDate}</Text>
        </View>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    fontWeight: AppTheme.fonts.titleMedium.fontWeight,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    color: AppTheme.colors.nameText,
    flex: 1,
  },
  optionsButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  optionsIcon: {
    fontSize: AppTheme.fonts.titleMedium.fontSize, 
    color: AppTheme.colors.placeholderText,
    fontWeight: 'bold',
  },
  details: {
    gap: 8,
  },
  dosageFrequency: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dosage: {
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    fontWeight: AppTheme.fonts.bodyLarge.fontWeight,
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    color: AppTheme.colors.textColor,
  },
  frequency: {
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: AppTheme.fonts.bodyMedium.fontWeight,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.placeholderText,
  },
  dates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: AppTheme.fonts.bodyMedium.fontWeight,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.placeholderText,
  },
});

export default MedicineCard;

