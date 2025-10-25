import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckpointCardOptions from './CheckpointCardOptions';
import { AppTheme } from '../../theme';

interface CheckpointCardProps {
  name: string;
  date: string;
  isCompleted: boolean; // Novo campo para o status de conclusão
  observation?: string;
  onEdit: () => void;
  onMarkAsCompleted: () => void;
  onDelete: () => void;
}

const CheckpointCard: React.FC<CheckpointCardProps> = ({
  name,
  date,

  observation,
  onEdit,
  onMarkAsCompleted,
  onDelete,
  isCompleted,
}) => {


  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.checkpointName}>{name}</Text>
        <CheckpointCardOptions 
          name={name}
          onEdit={onEdit}
          onMarkAsCompleted={onMarkAsCompleted}
          onDelete={onDelete}
          isCompleted={isCompleted}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Data Prevista:</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        {observation && (
          <View style={styles.row}>
            <Text style={styles.label}>Observação:</Text>
            <Text style={styles.value}>{observation}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkpointName: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    fontWeight: AppTheme.fonts.titleMedium.fontWeight,
    color: AppTheme.colors.nameText,
  },
  cardBody: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: 'bold',
    color: AppTheme.colors.tertinaryTextColor,
    marginRight: 5,
  },
  value: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.tertinaryTextColor,
    flexShrink: 1,
  },
});

export default CheckpointCard;
