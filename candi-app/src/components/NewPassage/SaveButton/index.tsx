import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { AppTheme } from '../../../theme';

interface SaveButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress, loading, disabled }) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={styles.button}
      labelStyle={styles.label}
      buttonColor={AppTheme.colors.tertiary}
      textColor={AppTheme.colors.cardBackground}
      loading={loading}
      disabled={disabled || loading}
    >
      Salvar Passagem
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 16,
    borderRadius: AppTheme.roundness,
    paddingVertical: 8,
  },
  label: {
    ...AppTheme.fonts.labelLarge,
    fontWeight: 'bold',
  },
});

export default SaveButton;